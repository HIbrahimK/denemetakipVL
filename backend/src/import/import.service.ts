import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ExcelParsingService, ParsedExamRow } from './excel-parsing.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImportService {
    private readonly logger = new Logger(ImportService.name);

    constructor(
        @InjectQueue('import-queue') private importQueue: Queue,
        private excelParser: ExcelParsingService,
        private prisma: PrismaService,
    ) { }

    async confirmImport(data: any[], examId: string, schoolId: string, examType: string) {
        try {
            const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
            if (!exam) throw new Error('Sınav bulunamadı');

            // frontend sends validated data which might have extra UI flags like 'selected'
            // We cast to ParsedExamRow & { selected?: boolean }
            const rowsToProcess = data.filter(row => row.isValid && (row as any).selected !== false);

            await this.prisma.$transaction(async (tx) => {
                for (const row of rowsToProcess) {
                    // row is ParsedExamRow
                    const studentNumber = row.studentNumber;
                    const firstName = row.name || 'Öğrenci';
                    const lastName = ''; // Often name is full name
                    const tcNo = row.tcNo;

                    // 1. Manage Grade & Class
                    let gradeName = 'Diğer';
                    let branchName = 'A';

                    if (row.class) {
                        const match = row.class.match(/^(\d+)/);
                        if (match) gradeName = match[1];
                        const branchMatch = row.class.match(/[a-zA-Z]/g); // Simple heuristic
                        if (branchMatch) branchName = branchMatch.pop() || 'A';
                    }

                    let grade = await tx.grade.findFirst({
                        where: { name: gradeName, schoolId }
                    });
                    if (!grade) {
                        grade = await tx.grade.create({
                            data: { name: gradeName, schoolId }
                        });
                    }

                    let studentClass = await tx.class.findFirst({
                        where: { name: `${gradeName}-${branchName}`, gradeId: grade.id }
                    });
                    if (!studentClass) {
                        studentClass = await tx.class.create({
                            data: {
                                name: `${gradeName}-${branchName}`,
                                gradeId: grade.id,
                                schoolId,
                            }
                        });
                    }

                    // 2. Manage Student & Parent
                    let student = await tx.student.findFirst({
                        where: { studentNumber, schoolId },
                        include: { user: true }
                    });

                    if (!student) {
                        // Create Student User
                        const studentUser = await tx.user.create({
                            data: {
                                email: `${studentNumber}.${schoolId}.s@denemetakip.com`,
                                password: '1234',
                                firstName,
                                lastName,
                                role: 'STUDENT',
                                schoolId,
                            }
                        });

                        // Create Parent User
                        const parentUser = await tx.user.create({
                            data: {
                                email: `${studentNumber}.${schoolId}.p@denemetakip.com`,
                                password: '1234',
                                firstName: `Veli - ${firstName}`,
                                lastName,
                                role: 'PARENT',
                                schoolId,
                            }
                        });

                        const parent = await tx.parent.create({
                            data: { userId: parentUser.id }
                        });

                        student = await tx.student.create({
                            data: {
                                studentNumber: studentNumber,
                                userId: studentUser.id,
                                schoolId,
                                classId: studentClass.id,
                                parentId: parent.id,
                                tcNo: tcNo || null
                            },
                            include: { user: true }
                        });
                    } else {
                        // Update Student Info
                        await tx.user.update({
                            where: { id: student.userId },
                            data: {
                                firstName: firstName !== 'Öğrenci' ? firstName : undefined,
                                lastName: lastName || undefined
                            }
                        });

                        // Update Student Record
                        await tx.student.update({
                            where: { id: student.id },
                            data: {
                                tcNo: tcNo || undefined,
                                classId: studentClass.id
                            }
                        });
                    }

                    // 3. Create Exam Attempt
                    let attempt = await tx.examAttempt.findUnique({
                        where: { examId_studentId: { examId, studentId: student!.id } }
                    });

                    if (!attempt) {
                        attempt = await tx.examAttempt.create({
                            data: { examId, studentId: student!.id }
                        });
                    }

                    // 4. Save Lesson Results
                    await tx.examLessonResult.deleteMany({ where: { attemptId: attempt.id } });

                    if (row.lessons) {
                        for (const [lessonName, stats] of Object.entries(row.lessons)) {
                            const lessonStats = stats as { correct: number, incorrect: number, net: number, point: number };
                            let lesson = await tx.lesson.findUnique({
                                where: { name_examType_schoolId: { name: lessonName, examType: exam.type, schoolId } }
                            });

                            if (!lesson) {
                                lesson = await tx.lesson.create({
                                    data: { name: lessonName, examType: exam.type, schoolId }
                                });
                            }

                            await tx.examLessonResult.create({
                                data: {
                                    attemptId: attempt.id,
                                    lessonId: lesson.id,
                                    correct: lessonStats.correct || 0,
                                    incorrect: lessonStats.incorrect || 0,
                                    net: lessonStats.net || 0,
                                    point: lessonStats.point || 0
                                }
                            });
                        }
                    }

                    // 5. Save Scores
                    await tx.examScore.deleteMany({ where: { attemptId: attempt.id } });

                    if (row.scores) {
                        for (const [scoreType, scoreVal] of Object.entries(row.scores)) {
                            await tx.examScore.create({
                                data: {
                                    attemptId: attempt.id,
                                    type: scoreType,
                                    score: Number(scoreVal),
                                    rankClass: row.ranks['Sınıf'] || row.ranks['Sınıf Derece'] || null,
                                    rankSchool: row.ranks['Okul'] || row.ranks['Kurum'] || row.ranks['Okul Derece'] || null,
                                    rankCity: row.ranks['İl'] || row.ranks['İl Derece'] || null,
                                    rankGen: row.ranks['Genel'] || row.ranks['Genel Derece'] || null,
                                }
                            });
                        }
                    }
                }
            });

            return { success: true, count: rowsToProcess.length };
        } catch (error) {
            this.logger.error(`Import confirmation error: ${error.message}`, error.stack);
            throw new BadRequestException(error.message || 'Veriler kaydedilirken bir hata oluştu.');
        }
    }

    async validateImport(file: Buffer, examId: string, schoolId: string, examType: string): Promise<ParsedExamRow[]> {
        try {
            const rawRows = await this.excelParser.parseExcel(file, examType);

            // Additional Validation: Check for duplicates within the file
            const studentNumberCounts = new Map<string, number>();
            rawRows.forEach(r => {
                if (r.studentNumber) {
                    studentNumberCounts.set(r.studentNumber, (studentNumberCounts.get(r.studentNumber) || 0) + 1);
                }
            });

            for (const row of rawRows) {
                if (studentNumberCounts.get(row.studentNumber)! > 1) {
                    row.isValid = false;
                    row.errorReason.push('Dosya içinde mükerrer öğrenci numarası.');
                }
            }

            return rawRows;
        } catch (error) {
            this.logger.error(`Import validation error: ${error.message}`, error.stack);
            throw new BadRequestException(error.message || 'Excel dosyası işlenirken bir hata oluştu.');
        }
    }

    async handleFileUpload(file: Buffer, examId: string, schoolId: string, examType: string) {
        const validatedData = await this.validateImport(file, examId, schoolId, examType);
        return {
            data: validatedData,
            examId,
            examType,
            rowCount: validatedData.length
        };
    }
}

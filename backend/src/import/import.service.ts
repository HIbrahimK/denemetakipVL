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
                    let gradeName = row.grade || 'Diğer';
                    let branchName = row.section || 'A';

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
                            // AYT'de sıralamalar "SAY Sınıf", "SAY Okul" şeklinde kaydedilir
                            // Diğer türlerde "Sınıf", "Okul" şeklinde kaydedilir
                            let rankClass, rankSchool, rankCity, rankGen;
                            
                            if (examType === 'AYT') {
                                rankClass = row.ranks[`${scoreType} Sınıf`] || null;
                                rankSchool = row.ranks[`${scoreType} Okul`] || null;
                                rankCity = row.ranks[`${scoreType} İlçe`] || null;
                                rankGen = row.ranks[`${scoreType} Genel`] || null;
                            } else {
                                rankClass = row.ranks['Sınıf'] || row.ranks['Sınıf Derece'] || null;
                                rankSchool = row.ranks['Okul'] || row.ranks['Kurum'] || row.ranks['Okul Derece'] || null;
                                rankCity = row.ranks['İlçe'] || row.ranks['İl'] || row.ranks['İl Derece'] || null;
                                rankGen = row.ranks['Genel'] || row.ranks['Genel Derece'] || null;
                            }

                            await tx.examScore.create({
                                data: {
                                    attemptId: attempt.id,
                                    type: scoreType,
                                    score: Number(scoreVal),
                                    rankClass: rankClass ? Number(rankClass) : null,
                                    rankSchool: rankSchool ? Number(rankSchool) : null,
                                    rankCity: rankCity ? Number(rankCity) : null,
                                    rankGen: rankGen ? Number(rankGen) : null,
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
            const exam = await this.prisma.exam.findUnique({ where: { id: examId } });

            if (!exam) {
                throw new Error('Sınav bulunamadı');
            }

            // Dosya içindeki mükerrer kontrol
            const studentNumberCounts = new Map<string, number>();
            rawRows.forEach(r => {
                if (r.studentNumber) {
                    studentNumberCounts.set(r.studentNumber, (studentNumberCounts.get(r.studentNumber) || 0) + 1);
                }
            });

            // Sınava zaten kayıtlı öğrenciler
            const existingAttempts = await this.prisma.examAttempt.findMany({
                where: { examId },
                include: { student: true }
            });
            const existingStudentNumbers = new Set(existingAttempts.map(a => a.student.studentNumber));

            // Sistemde kayıtlı öğrenciler
            const systemStudentNumbers = new Set(
                (await this.prisma.student.findMany({
                    where: { schoolId },
                    select: { studentNumber: true }
                })).map(s => s.studentNumber)
            );

            // Her satırı valide et
            for (const row of rawRows) {
                const { studentNumber } = row;
                
                // 1. Öğrenci numarası format kontrolü
                if (!studentNumber || studentNumber === '0' || studentNumber === '*' || studentNumber === '?' || !/^\d+$/.test(studentNumber)) {
                    row.isValid = false;
                    row.validationStatus = 'invalid_number';
                    if (!row.errorReason.includes('Geçersiz numara formatı')) {
                        row.errorReason.push('Geçersiz numara formatı (0, *, ?, yazı)');
                    }
                    continue;
                }

                // 2. Dosya içinde mükerrer kontrol
                if (studentNumberCounts.get(studentNumber)! > 1) {
                    row.isValid = false;
                    row.validationStatus = 'duplicate_in_file';
                    if (!row.errorReason.includes('Dosya içinde mükerrer')) {
                        row.errorReason.push('Dosya içinde mükerrer öğrenci numarası');
                    }
                    continue;
                }

                // 3. Bu sınava zaten kayıtlı mı?
                if (existingStudentNumbers.has(studentNumber)) {
                    row.isValid = false;
                    row.validationStatus = 'duplicate_in_exam';
                    if (!row.errorReason.includes('Sınava zaten kayıtlı')) {
                        row.errorReason.push('Bu öğrenci sınava zaten kayıtlı (veriler güncellenecek)');
                    }
                    continue;
                }

                // 4. Sistemde kayıtlı değilse bilgilendir
                if (!systemStudentNumbers.has(studentNumber)) {
                    row.validationStatus = 'not_registered';
                    if (!row.errorReason.includes('Sistemde kayıtlı değil')) {
                        row.errorReason.push('Sistemde kayıtlı değil (yeni öğrenci oluşturulacak)');
                    }
                    // Fakat bu durumda isValid = true kalır, çünkü sistem yeni öğrenci ekleyebilir
                } else {
                    // Sistemde var ve mükerrer değil = Valid
                    row.validationStatus = 'valid';
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

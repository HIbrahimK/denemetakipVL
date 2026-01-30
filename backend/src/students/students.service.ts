import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as ExcelJS from 'exceljs';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) { }

    async findAll(schoolId: string, query: { gradeId?: string; classId?: string; search?: string; className?: string }) {
        const { gradeId, classId, search, className } = query;

        // Parse className if provided (format: "12-B")
        let parsedGradeName: string | undefined;
        let parsedClassName: string | undefined;
        if (className) {
            const parts = className.split('-');
            if (parts.length === 2) {
                parsedGradeName = parts[0];
                parsedClassName = parts[1];
            }
        }

        return this.prisma.student.findMany({
            where: {
                schoolId,
                ...(classId && { classId }),
                ...(gradeId && {
                    class: {
                        gradeId,
                    },
                }),
                ...(parsedGradeName && parsedClassName && {
                    class: {
                        grade: {
                            name: {
                                equals: parsedGradeName,
                                mode: 'insensitive'
                            }
                        },
                        name: {
                            equals: parsedClassName,
                            mode: 'insensitive'
                        }
                    }
                }),
                ...(search && {
                    OR: [
                        { user: { firstName: { contains: search, mode: 'insensitive' } } },
                        { user: { lastName: { contains: search, mode: 'insensitive' } } },
                        { studentNumber: { contains: search, mode: 'insensitive' } },
                        { tcNo: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            include: {
                user: true,
                class: {
                    include: {
                        grade: true,
                    },
                },
            },
            orderBy: [
                { class: { grade: { name: 'asc' } } },
                { class: { name: 'asc' } },
                { user: { firstName: 'asc' } },
            ],
        });
    }

    async findOne(id: string, schoolId: string) {
        const student = await this.prisma.student.findFirst({
            where: { id, schoolId },
            include: {
                user: true,
                class: {
                    include: {
                        grade: true,
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException('Öğrenci bulunamadı');
        }

        return student;
    }

    async create(schoolId: string, dto: CreateStudentDto) {
        // Check if student number exists in this school
        if (dto.studentNumber) {
            const existing = await this.prisma.student.findFirst({
                where: { studentNumber: dto.studentNumber, schoolId },
            });
            if (existing) {
                throw new ConflictException('Bu öğrenci numarası zaten kullanımda');
            }
        }

        // Check if TC exists
        if (dto.tcNo) {
            const existingTc = await this.prisma.student.findUnique({
                where: { tcNo: dto.tcNo },
            });
            if (existingTc) {
                throw new ConflictException('Bu TC numarası zaten kullanımda');
            }
        }

        // Find or create grade
        let grade = await this.prisma.grade.findFirst({
            where: { name: dto.gradeName, schoolId },
        });
        if (!grade) {
            grade = await this.prisma.grade.create({
                data: { name: dto.gradeName, schoolId },
            });
        }

        // Find or create class
        let studentClass = await this.prisma.class.findFirst({
            where: { name: dto.className, gradeId: grade.id, schoolId },
        });
        if (!studentClass) {
            studentClass = await this.prisma.class.create({
                data: { name: dto.className, gradeId: grade.id, schoolId },
            });
        }

        const hashedPassword = await bcrypt.hash(dto.password || '123456', 10);
        // Generate placeholder email if not provided
        const email = `${dto.studentNumber || Math.random().toString(36).substring(7)}@${schoolId}.denemetakip.com`;

        return this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: 'STUDENT',
                schoolId,
                student: {
                    create: {
                        studentNumber: dto.studentNumber,
                        tcNo: dto.tcNo,
                        classId: studentClass.id,
                        schoolId,
                    },
                },
            },
            include: {
                student: {
                    include: {
                        class: {
                            include: {
                                grade: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async update(id: string, schoolId: string, dto: UpdateStudentDto) {
        const student = await this.findOne(id, schoolId);

        // If grade/class changed, update them
        let classId = student.classId;
        if (dto.gradeName || dto.className) {
            const gradeName = dto.gradeName || student.class.grade.name;
            const className = dto.className || student.class.name;

            let grade = await this.prisma.grade.findFirst({
                where: { name: gradeName, schoolId },
            });
            if (!grade) {
                grade = await this.prisma.grade.create({
                    data: { name: gradeName, schoolId },
                });
            }

            let studentClass = await this.prisma.class.findFirst({
                where: { name: className, gradeId: grade.id, schoolId },
            });
            if (!studentClass) {
                studentClass = await this.prisma.class.create({
                    data: { name: className, gradeId: grade.id, schoolId },
                });
            }
            classId = studentClass.id;
        }

        if (dto.firstName || dto.lastName) {
            await this.prisma.user.update({
                where: { id: student.userId },
                data: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                },
            });
        }

        return this.prisma.student.update({
            where: { id },
            data: {
                studentNumber: dto.studentNumber,
                tcNo: dto.tcNo,
                classId,
            },
            include: {
                user: true,
                class: {
                    include: {
                        grade: true,
                    },
                },
            },
        });
    }

    async remove(id: string, schoolId: string) {
        const student = await this.findOne(id, schoolId);

        // Delete student and associated user
        await this.prisma.student.delete({ where: { id } });
        await this.prisma.user.delete({ where: { id: student.userId } });

        return { success: true };
    }

    async bulkDelete(studentIds: string[], schoolId: string) {
        // Verify all students belong to this school
        const students = await this.prisma.student.findMany({
            where: {
                id: { in: studentIds },
                schoolId,
            },
            select: { id: true, userId: true },
        });

        if (students.length !== studentIds.length) {
            throw new NotFoundException('Bazı öğrenciler bulunamadı veya farklı okula ait');
        }

        const userIds = students.map(s => s.userId);

        // Delete students and their users in transaction
        await this.prisma.$transaction([
            this.prisma.student.deleteMany({
                where: { id: { in: studentIds } },
            }),
            this.prisma.user.deleteMany({
                where: { id: { in: userIds } },
            }),
        ]);

        return { success: true, count: students.length, message: `${students.length} öğrenci silindi` };
    }

    async bulkTransfer(studentIds: string[], schoolId: string, gradeName: string, className: string) {
        // Verify all students belong to this school
        const students = await this.prisma.student.findMany({
            where: {
                id: { in: studentIds },
                schoolId,
            },
        });

        if (students.length !== studentIds.length) {
            throw new NotFoundException('Bazı öğrenciler bulunamadı veya farklı okula ait');
        }

        // Find or create grade
        let grade = await this.prisma.grade.findFirst({
            where: { name: gradeName, schoolId },
        });
        if (!grade) {
            grade = await this.prisma.grade.create({
                data: { name: gradeName, schoolId },
            });
        }

        // Find or create class
        let studentClass = await this.prisma.class.findFirst({
            where: { name: className, gradeId: grade.id, schoolId },
        });
        if (!studentClass) {
            studentClass = await this.prisma.class.create({
                data: { name: className, gradeId: grade.id, schoolId },
            });
        }

        // Update all students
        await this.prisma.student.updateMany({
            where: { id: { in: studentIds } },
            data: { classId: studentClass.id },
        });

        return { 
            success: true, 
            count: students.length, 
            message: `${students.length} öğrenci ${gradeName} ${className} sınıfına aktarıldı` 
        };
    }

    async changePassword(id: string, schoolId: string, dto: ChangePasswordDto) {
        const student = await this.findOne(id, schoolId);
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.user.update({
            where: { id: student.userId },
            data: { password: hashedPassword },
        });

        return { success: true };
    }

    async changeParentPassword(id: string, schoolId: string, dto: ChangePasswordDto) {
        const student = await this.findOne(id, schoolId);
        
        // Check if student has a parent
        if (!student.parentId) {
            throw new NotFoundException('Bu öğrencinin velisi bulunamadı');
        }

        // Get parent user
        const parent = await this.prisma.parent.findUnique({
            where: { id: student.parentId },
            include: { user: true },
        });

        if (!parent) {
            throw new NotFoundException('Veli bulunamadı');
        }

        // Update parent password
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: parent.userId },
            data: { password: hashedPassword },
        });

        return { success: true, message: 'Veli şifresi başarıyla değiştirildi' };
    }

    async importFromExcel(schoolId: string, buffer: Buffer) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) throw new Error('Excel sayfası bulunamadı.');

        const students: CreateStudentDto[] = [];
        // Row 1 is header
        worksheet.eachRow((row, rowIndex) => {
            if (rowIndex < 2) return;

            const firstName = row.getCell(1).text?.trim();
            const lastName = row.getCell(2).text?.trim();
            const studentNumber = row.getCell(3).text?.trim();
            const gradeName = row.getCell(4).text?.trim();
            const className = row.getCell(5).text?.trim();
            const password = row.getCell(6).text?.trim();

            if (firstName && lastName) {
                students.push({
                    firstName,
                    lastName,
                    studentNumber: studentNumber?.toString(),
                    gradeName: gradeName?.toString() || '',
                    className: className?.toString() || '',
                    password: password?.toString() || '123456',
                });
            }
        });

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        for (const studentData of students) {
            try {
                await this.create(schoolId, studentData);
                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push(`${studentData.firstName} ${studentData.lastName}: ${error.message}`);
            }
        }

        return results;
    }

    async getFilters(schoolId: string) {
        const grades = await this.prisma.grade.findMany({
            where: { schoolId },
            include: {
                classes: true,
            },
            orderBy: { name: 'asc' },
        });

        return grades;
    }

    async getStudentExamHistory(studentId: string, schoolId: string, requestingUser?: any) {
        // Authorization check: Students can only access their own data
        if (requestingUser) {
            const isStudent = requestingUser.role === 'STUDENT';
            const isOwnData = requestingUser.student?.id === studentId;
            const isTeacherOrAdmin = ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(requestingUser.role);
            
            if (isStudent && !isOwnData) {
                throw new ForbiddenException('Öğrenciler sadece kendi sonuçlarını görüntüleyebilir');
            }
            
            if (!isStudent && !isTeacherOrAdmin) {
                throw new ForbiddenException('Bu kaynağa erişim yetkiniz yok');
            }
        }

        // Get student with class info to determine grade level
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: true,
                class: {
                    include: {
                        grade: true,
                    },
                },
                examAttempts: {
                    include: {
                        exam: {
                            include: {
                                _count: {
                                    select: { attempts: true }
                                }
                            }
                        },
                        lessonResults: {
                            include: {
                                lesson: true,
                            },
                        },
                        scores: true,
                    },
                    orderBy: {
                        exam: {
                            date: 'desc',
                        },
                    },
                },
            },
        });

        if (!student) {
            throw new NotFoundException('Öğrenci bulunamadı');
        }

        // Extract grade level number from grade name (e.g., "5. Sınıf" -> 5)
        const gradeName = student.class.grade.name;
        const gradeLevel = parseInt(gradeName.match(/\d+/)?.[0] || '0');

        // Get all exams for this school and grade level to find missed exams
        const allSchoolExams = await this.prisma.exam.findMany({
            where: {
                schoolId,
                // Only get exams for the same grade level
                gradeLevel: gradeLevel > 0 ? gradeLevel : undefined,
            },
            include: {
                attempts: {
                    where: {
                        studentId,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        // Find exams student didn't take
        const missedExams = allSchoolExams
            .filter(exam => exam.attempts.length === 0)
            .map(exam => ({
                id: exam.id,
                title: exam.title,
                date: exam.date,
                type: exam.type,
                publisher: exam.publisher,
            }));

        // Process exam attempts
        const examHistory = student.examAttempts.map(attempt => {
            // Calculate total net
            const totalNet = attempt.lessonResults.reduce((sum, lr) => sum + lr.net, 0);

            // Group lesson results by lesson name
            const lessonResults = attempt.lessonResults.map(lr => ({
                lessonName: lr.lesson.name,
                correct: lr.correct,
                incorrect: lr.incorrect,
                empty: lr.empty,
                net: lr.net,
                point: lr.point,
            }));

            // Process scores with rankings
            const scores = attempt.scores.map(score => ({
                type: score.type,
                score: score.score,
                rankSchool: score.rankSchool,
                rankClass: score.rankClass,
                rankCity: score.rankCity,
                rankGen: score.rankGen,
            }));

            return {
                attemptId: attempt.id,
                examId: attempt.exam.id,
                examTitle: attempt.exam.title,
                examDate: attempt.exam.date,
                examType: attempt.exam.type,
                publisher: attempt.exam.publisher,
                answerKeyUrl: attempt.exam.answerKeyUrl,
                totalNet,
                lessonResults,
                scores,
                // Katılım sayıları - eğer null ise attempts sayısından hesapla
                schoolParticipantCount: attempt.exam.schoolParticipantCount || attempt.exam._count?.attempts || null,
                districtParticipantCount: attempt.exam.districtParticipantCount,
                cityParticipantCount: attempt.exam.cityParticipantCount,
                generalParticipantCount: attempt.exam.generalParticipantCount,
            };
        });

        // Calculate statistics
        const totalExams = examHistory.length;
        const highestScore = examHistory.length > 0
            ? Math.max(...examHistory.flatMap(e => e.scores.map(s => s.score)))
            : 0;

        // Calculate average rankings (school rank)
        const schoolRanks = examHistory.flatMap(e => 
            e.scores.map(s => s.rankSchool).filter(r => r !== null)
        );
        const avgSchoolRank = schoolRanks.length > 0
            ? Math.round(schoolRanks.reduce((a, b) => a + (b || 0), 0) / schoolRanks.length)
            : null;

        return {
            studentInfo: {
                id: student.id,
                firstName: student.user.firstName,
                lastName: student.user.lastName,
                studentNumber: student.studentNumber,
                className: student.class.name,
                gradeName: student.class.grade.name,
            },
            statistics: {
                totalExams,
                highestScore,
                avgSchoolRank,
            },
            examHistory,
            missedExams,
        };
    }
}


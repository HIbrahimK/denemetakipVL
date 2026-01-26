import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as ExcelJS from 'exceljs';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class StudentsService {
    constructor(private prisma: PrismaService) { }

    async findAll(schoolId: string, query: { gradeId?: string; classId?: string; search?: string }) {
        const { gradeId, classId, search } = query;

        return this.prisma.student.findMany({
            where: {
                schoolId,
                ...(classId && { classId }),
                ...(gradeId && {
                    class: {
                        gradeId,
                    },
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

    async changePassword(id: string, schoolId: string, dto: ChangePasswordDto) {
        const student = await this.findOne(id, schoolId);
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.user.update({
            where: { id: student.userId },
            data: { password: hashedPassword },
        });

        return { success: true };
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
}

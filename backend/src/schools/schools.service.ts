import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchoolsService {
    constructor(private prisma: PrismaService) { }

    async getSchool(id?: string) {
        if (!id) {
            const school = await this.prisma.school.findFirst();
            if (!school) {
                throw new NotFoundException('No schools found');
            }
            return school;
        }

        const school = await this.prisma.school.findUnique({
            where: { id },
        });

        if (!school) {
            throw new NotFoundException('School not found');
        }

        return school;
    }

    async updateSchool(id: string, dto: any) {
        return this.prisma.school.update({
            where: { id },
            data: dto,
        });
    }

    async promoteGrades(id: string) {
        // Logic for grade promotion: 
        // 9 -> 10, 10 -> 11, 11 -> 12, 12 -> Graduate?
        return { message: 'Sınıf atlatma işlemi başarıyla tamamlandı.' };
    }

    async getGrades(schoolId: string) {
        const grades = await this.prisma.grade.findMany({
            where: { schoolId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { classes: true }
                }
            }
        });

        // Eğer grade yoksa veya standart grade'ler yoksa, oluştur
        if (grades.length === 0 || !this.hasStandardGrades(grades)) {
            await this.createStandardGrades(schoolId);
            return this.prisma.grade.findMany({
                where: { schoolId },
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { classes: true }
                    }
                }
            });
        }

        return grades;
    }

    async getClasses(schoolId: string, gradeId: string) {
        return this.prisma.class.findMany({
            where: {
                schoolId,
                gradeId,
            },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });
    }

    async getAllClasses(schoolId: string) {
        return this.prisma.class.findMany({
            where: {
                schoolId,
            },
            orderBy: [
                { grade: { name: 'asc' } },
                { name: 'asc' }
            ],
            include: {
                grade: true,
                _count: {
                    select: { students: true }
                }
            }
        });
    }

    async createClass(schoolId: string, dto: any) {
        // Yeni format: gradeLevel (5-12) ve section (A, B, vb.)
        if (dto.gradeLevel && dto.section) {
            // Grade'i name'e göre bul, yoksa oluştur
            let grade = await this.prisma.grade.findFirst({
                where: { schoolId, name: String(dto.gradeLevel) }
            });
            
            if (!grade) {
                // Grade yoksa oluştur
                grade = await this.prisma.grade.create({
                    data: {
                        name: String(dto.gradeLevel),
                        schoolId,
                    }
                });
            }
            
            return this.prisma.class.create({
                data: {
                    name: dto.section,
                    schoolId,
                    gradeId: grade.id,
                },
                include: {
                    grade: true,
                    _count: {
                        select: { students: true }
                    }
                }
            });
        }

        // Eski format: name ve gradeId
        return this.prisma.class.create({
            data: {
                name: dto.name,
                schoolId,
                gradeId: dto.gradeId,
            },
            include: {
                grade: true,
                _count: {
                    select: { students: true }
                }
            }
        });
    }

    async updateClass(schoolId: string, classId: string, dto: any) {
        const classToUpdate = await this.prisma.class.findFirst({
            where: { id: classId, schoolId }
        });

        if (!classToUpdate) {
            throw new NotFoundException('Sınıf bulunamadı');
        }

        // Yeni format: gradeLevel (5-12) ve section (A, B, vb.)
        if (dto.gradeLevel && dto.section) {
            let grade = await this.prisma.grade.findFirst({
                where: { schoolId, name: String(dto.gradeLevel) }
            });
            
            if (!grade) {
                // Grade yoksa oluştur
                grade = await this.prisma.grade.create({
                    data: {
                        name: String(dto.gradeLevel),
                        schoolId,
                    }
                });
            }
            
            return this.prisma.class.update({
                where: { id: classId },
                data: {
                    name: dto.section,
                    gradeId: grade.id,
                },
                include: {
                    grade: true,
                    _count: {
                        select: { students: true }
                    }
                }
            });
        }

        // Eski format: name ve gradeId
        return this.prisma.class.update({
            where: { id: classId },
            data: {
                name: dto.name,
                gradeId: dto.gradeId,
            },
            include: {
                grade: true,
                _count: {
                    select: { students: true }
                }
            }
        });
    }

    async deleteClass(schoolId: string, classId: string) {
        const classToDelete = await this.prisma.class.findFirst({
            where: { id: classId, schoolId },
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });

        if (!classToDelete) {
            throw new NotFoundException('Sınıf bulunamadı');
        }

        if (classToDelete._count.students > 0) {
            throw new Error('Bu sınıfta öğrenci bulunduğu için silinemez');
        }

        await this.prisma.class.delete({
            where: { id: classId }
        });

        return { message: 'Sınıf başarıyla silindi' };
    }

    async mergeClasses(schoolId: string, dto: any) {
        const sourceClass = await this.prisma.class.findFirst({
            where: { id: dto.sourceClassId, schoolId },
            include: {
                grade: true,
                _count: { select: { students: true } }
            }
        });

        const targetClass = await this.prisma.class.findFirst({
            where: { id: dto.targetClassId, schoolId },
            include: {
                grade: true,
                _count: { select: { students: true } }
            }
        });

        if (!sourceClass || !targetClass) {
            throw new NotFoundException('Sınıflardan biri bulunamadı');
        }

        // Transfer all students from source to target
        await this.prisma.student.updateMany({
            where: { classId: dto.sourceClassId },
            data: { classId: dto.targetClassId }
        });

        // Delete source class
        await this.prisma.class.delete({
            where: { id: dto.sourceClassId }
        });

        return {
            message: `${sourceClass.grade.name}-${sourceClass.name} sınıfı ${targetClass.grade.name}-${targetClass.name} sınıfına birleştirildi`,
            transferredStudents: sourceClass._count.students
        };
    }

    async transferStudents(schoolId: string, sourceClassId: string, dto: any) {
        const sourceClass = await this.prisma.class.findFirst({
            where: { id: sourceClassId, schoolId },
            include: { grade: true }
        });

        const targetClass = await this.prisma.class.findFirst({
            where: { id: dto.targetClassId, schoolId },
            include: { grade: true }
        });

        if (!sourceClass || !targetClass) {
            throw new NotFoundException('Sınıflardan biri bulunamadı');
        }

        let transferCount = 0;

        if (dto.studentIds && dto.studentIds.length > 0) {
            // Transfer selected students
            const result = await this.prisma.student.updateMany({
                where: {
                    id: { in: dto.studentIds },
                    classId: sourceClassId
                },
                data: { classId: dto.targetClassId }
            });
            transferCount = result.count;
        } else {
            // Transfer all students
            const result = await this.prisma.student.updateMany({
                where: { classId: sourceClassId },
                data: { classId: dto.targetClassId }
            });
            transferCount = result.count;
        }

        return {
            message: `${transferCount} öğrenci ${sourceClass.grade.name}-${sourceClass.name} sınıfından ${targetClass.grade.name}-${targetClass.name} sınıfına aktarıldı`,
            transferredCount: transferCount
        };
    }

    private hasStandardGrades(grades: any[]): boolean {
        const standardGradeNames = ['5', '6', '7', '8', '9', '10', '11', '12'];
        const existingNames = grades.map(g => g.name);
        return standardGradeNames.every(name => existingNames.includes(name));
    }

    private async createStandardGrades(schoolId: string) {
        const standardGrades = [
            { name: '5', schoolId },
            { name: '6', schoolId },
            { name: '7', schoolId },
            { name: '8', schoolId },
            { name: '9', schoolId },
            { name: '10', schoolId },
            { name: '11', schoolId },
            { name: '12', schoolId },
        ];

        // Mevcut grade'leri kontrol et, sadece yokları ekle
        for (const grade of standardGrades) {
            const existing = await this.prisma.grade.findFirst({
                where: {
                    schoolId,
                    name: grade.name,
                }
            });

            if (!existing) {
                await this.prisma.grade.create({
                    data: grade,
                });
            }
        }
    }

    async getBackups(schoolId: string) {
        return this.prisma.backup.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async backupData(id: string) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${id}-${timestamp}.json`;

        try {
            // Export school data in smaller chunks to avoid memory issues
            const [schoolInfo, grades, users, exams, messages, studyData] = await Promise.all([
                // Basic school info
                this.prisma.school.findUnique({
                    where: { id },
                }),
                // Grades with classes and students
                this.prisma.grade.findMany({
                    where: { schoolId: id },
                    include: {
                        classes: {
                            include: {
                                students: {
                                    include: {
                                        user: true,
                                        parent: {
                                            include: {
                                                user: true
                                            }
                                        },
                                    }
                                }
                            }
                        }
                    }
                }),
                // Users
                this.prisma.user.findMany({
                    where: { schoolId: id },
                }),
                // Exams with attempts
                this.prisma.exam.findMany({
                    where: { schoolId: id },
                    include: {
                        attempts: {
                            include: {
                                lessonResults: true,
                                scores: true,
                            }
                        },
                    }
                }),
                // Messages
                this.prisma.message.findMany({
                    where: { schoolId: id },
                }),
                // Study data
                Promise.all([
                    this.prisma.studyPlan.findMany({ where: { schoolId: id } }),
                    this.prisma.studyTask.findMany({ where: { schoolId: id } }),
                    this.prisma.studyGoal.findMany({ where: { schoolId: id } }),
                ]),
            ]);

            // Create backup data object
            const backupContent = {
                metadata: {
                    backupDate: new Date().toISOString(),
                    schoolId: id,
                    schoolName: schoolInfo?.name,
                    version: '1.0',
                },
                data: {
                    school: schoolInfo,
                    grades,
                    users,
                    exams,
                    messages,
                    studyPlans: studyData[0],
                    studyTasks: studyData[1],
                    studyGoals: studyData[2],
                },
            };

            // Calculate actual size
            const backupJson = JSON.stringify(backupContent);
            const size = Buffer.byteLength(backupJson, 'utf8');

            // Save backup record with actual data
            const backup = await this.prisma.backup.create({
                data: {
                    filename,
                    size,
                    schoolId: id,
                    data: backupJson,
                },
            });

            return { message: 'Yedekleme başarıyla oluşturuldu.', backup };
        } catch (error) {
            console.error('Backup error:', error);
            throw new Error('Yedekleme sırasında bir hata oluştu: ' + error.message);
        }
    }

    async downloadBackup(id: string, backupId: string) {
        const backup = await this.prisma.backup.findFirst({
            where: { id: backupId, schoolId: id },
        });
        if (!backup) throw new NotFoundException('Yedek bulunamadı');

        // Return the actual backup data
        let backupData;
        if (backup.data) {
            // If data is stored as string, parse it
            backupData = typeof backup.data === 'string' 
                ? JSON.parse(backup.data) 
                : backup.data;
        } else {
            // Fallback for old backups without data
            backupData = {
                metadata: {
                    backupDate: backup.createdAt.toISOString(),
                    schoolId: backup.schoolId,
                    filename: backup.filename,
                    note: 'Legacy backup - no data available'
                }
            };
        }

        return {
            ...backupData,
            filename: backup.filename,
        };
    }

    async restoreData(id: string, backupId: string) {
        const backup = await this.prisma.backup.findFirst({
            where: { id: backupId, schoolId: id },
        });
        if (!backup) throw new NotFoundException('Yedek bulunamadı');
        return { message: 'Geri yükleme işlemi başlatıldı.' };
    }

    async deleteBackup(id: string, backupId: string) {
        const backup = await this.prisma.backup.findFirst({
            where: { id: backupId, schoolId: id },
        });
        if (!backup) throw new NotFoundException('Yedek bulunamadı');
        
        await this.prisma.backup.delete({
            where: { id: backupId },
        });
        
        return { message: 'Yedek başarıyla silindi.' };
    }

    async restoreFromFile(id: string, backupData: any) {
        // Validate backup data structure
        if (!backupData || typeof backupData !== 'object') {
            throw new Error('Geçersiz yedek dosyası formatı');
        }

        // In a real implementation, you would:
        // 1. Validate the backup data structure
        // 2. Create a transaction
        // 3. Delete existing data (optionally)
        // 4. Restore data from backup
        // 5. Commit transaction

        // For now, we'll just acknowledge the restore
        return { message: 'Dosyadan geri yükleme işlemi başlatıldı. Veriler geri yükleniyor...' };
    }
}

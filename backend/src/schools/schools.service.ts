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
            console.log('Starting comprehensive backup for school:', id);

            // Export ALL school data in organized chunks
            const [
                schoolInfo,
                grades,
                users,
                exams,
                lessons,
                messageData,
                studyData,
                groupData,
                achievementData,
                performanceData,
            ] = await Promise.all([
                // 1. Basic school info
                this.prisma.school.findUnique({
                    where: { id },
                }),

                // 2. Grades with classes and students (with full relations)
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
                                                user: true,
                                            },
                                        },
                                        examAttempts: {
                                            include: {
                                                lessonResults: true,
                                                scores: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),

                // 3. All Users
                this.prisma.user.findMany({
                    where: { schoolId: id },
                }),

                // 4. Exams with all attempts and results
                this.prisma.exam.findMany({
                    where: { schoolId: id },
                    include: {
                        attempts: {
                            include: {
                                lessonResults: true,
                                scores: true,
                            },
                        },
                        notifications: true,
                    },
                }),

                // 5. Lessons
                this.prisma.lesson.findMany({
                    where: { schoolId: id },
                }),

                // 6. Message System (complete)
                Promise.all([
                    this.prisma.message.findMany({
                        where: { schoolId: id },
                        include: {
                            attachments: true,
                            recipients: true,
                            replies: true,
                        },
                    }),
                    this.prisma.messageDraft.findMany({
                        where: { schoolId: id },
                    }),
                    this.prisma.messageSettings.findUnique({
                        where: { schoolId: id },
                    }),
                    this.prisma.messageTemplate.findMany({
                        where: { schoolId: id },
                    }),
                ]),

                // 7. Study Plans & Tasks (complete)
                Promise.all([
                    this.prisma.studyPlan.findMany({
                        where: { schoolId: id },
                        include: {
                            assignments: true,
                            tasks: true,
                        },
                    }),
                    this.prisma.studyTask.findMany({
                        where: { schoolId: id },
                    }),
                    this.prisma.studyPlanAssignment.findMany({
                        where: { schoolId: id },
                    }),
                    this.prisma.studyPlanTemplate.findMany({
                        where: { schoolId: id },
                        include: {
                            ratings: true,
                        },
                    }),
                    this.prisma.studyRecommendation.findMany({
                        where: { schoolId: id },
                    }),
                    this.prisma.studySession.findMany({
                        where: { schoolId: id },
                    }),
                ]),

                // 8. Group/Mentor System (complete)
                Promise.all([
                    this.prisma.mentorGroup.findMany({
                        where: { schoolId: id },
                        include: {
                            memberships: true,
                            goals: true,
                            posts: {
                                include: {
                                    replies: true,
                                    responses: true,
                                },
                            },
                            groupPlans: true,
                        },
                    }),
                    this.prisma.groupMembership.findMany({
                        where: { schoolId: id },
                    }),
                    this.prisma.groupGoal.findMany({
                        where: { schoolId: id },
                    }),
                    this.prisma.groupPost.findMany({
                        where: { schoolId: id },
                        include: {
                            replies: true,
                            responses: true,
                        },
                    }),
                ]),

                // 9. Achievement System
                Promise.all([
                    this.prisma.achievement.findMany({
                        where: { schoolId: id },
                    }),
                    this.prisma.studentAchievement.findMany({
                        where: { schoolId: id },
                    }),
                ]),

                // 10. Performance Data
                this.prisma.studentPerformanceSummary.findMany({
                    where: { schoolId: id },
                }),
            ]);

            // Create comprehensive backup data object
            const backupContent = {
                metadata: {
                    backupDate: new Date().toISOString(),
                    schoolId: id,
                    schoolName: schoolInfo?.name,
                    version: '2.0', // Updated version for comprehensive backup
                    dataTypes: [
                        'school',
                        'grades',
                        'users',
                        'exams',
                        'lessons',
                        'messages',
                        'studyPlans',
                        'groups',
                        'achievements',
                        'performance',
                    ],
                },
                data: {
                    // Core Data
                    school: schoolInfo,
                    grades,
                    users,
                    lessons,

                    // Exam System
                    exams,
                    examAttempts: exams.flatMap((e) => e.attempts || []),
                    examLessonResults: exams.flatMap((e) =>
                        e.attempts?.flatMap((a) => a.lessonResults || []) || [],
                    ),
                    examScores: exams.flatMap((e) =>
                        e.attempts?.flatMap((a) => a.scores || []) || [],
                    ),
                    examNotifications: exams.flatMap((e) => e.notifications || []),

                    // Message System
                    messages: messageData[0],
                    messageAttachments: messageData[0].flatMap((m) => m.attachments || []),
                    messageRecipients: messageData[0].flatMap((m) => m.recipients || []),
                    messageReplies: messageData[0].flatMap((m) => m.replies || []),
                    messageDrafts: messageData[1],
                    messageSettings: messageData[2],
                    messageTemplates: messageData[3],

                    // Study Plans System
                    studyPlans: studyData[0],
                    studyTasks: studyData[1],
                    studyPlanAssignments: studyData[2],
                    studyPlanTemplates: studyData[3],
                    templateRatings: studyData[3].flatMap((t) => t.ratings || []),
                    studyRecommendations: studyData[4],
                    studySessions: studyData[5],

                    // Group/Mentor System
                    mentorGroups: groupData[0],
                    groupMemberships: groupData[1],
                    groupGoals: groupData[2],
                    groupPosts: groupData[3],
                    groupPostReplies: groupData[3].flatMap((p) => p.replies || []),
                    groupPostResponses: groupData[3].flatMap((p) => p.responses || []),

                    // Achievement System
                    achievements: achievementData[0],
                    studentAchievements: achievementData[1],

                    // Performance Data
                    studentPerformanceSummaries: performanceData,
                },
            };

            // Calculate actual size
            const backupJson = JSON.stringify(backupContent);
            const size = Buffer.byteLength(backupJson, 'utf8');

            console.log(`Backup size: ${(size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`Total data types backed up: ${backupContent.metadata.dataTypes.length}`);

            // Save backup record with actual data
            const backup = await this.prisma.backup.create({
                data: {
                    filename,
                    size,
                    schoolId: id,
                    data: backupJson,
                },
            });

            return {
                message: 'Kapsamlı yedekleme başarıyla oluşturuldu.',
                backup,
                stats: {
                    size: `${(size / 1024 / 1024).toFixed(2)} MB`,
                    dataTypes: backupContent.metadata.dataTypes.length,
                    totalRecords: {
                        users: users.length,
                        exams: exams.length,
                        messages: messageData[0].length,
                        studyPlans: studyData[0].length,
                        groups: groupData[0].length,
                        achievements: achievementData[0].length,
                    },
                },
            };
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

        // Parse backup data
        let backupData;
        if (backup.data) {
            backupData = typeof backup.data === 'string' ? JSON.parse(backup.data) : backup.data;
        } else {
            throw new Error('Yedek verisi bulunamadı');
        }

        // Restore using the main restore logic
        return this.performRestore(id, backupData);
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

        if (!backupData.data || !backupData.metadata) {
            throw new Error('Yedek dosyası eksik veya bozuk');
        }

        // Restore using the main restore logic
        return this.performRestore(id, backupData);
    }

    /**
     * Main restore logic - performs complete data restoration
     * WARNING: This will DELETE all existing school data before restoration
     */
    private async performRestore(schoolId: string, backupData: any) {
        const data = backupData.data;

        if (!data) {
            throw new Error('Yedek verisi bulunamadı');
        }

        console.log('Starting restore process for school:', schoolId);
        console.log('Backup version:', backupData.metadata?.version);

        try {
            // Use transaction to ensure data integrity
            await this.prisma.$transaction(
                async (tx) => {
                    console.log('Step 1: Deleting existing data in correct order...');

                    // Delete in reverse dependency order to avoid foreign key conflicts
                    // 1. Delete child relations first
                    await tx.groupPostReply.deleteMany({ where: { post: { schoolId } } });
                    await tx.groupPostResponse.deleteMany({ where: { post: { schoolId } } });
                    await tx.groupPost.deleteMany({ where: { schoolId } });
                    await tx.groupStudyPlan.deleteMany({
                        where: { group: { schoolId } },
                    });
                    await tx.groupGoal.deleteMany({ where: { schoolId } });
                    await tx.groupMembership.deleteMany({ where: { schoolId } });
                    await tx.mentorGroup.deleteMany({ where: { schoolId } });

                    await tx.studentAchievement.deleteMany({ where: { schoolId } });
                    await tx.achievement.deleteMany({ where: { schoolId } });

                    await tx.messageReply.deleteMany({ where: { message: { schoolId } } });
                    await tx.messageRecipient.deleteMany({ where: { message: { schoolId } } });
                    await tx.messageAttachment.deleteMany({ where: { message: { schoolId } } });
                    await tx.messageDraft.deleteMany({ where: { schoolId } });
                    await tx.message.deleteMany({ where: { schoolId } });

                    await tx.studySession.deleteMany({ where: { schoolId } });
                    await tx.studyRecommendation.deleteMany({ where: { schoolId } });
                    await tx.templateRating.deleteMany({ where: { template: { schoolId } } });
                    await tx.studyPlanTemplate.deleteMany({ where: { schoolId } });
                    await tx.studyTask.deleteMany({ where: { schoolId } });
                    await tx.studyPlanAssignment.deleteMany({ where: { schoolId } });
                    await tx.studentPerformanceSummary.deleteMany({ where: { schoolId } });
                    await tx.studyPlan.deleteMany({ where: { schoolId } });

                    await tx.examNotification.deleteMany({ where: { exam: { schoolId } } });
                    await tx.examScore.deleteMany({ where: { schoolId } });
                    await tx.examLessonResult.deleteMany({ where: { schoolId } });
                    await tx.examAttempt.deleteMany({ where: { schoolId } });
                    await tx.exam.deleteMany({ where: { schoolId } });

                    await tx.lesson.deleteMany({ where: { schoolId } });

                    await tx.student.deleteMany({ where: { schoolId } });
                    await tx.parent.deleteMany({ where: { user: { schoolId } } });
                    await tx.passwordResetToken.deleteMany({ where: { user: { schoolId } } });
                    await tx.user.deleteMany({ where: { schoolId } });

                    await tx.class.deleteMany({ where: { schoolId } });
                    await tx.grade.deleteMany({ where: { schoolId } });

                    console.log('Step 2: Restoring core data...');

                    // 2. Restore Users (required for foreign keys)
                    if (data.users?.length) {
                        console.log(`Restoring ${data.users.length} users...`);
                        for (const user of data.users) {
                            await tx.user.create({
                                data: {
                                    id: user.id,
                                    email: user.email,
                                    password: user.password,
                                    role: user.role,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    schoolId: user.schoolId,
                                    avatarSeed: user.avatarSeed,
                                    branch: user.branch,
                                    createdAt: user.createdAt,
                                    updatedAt: user.updatedAt,
                                },
                            });
                        }
                    }

                    // 3. Restore Grades and Classes
                    if (data.grades?.length) {
                        console.log(`Restoring ${data.grades.length} grades...`);
                        for (const grade of data.grades) {
                            await tx.grade.create({
                                data: {
                                    id: grade.id,
                                    name: grade.name,
                                    schoolId: grade.schoolId,
                                },
                            });

                            if (grade.classes?.length) {
                                for (const cls of grade.classes) {
                                    await tx.class.create({
                                        data: {
                                            id: cls.id,
                                            name: cls.name,
                                            gradeId: cls.gradeId,
                                            schoolId: cls.schoolId,
                                        },
                                    });
                                }
                            }
                        }
                    }

                    // 4. Restore Parents and Students
                    const allStudents = data.grades?.flatMap((g) =>
                        g.classes?.flatMap((c) => c.students || []) || [],
                    ) || [];

                    const parents = allStudents
                        .filter((s) => s.parent)
                        .map((s) => s.parent)
                        .filter(
                            (parent, index, self) =>
                                index === self.findIndex((p) => p.id === parent.id),
                        );

                    if (parents.length) {
                        console.log(`Restoring ${parents.length} parents...`);
                        for (const parent of parents) {
                            if (parent.user) {
                                await tx.parent.create({
                                    data: {
                                        id: parent.id,
                                        userId: parent.userId,
                                    },
                                });
                            }
                        }
                    }

                    if (allStudents.length) {
                        console.log(`Restoring ${allStudents.length} students...`);
                        for (const student of allStudents) {
                            await tx.student.create({
                                data: {
                                    id: student.id,
                                    studentNumber: student.studentNumber,
                                    userId: student.userId,
                                    classId: student.classId,
                                    schoolId: student.schoolId,
                                    parentId: student.parentId,
                                    tcNo: student.tcNo,
                                    rewardPoints: student.rewardPoints || 0,
                                },
                            });
                        }
                    }

                    // 5. Restore Lessons
                    if (data.lessons?.length) {
                        console.log(`Restoring ${data.lessons.length} lessons...`);
                        for (const lesson of data.lessons) {
                            await tx.lesson.create({
                                data: {
                                    id: lesson.id,
                                    name: lesson.name,
                                    examType: lesson.examType,
                                    schoolId: lesson.schoolId,
                                },
                            });
                        }
                    }

                    // 6. Restore Exams and Related Data
                    if (data.exams?.length) {
                        console.log(`Restoring ${data.exams.length} exams...`);
                        for (const exam of data.exams) {
                            await tx.exam.create({
                                data: {
                                    id: exam.id,
                                    title: exam.title,
                                    type: exam.type,
                                    date: exam.date,
                                    schoolId: exam.schoolId,
                                    gradeLevel: exam.gradeLevel,
                                    participantCount: exam.participantCount,
                                    publisher: exam.publisher,
                                    city: exam.city,
                                    district: exam.district,
                                    generalInfo: exam.generalInfo,
                                    branchParticipantCount: exam.branchParticipantCount,
                                    schoolParticipantCount: exam.schoolParticipantCount,
                                    cityParticipantCount: exam.cityParticipantCount,
                                    districtParticipantCount: exam.districtParticipantCount,
                                    generalParticipantCount: exam.generalParticipantCount,
                                    answerKeyUrl: exam.answerKeyUrl,
                                    applicationDateTime: exam.applicationDateTime,
                                    broughtBy: exam.broughtBy,
                                    color: exam.color,
                                    fee: exam.fee,
                                    isAnswerKeyPublic: exam.isAnswerKeyPublic,
                                    isArchived: exam.isArchived,
                                    isPaid: exam.isPaid,
                                    isPublished: exam.isPublished,
                                    isPublisherVisible: exam.isPublisherVisible,
                                    quantity: exam.quantity,
                                    scheduledDateTime: exam.scheduledDateTime,
                                    createdAt: exam.createdAt,
                                    updatedAt: exam.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.examAttempts?.length) {
                        console.log(`Restoring ${data.examAttempts.length} exam attempts...`);
                        for (const attempt of data.examAttempts) {
                            await tx.examAttempt.create({
                                data: {
                                    id: attempt.id,
                                    examId: attempt.examId,
                                    studentId: attempt.studentId,
                                    schoolId: attempt.schoolId,
                                    createdAt: attempt.createdAt,
                                },
                            });
                        }
                    }

                    if (data.examLessonResults?.length) {
                        console.log(`Restoring ${data.examLessonResults.length} lesson results...`);
                        for (const result of data.examLessonResults) {
                            await tx.examLessonResult.create({
                                data: {
                                    id: result.id,
                                    attemptId: result.attemptId,
                                    lessonId: result.lessonId,
                                    correct: result.correct,
                                    incorrect: result.incorrect,
                                    empty: result.empty,
                                    net: result.net,
                                    point: result.point,
                                    schoolId: result.schoolId,
                                },
                            });
                        }
                    }

                    if (data.examScores?.length) {
                        console.log(`Restoring ${data.examScores.length} exam scores...`);
                        for (const score of data.examScores) {
                            await tx.examScore.create({
                                data: {
                                    id: score.id,
                                    attemptId: score.attemptId,
                                    type: score.type,
                                    score: score.score,
                                    rankSchool: score.rankSchool,
                                    rankClass: score.rankClass,
                                    rankDistrict: score.rankDistrict,
                                    rankCity: score.rankCity,
                                    rankGen: score.rankGen,
                                    schoolId: score.schoolId,
                                },
                            });
                        }
                    }

                    if (data.examNotifications?.length) {
                        console.log(`Restoring ${data.examNotifications.length} notifications...`);
                        for (const notif of data.examNotifications) {
                            await tx.examNotification.create({
                                data: {
                                    id: notif.id,
                                    examId: notif.examId,
                                    notificationType: notif.notificationType,
                                    scheduledFor: notif.scheduledFor,
                                    sentAt: notif.sentAt,
                                    isSent: notif.isSent,
                                    messageId: notif.messageId,
                                    createdAt: notif.createdAt,
                                },
                            });
                        }
                    }

                    // 7. Restore Message System
                    if (data.messages?.length) {
                        console.log(`Restoring ${data.messages.length} messages...`);
                        for (const message of data.messages) {
                            await tx.message.create({
                                data: {
                                    id: message.id,
                                    senderId: message.senderId,
                                    subject: message.subject,
                                    body: message.body,
                                    type: message.type,
                                    category: message.category,
                                    status: message.status,
                                    targetRoles: message.targetRoles,
                                    targetGradeId: message.targetGradeId,
                                    targetClassId: message.targetClassId,
                                    scheduledFor: message.scheduledFor,
                                    sentAt: message.sentAt,
                                    requiresApproval: message.requiresApproval,
                                    approvedBy: message.approvedBy,
                                    approvedAt: message.approvedAt,
                                    schoolId: message.schoolId,
                                    allowReplies: message.allowReplies,
                                    groupId: message.groupId,
                                    deletedAt: message.deletedAt,
                                    createdAt: message.createdAt,
                                    updatedAt: message.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.messageAttachments?.length) {
                        for (const attachment of data.messageAttachments) {
                            await tx.messageAttachment.create({
                                data: {
                                    id: attachment.id,
                                    messageId: attachment.messageId,
                                    filename: attachment.filename,
                                    fileUrl: attachment.fileUrl,
                                    fileSize: attachment.fileSize,
                                    mimeType: attachment.mimeType,
                                    createdAt: attachment.createdAt,
                                },
                            });
                        }
                    }

                    if (data.messageRecipients?.length) {
                        for (const recipient of data.messageRecipients) {
                            await tx.messageRecipient.create({
                                data: {
                                    id: recipient.id,
                                    messageId: recipient.messageId,
                                    recipientId: recipient.recipientId,
                                    isRead: recipient.isRead,
                                    readAt: recipient.readAt,
                                    deliveredAt: recipient.deliveredAt,
                                    deletedAt: recipient.deletedAt,
                                    isFavorite: recipient.isFavorite,
                                    createdAt: recipient.createdAt,
                                },
                            });
                        }
                    }

                    if (data.messageReplies?.length) {
                        for (const reply of data.messageReplies) {
                            await tx.messageReply.create({
                                data: {
                                    id: reply.id,
                                    messageId: reply.messageId,
                                    senderId: reply.senderId,
                                    body: reply.body,
                                    deletedAt: reply.deletedAt,
                                    createdAt: reply.createdAt,
                                },
                            });
                        }
                    }

                    if (data.messageDrafts?.length) {
                        for (const draft of data.messageDrafts) {
                            await tx.messageDraft.create({
                                data: {
                                    id: draft.id,
                                    userId: draft.userId,
                                    subject: draft.subject,
                                    body: draft.body,
                                    category: draft.category,
                                    targetRoles: draft.targetRoles,
                                    targetGradeId: draft.targetGradeId,
                                    targetClassId: draft.targetClassId,
                                    recipientIds: draft.recipientIds,
                                    schoolId: draft.schoolId,
                                    allowReplies: draft.allowReplies,
                                    createdAt: draft.createdAt,
                                    updatedAt: draft.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.messageSettings) {
                        await tx.messageSettings.create({
                            data: {
                                id: data.messageSettings.id,
                                schoolId: data.messageSettings.schoolId,
                                maxCharacterLimit: data.messageSettings.maxCharacterLimit,
                                autoDeleteDays: data.messageSettings.autoDeleteDays,
                                requireTeacherApproval: data.messageSettings.requireTeacherApproval,
                                enableEmailNotifications: data.messageSettings.enableEmailNotifications,
                                enablePushNotifications: data.messageSettings.enablePushNotifications,
                                reminderAfterDays: data.messageSettings.reminderAfterDays,
                                createdAt: data.messageSettings.createdAt,
                                updatedAt: data.messageSettings.updatedAt,
                            },
                        });
                    }

                    if (data.messageTemplates?.length) {
                        for (const template of data.messageTemplates) {
                            await tx.messageTemplate.create({
                                data: {
                                    id: template.id,
                                    name: template.name,
                                    subject: template.subject,
                                    body: template.body,
                                    category: template.category,
                                    schoolId: template.schoolId,
                                    createdAt: template.createdAt,
                                    updatedAt: template.updatedAt,
                                },
                            });
                        }
                    }

                    // 8. Restore Study Plans System
                    if (data.studyPlans?.length) {
                        console.log(`Restoring ${data.studyPlans.length} study plans...`);
                        for (const plan of data.studyPlans) {
                            await tx.studyPlan.create({
                                data: {
                                    id: plan.id,
                                    teacherId: plan.teacherId,
                                    schoolId: plan.schoolId,
                                    name: plan.name,
                                    description: plan.description,
                                    targetType: plan.targetType,
                                    targetId: plan.targetId,
                                    isTemplate: plan.isTemplate,
                                    examType: plan.examType,
                                    gradeLevels: plan.gradeLevels,
                                    planData: plan.planData,
                                    status: plan.status,
                                    templateName: plan.templateName,
                                    weekStartDate: plan.weekStartDate,
                                    isShared: plan.isShared,
                                    sharedAt: plan.sharedAt,
                                    deletedAt: plan.deletedAt,
                                    endDate: plan.endDate,
                                    isPublic: plan.isPublic,
                                    startDate: plan.startDate,
                                    createdAt: plan.createdAt,
                                    updatedAt: plan.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.studyPlanAssignments?.length) {
                        for (const assignment of data.studyPlanAssignments) {
                            await tx.studyPlanAssignment.create({
                                data: {
                                    id: assignment.id,
                                    schoolId: assignment.schoolId,
                                    assignedById: assignment.assignedById,
                                    targetType: assignment.targetType,
                                    targetId: assignment.targetId,
                                    customPlanData: assignment.customPlanData,
                                    year: assignment.year,
                                    month: assignment.month,
                                    weekNumber: assignment.weekNumber,
                                    status: assignment.status,
                                    expiresAt: assignment.expiresAt,
                                    endDate: assignment.endDate,
                                    planId: assignment.planId,
                                    startDate: assignment.startDate,
                                    createdAt: assignment.createdAt,
                                    updatedAt: assignment.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.studyTasks?.length) {
                        console.log(`Restoring ${data.studyTasks.length} study tasks...`);
                        for (const task of data.studyTasks) {
                            await tx.studyTask.create({
                                data: {
                                    id: task.id,
                                    planId: task.planId,
                                    studentId: task.studentId,
                                    schoolId: task.schoolId,
                                    subjectName: task.subjectName,
                                    status: task.status,
                                    teacherComment: task.teacherComment,
                                    parentComment: task.parentComment,
                                    rowIndex: task.rowIndex,
                                    dayIndex: task.dayIndex,
                                    topicName: task.topicName,
                                    targetQuestionCount: task.targetQuestionCount,
                                    targetDuration: task.targetDuration,
                                    targetResource: task.targetResource,
                                    completedQuestionCount: task.completedQuestionCount,
                                    actualDuration: task.actualDuration,
                                    correctCount: task.correctCount,
                                    wrongCount: task.wrongCount,
                                    blankCount: task.blankCount,
                                    actualResource: task.actualResource,
                                    studentNotes: task.studentNotes,
                                    customContent: task.customContent,
                                    completedAt: task.completedAt,
                                    parentApproved: task.parentApproved,
                                    parentApprovedAt: task.parentApprovedAt,
                                    parentId: task.parentId,
                                    teacherApproved: task.teacherApproved,
                                    teacherApprovedAt: task.teacherApprovedAt,
                                    teacherApprovedById: task.teacherApprovedById,
                                    assignmentId: task.assignmentId,
                                    dueDate: task.dueDate,
                                    createdAt: task.createdAt,
                                    updatedAt: task.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.studyPlanTemplates?.length) {
                        for (const template of data.studyPlanTemplates) {
                            await tx.studyPlanTemplate.create({
                                data: {
                                    id: template.id,
                                    name: template.name,
                                    description: template.description,
                                    authorId: template.authorId,
                                    schoolId: template.schoolId,
                                    examType: template.examType,
                                    gradeLevel: template.gradeLevel,
                                    durationWeeks: template.durationWeeks,
                                    isPublic: template.isPublic,
                                    isOfficial: template.isOfficial,
                                    tags: template.tags,
                                    planData: template.planData,
                                    usageCount: template.usageCount,
                                    averageRating: template.averageRating,
                                    createdAt: template.createdAt,
                                    updatedAt: template.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.templateRatings?.length) {
                        for (const rating of data.templateRatings) {
                            await tx.templateRating.create({
                                data: {
                                    id: rating.id,
                                    templateId: rating.templateId,
                                    userId: rating.userId,
                                    rating: rating.rating,
                                    comment: rating.comment,
                                    createdAt: rating.createdAt,
                                },
                            });
                        }
                    }

                    if (data.studyRecommendations?.length) {
                        for (const rec of data.studyRecommendations) {
                            await tx.studyRecommendation.create({
                                data: {
                                    id: rec.id,
                                    studentId: rec.studentId,
                                    schoolId: rec.schoolId,
                                    recommendationType: rec.recommendationType,
                                    subjectName: rec.subjectName,
                                    topicId: rec.topicId,
                                    reasoning: rec.reasoning,
                                    priority: rec.priority,
                                    estimatedTime: rec.estimatedTime,
                                    isCompleted: rec.isCompleted,
                                    completedAt: rec.completedAt,
                                    expiresAt: rec.expiresAt,
                                    createdAt: rec.createdAt,
                                },
                            });
                        }
                    }

                    if (data.studySessions?.length) {
                        for (const session of data.studySessions) {
                            await tx.studySession.create({
                                data: {
                                    id: session.id,
                                    studentId: session.studentId,
                                    schoolId: session.schoolId,
                                    subjectName: session.subjectName,
                                    topicId: session.topicId,
                                    startTime: session.startTime,
                                    endTime: session.endTime,
                                    duration: session.duration,
                                    isPomodoroMode: session.isPomodoroMode,
                                    createdAt: session.createdAt,
                                },
                            });
                        }
                    }

                    if (data.studentPerformanceSummaries?.length) {
                        for (const summary of data.studentPerformanceSummaries) {
                            await tx.studentPerformanceSummary.create({
                                data: {
                                    id: summary.id,
                                    studentId: summary.studentId,
                                    schoolId: summary.schoolId,
                                    year: summary.year,
                                    month: summary.month,
                                    weekNumber: summary.weekNumber,
                                    totalTasks: summary.totalTasks,
                                    completedTasks: summary.completedTasks,
                                    totalQuestions: summary.totalQuestions,
                                    completedQuestions: summary.completedQuestions,
                                    correctCount: summary.correctCount,
                                    wrongCount: summary.wrongCount,
                                    blankCount: summary.blankCount,
                                    totalDuration: summary.totalDuration,
                                    completionRate: summary.completionRate,
                                    planName: summary.planName,
                                    examType: summary.examType,
                                    planId: summary.planId,
                                    createdAt: summary.createdAt,
                                    updatedAt: summary.updatedAt,
                                },
                            });
                        }
                    }

                    // 9. Restore Group/Mentor System
                    if (data.mentorGroups?.length) {
                        console.log(`Restoring ${data.mentorGroups.length} mentor groups...`);
                        for (const group of data.mentorGroups) {
                            await tx.mentorGroup.create({
                                data: {
                                    id: group.id,
                                    teacherId: group.teacherId,
                                    schoolId: group.schoolId,
                                    name: group.name,
                                    description: group.description,
                                    gradeIds: group.gradeIds,
                                    maxStudents: group.maxStudents,
                                    isActive: group.isActive,
                                    coverImage: group.coverImage,
                                    groupType: group.groupType,
                                    gradeId: group.gradeId,
                                    classId: group.classId,
                                    createdAt: group.createdAt,
                                    updatedAt: group.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.groupMemberships?.length) {
                        for (const membership of data.groupMemberships) {
                            await tx.groupMembership.create({
                                data: {
                                    id: membership.id,
                                    groupId: membership.groupId,
                                    studentId: membership.studentId,
                                    role: membership.role,
                                    joinedAt: membership.joinedAt,
                                    leftAt: membership.leftAt,
                                    schoolId: membership.schoolId,
                                },
                            });
                        }
                    }

                    if (data.groupGoals?.length) {
                        for (const goal of data.groupGoals) {
                            await tx.groupGoal.create({
                                data: {
                                    id: goal.id,
                                    groupId: goal.groupId,
                                    goalType: goal.goalType,
                                    targetData: goal.targetData,
                                    deadline: goal.deadline,
                                    isActive: goal.isActive,
                                    isPublished: goal.isPublished,
                                    isCompleted: goal.isCompleted,
                                    schoolId: goal.schoolId,
                                    createdAt: goal.createdAt,
                                    updatedAt: goal.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.groupPosts?.length) {
                        console.log(`Restoring ${data.groupPosts.length} group posts...`);
                        for (const post of data.groupPosts) {
                            await tx.groupPost.create({
                                data: {
                                    id: post.id,
                                    groupId: post.groupId,
                                    schoolId: post.schoolId,
                                    authorId: post.authorId,
                                    type: post.type,
                                    title: post.title,
                                    body: post.body,
                                    filePath: post.filePath,
                                    fileName: post.fileName,
                                    fileSize: post.fileSize,
                                    mimeType: post.mimeType,
                                    goalId: post.goalId,
                                    planId: post.planId,
                                    data: post.data,
                                    isPinned: post.isPinned,
                                    createdAt: post.createdAt,
                                    updatedAt: post.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.groupPostReplies?.length) {
                        for (const reply of data.groupPostReplies) {
                            await tx.groupPostReply.create({
                                data: {
                                    id: reply.id,
                                    postId: reply.postId,
                                    authorId: reply.authorId,
                                    body: reply.body,
                                    createdAt: reply.createdAt,
                                    updatedAt: reply.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.groupPostResponses?.length) {
                        for (const response of data.groupPostResponses) {
                            await tx.groupPostResponse.create({
                                data: {
                                    id: response.id,
                                    postId: response.postId,
                                    studentId: response.studentId,
                                    selectedOption: response.selectedOption,
                                    isCorrect: response.isCorrect,
                                    pointsAwarded: response.pointsAwarded,
                                    createdAt: response.createdAt,
                                },
                            });
                        }
                    }

                    // 10. Restore Achievement System
                    if (data.achievements?.length) {
                        console.log(`Restoring ${data.achievements.length} achievements...`);
                        for (const achievement of data.achievements) {
                            await tx.achievement.create({
                                data: {
                                    id: achievement.id,
                                    name: achievement.name,
                                    description: achievement.description,
                                    category: achievement.category,
                                    type: achievement.type,
                                    requirement: achievement.requirement,
                                    iconName: achievement.iconName,
                                    colorScheme: achievement.colorScheme,
                                    points: achievement.points,
                                    isActive: achievement.isActive,
                                    examType: achievement.examType,
                                    schoolId: achievement.schoolId,
                                    createdAt: achievement.createdAt,
                                    updatedAt: achievement.updatedAt,
                                },
                            });
                        }
                    }

                    if (data.studentAchievements?.length) {
                        for (const stuAch of data.studentAchievements) {
                            await tx.studentAchievement.create({
                                data: {
                                    id: stuAch.id,
                                    studentId: stuAch.studentId,
                                    achievementId: stuAch.achievementId,
                                    progress: stuAch.progress,
                                    unlockedAt: stuAch.unlockedAt,
                                    schoolId: stuAch.schoolId,
                                    createdAt: stuAch.createdAt,
                                    updatedAt: stuAch.updatedAt,
                                },
                            });
                        }
                    }

                    console.log('Step 3: Restore completed successfully!');
                },
                {
                    maxWait: 120000, // 2 minutes max wait
                    timeout: 300000, // 5 minutes timeout
                },
            );

            return {
                message: 'Geri yükleme başarıyla tamamlandı!',
                success: true,
                stats: {
                    users: data.users?.length || 0,
                    students: data.grades?.flatMap((g) =>
                        g.classes?.flatMap((c) => c.students || []) || [],
                    ).length || 0,
                    exams: data.exams?.length || 0,
                    messages: data.messages?.length || 0,
                    studyPlans: data.studyPlans?.length || 0,
                    groups: data.mentorGroups?.length || 0,
                    achievements: data.achievements?.length || 0,
                },
            };
        } catch (error) {
            console.error('Restore error:', error);
            throw new Error(
                `Geri yükleme sırasında bir hata oluştu: ${error.message}. Tüm değişiklikler geri alındı.`,
            );
        }
    }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { DuplicateExamDto } from './dto/duplicate-exam.dto';
import { ExamCalendarSettingsDto } from './dto/calendar-settings.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExamsService {
    constructor(private prisma: PrismaService) { }

    async create(createExamDto: CreateExamDto) {
        const data: any = {
            ...createExamDto,
            date: createExamDto.date ? new Date(createExamDto.date) : new Date(),
        };

        // Parse date strings
        if (createExamDto.scheduledDateTime) {
            data.scheduledDateTime = new Date(createExamDto.scheduledDateTime);
        }
        if (createExamDto.applicationDateTime) {
            data.applicationDateTime = new Date(createExamDto.applicationDateTime);
        }

        const exam = await this.prisma.exam.create({ data });

        // Otomatik bildirim oluştur
        if (exam.scheduledDateTime && exam.isPublished) {
            await this.createExamNotifications(exam.id, exam.scheduledDateTime);
        }

        return exam;
    }

    async findAll(schoolId: string) {
        return this.prisma.exam.findMany({
            where: { schoolId },
            orderBy: { date: 'desc' },
            include: {
                _count: {
                    select: { attempts: true },
                },
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.exam.findUnique({
            where: { id },
            include: {
                attempts: {
                    include: {
                        student: true,
                        lessonResults: true,
                        scores: true,
                    },
                },
            },
        });
    }

    async updateParticipantCounts(examId: string) {
        const attempts = await this.prisma.examAttempt.findMany({
            where: { examId },
            include: {
                student: {
                    include: {
                        class: true,
                    },
                },
            },
        });

        const schoolParticipantCount = attempts.length;
        const branchMap = {};

        attempts.forEach((attempt) => {
            const branchName = attempt.student.class.name;
            branchMap[branchName] = (branchMap[branchName] || 0) + 1;
        });

        return this.prisma.exam.update({
            where: { id: examId },
            data: {
                schoolParticipantCount,
                branchParticipantCount: branchMap,
            },
        });
    }
    async getExamStatistics(id: string) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                attempts: {
                    include: {
                        student: { include: { class: true, user: true } },
                        lessonResults: { include: { lesson: true } },
                        scores: true,
                    }
                }
            }
        });

        if (!exam) return null;

        const attempts = exam.attempts;
        const totalAttempts = attempts.length;

        // 1. Overall Averages
        let totalNet = 0;
        let totalScore = 0;
        const branchStats: Record<string, { count: number; totalNet: number; totalScore: number }> = {};
        const lessonStats: Record<string, { count: number; totalNet: number; totalCorrect: number; totalIncorrect: number }> = {};

        attempts.forEach(attempt => {
            // Scores (Assuming 'TYT' or main score type is relevant, or taking average of all scores found)
            // For simplicity, let's take the first score found or a specific type if known
            const mainScore = attempt.scores.length > 0 ? attempt.scores[0].score : 0;
            totalScore += mainScore;

            // Calculate total net for this attempt from lessons
            let attemptNet = 0;
            attempt.lessonResults.forEach(res => {
                attemptNet += res.net;

                // Lesson Stats
                const lessonName = res.lesson.name;
                if (!lessonStats[lessonName]) {
                    lessonStats[lessonName] = { count: 0, totalNet: 0, totalCorrect: 0, totalIncorrect: 0 };
                }
                lessonStats[lessonName].count++;
                lessonStats[lessonName].totalNet += res.net;
                lessonStats[lessonName].totalCorrect += res.correct;
                lessonStats[lessonName].totalIncorrect += res.incorrect;
            });
            totalNet += attemptNet;

            // Branch Stats
            const branchName = attempt.student.class?.name || 'Diğer';
            if (!branchStats[branchName]) {
                branchStats[branchName] = { count: 0, totalNet: 0, totalScore: 0 };
            }
            branchStats[branchName].count++;
            branchStats[branchName].totalNet += attemptNet;
            branchStats[branchName].totalScore += mainScore;
        });

        const averageNet = totalAttempts > 0 ? totalNet / totalAttempts : 0;
        const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;

        // Process Lesson Stats
        const finalLessonStats = Object.entries(lessonStats).map(([name, stats]) => ({
            name,
            avgNet: stats.count > 0 ? stats.totalNet / stats.count : 0,
            avgCorrect: stats.count > 0 ? stats.totalCorrect / stats.count : 0,
            avgIncorrect: stats.count > 0 ? stats.totalIncorrect / stats.count : 0,
        }));

        // Process Branch Stats
        const finalBranchStats = Object.entries(branchStats).map(([name, stats]) => ({
            name,
            avgNet: stats.count > 0 ? stats.totalNet / stats.count : 0,
            avgScore: stats.count > 0 ? stats.totalScore / stats.count : 0,
            participation: stats.count
        }));

        // Detailed Student List (Simplified for table)
        const studentList = attempts.map(a => ({
            id: a.student.id,
            studentNumber: a.student.studentNumber,
            name: `${a.student.user?.firstName || ''} ${a.student.user?.lastName || ''}`.trim(), // Need to include user in query above if not present
            className: a.student.class?.name,
            score: a.scores.length > 0 ? a.scores[0].score : 0,
            scores: a.scores, // Include all scores (SAY, EA, SÖZ for AYT)
            net: a.lessonResults.reduce((acc, curr) => acc + curr.net, 0),
            // Add lesson specific nets if needed for dynamic columns
            lessons: a.lessonResults.reduce((acc, curr) => ({
                ...acc,
                [curr.lesson.name]: {
                    net: curr.net,
                    correct: curr.correct,
                    incorrect: curr.incorrect
                }
            }), {})
        })).sort((a, b) => b.score - a.score);

        return {
            examTitle: exam.title,
            examDate: exam.date,
            examType: exam.type,
            participantCount: totalAttempts,
            averageNet,
            averageScore,
            lessonStats: finalLessonStats,
            branchStats: finalBranchStats,
            students: studentList
        };
    }

    async update(id: string, updateExamDto: UpdateExamDto) {
        return this.prisma.exam.update({
            where: { id },
            data: {
                ...updateExamDto,
                date: updateExamDto.date ? new Date(updateExamDto.date) : undefined,
            },
        });
    }

    async delete(id: string) {
        return this.prisma.exam.delete({
            where: { id },
        });
    }

    async clearResults(id: string) {
        return this.prisma.examAttempt.deleteMany({
            where: { examId: id },
        });
    }

    async uploadAnswerKey(examId: string, file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file provided');
        }

        // Validate file type
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only PDF, JPG, JPEG, PNG, and Excel files are allowed.');
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'uploads', 'answer-keys');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `${examId}_${timestamp}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Save file
        fs.writeFileSync(filepath, file.buffer);

        // Update exam with answer key URL
        const answerKeyUrl = `/uploads/answer-keys/${filename}`;
        await this.prisma.exam.update({
            where: { id: examId },
            data: { answerKeyUrl },
        });

        return {
            success: true,
            answerKeyUrl,
            message: 'Answer key uploaded successfully',
        };
    }

    // ============ TAKVIM METODLARI ============

    // Takvim görünümü için sınavları getir
    async getCalendarExams(schoolId: string, query: CalendarQueryDto, userId?: string, userRole?: string) {
        const where: any = { schoolId };

        // Arşivlenmemiş sınavları getir (includeArchived true değilse)
        if (!query.includeArchived) {
            where.isArchived = false;
        }

        // Yıl-ay filtreleme
        if (query.year && query.month) {
            const startDate = new Date(query.year, query.month - 1, 1);
            const endDate = new Date(query.year, query.month, 0, 23, 59, 59);
            where.date = { gte: startDate, lte: endDate };
        } else if (query.year) {
            const startDate = new Date(query.year, 0, 1);
            const endDate = new Date(query.year, 11, 31, 23, 59, 59);
            where.date = { gte: startDate, lte: endDate };
        }

        // Sınıf seviyesi filtreleme (öğrenci için kendi sınıfı)
        if (query.gradeLevel) {
            where.gradeLevel = query.gradeLevel;
        }

        // Deneme türü filtreleme
        if (query.type) {
            where.type = query.type;
        }

        // Öğrenciler sadece yayınlananları görsün
        if (userRole === 'STUDENT') {
            where.isPublished = true;
        }

        const exams = await this.prisma.exam.findMany({
            where,
            orderBy: { date: 'asc' },
            include: {
                _count: { select: { attempts: true } },
                attempts: userRole === 'STUDENT' && userId
                    ? { where: { student: { userId } }, select: { id: true } }
                    : false,
            },
        });

        // Öğrenci için: Girdiği/girmediği sınavları işaretle
        if (userRole === 'STUDENT') {
            return exams.map(exam => ({
                ...exam,
                hasAttempted: exam.attempts && exam.attempts.length > 0,
                attempts: undefined, // Detay bilgiyi gizle
            }));
        }

        return exams;
    }

    // Yaklaşan sınavlar
    async getUpcomingExams(schoolId: string, gradeLevel?: number, limit: number = 5) {
        const where: any = {
            schoolId,
            isArchived: false,
            isPublished: true,
            scheduledDateTime: { gte: new Date() },
        };

        if (gradeLevel) {
            where.gradeLevel = gradeLevel;
        }

        return this.prisma.exam.findMany({
            where,
            orderBy: { scheduledDateTime: 'asc' },
            take: limit,
        });
    }

    // Denemeyi başka sınıflara kopyala
    async duplicateExam(examId: string, dto: DuplicateExamDto) {
        const originalExam = await this.prisma.exam.findUnique({
            where: { id: examId },
        });

        if (!originalExam) {
            throw new Error('Exam not found');
        }

        const { id, createdAt, updatedAt, ...examData } = originalExam as any;

        const duplicatedExams: any[] = [];

        for (const gradeLevel of dto.gradeLevels) {
            // Aynı sınıfa kopyalama
            if (gradeLevel === originalExam.gradeLevel) continue;

            const newExam = await this.prisma.exam.create({
                data: {
                    ...examData,
                    gradeLevel,
                    title: `${originalExam.title} - ${gradeLevel}. Sınıf`,
                    schoolParticipantCount: 0, // Yeni sınav için sıfırla
                    branchParticipantCount: null,
                },
            });

            // Bildirimler oluştur
            if (newExam.scheduledDateTime && newExam.isPublished) {
                await this.createExamNotifications(newExam.id, newExam.scheduledDateTime);
            }

            duplicatedExams.push(newExam);
        }

        return duplicatedExams;
    }

    // Sınavı arşivle/arşivden çıkar
    async toggleArchive(examId: string) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            select: { isArchived: true },
        });

        if (!exam) {
            throw new Error('Exam not found');
        }

        return this.prisma.exam.update({
            where: { id: examId },
            data: { isArchived: !exam.isArchived },
        });
    }

    // Yayın görünürlüğünü değiştir
    async togglePublisherVisibility(examId: string) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            select: { isPublisherVisible: true },
        });

        if (!exam) {
            throw new Error('Exam not found');
        }

        return this.prisma.exam.update({
            where: { id: examId },
            data: { isPublisherVisible: !exam.isPublisherVisible },
        });
    }

    // Cevap anahtarını paylaş/gizle
    async toggleAnswerKeyPublic(examId: string) {
        const exam = await this.prisma.exam.findUnique({
            where: { id: examId },
            select: { isAnswerKeyPublic: true },
        });

        if (!exam) {
            throw new Error('Exam not found');
        }

        return this.prisma.exam.update({
            where: { id: examId },
            data: { isAnswerKeyPublic: !exam.isAnswerKeyPublic },
        });
    }

    // Otomatik bildirim oluştur
    private async createExamNotifications(examId: string, scheduledDateTime: Date) {
        const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) {
            throw new Error('Exam not found');
        }

        const settings = await this.getCalendarSettings(exam.schoolId);

        const notifyDaysBefore = settings.notifyDaysBefore || 3;

        // Hatırlatma bildirimi
        const reminderDate = new Date(scheduledDateTime);
        reminderDate.setDate(reminderDate.getDate() - notifyDaysBefore);

        // Sadece gelecek tarih için oluştur
        if (reminderDate > new Date()) {
            await this.prisma.examNotification.create({
                data: {
                    examId,
                    notificationType: 'REMINDER',
                    scheduledFor: reminderDate,
                },
            });
        }
    }

    // Takvim ayarlarını getir
    async getCalendarSettings(schoolId: string) {
        let settings = await this.prisma.examCalendarSettings.findUnique({
            where: { schoolId },
        });

        // Yoksa varsayılan oluştur
        if (!settings) {
            settings = await this.prisma.examCalendarSettings.create({
                data: { schoolId },
            });
        }

        return settings;
    }

    // Takvim ayarlarını güncelle
    async updateCalendarSettings(schoolId: string, dto: ExamCalendarSettingsDto) {
        return this.prisma.examCalendarSettings.upsert({
            where: { schoolId },
            create: { schoolId, ...dto },
            update: dto,
        });
    }

    // Pending bildirimleri işle (Cron job için)
    async processPendingNotifications() {
        const now = new Date();

        const pendingNotifications = await this.prisma.examNotification.findMany({
            where: {
                isSent: false,
                scheduledFor: { lte: now },
            },
            include: { exam: true },
        });

        for (const notification of pendingNotifications) {
            try {
                await this.sendExamNotification(notification);
                await this.prisma.examNotification.update({
                    where: { id: notification.id },
                    data: { isSent: true, sentAt: new Date() },
                });
            } catch (error) {
                console.error(`Failed to send notification ${notification.id}:`, error);
            }
        }
    }

    // Bildirim gönder (Message sistemi ile entegre)
    private async sendExamNotification(notification: any) {
        const exam = notification.exam;

        // İlgili sınıf seviyesindeki öğrencileri bul
        const students = await this.prisma.student.findMany({
            where: {
                schoolId: exam.schoolId,
                class: {
                    grade: {
                        name: `${exam.gradeLevel}`, // Grade name'e göre eşleştir
                    },
                },
            },
            include: { user: true },
        });

        if (students.length === 0) return;

        let messageBody = '';
        let messageSubject = '';

        if (notification.notificationType === 'REMINDER') {
            messageSubject = `📚 Yaklaşan Deneme: ${exam.title}`;
            messageBody = `Merhaba,\n\n${exam.title} sınavınız ${exam.scheduledDateTime?.toLocaleDateString('tr-TR')} tarihinde yapılacaktır.\n\nHazırlıklarınızı tamamlamayı unutmayın!`;
        } else if (notification.notificationType === 'RESULTS_READY') {
            messageSubject = `✅ Sonuçlar Açıklandı: ${exam.title}`;
            messageBody = `Merhaba,\n\n${exam.title} sınavınızın sonuçları açıklanmıştır.\n\nDeneme Takvimi sayfasından sonuçlarınızı görüntüleyebilirsiniz.`;
        }

        // Admin kullanıcıyı bul (mesaj gönderen)
        const adminUser = await this.prisma.user.findFirst({
            where: {
                schoolId: exam.schoolId,
                role: { in: ['SCHOOL_ADMIN', 'SUPER_ADMIN'] },
            },
        });

        if (!adminUser) return;

        // Mesaj oluştur
        const message = await this.prisma.message.create({
            data: {
                senderId: adminUser.id,
                schoolId: exam.schoolId,
                subject: messageSubject,
                body: messageBody,
                type: 'BROADCAST',
                category: 'EXAM',
                status: 'SENT',
                sentAt: new Date(),
                allowReplies: false,
            },
        });

        // Alıcıları ekle
        for (const student of students) {
            await this.prisma.messageRecipient.create({
                data: {
                    messageId: message.id,
                    recipientId: student.userId,
                },
            });
        }

        // Notification'a messageId ekle
        await this.prisma.examNotification.update({
            where: { id: notification.id },
            data: { messageId: message.id },
        });
    }
}

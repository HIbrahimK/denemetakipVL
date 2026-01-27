import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExamsService {
    constructor(private prisma: PrismaService) { }

    async create(createExamDto: CreateExamDto) {
        return this.prisma.exam.create({
            data: {
                ...createExamDto,
                date: createExamDto.date ? new Date(createExamDto.date) : new Date(),
            },
        });
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
}

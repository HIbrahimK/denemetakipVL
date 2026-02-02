import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendationType } from '@prisma/client';

@Injectable()
export class StudyRecommendationService {
  constructor(private prisma: PrismaService) {}

  async generateForStudent(studentId: string, schoolId: string) {
    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found');
    }

    // Get completed tasks
    const completedTasks = await this.prisma.studyTask.findMany({
      where: {
        studentId,
        status: { in: ['COMPLETED', 'LATE'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    // Get study sessions
    const sessions = await this.prisma.studySession.findMany({
      where: { studentId },
      orderBy: { startTime: 'desc' },
      take: 30,
    });

    // Analyze weak subjects from completed tasks
    const recommendations: any[] = [];

    // 1. Identify weak subjects from task performance
    const subjectScores: { [key: string]: { total: number; count: number } } = {};

    completedTasks.forEach((task: any) => {
      if (task.subjectName) {
        const totalAnswered = task.correctCount + task.wrongCount + task.blankCount;
        if (totalAnswered > 0) {
          const score = (task.correctCount / totalAnswered) * 100;
          
          if (!subjectScores[task.subjectName]) {
            subjectScores[task.subjectName] = { total: 0, count: 0 };
          }
          subjectScores[task.subjectName].total += score;
          subjectScores[task.subjectName].count += 1;
        }
      }
    });

    // Find lowest performing subjects
    const subjectAverages = Object.entries(subjectScores)
      .map(([name, data]) => ({
        name,
        average: data.total / data.count,
      }))
      .sort((a, b) => a.average - b.average);

    // 1. Weak subject recommendations
    if (subjectAverages.length > 0) {
      const weakestSubject = subjectAverages[0];
      if (weakestSubject.average < 70) {
        recommendations.push({
          recommendationType: 'WEAK_AREA',
          subjectName: weakestSubject.name,
          reasoning: `${weakestSubject.name} dersinde ortalamanız %${weakestSubject.average.toFixed(1)}. Bu derste daha fazla çalışma yapmanızı öneririz.`,
          priority: 5,
        });
      }
    }

    // 2. Study consistency check
    const totalMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);
    const avgMinutesPerDay = sessions.length > 0 ? totalMinutes / 30 : 0;

    if (avgMinutesPerDay < 60) {
      recommendations.push({
        recommendationType: 'STUDY_GAP',
        subjectName: 'Genel',
        reasoning: `Günlük ortalama çalışma süreniz ${Math.round(avgMinutesPerDay)} dakika. Hedef en az 2 saat olmalı.`,
        priority: 4,
      });
    }

    // 3. Task completion rate
    const pendingTasks = await this.prisma.studyTask.count({
      where: {
        studentId,
        status: 'PENDING',
      },
    });

    if (pendingTasks > 5) {
      recommendations.push({
        recommendationType: 'TASK_REMINDER',
        subjectName: 'Genel',
        reasoning: `${pendingTasks} adet tamamlanmamış göreviniz var. Bunları en kısa sürede tamamlamaya çalışın.`,
        priority: 3,
      });
    }

    // 4. Subject-specific recommendations based on performance
    if (subjectAverages.length > 1) {
      // Find subjects with biggest gaps
      for (let i = 0; i < Math.min(2, subjectAverages.length); i++) {
        const subject = subjectAverages[i];
        if (subject.average < 60) {
          recommendations.push({
            recommendationType: 'DIFFICULTY_BALANCE',
            subjectName: subject.name,
            reasoning: `${subject.name} dersinde başarı oranınız düşük (%${subject.average.toFixed(1)}). Konu tekrarı yapmanız faydalı olacaktır.`,
            priority: 4 - i,
          });
        }
      }
    }

    // Save recommendations
    const saved: any[] = [];
    for (const rec of recommendations) {
      const created = await this.prisma.studyRecommendation.create({
        data: {
          studentId,
          schoolId,
          recommendationType: rec.recommendationType as RecommendationType,
          subjectName: rec.subjectName,
          reasoning: rec.reasoning,
          priority: rec.priority,
        },
      });
      saved.push(created);
    }

    return saved;
  }

  async findAll(userId: string, userRole: string, schoolId: string) {
    const where: any = { schoolId };

    if (userRole === 'STUDENT') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { student: true },
      });

      if (!user?.student) {
        return [];
      }

      where.studentId = user.student.id;
    }

    return this.prisma.studyRecommendation.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async markAsApplied(id: string, userId: string, schoolId: string) {
    const recommendation = await this.prisma.studyRecommendation.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }

    if (recommendation.schoolId !== schoolId) {
      throw new NotFoundException('Recommendation not found');
    }

    // Only the student can mark as applied
    if (recommendation.student.userId !== userId) {
      throw new NotFoundException('Recommendation not found');
    }

    return this.prisma.studyRecommendation.update({
      where: { id },
      data: { isCompleted: true, completedAt: new Date() },
    });
  }

  async dismiss(id: string, userId: string, schoolId: string) {
    const recommendation = await this.prisma.studyRecommendation.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!recommendation) {
      throw new NotFoundException('Recommendation not found');
    }

    if (recommendation.schoolId !== schoolId) {
      throw new NotFoundException('Recommendation not found');
    }

    // Only the student can dismiss
    if (recommendation.student.userId !== userId) {
      throw new NotFoundException('Recommendation not found');
    }

    return this.prisma.studyRecommendation.update({
      where: { id },
      data: { isCompleted: true },
    });
  }
}

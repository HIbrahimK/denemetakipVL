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
      include: {
        topic: true,
      },
    });

    // Get study sessions
    const sessions = await this.prisma.studySession.findMany({
      where: { studentId },
      orderBy: { startTime: 'desc' },
      take: 30,
    });

    // Analyze weak topics from completed tasks
    const recommendations: any[] = [];

    // 1. Identify weak subjects from task performance
    const subjectScores: { [key: string]: { total: number; count: number } } = {};

    completedTasks.forEach((task) => {
      if (task.topic) {
        const score = task.correctAnswers / (task.correctAnswers + task.wrongAnswers + task.blankAnswers) * 100;
        const subjectName = task.topic.name;
        
        if (!subjectScores[subjectName]) {
          subjectScores[subjectName] = { total: 0, count: 0 };
        }
        subjectScores[subjectName].total += score;
        subjectScores[subjectName].count += 1;
      }
    });

    // Find lowest performing subjects
    const subjectAverages = Object.entries(subjectScores)
      .map(([name, data]) => ({
        name,
        average: data.total / data.count,
      }))
      .sort((a, b) => a.average - b.average);

    // 1. Weak topic recommendations
    if (subjectAverages.length > 0) {
      const weakestSubject = subjectAverages[0];
      recommendations.push({
        recommendationType: 'WEAK_TOPIC',
        subjectName: weakestSubject.name,
        reasoning: `${weakestSubject.name} konusunda ortalamanız ${weakestSubject.average.toFixed(1)}%. Bu konuda daha fazla çalışma yapmanızı öneririz.`,
        priority: 5,
      });
    }

    // 2. Study consistency check
    const totalMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);
    const avgMinutesPerDay = totalMinutes / 30; // last 30 sessions

    if (avgMinutesPerDay < 60) {
      recommendations.push({
        recommendationType: 'STUDY_HABIT',
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
        date: { lt: new Date() },
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

    // 4. Topic recommendations
    if (subjectAverages.length > 0) {
      const weakestSubject = subjectAverages[0];
      
      const topics = await this.prisma.topic.findMany({
        where: { 
          examType: 'TYT',
          subjectName: weakestSubject.name
        },
        take: 3,
      });

      if (topics.length > 0) {
        recommendations.push({
          recommendationType: 'WEAK_TOPIC',
          subjectName: weakestSubject.name,
          topicId: topics[0].id,
          reasoning: `${weakestSubject.name} konusunda ortalamanız ${weakestSubject.average.toFixed(1)}%. Bu konuda daha fazla çalışma yapmanızı öneririz.`,
          priority: 5,
        });
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
          topicId: rec.topicId,
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
        topic: true,
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

    if (recommendation.schoolId !== schoolId || recommendation.student.userId !== userId) {
      throw new NotFoundException('Access denied');
    }

    return this.prisma.studyRecommendation.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }
}

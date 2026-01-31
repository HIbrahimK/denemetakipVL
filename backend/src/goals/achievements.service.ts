import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(schoolId: string, category?: string) {
    const where: any = { schoolId };

    if (category) {
      where.category = category;
    }

    return this.prisma.achievement.findMany({
      where,
      orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findStudentAchievements(userId: string, schoolId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user?.student) {
      return [];
    }

    return this.prisma.studentAchievement.findMany({
      where: {
        studentId: user.student.id,
      },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  async getStudentProgress(userId: string, schoolId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user?.student) {
      throw new NotFoundException('Student not found');
    }

    // Get all achievements
    const allAchievements = await this.prisma.achievement.findMany({});

    // Get earned achievements
    const earnedAchievements = await this.prisma.studentAchievement.findMany({
      where: {
        studentId: user.student.id,
      },
      include: {
        achievement: true,
      },
    });

    // Get study statistics
    const completedTasks = await this.prisma.studyTask.count({
      where: {
        studentId: user.student.id,
        status: { in: ['COMPLETED', 'LATE'] },
      },
    });

    const studySessions = await this.prisma.studySession.findMany({
      where: { studentId: user.student.id },
    });

    const totalStudyMinutes = studySessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

    const completedGoals = await this.prisma.studyGoal.count({
      where: {
        userId: user.id,
        isCompleted: true,
      },
    });

    const studyStreak = await this.calculateStudyStreak(user.student.id);

    return {
      earnedCount: earnedAchievements.length,
      totalCount: allAchievements.length,
      earned: earnedAchievements,
      available: allAchievements.filter(
        (a) => !earnedAchievements.find((e) => e.achievementId === a.id),
      ),
      progress: {
        completedTasks,
        totalStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
        completedGoals,
        studyStreak,
      },
    };
  }

  private async calculateStudyStreak(studentId: string): Promise<number> {
    const sessions = await this.prisma.studySession.findMany({
      where: { studentId },
      orderBy: { startTime: 'desc' },
      select: { startTime: true },
    });

    if (sessions.length === 0) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const studyDays = new Set(
      sessions.map((s) => {
        const date = new Date(s.startTime);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }),
    );

    // Check if studied today or yesterday
    const today = currentDate.getTime();
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    if (!studyDays.has(today) && !studyDays.has(yesterdayTime)) {
      return 0;
    }

    // Count consecutive days
    let checkDate = new Date(currentDate);
    while (true) {
      const checkTime = checkDate.getTime();
      if (studyDays.has(checkTime)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  async awardAchievement(studentId: string, achievementCode: string, schoolId: string) {
    const achievement = await this.prisma.achievement.findFirst({
      where: {
        code: achievementCode,
        schoolId,
      },
    });

    if (!achievement) {
      throw new NotFoundException('Achievement not found');
    }

    // Check if already awarded
    const existing = await this.prisma.studentAchievement.findUnique({
      where: {
        studentId_achievementId: {
          studentId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.studentAchievement.create({
      data: {
        studentId,
        achievementId: achievement.id,
        schoolId,
      },
      include: {
        achievement: true,
      },
    });
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyGoalDto, UpdateStudyGoalDto, UpdateGoalProgressDto } from './dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudyGoalDto, schoolId: string) {
    // Verify student belongs to school
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found');
    }

    // Verify topic exists if provided
    if (dto.topicId) {
      const topic = await this.prisma.topic.findUnique({
        where: { id: dto.topicId },
      });

      if (!topic) {
        throw new NotFoundException('Topic not found');
      }
    }

    return this.prisma.studyGoal.create({
      data: {
        ...dto,
        userId: student.userId, // userId required
        targetData: dto.targetData || {},
        targetDate: new Date(dto.targetDate),
        schoolId,
        currentValue: 0,
      },
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
    });
  }

  async findAll(userId: string, userRole: string, schoolId: string, filters?: any) {
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

    // Apply filters
    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters?.isCompleted !== undefined) {
      where.isCompleted = filters.isCompleted === 'true';
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    return this.prisma.studyGoal.findMany({
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
      orderBy: { targetDate: 'asc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string, schoolId: string) {
    const goal = await this.prisma.studyGoal.findUnique({
      where: { id },
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
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    // Check access rights
    if (userRole === 'STUDENT' && goal.userId !== userId) {
      throw new ForbiddenException('You can only view your own goals');
    }

    return goal;
  }

  async update(id: string, dto: UpdateStudyGoalDto, userId: string, userRole: string, schoolId: string) {
    const goal = await this.prisma.studyGoal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    // Students can only update their own goals
    if (userRole === 'STUDENT' && goal.userId !== userId) {
      throw new ForbiddenException('You can only update your own goals');
    }

    // Check if goal should be completed
    const updateData: any = {
      ...dto,
      targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
    };

    // targetValue artık targetData veya direkt field olabilir
    const targetData = goal.targetData as any;
    const targetValue = goal.targetValue || targetData?.targetValue || 100;

    if (dto.currentValue !== undefined && dto.currentValue >= targetValue) {
      updateData.isCompleted = true;
      updateData.completedAt = new Date();
    }

    return this.prisma.studyGoal.update({
      where: { id },
      data: updateData,
      include: {
        topic: true,
      },
    });
  }

  async updateProgress(id: string, dto: UpdateGoalProgressDto, userId: string, schoolId: string) {
    const goal = await this.prisma.studyGoal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.schoolId !== schoolId || goal.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = {
      currentValue: dto.currentValue,
    };

    // Check if goal is completed
    const targetData = goal.targetData as any;
    const targetValue = goal.targetValue || targetData?.targetValue || 100;
    
    if (dto.currentValue >= targetValue) {
      updateData.isCompleted = true;
      updateData.completedAt = new Date();

      // Award achievement if applicable
      await this.checkAndAwardAchievements(userId, schoolId);
    }

    return this.prisma.studyGoal.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string, userRole: string, schoolId: string) {
    const goal = await this.prisma.studyGoal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    // Students can only delete their own goals
    if (userRole === 'STUDENT' && goal.userId !== userId) {
      throw new ForbiddenException('You can only delete your own goals');
    }

    await this.prisma.studyGoal.delete({
      where: { id },
    });

    return { message: 'Goal deleted successfully' };
  }

  private async checkAndAwardAchievements(userId: string, schoolId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user?.student) {
      return;
    }

    // Get completed goals count
    const completedGoals = await this.prisma.studyGoal.count({
      where: {
        userId: user.id,
        isCompleted: true,
      },
    });

    // Check for goal-related achievements
    const achievements = await this.prisma.achievement.findMany({
      where: {
        OR: [
          { code: 'first_goal' },
          { code: 'goal_master_5' },
          { code: 'goal_master_10' },
        ],
      },
    });

    for (const achievement of achievements) {
      let shouldAward = false;

      if (achievement.code === 'first_goal' && completedGoals >= 1) {
        shouldAward = true;
      } else if (achievement.code === 'goal_master_5' && completedGoals >= 5) {
        shouldAward = true;
      } else if (achievement.code === 'goal_master_10' && completedGoals >= 10) {
        shouldAward = true;
      }

      if (shouldAward) {
        // Check if already awarded
        const existing = await this.prisma.studentAchievement.findUnique({
          where: {
            studentId_achievementId: {
              studentId: user.student.id,
              achievementId: achievement.id,
            },
          },
        });

        if (!existing) {
          await this.prisma.studentAchievement.create({
            data: {
              studentId: user.student.id,
              achievementId: achievement.id,
              schoolId,
            },
          });
        }
      }
    }
  }
}

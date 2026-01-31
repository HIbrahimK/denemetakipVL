import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyPlanDto, UpdateStudyPlanDto, AssignStudyPlanDto } from './dto';
import { StudyPlanTargetType } from '@prisma/client';

@Injectable()
export class StudyPlanService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudyPlanDto, teacherId: string, schoolId: string) {
    return this.prisma.studyPlan.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        teacherId,
        schoolId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: string, schoolId: string) {
    const where: any = { schoolId };

    if (userRole === 'TEACHER') {
      where.teacherId = userId;
    } else if (userRole === 'STUDENT') {
      // Find plans assigned to this student
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { student: true },
      });

      if (!user?.student) {
        return [];
      }

      where.OR = [
        { targetType: 'INDIVIDUAL', targetId: user.student.id },
        { targetType: 'CLASS', targetId: user.student.classId },
      ];

      // Also include group plans
      const groupMemberships = await this.prisma.groupMembership.findMany({
        where: { studentId: user.student.id, leftAt: null },
        select: { groupId: true },
      });

      if (groupMemberships.length > 0) {
        where.OR.push({
          groupPlans: {
            some: {
              groupId: { in: groupMemberships.map((m) => m.groupId) },
            },
          },
        });
      }
    }

    return this.prisma.studyPlan.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string, schoolId: string) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        tasks: {
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
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    if (plan.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    // Check access rights
    if (userRole === 'TEACHER' && plan.teacherId !== userId) {
      throw new ForbiddenException('You can only view your own plans');
    }

    return plan;
  }

  async update(id: string, dto: UpdateStudyPlanDto, userId: string, schoolId: string) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    if (plan.schoolId !== schoolId || plan.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.studyPlan.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, schoolId: string) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    if (plan.schoolId !== schoolId || plan.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.studyPlan.delete({
      where: { id },
    });

    return { message: 'Study plan deleted successfully' };
  }

  async assign(planId: string, dto: AssignStudyPlanDto, userId: string, schoolId: string) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    if (plan.schoolId !== schoolId || plan.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const tasks = [];

    // Generate tasks based on plan date range
    const daysDiff = Math.ceil(
      (plan.endDate.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Assign to individual students
    if (dto.studentIds && dto.studentIds.length > 0) {
      for (const studentId of dto.studentIds) {
        // Verify student exists and belongs to school
        const student = await this.prisma.student.findUnique({
          where: { id: studentId },
        });

        if (!student || student.schoolId !== schoolId) {
          continue;
        }

        // Create placeholder task for the plan period
        await this.prisma.studyTask.create({
          data: {
            planId,
            studentId,
            schoolId,
            date: plan.startDate,
            subjectName: 'Genel',
            questionCount: 0,
          },
        });
      }
    }

    // Assign to groups
    if (dto.groupIds && dto.groupIds.length > 0) {
      for (const groupId of dto.groupIds) {
        await this.prisma.groupStudyPlan.create({
          data: {
            groupId,
            studyPlanId: planId,
          },
        });
      }
    }

    // Assign to classes
    if (dto.classIds && dto.classIds.length > 0) {
      for (const classId of dto.classIds) {
        const students = await this.prisma.student.findMany({
          where: { classId, schoolId },
        });

        for (const student of students) {
          await this.prisma.studyTask.create({
            data: {
              planId,
              studentId: student.id,
              schoolId,
              date: plan.startDate,
              subjectName: 'Genel',
              questionCount: 0,
            },
          });
        }
      }
    }

    return { message: 'Study plan assigned successfully' };
  }
}

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyTaskDto, CompleteStudyTaskDto, VerifyStudyTaskDto } from './dto';
import { StudyTaskStatus } from '@prisma/client';

@Injectable()
export class StudyTaskService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStudyTaskDto, schoolId: string) {
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

    return this.prisma.studyTask.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        schoolId,
        status: 'PENDING',
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
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.planId) {
      where.planId = filters.planId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    return this.prisma.studyTask.findMany({
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
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string, schoolId: string) {
    const task = await this.prisma.studyTask.findUnique({
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
        plan: {
          select: {
            id: true,
            name: true,
            teacherId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Study task not found');
    }

    if (task.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    // Check access rights
    if (userRole === 'STUDENT') {
      const student = await this.prisma.student.findUnique({
        where: { id: task.studentId },
      });
      if (!student || student.userId !== userId) {
        throw new ForbiddenException('You can only view your own tasks');
      }
    }

    return task;
  }

  async complete(id: string, dto: CompleteStudyTaskDto, userId: string, schoolId: string) {
    const task = await this.prisma.studyTask.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Study task not found');
    }

    if (task.schoolId !== schoolId || task.student.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (task.status === 'COMPLETED') {
      throw new ForbiddenException('Task is already completed');
    }

    const now = new Date();
    const isLate = now > task.date;

    return this.prisma.studyTask.update({
      where: { id },
      data: {
        status: isLate ? 'LATE' : 'COMPLETED',
        completedQuestions: dto.completedQuestions,
        correctAnswers: dto.correctAnswers,
        wrongAnswers: dto.wrongAnswers,
        blankAnswers: dto.blankAnswers,
        timeSpent: dto.timeSpent,
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

  async verify(id: string, dto: VerifyStudyTaskDto, userId: string, schoolId: string) {
    const task = await this.prisma.studyTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Study task not found');
    }

    if (task.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    if (task.status !== 'COMPLETED' && task.status !== 'LATE') {
      throw new ForbiddenException('Only completed tasks can be verified');
    }

    return this.prisma.studyTask.update({
      where: { id },
      data: {
        teacherReviewed: dto.verified,
        verifiedById: userId,
        verifiedAt: new Date(),
        teacherComment: dto.comment,
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

  async updateStatus(id: string, status: StudyTaskStatus, userId: string, schoolId: string) {
    const task = await this.prisma.studyTask.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Study task not found');
    }

    if (task.schoolId !== schoolId || task.student.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.studyTask.update({
      where: { id },
      data: { status },
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

  async remove(id: string, userId: string, userRole: string, schoolId: string) {
    const task = await this.prisma.studyTask.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            userId: true,
          },
        },
        plan: {
          select: {
            teacherId: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Study task not found');
    }

    if (task.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    // Only teachers who created the plan or the student can delete
    const canDelete =
      (userRole === 'TEACHER' && task.plan?.teacherId === userId) ||
      (userRole === 'STUDENT' && task.student.userId === userId);

    if (!canDelete) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.studyTask.delete({
      where: { id },
    });

    return { message: 'Study task deleted successfully' };
  }
}

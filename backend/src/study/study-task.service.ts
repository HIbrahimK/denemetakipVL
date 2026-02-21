import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStudyTaskDto,
  CompleteStudyTaskDto,
  VerifyStudyTaskDto,
  VerificationType,
} from './dto';
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

    // Verify plan exists and belongs to school
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan || plan.schoolId !== schoolId) {
      throw new NotFoundException('Study plan not found');
    }

    const data: any = {
      planId: dto.planId,
      studentId: dto.studentId,
      schoolId,
      rowIndex: dto.rowIndex,
      dayIndex: dto.dayIndex,
      subjectName: dto.subjectName,
      topicName: dto.topicName,
      targetQuestionCount: dto.targetQuestionCount,
      targetDuration: dto.targetDuration,
      targetResource: dto.targetResource,
      status: dto.status ?? StudyTaskStatus.PENDING,
    };

    return this.prisma.studyTask.create({
      data,
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
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(
    userId: string,
    userRole: string,
    schoolId: string,
    filters?: any,
  ) {
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

    if (
      filters?.studentId &&
      (userRole === 'TEACHER' || userRole === 'SCHOOL_ADMIN')
    ) {
      where.studentId = filters.studentId;
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
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        studentId: 'asc',
      },
    });
  }

  async findOne(
    id: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
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

  async complete(
    id: string,
    dto: CompleteStudyTaskDto,
    userId: string,
    schoolId: string,
  ) {
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

    if (task.status === StudyTaskStatus.COMPLETED) {
      throw new ForbiddenException('Task is already completed');
    }

    const data: any = {
      status: StudyTaskStatus.COMPLETED,
      completedQuestionCount: dto.completedQuestionCount,
      correctCount: dto.correctCount,
      wrongCount: dto.wrongCount,
      blankCount: dto.blankCount,
      actualDuration: dto.actualDuration ?? 0,
      actualResource: dto.actualResource,
      studentNotes: dto.studentNotes,
      completedAt: new Date(),
    };

    return this.prisma.studyTask.update({
      where: { id },
      data,
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
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async verify(
    id: string,
    dto: VerifyStudyTaskDto,
    userId: string,
    schoolId: string,
    verifierRole: string,
  ) {
    const task = await this.prisma.studyTask.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            userId: true,
            parentId: true,
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

    // Only check completion status for parent verification
    if (
      dto.verificationType === VerificationType.PARENT &&
      task.status !== StudyTaskStatus.COMPLETED
    ) {
      throw new ForbiddenException(
        'Only completed tasks can be verified by parents',
      );
    }

    const updateData: any = {};

    if (dto.verificationType === VerificationType.PARENT) {
      // Check if user is the parent of the student
      const parent = await this.prisma.parent.findUnique({
        where: { userId },
      });

      if (!parent || task.student.parentId !== parent.id) {
        throw new ForbiddenException('Only the parent can verify this task');
      }

      updateData.parentApproved = dto.approved;
      updateData.parentComment = dto.comment;
      updateData.parentApprovedAt = new Date();
      updateData.parentId = parent.id;
    } else if (dto.verificationType === VerificationType.TEACHER) {
      // Check if user is a teacher or school admin
      if (verifierRole !== 'TEACHER' && verifierRole !== 'SCHOOL_ADMIN') {
        throw new ForbiddenException('Only teachers can verify tasks');
      }

      updateData.teacherApproved = dto.approved;
      updateData.teacherComment = dto.comment;
      updateData.teacherApprovedAt = new Date();
      updateData.teacherApprovedById = userId;

      // If teacher approves, task is considered COMPLETED (or VERIFIED)
      if (dto.approved) {
        // If not completed yet, mark as completed
        if (
          task.status !== StudyTaskStatus.COMPLETED &&
          task.status !== ('VERIFIED' as StudyTaskStatus)
        ) {
          updateData.status = StudyTaskStatus.COMPLETED;
          updateData.completedAt = new Date();
        }
      }
    }

    return this.prisma.studyTask.update({
      where: { id },
      data: updateData,
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
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateStatus(
    id: string,
    status: StudyTaskStatus,
    userId: string,
    schoolId: string,
  ) {
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
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
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
      userRole === 'SCHOOL_ADMIN' ||
      (userRole === 'STUDENT' && task.student.userId === userId);

    if (!canDelete) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.studyTask.delete({
      where: { id },
    });

    return { message: 'Study task deleted successfully' };
  }

  async getStudentTasks(studentId: string, planId: string, schoolId: string) {
    // Verify student belongs to school
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found');
    }

    return this.prisma.studyTask.findMany({
      where: {
        studentId,
        planId,
        schoolId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async approveTask(
    taskId: string,
    teacherId: string,
    schoolId: string,
    comment?: string,
  ) {
    const task = await this.prisma.studyTask.findUnique({
      where: { id: taskId },
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
        plan: {
          select: {
            id: true,
            name: true,
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

    // Öğretmen onayı ile görev tamamlanmış sayılır
    const updateData: any = {
      teacherApproved: true,
      teacherApprovedById: teacherId,
      teacherApprovedAt: new Date(),
      status: StudyTaskStatus.COMPLETED,
    };

    if (comment) {
      updateData.teacherComment = comment;
    }

    // Eğer completedAt yoksa şimdi ekle
    if (!task.completedAt) {
      updateData.completedAt = new Date();
    }

    return this.prisma.studyTask.update({
      where: { id: taskId },
      data: updateData,
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
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
        teacherApprovedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async rejectTask(
    taskId: string,
    teacherId: string,
    schoolId: string,
    comment: string,
  ) {
    const task = await this.prisma.studyTask.findUnique({
      where: { id: taskId },
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
        plan: {
          select: {
            id: true,
            name: true,
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

    // Öğretmen reddettiğinde görev PENDING durumuna döner
    const updateData: any = {
      teacherApproved: false,
      teacherApprovedById: teacherId,
      teacherApprovedAt: new Date(),
      teacherComment: comment,
      status: StudyTaskStatus.PENDING,
    };

    return this.prisma.studyTask.update({
      where: { id: taskId },
      data: updateData,
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
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
        teacherApprovedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getPendingApprovalTasks(teacherId: string, schoolId: string) {
    // Öğretmenin planlarına ait, tamamlanmış ama onaylanmamış görevleri getir
    return this.prisma.studyTask.findMany({
      where: {
        schoolId,
        status: StudyTaskStatus.COMPLETED,
        teacherApproved: false,
        plan: {
          teacherId,
        },
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
            class: {
              select: {
                name: true,
                grade: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });
  }
}

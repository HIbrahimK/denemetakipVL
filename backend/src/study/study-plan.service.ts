import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudyPlanDto, AssignStudyPlanDto } from './dto';
import { NotificationType, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { NotificationsService } from '../notifications/notifications.service';

// Study plan status enum (inline since it's not in Prisma client yet)
enum StudyPlanStatus {
  DRAFT = 'DRAFT',
  ASSIGNED = 'ASSIGNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
}

// Assignment target type enum
enum AssignmentTargetType {
  STUDENT = 'STUDENT',
  GROUP = 'GROUP',
  GRADE = 'GRADE',
  CLASS = 'CLASS',
}

// Delete mode options
export enum DeleteMode {
  CANCEL_ASSIGNMENTS = 'CANCEL_ASSIGNMENTS', // Sadece atamaları iptal et, template kalsın
  DELETE_TEMPLATE = 'DELETE_TEMPLATE', // Her şeyi sil (soft delete)
}

@Injectable()
export class StudyPlanService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateStudyPlanDto, teacherId: string, schoolId: string) {
    console.log('[StudyPlanService] Creating study plan:', {
      dto,
      teacherId,
      schoolId,
    });
    try {
      const data: any = {
        name: dto.name,
        description: dto.description,
        examType: dto.examType,
        gradeLevels: dto.gradeLevels ?? [],
        planData: dto.planData ?? Prisma.JsonNull,
        status: dto.status ?? StudyPlanStatus.DRAFT,
        isTemplate: dto.isTemplate ?? true, // Varsayılan olarak template
        templateName: dto.templateName,
        isShared: dto.isShared ?? false,
        isPublic: dto.isPublic ?? false,
        teacherId,
        schoolId,
      };

      // Başlangıç ve bitiş tarihleri opsiyonel
      if (dto.startDate) {
        data.startDate = new Date(dto.startDate);
      }
      if (dto.endDate) {
        data.endDate = new Date(dto.endDate);
      }

      console.log('[StudyPlanService] Prisma data:', data);

      const result = await this.prisma.studyPlan.create({
        data,
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
      });

      console.log('[StudyPlanService] Study plan created:', result.id);
      return result;
    } catch (error) {
      console.error('[StudyPlanService] Error creating study plan:', error);
      throw error;
    }
  }

  async findAll(
    userId: string,
    userRole: string,
    schoolId: string,
    filters?: {
      isTemplate?: boolean;
      status?: string;
      isShared?: boolean;
      examType?: string;
    },
  ) {
    const where: any = {
      schoolId,
      deletedAt: null, // Soft delete kontrolü
    };

    // Filtreler
    if (filters?.isTemplate !== undefined) {
      where.isTemplate = filters.isTemplate;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.isShared !== undefined) {
      where.isShared = filters.isShared;
    }
    if (filters?.examType) {
      where.examType = filters.examType;
    }

    if (userRole === 'TEACHER') {
      // Öğretmen kendi planlarını veya paylaşılan planları görebilir
      where.OR = [
        { teacherId: userId },
        { isShared: true },
        { isPublic: true },
      ];
    } else if (userRole === 'STUDENT') {
      // Öğrenci sadece kendisine atanan planları görür
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { student: true },
      });

      if (!user?.student) {
        return [];
      }

      // Öğrenciye atanan planları bul
      const assignments = await this.prisma.studyPlanAssignment.findMany({
        where: {
          OR: [
            { targetType: 'STUDENT', targetId: user.student.id },
            // Grup atamaları için
            {
              targetType: 'GROUP',
              targetId: {
                in: (
                  await this.prisma.groupMembership.findMany({
                    where: { studentId: user.student.id, leftAt: null },
                    select: { groupId: true },
                  })
                ).map((m) => m.groupId),
              },
            },
            // Sınıf atamaları için
            { targetType: 'CLASS', targetId: user.student.classId ?? '' },
            // Sınıf seviyesi atamaları için
            {
              targetType: 'GRADE',
              targetId: user.student.classId
                ? ((
                    await this.prisma.class.findUnique({
                      where: { id: user.student.classId },
                      select: { gradeId: true },
                    })
                  )?.gradeId ?? '')
                : '',
            },
          ],
          status: { in: ['ACTIVE', 'COMPLETED'] },
        },
        select: { planId: true },
      });

      where.id = { in: assignments.map((a) => a.planId) };
    } else if (userRole === 'ADMIN') {
      // Admin tüm planları görebilir
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
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(
    id: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
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
          },
          orderBy: {
            studentId: 'asc',
          },
        },
        assignments: {
          where: { status: { not: 'CANCELLED' } },
          orderBy: { createdAt: 'desc' },
        },
        groupPlans: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    if (plan.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    // Soft delete kontrolü
    if ((plan as any).deletedAt) {
      throw new NotFoundException('Study plan not found');
    }

    // Check access rights
    if (userRole === 'TEACHER' && plan.teacherId !== userId) {
      // Paylaşılan planları da görüntüleyebilir
      if (!(plan as any).isShared && !(plan as any).isPublic) {
        throw new ForbiddenException('You can only view your own plans');
      }
    }

    return plan;
  }

  async update(
    id: string,
    dto: Partial<CreateStudyPlanDto>,
    userId: string,
    schoolId: string,
  ) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    if (plan.schoolId !== schoolId || plan.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Soft delete kontrolü
    if ((plan as any).deletedAt) {
      throw new NotFoundException('Study plan not found');
    }

    // Check if template has active assignments
    // Restriction removed: Templates CAN be updated even if they have active assignments.
    // Existing assignments use a copy of the plan data, so they are mostly unaffected.
    /*
    if ((plan as any).isTemplate) {
      const activeAssignmentsCount = await this.prisma.studyPlanAssignment.count({
        where: { 
          planId: id,
          status: { not: 'CANCELLED' }
        }
      });

      if (activeAssignmentsCount > 0) {
        throw new BadRequestException(
          `Bu şablon ${activeAssignmentsCount} aktif atamada kullanılıyor. Düzenlemek için önce şablonu kopyalayın.`
        );
      }
    }
    */

    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.examType !== undefined) updateData.examType = dto.examType;
    if (dto.gradeLevels !== undefined) updateData.gradeLevels = dto.gradeLevels;
    if (dto.planData !== undefined) updateData.planData = dto.planData;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.isTemplate !== undefined) updateData.isTemplate = dto.isTemplate;
    if (dto.templateName !== undefined)
      updateData.templateName = dto.templateName;
    if (dto.isShared !== undefined) {
      updateData.isShared = dto.isShared;
      if (dto.isShared) {
        updateData.sharedAt = new Date();
      }
    }
    if (dto.isPublic !== undefined) updateData.isPublic = dto.isPublic;
    if (dto.startDate !== undefined)
      updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) updateData.endDate = new Date(dto.endDate);

    return this.prisma.studyPlan.update({
      where: { id },
      data: updateData,
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
            assignments: true,
          },
        },
      },
    });
  }

  async archive(id: string, userId: string, schoolId: string) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    if (plan.schoolId !== schoolId || plan.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Set status to ARCHIVED
    await this.prisma.studyPlan.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date(),
      },
    });

    return { message: 'Study plan archived successfully' };
  }

  async remove(
    id: string,
    userId: string,
    schoolId: string,
    mode: DeleteMode = DeleteMode.CANCEL_ASSIGNMENTS,
  ) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id },
      include: {
        assignments: true,
        tasks: {
          where: { completedAt: { not: null } }, // Sadece tamamlanmış task'ları al
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    if (plan.schoolId !== schoolId || plan.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Öğrenci performans verilerini kaydet (silmeden önce)
    const completedTasks = plan.tasks;
    if (completedTasks.length > 0) {
      // Her öğrenci için performans özetini kaydet
      const studentPerformance: Record<
        string,
        {
          completedQuestions: number;
          totalDuration: number;
          completedTasks: number;
        }
      > = {};

      for (const task of completedTasks) {
        if (!studentPerformance[task.studentId]) {
          studentPerformance[task.studentId] = {
            completedQuestions: 0,
            totalDuration: 0,
            completedTasks: 0,
          };
        }
        studentPerformance[task.studentId].completedQuestions +=
          (task as any).actualQuestionCount ?? 0;
        studentPerformance[task.studentId].totalDuration +=
          (task as any).actualDuration ?? 0;
        studentPerformance[task.studentId].completedTasks += 1;
      }

      // StudentPerformanceSummary'ye kaydet
      for (const [studentId, perf] of Object.entries(studentPerformance)) {
        await this.prisma.studentPerformanceSummary.upsert({
          where: {
            studentId_planId: {
              studentId,
              planId: id,
            },
          },
          update: {
            completedQuestions: { increment: perf.completedQuestions },
            totalDuration: { increment: perf.totalDuration },
            completedTasks: { increment: perf.completedTasks },
            updatedAt: new Date(),
          },
          create: {
            id: randomUUID(),
            studentId,
            planId: id,
            schoolId,
            completedQuestions: perf.completedQuestions,
            totalDuration: perf.totalDuration,
            completedTasks: perf.completedTasks,
            completionRate: 0,
            updatedAt: new Date(),
          },
        });
      }
    }

    if (mode === DeleteMode.CANCEL_ASSIGNMENTS) {
      // Sadece atamaları iptal et, template kalsın
      await this.prisma.$transaction([
        // Tüm aktif atamaları iptal et
        this.prisma.studyPlanAssignment.updateMany({
          where: { planId: id, status: { not: 'CANCELLED' } },
          data: { status: 'CANCELLED' },
        }),
        // Tamamlanmamış task'ları sil
        this.prisma.studyTask.deleteMany({
          where: { planId: id, completedAt: null },
        }),
      ]);

      return { message: 'Study plan assignments cancelled successfully' };
    } else {
      // Template'i de sil (soft delete)
      await this.prisma.$transaction([
        // Tüm atamaları iptal et
        this.prisma.studyPlanAssignment.updateMany({
          where: { planId: id },
          data: { status: 'CANCELLED' },
        }),
        // Tamamlanmamış task'ları sil
        this.prisma.studyTask.deleteMany({
          where: { planId: id, completedAt: null },
        }),
        // Template'i soft delete yap
        this.prisma.studyPlan.update({
          where: { id },
          data: {
            deletedAt: new Date(),
            status: 'CANCELLED',
          },
        }),
      ]);

      return { message: 'Study plan deleted successfully' };
    }
  }

  async assign(
    planId: string,
    dto: AssignStudyPlanDto,
    userId: string,
    schoolId: string,
  ) {
    const templatePlan = await this.prisma.studyPlan.findUnique({
      where: { id: planId },
    });

    if (!templatePlan) {
      throw new NotFoundException('Study plan not found');
    }

    // Allow assignment if:
    // 1. User owns the template (templatePlan.teacherId === userId)
    // 2. Template is shared with the school (isShared=true and same schoolId)
    // 3. Template is public (isPublic=true)
    const canAssign =
      templatePlan.teacherId === userId ||
      ((templatePlan as any).isShared && templatePlan.schoolId === schoolId) ||
      (templatePlan as any).isPublic;

    if (!canAssign) {
      throw new ForbiddenException(
        'You do not have permission to assign this template',
      );
    }

    // Tarih hesaplama (yıl, ay, hafta'dan) - Do this BEFORE creating the plan
    let weekStartDate: Date;
    let weekEndDate: Date;

    if (dto.year && dto.month && dto.weekNumber) {
      // Ayın ilk gününü bul
      const firstDayOfMonth = new Date(dto.year, dto.month - 1, 1);
      // İlk pazartesiyi bul
      const dayOfWeek = firstDayOfMonth.getDay();
      const daysUntilMonday =
        dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
      const firstMonday = new Date(firstDayOfMonth);
      firstMonday.setDate(firstDayOfMonth.getDate() + daysUntilMonday);

      // İstenen haftanın pazartesisini bul
      weekStartDate = new Date(firstMonday);
      weekStartDate.setDate(firstMonday.getDate() + (dto.weekNumber - 1) * 7);

      // Hafta sonu (Pazar)
      weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
    } else {
      // Varsayılan: Bu hafta
      weekStartDate = new Date();
      weekStartDate.setHours(0, 0, 0, 0);
      const dayOfWeek = weekStartDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStartDate.setDate(weekStartDate.getDate() + diff);

      weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
    }

    // Create a copy of the template as an active plan (not a template)
    const activePlan = await this.prisma.studyPlan.create({
      data: {
        id: randomUUID(),
        teacherId: userId,
        schoolId,
        name: templatePlan.name,
        description: templatePlan.description,
        examType: (templatePlan as any).examType,
        gradeLevels: (templatePlan as any).gradeLevels || [],
        planData: (templatePlan as any).planData,
        isTemplate: false, // This is an active plan, not a template
        isShared: false,
        isPublic: false,
        status: 'ACTIVE',
        startDate: weekStartDate,
        endDate: weekEndDate,
        weekStartDate: weekStartDate, // FIX: Set weekStartDate to prevent "01 Jan 1970" display
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Use same variables for assignment dates
    const startDate = weekStartDate;
    const endDate = weekEndDate;

    const createdTasks: string[] = [];
    const createdAssignments: string[] = [];
    const assignedStudentIds = new Set<string>();

    // Summary tracking
    const summary = {
      students: { count: 0, names: [] as string[] },
      groups: { count: 0, totalStudents: 0, details: [] as any[] },
      classes: { count: 0, totalStudents: 0, details: [] as any[] },
      grades: { count: 0, totalStudents: 0, details: [] as any[] },
    };

    // Get planData from active plan
    const planData = (activePlan as any).planData ?? { rows: [] };
    const rows = planData?.rows ?? [];

    // Helper function: Bir öğrenci için task'ları oluştur
    const createTasksForStudent = async (
      studentId: string,
      assignmentId: string,
      customPlanData?: any,
    ) => {
      const taskRows = customPlanData?.rows ?? rows;

      for (let rowIndex = 0; rowIndex < taskRows.length; rowIndex++) {
        const row = taskRows[rowIndex];
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
          const cell = row?.cells?.[dayIndex];
          if (cell && cell.subjectName) {
            // Her gün için task tarihi hesapla
            const taskDate = new Date(startDate);
            taskDate.setDate(startDate.getDate() + dayIndex);

            const taskData: any = {
              planId: activePlan.id, // Use active plan ID, not template ID
              assignmentId,
              studentId,
              schoolId,
              rowIndex,
              dayIndex,
              subjectName: cell.subjectName,
              topicName: cell.topicName,
              targetQuestionCount:
                cell.targetQuestionCount || cell.questionCount,
              targetDuration: cell.targetDuration || cell.duration,
              targetResource: cell.targetResource || cell.resource,
              status: 'PENDING',
              dueDate: taskDate,
            };
            const task = await this.prisma.studyTask.create({ data: taskData });
            createdTasks.push(task.id);
          }
        }
      }
    };

    // Yeni targets yapısı ile atama
    if (dto.targets && dto.targets.length > 0) {
      for (const target of dto.targets) {
        // Assignment kaydı oluştur
        const assignment = await this.prisma.studyPlanAssignment.create({
          data: {
            id: randomUUID(),
            planId: activePlan.id, // Use active plan ID
            targetType: target.type as any,
            targetId: target.id,
            assignedById: userId,
            schoolId,
            startDate,
            endDate,
            status: 'ACTIVE',
            customPlanData: target.customPlanData ?? null,
            updatedAt: new Date(),
          },
        });
        createdAssignments.push(assignment.id);

        // Hedef tipine göre öğrencileri bul ve task oluştur
        const studentIds = await this.getStudentsForTarget(
          target.type as AssignmentTargetType,
          target.id,
          schoolId,
        );

        for (const studentId of studentIds) {
          assignedStudentIds.add(studentId);
          await createTasksForStudent(
            studentId,
            assignment.id,
            target.customPlanData,
          );
        }
      }
    }

    // Geriye uyumluluk: Eski yapıyı da destekle
    if (dto.studentIds && dto.studentIds.length > 0) {
      for (const studentId of dto.studentIds) {
        const student = await this.prisma.student.findUnique({
          where: { id: studentId },
          include: { user: true },
        });

        const assignment = await this.prisma.studyPlanAssignment.create({
          data: {
            id: randomUUID(),
            planId: activePlan.id,
            targetType: 'STUDENT' as any,
            targetId: studentId,
            assignedById: userId,
            schoolId,
            startDate,
            endDate,
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        });
        createdAssignments.push(assignment.id);

        assignedStudentIds.add(studentId);
        await createTasksForStudent(studentId, assignment.id);

        // Update summary
        if (student) {
          summary.students.count++;
          summary.students.names.push(
            `${student.user.firstName} ${student.user.lastName}`,
          );
        }
      }
    }

    if (dto.groupIds && dto.groupIds.length > 0) {
      for (const groupId of dto.groupIds) {
        const group = await this.prisma.mentorGroup.findUnique({
          where: { id: groupId },
          include: { _count: { select: { memberships: true } } },
        });

        const assignment = await this.prisma.studyPlanAssignment.create({
          data: {
            id: randomUUID(),
            planId: activePlan.id,
            targetType: 'GROUP' as any,
            targetId: groupId,
            assignedById: userId,
            schoolId,
            startDate,
            endDate,
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        });
        createdAssignments.push(assignment.id);

        const studentIds = await this.getStudentsForTarget(
          AssignmentTargetType.GROUP,
          groupId,
          schoolId,
        );
        for (const studentId of studentIds) {
          assignedStudentIds.add(studentId);
          await createTasksForStudent(studentId, assignment.id);
        }

        // Update summary
        if (group) {
          summary.groups.count++;
          summary.groups.totalStudents += studentIds.length;
          summary.groups.details.push({
            name: group.name,
            studentCount: studentIds.length,
          });
        }

        // GroupStudyPlan kaydı da oluştur (geriye uyumluluk)
        await this.prisma.groupStudyPlan.create({
          data: {
            id: randomUUID(),
            groupId,
            studyPlanId: activePlan.id,
          },
        });
      }
    }

    if (dto.classIds && dto.classIds.length > 0) {
      for (const classId of dto.classIds) {
        const classInfo = await this.prisma.class.findUnique({
          where: { id: classId },
          include: {
            grade: { select: { id: true, name: true } },
            _count: { select: { students: true } },
          },
        });

        const assignment = await this.prisma.studyPlanAssignment.create({
          data: {
            id: randomUUID(),
            planId: activePlan.id,
            targetType: 'CLASS' as any,
            targetId: classId,
            assignedById: userId,
            schoolId,
            startDate,
            endDate,
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        });
        createdAssignments.push(assignment.id);

        const studentIds = await this.getStudentsForTarget(
          AssignmentTargetType.CLASS,
          classId,
          schoolId,
        );
        for (const studentId of studentIds) {
          assignedStudentIds.add(studentId);
          await createTasksForStudent(studentId, assignment.id);
        }

        // Update summary
        if (classInfo) {
          summary.classes.count++;
          summary.classes.totalStudents += studentIds.length;
          summary.classes.details.push({
            name: `${classInfo.grade?.name || ''} - ${classInfo.name}`,
            studentCount: studentIds.length,
          });
        }
      }
    }

    if (dto.gradeIds && dto.gradeIds.length > 0) {
      for (const gradeId of dto.gradeIds) {
        const gradeInfo = await this.prisma.grade.findUnique({
          where: { id: gradeId },
          select: { id: true, name: true },
        });

        const assignment = await this.prisma.studyPlanAssignment.create({
          data: {
            id: randomUUID(),
            planId: activePlan.id,
            targetType: 'GRADE' as any,
            targetId: gradeId,
            assignedById: userId,
            schoolId,
            startDate,
            endDate,
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        });
        createdAssignments.push(assignment.id);

        const studentIds = await this.getStudentsForTarget(
          AssignmentTargetType.GRADE,
          gradeId,
          schoolId,
        );
        for (const studentId of studentIds) {
          assignedStudentIds.add(studentId);
          await createTasksForStudent(studentId, assignment.id);
        }

        // Update summary
        if (gradeInfo) {
          summary.grades.count++;
          summary.grades.totalStudents += studentIds.length;
          summary.grades.details.push({
            name: `${gradeInfo.name} (Tüm Şubeler)`,
            studentCount: studentIds.length,
          });
        }
      }
    }

    // Calculate total unique students
    const totalStudents =
      summary.students.count +
      summary.groups.totalStudents +
      summary.classes.totalStudents +
      summary.grades.totalStudents;

    // Template stays as is, new active plan created
    // No need to update template status

    try {
      if (assignedStudentIds.size > 0) {
        const assignedStudents = await this.prisma.student.findMany({
          where: {
            id: { in: [...assignedStudentIds] },
            schoolId,
          },
          select: {
            userId: true,
            parent: {
              select: {
                userId: true,
              },
            },
          },
        });

        const recipientUserIds = new Set<string>();
        assignedStudents.forEach((student) => {
          recipientUserIds.add(student.userId);
          if (student.parent?.userId) {
            recipientUserIds.add(student.parent.userId);
          }
        });

        await this.notificationsService.dispatchSystemNotification({
          schoolId,
          type: NotificationType.STUDY_PLAN_ASSIGNED,
          title: 'Yeni calisma planin hazir',
          body: `${activePlan.name} plani senin icin atandi.`,
          targetUserIds: [...recipientUserIds],
          deeplink: `/dashboard/my-tasks/${activePlan.id}`,
          metadata: {
            planId: activePlan.id,
            templateId: planId,
          },
        });
      }
    } catch (error) {
      console.error(
        'Push notification dispatch failed for study plan assignment:',
        error,
      );
    }

    return {
      message: 'Study plan assigned successfully',
      activePlanId: activePlan.id, // Return the new active plan ID
      templateId: planId, // Return original template ID
      summary: {
        totalStudents,
        students: summary.students,
        groups: summary.groups,
        classes: summary.classes,
        grades: summary.grades,
      },
      assignmentCount: createdAssignments.length,
      taskCount: createdTasks.length,
      startDate,
      endDate,
    };
  }

  // Hedef tipine göre öğrenci ID'lerini getir
  private async getStudentsForTarget(
    targetType: AssignmentTargetType,
    targetId: string,
    schoolId: string,
  ): Promise<string[]> {
    switch (targetType) {
      case AssignmentTargetType.STUDENT: {
        // ��renci do�rudan
        const student = await this.prisma.student.findUnique({
          where: { id: targetId },
        });
        if (student && student.schoolId === schoolId) {
          return [student.id];
        }
        return [];
      }

      case AssignmentTargetType.GROUP: {
        // Mentor grubu �yeleri
        const memberships = await this.prisma.groupMembership.findMany({
          where: { groupId: targetId, leftAt: null },
          select: { studentId: true },
        });
        return memberships.map((m) => m.studentId);
      }

      case AssignmentTargetType.CLASS: {
        // S�n�ftaki ��renciler
        const classStudents = await this.prisma.student.findMany({
          where: { classId: targetId, schoolId },
          select: { id: true },
        });
        return classStudents.map((s) => s.id);
      }

      case AssignmentTargetType.GRADE: {
        // S�n�f seviyesindeki t�m ��renciler (�rn: t�m 8. s�n�flar)
        const classes = await this.prisma.class.findMany({
          where: { gradeId: targetId },
          select: { id: true },
        });
        const gradeStudents = await this.prisma.student.findMany({
          where: {
            classId: { in: classes.map((c) => c.id) },
            schoolId,
          },
          select: { id: true },
        });
        return gradeStudents.map((s) => s.id);
      }

      default:
        return [];
    }
  }

  async findTemplates(
    schoolId: string,
    userId: string,
    examType?: string,
    gradeLevel?: number,
    includeShared: boolean = true,
    month?: number,
    year?: number,
    createdBy?: string,
    sortBy?: string,
  ) {
    // Default to current month/year if not provided
    const now = new Date();
    const filterMonth = month !== undefined ? month : now.getMonth() + 1; // 1-12
    const filterYear = year !== undefined ? year : now.getFullYear();

    const where: any = {
      isTemplate: true,
      deletedAt: null,
    };

    if (examType) {
      where.examType = examType;
    }

    if (gradeLevel !== undefined) {
      where.gradeLevels = { has: gradeLevel };
    }

    // Month/Year filter - filter by createdAt
    const startDate = new Date(filterYear, filterMonth - 1, 1); // First day of month
    const endDate = new Date(filterYear, filterMonth, 0, 23, 59, 59); // Last day of month
    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };

    // CreatedBy filter - "mine" vs "all"
    if (createdBy === 'mine') {
      where.teacherId = userId;
    } else if (includeShared) {
      // Show own templates + shared templates
      where.OR = [
        { schoolId, teacherId: userId },
        { schoolId, isShared: true },
        { isPublic: true },
      ];
    } else {
      where.schoolId = schoolId;
      where.teacherId = userId;
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }; // Default: newest first
    if (sortBy === 'most-used') {
      orderBy = { assignments: { _count: 'desc' } };
    } else if (sortBy === 'name') {
      orderBy = { name: 'asc' };
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
            assignments: true,
          },
        },
      },
      orderBy,
    });
  }

  // Planı kopyala (duplicate)
  async duplicate(
    id: string,
    userId: string,
    schoolId: string,
    newName?: string,
  ) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    // Plan ya okulun planı olmalı ya da paylaşılmış olmalı
    if (plan.schoolId !== schoolId && !plan.isShared && !plan.isPublic) {
      throw new ForbiddenException('Access denied');
    }

    // Yeni plan oluştur
    const newPlan = await this.prisma.studyPlan.create({
      data: {
        id: randomUUID(),
        name: newName || `${plan.name} (Kopya)`,
        description: plan.description,
        examType: plan.examType,
        gradeLevels: plan.gradeLevels ?? [],
        planData: plan.planData ?? Prisma.JsonNull,
        status: 'DRAFT' as any,
        isTemplate: true,
        templateName: plan.templateName,
        isShared: false,
        isPublic: false,
        teacherId: userId,
        schoolId,
        updatedAt: new Date(),
      },
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
            assignments: true,
          },
        },
      },
    });

    return newPlan;
  }

  // Planı paylaş
  async share(
    id: string,
    userId: string,
    schoolId: string,
    isPublic: boolean = false,
  ) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    if (plan.schoolId !== schoolId || plan.teacherId !== userId) {
      throw new ForbiddenException('Only the creator can share this plan');
    }

    return this.prisma.studyPlan.update({
      where: { id },
      data: {
        isShared: true,
        isPublic,
        sharedAt: new Date(),
      },
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
            assignments: true,
          },
        },
      },
    });
  }

  // Plan atamalarını getir
  async getAssignments(planId: string, userId: string, schoolId: string) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    if (plan.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    const assignments = await this.prisma.studyPlanAssignment.findMany({
      where: { planId },
      include: {
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Her atama için hedef detaylarını al
    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        let targetDetails: any = null;

        switch (assignment.targetType) {
          case 'STUDENT': {
            const student = await this.prisma.student.findUnique({
              where: { id: assignment.targetId },
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            });
            targetDetails = student
              ? {
                  name: `${student.user.firstName} ${student.user.lastName}`,
                  type: '��renci',
                }
              : null;
            break;
          }

          case 'GROUP': {
            const group = await this.prisma.mentorGroup.findUnique({
              where: { id: assignment.targetId },
              select: { name: true },
            });
            targetDetails = group
              ? {
                  name: group.name,
                  type: 'Grup',
                }
              : null;
            break;
          }

          case 'CLASS': {
            const classObj = await this.prisma.class.findUnique({
              where: { id: assignment.targetId },
              include: { grade: { select: { name: true } } },
            });
            targetDetails = classObj
              ? {
                  name: classObj.name, // S�n�f ad� (�rn: "8/A")
                  type: 'S�n�f',
                }
              : null;
            break;
          }

          case 'GRADE': {
            const grade = await this.prisma.grade.findUnique({
              where: { id: assignment.targetId },
              select: { name: true },
            });
            targetDetails = grade
              ? {
                  name: grade.name, // S�n�f seviyesi ad� (�rn: "8. S�n�f")
                  type: 'S�n�f Seviyesi',
                }
              : null;
            break;
          }
        }
        // Task istatistikleri
        const taskStats = await this.prisma.studyTask.count({
          where: { assignmentId: assignment.id },
        });
        const completedTaskStats = await this.prisma.studyTask.count({
          where: { assignmentId: assignment.id, status: 'COMPLETED' },
        });

        return {
          ...assignment,
          targetDetails,
          taskStats: {
            total: taskStats,
            completed: completedTaskStats,
          },
        };
      }),
    );

    return assignmentsWithDetails;
  }

  // Bir atamayı iptal et
  async cancelAssignment(
    assignmentId: string,
    userId: string,
    schoolId: string,
  ) {
    const assignment = await this.prisma.studyPlanAssignment.findUnique({
      where: { id: assignmentId },
      include: { plan: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.plan.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    // Planın sahibi veya atamayı yapan kişi iptal edebilir
    if (
      assignment.plan.teacherId !== userId &&
      assignment.assignedById !== userId
    ) {
      throw new ForbiddenException('You cannot cancel this assignment');
    }

    // Atamayı iptal et
    await this.prisma.$transaction([
      this.prisma.studyPlanAssignment.update({
        where: { id: assignmentId },
        data: { status: 'CANCELLED' },
      }),
      // Tamamlanmamış task'ları sil
      this.prisma.studyTask.deleteMany({
        where: { assignmentId, completedAt: null },
      }),
    ]);

    return { message: 'Assignment cancelled successfully' };
  }

  // Get assignment summary for a plan
  async getAssignmentSummary(planId: string, schoolId: string) {
    const assignments = await this.prisma.studyPlanAssignment.findMany({
      where: {
        planId,
        schoolId,
        status: { in: ['ACTIVE', 'ASSIGNED'] },
      },
      select: {
        id: true,
        targetType: true,
        targetId: true,
      },
    });

    if (assignments.length === 0) {
      return { assignments: [] };
    }

    // Fetch target details for each assignment
    const assignmentsWithDetails = await Promise.all(
      assignments.map(async (assignment) => {
        let targetName = '';

        switch (assignment.targetType) {
          case 'STUDENT': {
            const student = await this.prisma.student.findUnique({
              where: { id: assignment.targetId },
              include: { user: true },
            });
            targetName = student
              ? `${student.user.firstName} ${student.user.lastName}`
              : '��renci';
            break;
          }

          case 'GROUP': {
            const group = await this.prisma.mentorGroup.findUnique({
              where: { id: assignment.targetId },
            });
            targetName = group?.name || 'Grup';
            break;
          }

          case 'CLASS': {
            const classEntity = await this.prisma.class.findUnique({
              where: { id: assignment.targetId },
              include: { grade: true },
            });
            targetName = classEntity
              ? `${classEntity.grade.name}-${classEntity.name}`
              : 'S�n�f';
            break;
          }

          case 'GRADE': {
            const grade = await this.prisma.grade.findUnique({
              where: { id: assignment.targetId },
            });
            targetName = grade?.name || 'S�n�f Seviyesi';
            break;
          }
        }
        return {
          targetType: assignment.targetType,
          targetName,
        };
      }),
    );

    return { assignments: assignmentsWithDetails };
  }
}

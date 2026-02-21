import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupPostType } from '@prisma/client';
import { basename, join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import {
  CreateMentorGroupDto,
  UpdateMentorGroupDto,
  AddGroupMemberDto,
  CreateGroupGoalDto,
  UpdateGroupPostDto,
} from './dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  private isAdmin(role: string) {
    return role === 'SCHOOL_ADMIN' || role === 'SUPER_ADMIN';
  }

  private async isGroupTeacher(
    groupId: string,
    userId: string,
    primaryTeacherId?: string | null,
  ) {
    if (primaryTeacherId && primaryTeacherId === userId) {
      return true;
    }

    const assignment = await this.prisma.groupTeacher.findFirst({
      where: {
        groupId,
        teacherId: userId,
        leftAt: null,
      },
      select: { id: true },
    });

    return !!assignment;
  }

  private async canManageGroup(
    group: { id: string; teacherId: string | null },
    userId: string,
    role: string,
  ) {
    if (this.isAdmin(role)) {
      return true;
    }

    if (role !== 'TEACHER') {
      return false;
    }

    return this.isGroupTeacher(group.id, userId, group.teacherId);
  }

  private async validateTeacherIds(teacherIds: string[], schoolId: string) {
    if (!teacherIds.length) {
      return [];
    }

    const uniqueTeacherIds = [...new Set(teacherIds)];
    const teachers = await this.prisma.user.findMany({
      where: {
        id: { in: uniqueTeacherIds },
        role: 'TEACHER',
        schoolId,
      },
      select: { id: true },
    });

    if (teachers.length !== uniqueTeacherIds.length) {
      throw new BadRequestException('Öğretmenlerden biri bulunamadı');
    }

    return uniqueTeacherIds;
  }

  private async syncGroupTeacherAssignments(
    groupId: string,
    schoolId: string,
    managerUserId: string | null,
    teacherIds: string[],
  ) {
    const uniqueTeacherIds = [...new Set(teacherIds)];
    await this.prisma.$transaction(async (tx) => {
      for (const teacherId of uniqueTeacherIds) {
        await tx.groupTeacher.upsert({
          where: {
            groupId_teacherId: {
              groupId,
              teacherId,
            },
          },
          update: {
            schoolId,
            addedById: managerUserId,
            leftAt: null,
          },
          create: {
            groupId,
            teacherId,
            schoolId,
            addedById: managerUserId,
            leftAt: null,
          },
        });
      }
    });
  }

  private async ensureGroupAccess(
    groupId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
      include: {
        memberships: {
          where: { leftAt: null },
          select: { studentId: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    if (
      userRole === 'TEACHER' &&
      !(await this.isGroupTeacher(group.id, userId, group.teacherId))
    ) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === 'STUDENT') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { student: true },
      });

      if (!user?.student) {
        throw new ForbiddenException('Access denied');
      }

      const studentId = user.student?.id;
      if (!studentId) {
        throw new ForbiddenException('Access denied');
      }
      const isMember = group.memberships.some(
        (membership) => membership.studentId === studentId,
      );
      if (!isMember) {
        throw new ForbiddenException('Access denied');
      }

      // Hide member list details from students
      return {
        ...group,
        memberships: [],
      };
    }

    return group;
  }

  async create(
    dto: CreateMentorGroupDto,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    console.log('Creating group with:', { dto, userId, schoolId });

    let teacherId: string | null = userId;
    const requestedTeacherIds = Array.isArray(dto.teacherIds)
      ? dto.teacherIds
      : [];
    const normalizedTeacherIds = [
      ...new Set(requestedTeacherIds.filter(Boolean)),
    ];

    if (this.isAdmin(userRole)) {
      if (dto.teacherId) {
        const [primaryTeacherId] = await this.validateTeacherIds(
          [dto.teacherId],
          schoolId,
        );
        teacherId = primaryTeacherId;
      } else if (normalizedTeacherIds.length > 0) {
        const validatedIds = await this.validateTeacherIds(
          normalizedTeacherIds,
          schoolId,
        );
        teacherId = validatedIds[0] ?? null;
      } else {
        teacherId = null;
      }
    } else if (normalizedTeacherIds.length > 0) {
      const validatedIds = await this.validateTeacherIds(
        normalizedTeacherIds,
        schoolId,
      );
      if (!validatedIds.includes(userId)) {
        validatedIds.push(userId);
      }
      teacherId = teacherId ?? validatedIds[0] ?? userId;
    }

    // Create group
    const group = await this.prisma.mentorGroup.create({
      data: {
        name: dto.name,
        description: dto.description,
        teacherId,
        schoolId,
        gradeIds: dto.gradeIds || [],
        maxStudents: dto.maxStudents ?? undefined,
        isActive: dto.isActive ?? true,
      },
    });

    const teacherIdsToAssign = [
      ...new Set([
        ...(teacherId ? [teacherId] : []),
        ...normalizedTeacherIds,
        ...(userRole === 'TEACHER' ? [userId] : []),
      ]),
    ];

    if (teacherIdsToAssign.length > 0) {
      const validatedTeacherIds = await this.validateTeacherIds(
        teacherIdsToAssign,
        schoolId,
      );
      await this.syncGroupTeacherAssignments(
        group.id,
        schoolId,
        userId,
        validatedTeacherIds,
      );
    }

    // Add initial members if provided
    if (dto.studentIds && dto.studentIds.length > 0) {
      let currentCount = 0;
      if (group.maxStudents) {
        currentCount = await this.prisma.groupMembership.count({
          where: { groupId: group.id, leftAt: null },
        });
      }

      for (const studentId of dto.studentIds) {
        const student = await this.prisma.student.findUnique({
          where: { id: studentId },
        });

        if (student && student.schoolId === schoolId) {
          const existingMembership =
            await this.prisma.groupMembership.findFirst({
              where: { groupId: group.id, studentId, leftAt: null },
            });

          if (existingMembership) {
            continue;
          }

          if (group.maxStudents && currentCount >= group.maxStudents) {
            break;
          }

          await this.prisma.groupMembership.create({
            data: {
              groupId: group.id,
              studentId,
              schoolId,
              role: 'MEMBER',
            },
          });

          currentCount += 1;
        }
      }
    }

    return this.findOne(group.id, userId, userRole, schoolId);
  }

  async findAll(userId: string, userRole: string, schoolId: string) {
    const where: any = { schoolId };

    if (userRole === 'TEACHER') {
      where.OR = [
        { teacherId: userId },
        {
          teacherAssignments: {
            some: {
              teacherId: userId,
              leftAt: null,
            },
          },
        },
      ];
    } else if (userRole === 'STUDENT') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { student: true },
      });

      if (!user?.student) {
        return [];
      }

      where.memberships = {
        some: {
          studentId: user.student.id,
          leftAt: null,
        },
      };
    }

    return this.prisma.mentorGroup.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        teacherAssignments: {
          where: { leftAt: null },
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            memberships: true,
            goals: true,
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
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        teacherAssignments: {
          where: { leftAt: null },
          include: {
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        memberships: {
          where: { leftAt: null },
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
          orderBy: { joinedAt: 'asc' },
        },
        goals: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    if (
      userRole === 'TEACHER' &&
      !(await this.isGroupTeacher(group.id, userId, group.teacherId))
    ) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === 'STUDENT') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { student: true },
      });

      if (!user?.student) {
        throw new ForbiddenException('Access denied');
      }

      const studentId = user.student?.id;
      if (!studentId) {
        throw new ForbiddenException('Access denied');
      }
      const isMember = group.memberships.some(
        (membership) => membership.studentId === studentId,
      );
      if (!isMember) {
        throw new ForbiddenException('Access denied');
      }
    }

    return group;
  }

  async update(
    id: string,
    dto: UpdateMentorGroupDto,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = {
      name: dto.name,
      description: dto.description,
      maxStudents: dto.maxStudents,
      gradeIds: dto.gradeIds,
      isActive: dto.isActive,
    };

    let primaryTeacherId: string | null = group.teacherId;
    if (this.isAdmin(userRole) && dto.teacherId) {
      const [validatedTeacherId] = await this.validateTeacherIds(
        [dto.teacherId],
        schoolId,
      );
      updateData.teacherId = validatedTeacherId;
      primaryTeacherId = validatedTeacherId;
    }

    const updatedGroup = await this.prisma.mentorGroup.update({
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
            memberships: true,
          },
        },
      },
    });

    if (Array.isArray(dto.teacherIds)) {
      const validatedTeacherIds = await this.validateTeacherIds(
        dto.teacherIds,
        schoolId,
      );
      const teacherIdsToSync = [
        ...new Set([
          ...(primaryTeacherId ? [primaryTeacherId] : []),
          ...validatedTeacherIds,
        ]),
      ];
      await this.syncGroupTeacherAssignments(
        id,
        schoolId,
        userId,
        teacherIdsToSync,
      );
    } else if (primaryTeacherId) {
      await this.syncGroupTeacherAssignments(id, schoolId, userId, [
        primaryTeacherId,
      ]);
    }

    return updatedGroup;
  }

  async remove(id: string, userId: string, userRole: string, schoolId: string) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.mentorGroup.delete({
      where: { id },
    });

    return { message: 'Group deleted successfully' };
  }

  async addMember(
    groupId: string,
    dto: AddGroupMemberDto,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    // Verify student exists and belongs to school
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found');
    }

    const existingMembership = await this.prisma.groupMembership.findFirst({
      where: { groupId, studentId: dto.studentId, leftAt: null },
    });

    if (existingMembership) {
      throw new BadRequestException('Öğrenci zaten bu grupta');
    }

    const currentCount = await this.prisma.groupMembership.count({
      where: { groupId, leftAt: null },
    });

    if (group.maxStudents && currentCount >= group.maxStudents) {
      throw new ForbiddenException('Grup kapasitesi dolu');
    }

    return this.prisma.groupMembership.create({
      data: {
        groupId,
        studentId: dto.studentId,
        role: dto.role,
        schoolId,
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
      },
    });
  }

  async transferMember(
    groupId: string,
    studentId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found');
    }

    const existingMembership = await this.prisma.groupMembership.findFirst({
      where: { groupId, studentId, leftAt: null },
    });

    if (existingMembership) {
      throw new BadRequestException('Öğrenci zaten bu grupta');
    }

    const currentCount = await this.prisma.groupMembership.count({
      where: { groupId, leftAt: null },
    });

    if (group.maxStudents && currentCount >= group.maxStudents) {
      throw new ForbiddenException('Grup kapasitesi dolu');
    }

    return this.prisma.groupMembership.create({
      data: {
        groupId,
        studentId,
        role: 'MEMBER',
        schoolId,
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
      },
    });
  }

  async removeMember(
    groupId: string,
    studentId: string,
    userId: string,
    userRole: string,
    schoolId: string,
    removeBoardContent: boolean = false,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    const membership = await this.prisma.groupMembership.findFirst({
      where: {
        groupId,
        studentId,
        leftAt: null,
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, userId: true },
    });

    await this.prisma.$transaction(async (tx) => {
      if (removeBoardContent && student?.userId) {
        await tx.groupPostResponse.deleteMany({
          where: {
            studentId,
            post: { groupId },
          },
        });

        await tx.groupPostReply.deleteMany({
          where: {
            authorId: student.userId,
            post: { groupId },
          },
        });

        await tx.groupPost.deleteMany({
          where: {
            groupId,
            authorId: student.userId,
          },
        });
      }

      await tx.groupMembership.update({
        where: { id: membership.id },
        data: {
          leftAt: new Date(),
        },
      });
    });

    return {
      message: 'Member removed successfully',
      removedBoardContent: removeBoardContent,
    };
  }

  async getGroupTeachers(
    groupId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
      select: { id: true, schoolId: true, teacherId: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    const assignments = await this.prisma.groupTeacher.findMany({
      where: {
        groupId,
        leftAt: null,
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
      orderBy: { createdAt: 'asc' },
    });

    return assignments.map((assignment) => ({
      id: assignment.id,
      teacherId: assignment.teacherId,
      isPrimary: assignment.teacherId === group.teacherId,
      createdAt: assignment.createdAt,
      teacher: assignment.teacher,
    }));
  }

  async addGroupTeachers(
    groupId: string,
    teacherIds: string[],
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
      select: { id: true, schoolId: true, teacherId: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    const normalizedTeacherIds = [
      ...new Set((teacherIds || []).filter(Boolean)),
    ];
    if (normalizedTeacherIds.length === 0) {
      throw new BadRequestException('En az bir öğretmen seçilmelidir');
    }

    const validatedTeacherIds = await this.validateTeacherIds(
      normalizedTeacherIds,
      schoolId,
    );
    await this.syncGroupTeacherAssignments(
      groupId,
      schoolId,
      userId,
      validatedTeacherIds,
    );

    if (!group.teacherId) {
      await this.prisma.mentorGroup.update({
        where: { id: groupId },
        data: { teacherId: validatedTeacherIds[0] },
      });
    }

    return this.getGroupTeachers(groupId, userId, userRole, schoolId);
  }

  async removeGroupTeacher(
    groupId: string,
    teacherId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
      select: { id: true, schoolId: true, teacherId: true },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    const activeAssignments = await this.prisma.groupTeacher.findMany({
      where: { groupId, leftAt: null },
      select: { id: true, teacherId: true },
      orderBy: { createdAt: 'asc' },
    });

    const assignment =
      activeAssignments.find((item) => item.teacherId === teacherId) ?? null;

    if (!assignment && group.teacherId !== teacherId) {
      throw new NotFoundException('Öğretmen bu grupta yetkili değil');
    }

    const remainingTeacherIds = activeAssignments
      .filter((item) => item.teacherId !== teacherId)
      .map((item) => item.teacherId);

    if (remainingTeacherIds.length === 0) {
      throw new BadRequestException(
        'Grupta en az bir yetkili öğretmen kalmalıdır',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (assignment) {
        await tx.groupTeacher.update({
          where: { id: assignment.id },
          data: { leftAt: new Date() },
        });
      }

      if (group.teacherId === teacherId) {
        await tx.mentorGroup.update({
          where: { id: groupId },
          data: { teacherId: remainingTeacherIds[0] ?? null },
        });
      }
    });

    return {
      message: 'Öğretmen yetkisi kaldırıldı',
      primaryTeacherId:
        group.teacherId === teacherId
          ? remainingTeacherIds[0]
          : group.teacherId,
    };
  }

  async createGroupGoal(
    groupId: string,
    dto: CreateGroupGoalDto,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.groupGoal.create({
      data: {
        groupId,
        schoolId,
        goalType: dto.goalType,
        targetData: dto.targetData,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        isPublished: dto.isPublished ?? true,
        isCompleted: dto.isCompleted ?? false,
      },
    });
  }

  async getGroupStats(
    groupId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
      include: {
        memberships: {
          where: { leftAt: null },
          include: {
            student: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    if (
      userRole === 'TEACHER' &&
      !(await this.isGroupTeacher(group.id, userId, group.teacherId))
    ) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === 'STUDENT') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { student: true },
      });

      if (!user?.student) {
        throw new ForbiddenException('Access denied');
      }

      const studentId = user.student?.id;
      if (!studentId) {
        throw new ForbiddenException('Access denied');
      }
      const isMember = group.memberships.some(
        (membership) => membership.studentId === studentId,
      );
      if (!isMember) {
        throw new ForbiddenException('Access denied');
      }
    }

    const memberIds = group.memberships.map((m) => m.studentId);

    // Get study stats for all members
    const completedTasks = await this.prisma.studyTask.count({
      where: {
        studentId: { in: memberIds },
        status: { in: ['COMPLETED', 'LATE'] },
      },
    });

    const sessions = await this.prisma.studySession.findMany({
      where: {
        studentId: { in: memberIds },
      },
    });

    const totalStudyMinutes = sessions.reduce(
      (sum, s) => sum + Math.round(s.duration / 60),
      0,
    );

    const goals = await this.prisma.groupGoal.findMany({
      where: { groupId },
    });

    const activeGoals = goals.filter((g) => g.isActive).length;

    return {
      memberCount: memberIds.length,
      completedTasks,
      totalStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
      avgStudyHoursPerMember:
        memberIds.length > 0
          ? Math.round((totalStudyMinutes / 60 / memberIds.length) * 10) / 10
          : 0,
      groupGoals: goals.length,
      activeGroupGoals: activeGoals,
    };
  }

  async getAvailableStudents(
    groupId: string,
    userId: string,
    userRole: string,
    schoolId: string,
    gradeId?: string,
    classId?: string,
  ) {
    // Verify group exists and belongs to school
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    // Build where clause
    const where: any = {
      schoolId,
      groupMemberships: {
        none: {
          groupId,
          leftAt: null,
        },
      },
    };

    if (classId) {
      where.classId = classId;
    } else if (gradeId) {
      where.class = { gradeId };
    }

    // Get available students
    return this.prisma.student.findMany({
      where,
      include: {
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
      orderBy: [
        { class: { grade: { name: 'asc' } } },
        { class: { name: 'asc' } },
        { user: { firstName: 'asc' } },
      ],
    });
  }

  async getTransferCandidates(
    groupId: string,
    userId: string,
    userRole: string,
    schoolId: string,
    gradeId?: string,
    classId?: string,
  ) {
    const group = await this.ensureGroupAccess(
      groupId,
      userId,
      userRole,
      schoolId,
    );

    if (!(await this.canManageGroup(group, userId, userRole))) {
      throw new ForbiddenException('Access denied');
    }

    const where: any = {
      schoolId,
    };

    if (classId) {
      where.classId = classId;
    } else if (gradeId) {
      where.class = { gradeId };
    }

    const students = await this.prisma.student.findMany({
      where,
      include: {
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
              select: { name: true },
            },
          },
        },
        groupMemberships: {
          where: { leftAt: null },
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
      orderBy: [
        { class: { grade: { name: 'asc' } } },
        { class: { name: 'asc' } },
        { user: { firstName: 'asc' } },
      ],
    });

    return students.map((student) => {
      const activeMembership = student.groupMemberships[0];
      const isInThisGroup = student.groupMemberships.some(
        (membership) => membership.group.id === groupId,
      );
      return {
        id: student.id,
        user: student.user,
        class: student.class,
        currentGroup: activeMembership ? activeMembership.group : null,
        isInThisGroup,
      };
    });
  }

  async getGradesForGroup(schoolId: string) {
    // Önce mevcut grade'leri kontrol et
    let grades = await this.prisma.grade.findMany({
      where: { schoolId },
      include: {
        _count: {
          select: {
            classes: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Eğer standart grade'ler yoksa, oluştur
    if (grades.length === 0 || !this.hasStandardGrades(grades)) {
      await this.createStandardGrades(schoolId);
      grades = await this.prisma.grade.findMany({
        where: { schoolId },
        include: {
          _count: {
            select: {
              classes: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    return grades;
  }

  private hasStandardGrades(grades: any[]): boolean {
    const standardGradeNames = ['5', '6', '7', '8', '9', '10', '11', '12'];
    const existingNames = grades.map((g) => g.name);
    return standardGradeNames.every((name) => existingNames.includes(name));
  }

  private async createStandardGrades(schoolId: string) {
    const standardGrades = [
      { name: '5', schoolId },
      { name: '6', schoolId },
      { name: '7', schoolId },
      { name: '8', schoolId },
      { name: '9', schoolId },
      { name: '10', schoolId },
      { name: '11', schoolId },
      { name: '12', schoolId },
    ];

    for (const grade of standardGrades) {
      const existing = await this.prisma.grade.findFirst({
        where: { schoolId, name: grade.name },
      });

      if (!existing) {
        await this.prisma.grade.create({ data: grade });
      }
    }
  }

  async getClassesByGrade(gradeId: string, schoolId: string) {
    return this.prisma.class.findMany({
      where: {
        gradeId,
        schoolId,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async addMembersBulk(
    groupId: string,
    studentIds: string[],
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    const results: any[] = [];
    const errors: any[] = [];
    let currentCount = await this.prisma.groupMembership.count({
      where: { groupId, leftAt: null },
    });

    for (const studentId of studentIds) {
      try {
        // Verify student exists and belongs to school
        const student = await this.prisma.student.findUnique({
          where: { id: studentId },
        });

        if (!student || student.schoolId !== schoolId) {
          errors.push({
            studentId,
            error: 'Öğrenci bulunamadı veya okula ait değil',
          });
          continue;
        }

        const existingMembership = await this.prisma.groupMembership.findFirst({
          where: { groupId, studentId, leftAt: null },
        });

        if (existingMembership) {
          errors.push({ studentId, error: 'Öğrenci zaten bu grupta' });
          continue;
        }

        if (group.maxStudents && currentCount >= group.maxStudents) {
          errors.push({ studentId, error: 'Grup kapasitesi dolu' });
          continue;
        }

        const membership = await this.prisma.groupMembership.create({
          data: {
            groupId,
            studentId,
            role: 'MEMBER',
            schoolId,
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
          },
        });

        results.push(membership);
        currentCount += 1;
      } catch (error) {
        errors.push({ studentId, error: error.message });
      }
    }

    return {
      added: results,
      errors,
      totalAdded: results.length,
      totalErrors: errors.length,
    };
  }

  async updateGroupGoal(
    groupId: string,
    goalId: string,
    dto: any,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    const goal = await this.prisma.groupGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.groupId !== groupId) {
      throw new NotFoundException('Goal not found');
    }

    const updateData: any = {};

    if (dto.goalType) updateData.goalType = dto.goalType;
    if (dto.targetData) updateData.targetData = dto.targetData;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.isPublished !== undefined) updateData.isPublished = dto.isPublished;
    if (dto.isCompleted !== undefined) updateData.isCompleted = dto.isCompleted;
    if (dto.deadline) updateData.deadline = new Date(dto.deadline);

    return this.prisma.groupGoal.update({
      where: { id: goalId },
      data: updateData,
    });
  }

  async completeGoalAsStudent(
    groupId: string,
    goalId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    if (userRole !== 'STUDENT') {
      throw new ForbiddenException('Access denied');
    }

    await this.ensureGroupAccess(groupId, userId, userRole, schoolId);

    const goal = await this.prisma.groupGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.groupId !== groupId) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.goalType !== 'TASK') {
      throw new BadRequestException('Sadece görev hedefleri tamamlanabilir');
    }

    return this.prisma.groupGoal.update({
      where: { id: goalId },
      data: { isCompleted: true },
    });
  }

  async deleteGroupGoal(
    groupId: string,
    goalId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (
      group.schoolId !== schoolId ||
      !(await this.canManageGroup(group, userId, userRole))
    ) {
      throw new ForbiddenException('Access denied');
    }

    const goal = await this.prisma.groupGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.groupId !== groupId) {
      throw new NotFoundException('Goal not found');
    }

    await this.prisma.groupGoal.delete({
      where: { id: goalId },
    });

    return { message: 'Goal deleted successfully' };
  }

  async getBoardPosts(
    groupId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    await this.ensureGroupAccess(groupId, userId, userRole, schoolId);

    let studentId: string | null = null;
    if (userRole === 'STUDENT') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { student: true },
      });
      studentId = user?.student?.id ?? null;
    }

    const posts = await this.prisma.groupPost.findMany({
      where: { groupId, schoolId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        goal: true,
        plan: {
          select: {
            id: true,
            name: true,
            examType: true,
            gradeLevels: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        responses: {
          include: {
            student: {
              select: {
                id: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    return posts.map((post) => {
      const data: any = post.data ?? {};
      const allResponses = post.responses ?? [];
      const isStudent = userRole === 'STUDENT';
      const isResultsPublic = data.isResultsPublic !== false;

      let filteredResponses = allResponses;
      if (isStudent && studentId) {
        filteredResponses = allResponses.filter(
          (r) => r.studentId === studentId,
        );
      }

      let responseStats: any = null;
      if (post.type === GroupPostType.POLL && (!isStudent || isResultsPublic)) {
        const options = Array.isArray(data.options) ? data.options : [];
        const counts: Record<string, number> = {};
        options.forEach((opt: string) => {
          counts[opt] = 0;
        });
        allResponses.forEach((response) => {
          if (counts[response.selectedOption] !== undefined) {
            counts[response.selectedOption] += 1;
          }
        });
        responseStats = {
          total: allResponses.length,
          counts,
        };
      }

      let safeData = data;
      if (post.type === GroupPostType.QUESTION && isStudent) {
        safeData = { ...data };
        if (Array.isArray(safeData.questions)) {
          safeData.questions = safeData.questions.map(
            (question: Record<string, any>) => {
              const nextQuestion = { ...question };
              delete nextQuestion.correctOption;
              return nextQuestion;
            },
          );
        } else {
          delete safeData.correctOption;
        }
      }

      return {
        ...post,
        data: safeData,
        responses: filteredResponses,
        responseStats,
      };
    });
  }

  async syncAutoGroups(userId: string, userRole: string, schoolId: string) {
    if (!this.isAdmin(userRole)) {
      throw new ForbiddenException('Access denied');
    }

    const grades = await this.prisma.grade.findMany({
      where: { schoolId },
      include: {
        classes: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const classes = await this.prisma.class.findMany({
      where: { schoolId },
      include: {
        grade: { select: { id: true, name: true } },
        students: { select: { id: true } },
      },
      orderBy: [{ grade: { name: 'asc' } }, { name: 'asc' }],
    });

    const createdGroups: string[] = [];
    let updatedMemberships = 0;
    const gradeGroupMap = new Map<string, string>();

    for (const grade of grades) {
      const existingGradeGroup = await this.prisma.mentorGroup.findFirst({
        where: { schoolId, groupType: 'GRADE', gradeId: grade.id },
      });

      if (!existingGradeGroup) {
        const gradeGroup = await this.prisma.mentorGroup.create({
          data: {
            name: `${grade.name}. Sınıf`,
            schoolId,
            teacherId: null,
            groupType: 'GRADE',
            gradeId: grade.id,
            isActive: true,
          },
        });
        createdGroups.push(gradeGroup.id);
        gradeGroupMap.set(grade.id, gradeGroup.id);
      } else {
        gradeGroupMap.set(grade.id, existingGradeGroup.id);
      }
    }

    for (const cls of classes) {
      const existingClassGroup = await this.prisma.mentorGroup.findFirst({
        where: { schoolId, groupType: 'CLASS', classId: cls.id },
      });

      let classGroupId = existingClassGroup?.id;
      if (!existingClassGroup) {
        const classGroup = await this.prisma.mentorGroup.create({
          data: {
            name: `${cls.grade.name}/${cls.name}`,
            schoolId,
            teacherId: null,
            groupType: 'CLASS',
            classId: cls.id,
            gradeId: cls.grade.id,
            isActive: true,
          },
        });
        classGroupId = classGroup.id;
        createdGroups.push(classGroup.id);
      }

      if (classGroupId) {
        for (const student of cls.students) {
          const exists = await this.prisma.groupMembership.findFirst({
            where: {
              groupId: classGroupId,
              studentId: student.id,
              leftAt: null,
            },
          });
          if (!exists) {
            await this.prisma.groupMembership.create({
              data: {
                groupId: classGroupId,
                studentId: student.id,
                role: 'MEMBER',
                schoolId,
              },
            });
            updatedMemberships += 1;
          }

          const gradeGroupId = gradeGroupMap.get(cls.grade.id);
          if (gradeGroupId) {
            const gradeMembership = await this.prisma.groupMembership.findFirst(
              {
                where: {
                  groupId: gradeGroupId,
                  studentId: student.id,
                  leftAt: null,
                },
              },
            );
            if (!gradeMembership) {
              await this.prisma.groupMembership.create({
                data: {
                  groupId: gradeGroupId,
                  studentId: student.id,
                  role: 'MEMBER',
                  schoolId,
                },
              });
              updatedMemberships += 1;
            }
          }
        }
      }
    }

    return {
      createdGroups: createdGroups.length,
      updatedMemberships,
    };
  }

  async createBoardPost(
    groupId: string,
    dto: {
      type: GroupPostType;
      title?: string;
      body?: string;
      filePath?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      goalId?: string;
      planId?: string;
      data?: Record<string, any>;
    },
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.ensureGroupAccess(
      groupId,
      userId,
      userRole,
      schoolId,
    );

    if (!(await this.canManageGroup(group, userId, userRole))) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.type === GroupPostType.ANNOUNCEMENT) {
      if (!dto.title && !dto.body) {
        throw new BadRequestException('Başlık veya içerik zorunludur');
      }
    }

    if (dto.type === GroupPostType.FILE) {
      if (!dto.filePath || !dto.fileName || !dto.fileSize || !dto.mimeType) {
        throw new BadRequestException('Dosya bilgileri eksik');
      }
    }

    if (dto.type === GroupPostType.GOAL) {
      if (!dto.goalId) {
        throw new BadRequestException('Hedef seçilmelidir');
      }
      const goal = await this.prisma.groupGoal.findUnique({
        where: { id: dto.goalId },
      });
      if (!goal || goal.groupId !== groupId) {
        throw new BadRequestException('Hedef bulunamadı');
      }
    }

    if (dto.type === GroupPostType.PLAN) {
      if (!dto.planId) {
        throw new BadRequestException('Çalışma planı seçilmelidir');
      }
      const plan = await this.prisma.studyPlan.findUnique({
        where: { id: dto.planId },
        select: { id: true, schoolId: true },
      });
      if (!plan || plan.schoolId !== schoolId) {
        throw new BadRequestException('Çalışma planı bulunamadı');
      }
    }

    if (dto.type === GroupPostType.POLL) {
      const question = dto.title || dto.data?.question;
      const options = Array.isArray(dto.data?.options) ? dto.data?.options : [];
      if (!question || options.length < 2) {
        throw new BadRequestException(
          'Anket sorusu ve en az iki seçenek gereklidir',
        );
      }
    }

    if (dto.type === GroupPostType.VIDEO) {
      const url = dto.data?.url;
      if (!url || typeof url !== 'string') {
        throw new BadRequestException('Video bağlantısı gereklidir');
      }
    }

    if (dto.type === GroupPostType.QUESTION) {
      const questions = Array.isArray(dto.data?.questions)
        ? dto.data?.questions
        : null;

      if (questions) {
        if (questions.length === 0) {
          throw new BadRequestException('En az bir soru gereklidir');
        }
        questions.forEach(
          (questionData: Record<string, any>, index: number) => {
            const questionText = questionData?.question;
            const options = Array.isArray(questionData?.options)
              ? questionData?.options
              : [];
            const correctOption = questionData?.correctOption;
            const hasFile = !!questionData?.filePath;
            if ((!questionText || !String(questionText).trim()) && !hasFile) {
              throw new BadRequestException(
                `Soru ${index + 1} metni veya görseli zorunludur`,
              );
            }
            if (options.length < 4) {
              throw new BadRequestException(
                `Soru ${index + 1} için en az 4 şık gereklidir`,
              );
            }
            if (!correctOption || !options.includes(correctOption)) {
              throw new BadRequestException(
                `Soru ${index + 1} için doğru cevap seçilmelidir`,
              );
            }
          },
        );
      } else {
        const question = dto.title || dto.data?.question;
        const options = Array.isArray(dto.data?.options)
          ? dto.data?.options
          : [];
        const correctOption = dto.data?.correctOption;
        if (!question || options.length < 4) {
          throw new BadRequestException('Soru ve en az 4 şık gereklidir');
        }
        if (!correctOption || !options.includes(correctOption)) {
          throw new BadRequestException('Doğru cevap seçilmelidir');
        }
      }
    }

    const sanitizedFilePath = dto.filePath ? basename(dto.filePath) : undefined;
    const postData = dto.data ? { ...dto.data } : undefined;
    if (postData && Array.isArray(postData.questions)) {
      postData.questions = postData.questions.map(
        (question: Record<string, any>) => ({
          ...question,
          filePath: question?.filePath
            ? basename(String(question.filePath))
            : undefined,
        }),
      );
    }

    return this.prisma.groupPost.create({
      data: {
        groupId,
        schoolId,
        authorId: userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        filePath: sanitizedFilePath,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        goalId: dto.goalId,
        planId: dto.planId,
        data: postData,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        goal: true,
        plan: {
          select: {
            id: true,
            name: true,
            examType: true,
            gradeLevels: true,
          },
        },
      },
    });
  }

  async updateBoardPost(
    groupId: string,
    postId: string,
    dto: UpdateGroupPostDto,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.ensureGroupAccess(
      groupId,
      userId,
      userRole,
      schoolId,
    );
    if (!(await this.canManageGroup(group, userId, userRole))) {
      throw new ForbiddenException('Access denied');
    }

    const post = await this.prisma.groupPost.findFirst({
      where: { id: postId, groupId, schoolId },
    });

    if (!post) {
      throw new NotFoundException('Paylaşım bulunamadı');
    }

    const updateData: Record<string, any> = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.body !== undefined) updateData.body = dto.body;

    if (dto.goalId !== undefined) {
      if (post.type !== GroupPostType.GOAL) {
        throw new BadRequestException('Hedef paylaşımı güncellenemez');
      }
      const goal = await this.prisma.groupGoal.findUnique({
        where: { id: dto.goalId },
        select: { id: true, groupId: true },
      });
      if (!goal || goal.groupId !== groupId) {
        throw new BadRequestException('Hedef bulunamadı');
      }
      updateData.goalId = dto.goalId;
    }

    if (dto.planId !== undefined) {
      if (post.type !== GroupPostType.PLAN) {
        throw new BadRequestException('Plan paylaşımı güncellenemez');
      }
      const plan = await this.prisma.studyPlan.findUnique({
        where: { id: dto.planId },
        select: { id: true, schoolId: true },
      });
      if (!plan || plan.schoolId !== schoolId) {
        throw new BadRequestException('Çalışma planı bulunamadı');
      }
      updateData.planId = dto.planId;
    }

    const baseData = (post.data ?? {}) as Record<string, any>;
    const shouldUpdateData =
      dto.data !== undefined ||
      ((post.type === GroupPostType.POLL ||
        post.type === GroupPostType.QUESTION) &&
        dto.title !== undefined);

    if (shouldUpdateData) {
      const nextData = {
        ...baseData,
        ...(dto.data ?? {}),
      } as Record<string, any>;

      const isQuestionGroup = Array.isArray(nextData.questions);

      if (
        dto.title !== undefined &&
        (post.type === GroupPostType.POLL ||
          post.type === GroupPostType.QUESTION) &&
        !isQuestionGroup
      ) {
        nextData.question = dto.title;
      }

      if (post.type === GroupPostType.POLL) {
        const question = nextData.question;
        const options = Array.isArray(nextData.options) ? nextData.options : [];
        if (!question || options.length < 2) {
          throw new BadRequestException(
            'Anket sorusu ve en az iki seçenek gereklidir',
          );
        }
      }

      if (post.type === GroupPostType.VIDEO) {
        const url = nextData.url;
        if (!url || typeof url !== 'string') {
          throw new BadRequestException('Video bağlantısı gereklidir');
        }
      }

      if (post.type === GroupPostType.QUESTION) {
        if (isQuestionGroup) {
          const questions = Array.isArray(nextData.questions)
            ? nextData.questions
            : [];
          if (questions.length === 0) {
            throw new BadRequestException('En az bir soru gereklidir');
          }
          questions.forEach(
            (questionData: Record<string, any>, index: number) => {
              const questionText = questionData?.question;
              const options = Array.isArray(questionData?.options)
                ? questionData?.options
                : [];
              const correctOption = questionData?.correctOption;
              const hasFile = !!questionData?.filePath;
              if ((!questionText || !String(questionText).trim()) && !hasFile) {
                throw new BadRequestException(
                  `Soru ${index + 1} metni veya görseli zorunludur`,
                );
              }
              if (options.length < 4) {
                throw new BadRequestException(
                  `Soru ${index + 1} için en az 4 şık gereklidir`,
                );
              }
              if (!correctOption || !options.includes(correctOption)) {
                throw new BadRequestException(
                  `Soru ${index + 1} için doğru cevap seçilmelidir`,
                );
              }
            },
          );
        } else {
          const question = nextData.question;
          const options = Array.isArray(nextData.options)
            ? nextData.options
            : [];
          const correctOption = nextData.correctOption;
          if (!question || options.length < 4) {
            throw new BadRequestException('Soru ve en az 4 şık gereklidir');
          }
          if (!correctOption || !options.includes(correctOption)) {
            throw new BadRequestException('Doğru cevap seçilmelidir');
          }
        }
      }

      if (Array.isArray(nextData.questions)) {
        nextData.questions = nextData.questions.map(
          (question: Record<string, any>) => ({
            ...question,
            filePath: question?.filePath
              ? basename(String(question.filePath))
              : undefined,
          }),
        );
      }

      updateData.data = nextData;
    }

    if (dto.isPinned !== undefined) {
      if (dto.isPinned && !post.isPinned) {
        const pinnedCount = await this.prisma.groupPost.count({
          where: { groupId, schoolId, isPinned: true },
        });
        if (pinnedCount >= 3) {
          throw new BadRequestException('En fazla 3 paylaşım sabitlenebilir');
        }
      }
      updateData.isPinned = dto.isPinned;
    }

    return this.prisma.groupPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        goal: true,
        plan: {
          select: {
            id: true,
            name: true,
            examType: true,
            gradeLevels: true,
          },
        },
      },
    });
  }

  async deleteBoardPost(
    groupId: string,
    postId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.ensureGroupAccess(
      groupId,
      userId,
      userRole,
      schoolId,
    );
    if (!(await this.canManageGroup(group, userId, userRole))) {
      throw new ForbiddenException('Access denied');
    }

    const post = await this.prisma.groupPost.findFirst({
      where: { id: postId, groupId, schoolId },
    });

    if (!post) {
      throw new NotFoundException('Paylaşım bulunamadı');
    }

    if (post.filePath) {
      const safeFilename = basename(post.filePath);
      const filePath = join(
        process.cwd(),
        'uploads',
        'group-board',
        safeFilename,
      );
      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath);
        } catch {
          // ignore file deletion errors
        }
      }
    }

    const data: any = post.data ?? {};
    if (Array.isArray(data.questions)) {
      data.questions.forEach((question: Record<string, any>) => {
        if (!question?.filePath) return;
        const safeFilename = basename(String(question.filePath));
        const filePath = join(
          process.cwd(),
          'uploads',
          'group-board',
          safeFilename,
        );
        if (existsSync(filePath)) {
          try {
            unlinkSync(filePath);
          } catch {
            // ignore file deletion errors
          }
        }
      });
    }

    await this.prisma.$transaction(async (tx) => {
      if (post.goalId) {
        const remaining = await tx.groupPost.count({
          where: {
            goalId: post.goalId,
            id: { not: post.id },
          },
        });
        if (remaining === 0) {
          await tx.groupGoal
            .delete({
              where: { id: post.goalId },
            })
            .catch(() => undefined);
        }
      }

      await tx.groupPost.delete({
        where: { id: post.id },
      });
    });

    return { message: 'Paylaşım silindi' };
  }

  async updateBoardReply(
    groupId: string,
    postId: string,
    replyId: string,
    body: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.ensureGroupAccess(
      groupId,
      userId,
      userRole,
      schoolId,
    );
    if (!(await this.canManageGroup(group, userId, userRole))) {
      throw new ForbiddenException('Access denied');
    }

    if (!body || !body.trim()) {
      throw new BadRequestException('Yanıt boş olamaz');
    }

    const reply = await this.prisma.groupPostReply.findFirst({
      where: {
        id: replyId,
        postId,
        post: {
          groupId,
          schoolId,
        },
      },
    });

    if (!reply) {
      throw new NotFoundException('Yanıt bulunamadı');
    }

    return this.prisma.groupPostReply.update({
      where: { id: replyId },
      data: { body: body.trim() },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async deleteBoardReply(
    groupId: string,
    postId: string,
    replyId: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const group = await this.ensureGroupAccess(
      groupId,
      userId,
      userRole,
      schoolId,
    );
    if (!(await this.canManageGroup(group, userId, userRole))) {
      throw new ForbiddenException('Access denied');
    }

    const reply = await this.prisma.groupPostReply.findFirst({
      where: {
        id: replyId,
        postId,
        post: {
          groupId,
          schoolId,
        },
      },
    });

    if (!reply) {
      throw new NotFoundException('Yanıt bulunamadı');
    }

    await this.prisma.groupPostReply.delete({
      where: { id: replyId },
    });

    return { message: 'Yanıt silindi' };
  }

  async getBoardFile(
    groupId: string,
    postId: string,
    userId: string,
    userRole: string,
    schoolId: string,
    questionId?: string,
  ) {
    await this.ensureGroupAccess(groupId, userId, userRole, schoolId);

    const post = await this.prisma.groupPost.findFirst({
      where: { id: postId, groupId, schoolId },
    });

    if (!post) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    const data: any = post.data ?? {};
    if (questionId && Array.isArray(data.questions)) {
      const question = data.questions.find(
        (item: any) => String(item?.id) === String(questionId),
      );
      if (!question || !question.filePath) {
        throw new NotFoundException('Dosya bulunamadı');
      }
      return {
        filePath: question.filePath,
        fileName: question.fileName,
        mimeType: question.mimeType,
      };
    }

    if (!post.filePath) {
      throw new NotFoundException('Dosya bulunamadı');
    }

    return {
      filePath: post.filePath,
      fileName: post.fileName,
      mimeType: post.mimeType,
    };
  }

  async createBoardReply(
    groupId: string,
    postId: string,
    body: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    await this.ensureGroupAccess(groupId, userId, userRole, schoolId);

    if (!body || !body.trim()) {
      throw new BadRequestException('Yanıt boş olamaz');
    }

    const post = await this.prisma.groupPost.findFirst({
      where: { id: postId, groupId, schoolId },
    });

    if (!post) {
      throw new NotFoundException('Paylaşım bulunamadı');
    }

    return this.prisma.groupPostReply.create({
      data: {
        postId,
        authorId: userId,
        body: body.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async respondToBoardPost(
    groupId: string,
    postId: string,
    selectedOption: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    await this.ensureGroupAccess(groupId, userId, userRole, schoolId);

    if (userRole !== 'STUDENT') {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    const studentId = user?.student?.id;
    if (!studentId) {
      throw new ForbiddenException('Access denied');
    }

    const post = await this.prisma.groupPost.findFirst({
      where: { id: postId, groupId, schoolId },
    });

    if (!post) {
      throw new NotFoundException('Paylaşım bulunamadı');
    }

    if (
      post.type !== GroupPostType.POLL &&
      post.type !== GroupPostType.QUESTION
    ) {
      throw new BadRequestException('Bu paylaşım cevaplanamaz');
    }

    const data: any = post.data ?? {};
    const questionGroup = Array.isArray(data.questions) ? data.questions : null;

    if (post.type === GroupPostType.QUESTION && questionGroup) {
      let answers: Record<string, string> = {};
      try {
        const parsed = JSON.parse(selectedOption);
        if (parsed && typeof parsed === 'object') {
          if (
            parsed.answers &&
            typeof parsed.answers === 'object' &&
            !Array.isArray(parsed.answers)
          ) {
            answers = parsed.answers as Record<string, string>;
          } else if (Array.isArray(parsed.answers)) {
            parsed.answers.forEach((entry: any) => {
              if (entry?.questionId && entry?.selectedOption) {
                answers[String(entry.questionId)] = String(
                  entry.selectedOption,
                );
              }
            });
          }
        }
      } catch {
        throw new BadRequestException('Geçersiz cevap formatı');
      }

      if (!answers || Object.keys(answers).length === 0) {
        throw new BadRequestException('Cevaplar boş olamaz');
      }

      questionGroup.forEach((question: Record<string, any>, index: number) => {
        const questionId = String(question?.id ?? index);
        const options = Array.isArray(question?.options)
          ? question.options
          : [];
        const selected = answers[questionId];
        if (!selected) {
          throw new BadRequestException('Tüm sorular cevaplanmalıdır');
        }
        if (!options.includes(selected)) {
          throw new BadRequestException('Geçersiz seçenek');
        }
      });
    } else {
      const options = Array.isArray(data.options) ? data.options : [];
      if (!options.includes(selectedOption)) {
        throw new BadRequestException('Geçersiz seçenek');
      }
    }

    const existingResponse = await this.prisma.groupPostResponse.findUnique({
      where: { postId_studentId: { postId, studentId } },
    });

    if (existingResponse) {
      throw new BadRequestException('Bu paylaşımı zaten cevapladınız');
    }

    let isCorrect: boolean | null = null;
    let pointsAwarded = 0;

    if (post.type === GroupPostType.QUESTION && questionGroup) {
      let answers: Record<string, string> = {};
      try {
        const parsed = JSON.parse(selectedOption);
        if (parsed && typeof parsed === 'object') {
          if (
            parsed.answers &&
            typeof parsed.answers === 'object' &&
            !Array.isArray(parsed.answers)
          ) {
            answers = parsed.answers as Record<string, string>;
          } else if (Array.isArray(parsed.answers)) {
            parsed.answers.forEach((entry: any) => {
              if (entry?.questionId && entry?.selectedOption) {
                answers[String(entry.questionId)] = String(
                  entry.selectedOption,
                );
              }
            });
          }
        }
      } catch {
        answers = {};
      }

      let awarded = 0;
      questionGroup.forEach((question: Record<string, any>, index: number) => {
        const questionId = String(question?.id ?? index);
        const correctOption = question?.correctOption;
        const points = Number.isFinite(Number(question?.points))
          ? Number(question.points)
          : 10;
        if (correctOption && answers[questionId] === correctOption) {
          awarded += points;
        }
      });
      pointsAwarded = awarded;
      isCorrect = null;
    } else if (post.type === GroupPostType.QUESTION) {
      isCorrect = data.correctOption
        ? data.correctOption === selectedOption
        : null;
      const points = Number.isFinite(Number(data.points))
        ? Number(data.points)
        : 10;
      pointsAwarded = isCorrect ? points : 0;
    }

    return this.prisma.$transaction(async (tx) => {
      const response = await tx.groupPostResponse.create({
        data: {
          postId,
          studentId,
          selectedOption,
          isCorrect,
          pointsAwarded,
        },
        include: {
          student: {
            select: {
              id: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      if (pointsAwarded > 0) {
        await tx.student.update({
          where: { id: studentId },
          data: {
            rewardPoints: { increment: pointsAwarded },
          },
        });
      }

      return response;
    });
  }
}

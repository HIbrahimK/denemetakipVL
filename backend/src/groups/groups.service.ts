import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMentorGroupDto, UpdateMentorGroupDto, AddGroupMemberDto, CreateGroupGoalDto } from './dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMentorGroupDto, teacherId: string, schoolId: string) {
    console.log('Creating group with:', { dto, teacherId, schoolId });
    
    // Create group
    const group = await this.prisma.mentorGroup.create({
      data: {
        name: dto.name,
        description: dto.description,
        teacherId,
        schoolId,
        gradeIds: dto.gradeIds || [],
      },
    });

    // Add initial members if provided
    if (dto.studentIds && dto.studentIds.length > 0) {
      for (const studentId of dto.studentIds) {
        const student = await this.prisma.student.findUnique({
          where: { id: studentId },
        });

        if (student && student.schoolId === schoolId) {
          await this.prisma.groupMembership.create({
            data: {
              groupId: group.id,
              studentId,
              schoolId,
              role: 'MEMBER',
            },
          });
        }
      }
    }

    return this.findOne(group.id, teacherId, schoolId);
  }

  async findAll(userId: string, userRole: string, schoolId: string) {
    const where: any = { schoolId };

    if (userRole === 'TEACHER') {
      where.teacherId = userId;
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

  async findOne(id: string, userId: string, schoolId: string) {
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

    return group;
  }

  async update(id: string, dto: UpdateMentorGroupDto, userId: string, schoolId: string) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId || group.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.mentorGroup.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
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
            memberships: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, schoolId: string) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId || group.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.mentorGroup.delete({
      where: { id },
    });

    return { message: 'Group deleted successfully' };
  }

  async addMember(groupId: string, dto: AddGroupMemberDto, userId: string, schoolId: string) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId || group.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Verify student exists and belongs to school
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student || student.schoolId !== schoolId) {
      throw new NotFoundException('Student not found');
    }

    // Check if already a member
    const existing = await this.prisma.groupMembership.findFirst({
      where: {
        groupId,
        studentId: dto.studentId,
        leftAt: null,
      },
    });

    if (existing) {
      throw new ForbiddenException('Student is already a member');
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

  async removeMember(groupId: string, studentId: string, userId: string, schoolId: string) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId || group.teacherId !== userId) {
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

    await this.prisma.groupMembership.update({
      where: { id: membership.id },
      data: {
        leftAt: new Date(),
      },
    });

    return { message: 'Member removed successfully' };
  }

  async createGroupGoal(groupId: string, dto: CreateGroupGoalDto, userId: string, schoolId: string) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId || group.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.groupGoal.create({
      data: {
        groupId,
        schoolId,
        goalType: dto.goalType,
        targetData: dto.targetData,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
      },
    });
  }

  async getGroupStats(groupId: string, userId: string, schoolId: string) {
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

    const totalStudyMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

    const goals = await this.prisma.groupGoal.findMany({
      where: { groupId },
    });

    const activeGoals = goals.filter((g) => g.isActive).length;

    return {
      memberCount: memberIds.length,
      completedTasks,
      totalStudyHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
      avgStudyHoursPerMember: memberIds.length > 0 
        ? Math.round((totalStudyMinutes / 60 / memberIds.length) * 10) / 10 
        : 0,
      groupGoals: goals.length,
      activeGroupGoals: activeGoals,
    };
  }
}

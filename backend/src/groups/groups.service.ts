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

  async getAvailableStudents(groupId: string, schoolId: string, gradeId?: string, classId?: string) {
    // Verify group exists and belongs to school
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    // Get existing member IDs
    const existingMembers = await this.prisma.groupMembership.findMany({
      where: { groupId, leftAt: null },
      select: { studentId: true },
    });

    const existingMemberIds = existingMembers.map(m => m.studentId);

    // Build where clause
    const where: any = {
      schoolId,
      id: { notIn: existingMemberIds },
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
            email: true,
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
    const existingNames = grades.map(g => g.name);
    return standardGradeNames.every(name => existingNames.includes(name));
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

  async addMembersBulk(groupId: string, studentIds: string[], userId: string, schoolId: string) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId || group.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const studentId of studentIds) {
      try {
        // Verify student exists and belongs to school
        const student = await this.prisma.student.findUnique({
          where: { id: studentId },
        });

        if (!student || student.schoolId !== schoolId) {
          errors.push({ studentId, error: 'Öğrenci bulunamadı veya okula ait değil' });
          continue;
        }

        // Check if already a member
        const existing = await this.prisma.groupMembership.findFirst({
          where: {
            groupId,
            studentId,
            leftAt: null,
          },
        });

        if (existing) {
          errors.push({ studentId, error: 'Öğrenci zaten grup üyesi' });
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

  async updateGroupGoal(groupId: string, goalId: string, dto: any, userId: string, schoolId: string) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId || group.teacherId !== userId) {
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
    if (dto.deadline) updateData.deadline = new Date(dto.deadline);

    return this.prisma.groupGoal.update({
      where: { id: goalId },
      data: updateData,
    });
  }

  async deleteGroupGoal(groupId: string, goalId: string, userId: string, schoolId: string) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId || group.teacherId !== userId) {
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

  async updateGroup(groupId: string, dto: any, userId: string, schoolId: string) {
    const group = await this.prisma.mentorGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.schoolId !== schoolId || group.teacherId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.mentorGroup.update({
      where: { id: groupId },
      data: {
        name: dto.name,
        description: dto.description,
        maxStudents: dto.maxStudents,
        gradeIds: dto.gradeIds,
      },
    });
  }
}

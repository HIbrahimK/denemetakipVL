import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogStudySessionDto } from './dto';

@Injectable()
export class StudySessionService {
  constructor(private prisma: PrismaService) {}

  async create(dto: LogStudySessionDto, userId: string, schoolId: string) {
    // Get student from user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user?.student) {
      throw new NotFoundException('Student not found');
    }

    if (user.student.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
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

    return this.prisma.studySession.create({
      data: {
        studentId: user.student.id,
        schoolId,
        subjectName: dto.subjectName,
        topicId: dto.topicId,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        duration: dto.duration,
        isPomodoroMode: dto.isPomodoroMode || false,
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
    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters?.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.startTime = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    } else if (filters?.startDate) {
      // If only startDate is provided, get sessions from that date onwards
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.startDate);
      endDate.setDate(endDate.getDate() + 1); // Next day
      where.startTime = {
        gte: startDate,
        lt: endDate,
      };
    }

    return this.prisma.studySession.findMany({
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
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(
    id: string,
    userId: string,
    userRole: string,
    schoolId: string,
  ) {
    const session = await this.prisma.studySession.findUnique({
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

    if (!session) {
      throw new NotFoundException('Study session not found');
    }

    if (session.schoolId !== schoolId) {
      throw new ForbiddenException('Access denied');
    }

    // Check access rights
    // Student için userId kontrolü
    if (userRole === 'STUDENT') {
      const student = await this.prisma.student.findUnique({
        where: { id: session.studentId },
      });
      if (!student || student.userId !== userId) {
        throw new NotFoundException('Study session not found');
      }
    }

    return session;
  }

  async getStats(
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
        return null;
      }

      where.studentId = user.student.id;
    }

    if (filters?.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.startTime = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const sessions = await this.prisma.studySession.findMany({
      where,
      select: {
        duration: true,
        startTime: true,
      },
    });

    const totalMinutes = sessions.reduce(
      (sum, s) => sum + Math.round(s.duration / 60),
      0,
    );
    const totalSessions = sessions.length;
    const avgMinutesPerSession =
      totalSessions > 0 ? totalMinutes / totalSessions : 0;

    // Group by day
    const byDay: { [key: string]: number } = {};
    sessions.forEach((session) => {
      const day = session.startTime.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + Math.round(session.duration / 60);
    });

    return {
      totalMinutes,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      totalSessions,
      avgMinutesPerSession: Math.round(avgMinutesPerSession),
      byDay,
    };
  }

  async remove(id: string, userId: string, schoolId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Study session not found');
    }

    if (session.schoolId !== schoolId || session.student.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.studySession.delete({
      where: { id },
    });

    return { message: 'Study session deleted successfully' };
  }
}

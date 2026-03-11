import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CaptureAccessLogInput = {
  schoolId: string;
  userId: string;
  method: string;
  path: string;
  route?: string;
  area?: string;
  ipAddress?: string;
  userAgent?: string;
  statusCode: number;
};

@Injectable()
export class AccessLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async capture(input: CaptureAccessLogInput) {
    return this.prisma.userAccessLog.create({
      data: input,
    });
  }

  async list(options: {
    page: number;
    limit: number;
    schoolId?: string;
    userId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const { page, limit, schoolId, userId, search, dateFrom, dateTo } = options;

    const where: any = {};

    if (schoolId) {
      where.schoolId = schoolId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { path: { contains: search, mode: 'insensitive' } },
        { route: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          school: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.userAccessLog.findMany({
        where,
        include: {
          school: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.userAccessLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalToday, activeUsersToday, activeSchoolsToday, topRoutes] =
      await Promise.all([
        this.prisma.userAccessLog.count({
          where: {
            createdAt: { gte: todayStart },
          },
        }),
        this.prisma.userAccessLog.groupBy({
          by: ['userId'],
          where: {
            createdAt: { gte: todayStart },
          },
        }),
        this.prisma.userAccessLog.groupBy({
          by: ['schoolId'],
          where: {
            createdAt: { gte: todayStart },
          },
        }),
        this.prisma.userAccessLog.groupBy({
          by: ['path'],
          _count: true,
          orderBy: {
            _count: {
              path: 'desc',
            },
          },
          take: 5,
        }),
      ]);

    return {
      totalToday,
      activeUsersToday: activeUsersToday.length,
      activeSchoolsToday: activeSchoolsToday.length,
      topRoutes: topRoutes.map((item) => ({
        path: item.path,
        count: item._count,
      })),
    };
  }
}
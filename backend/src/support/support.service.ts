import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { CreateSupportTicketReplyDto } from './dto/create-support-ticket-reply.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAccessibleTicket(id: string, user: any) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Destek talebi bulunamadı');
    }

    if (user.role !== 'SUPER_ADMIN' && ticket.schoolId !== user.schoolId) {
      throw new ForbiddenException('Bu destek talebine erişim yetkiniz yok');
    }

    return ticket;
  }

  async createTicket(dto: CreateSupportTicketDto, user: any) {
    if (user.role !== 'SCHOOL_ADMIN') {
      throw new ForbiddenException(
        'Sadece okul yöneticileri destek talebi oluşturabilir',
      );
    }

    return this.prisma.supportTicket.create({
      data: {
        schoolId: user.schoolId,
        createdById: user.id,
        updatedById: user.id,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getSchoolTickets(user: any) {
    if (user.role !== 'SCHOOL_ADMIN') {
      throw new ForbiddenException(
        'Destek taleplerini sadece okul yöneticileri görüntüleyebilir',
      );
    }

    return this.prisma.supportTicket.findMany({
      where: { schoolId: user.schoolId },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        replies: {
          include: {
            sender: {
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
      },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async getAdminTickets(status?: string) {
    return this.prisma.supportTicket.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        replies: {
          include: {
            sender: {
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
      },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(id: string, user: any) {
    return this.getAccessibleTicket(id, user);
  }

  async addReply(id: string, dto: CreateSupportTicketReplyDto, user: any) {
    const ticket = await this.getAccessibleTicket(id, user);

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'SCHOOL_ADMIN') {
      throw new ForbiddenException('Bu ticket için yanıt yetkiniz yok');
    }

    await this.prisma.supportTicketReply.create({
      data: {
        ticketId: ticket.id,
        senderId: user.id,
        message: dto.message,
      },
    });

    const nextStatus =
      user.role === 'SUPER_ADMIN'
        ? 'ANSWERED'
        : ticket.status === 'CLOSED'
        ? 'OPEN'
        : 'OPEN';

    return this.prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: nextStatus,
        updatedById: user.id,
        lastReplyAt: new Date(),
        closedAt: nextStatus === 'CLOSED' ? new Date() : null,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async updateStatus(id: string, dto: UpdateSupportTicketStatusDto, user: any) {
    const ticket = await this.getAccessibleTicket(id, user);

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'SCHOOL_ADMIN') {
      throw new ForbiddenException('Bu ticket durumunu değiştirme yetkiniz yok');
    }

    if (
      user.role === 'SCHOOL_ADMIN' &&
      !['OPEN', 'CLOSED'].includes(dto.status)
    ) {
      throw new ForbiddenException(
        'Okul yöneticisi yalnızca ticket açma veya kapatma işlemi yapabilir',
      );
    }

    return this.prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: dto.status,
        updatedById: user.id,
        closedAt: dto.status === 'CLOSED' ? new Date() : null,
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        replies: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}
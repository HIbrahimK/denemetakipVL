import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact.dto';
import { CreateDemoRequestDto } from './dto/create-demo-request.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // Contact Messages
  // ==========================================

  async createContactMessage(dto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({
      data: dto,
    });
  }

  async getAllContactMessages(options: {
    page: number;
    limit: number;
    status?: string;
  }) {
    const { page, limit, status } = options;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateContactMessageStatus(id: string, status: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { id },
    });
    if (!message) throw new NotFoundException('Mesaj bulunamadı');

    return this.prisma.contactMessage.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'REPLIED' ? { repliedAt: new Date() } : {}),
      },
    });
  }

  async deleteContactMessage(id: string) {
    return this.prisma.contactMessage.delete({ where: { id } });
  }

  // ==========================================
  // Demo Requests
  // ==========================================

  async createDemoRequest(dto: CreateDemoRequestDto) {
    return this.prisma.demoRequest.create({
      data: dto,
    });
  }

  async getAllDemoRequests(options: {
    page: number;
    limit: number;
    status?: string;
  }) {
    const { page, limit, status } = options;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.demoRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.demoRequest.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateDemoRequestStatus(id: string, status: string) {
    const request = await this.prisma.demoRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Demo talebi bulunamadı');

    return this.prisma.demoRequest.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'CONTACTED' ? { contactedAt: new Date() } : {}),
      },
    });
  }

  async deleteDemoRequest(id: string) {
    return this.prisma.demoRequest.delete({ where: { id } });
  }

  // ==========================================
  // Dashboard Stats
  // ==========================================

  async getStats() {
    const [
      totalContacts,
      newContacts,
      totalDemoRequests,
      pendingDemoRequests,
    ] = await Promise.all([
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { status: 'NEW' } }),
      this.prisma.demoRequest.count(),
      this.prisma.demoRequest.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalContacts,
      newContacts,
      totalDemoRequests,
      pendingDemoRequests,
    };
  }
}

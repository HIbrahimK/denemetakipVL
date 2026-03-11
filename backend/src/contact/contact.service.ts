import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactMessageDto } from './dto/create-contact.dto';
import { CreateDemoRequestDto } from './dto/create-demo-request.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  private normalizeInbox(rawInbox?: string, fallback = 'info@denemetakip.net') {
    const normalized = rawInbox?.trim().toLowerCase();
    if (!normalized) {
      return fallback;
    }

    if (normalized === 'kvkk') return 'kvkk@denemetakip.net';
    if (normalized === 'admin') return 'admin@denemetakip.net';
    if (normalized === 'admin@2eh.net') return 'admin@2eh.net';
    if (normalized === 'info') return 'info@denemetakip.net';

    return normalized;
  }

  private inferCategory(subject: string, targetInbox: string, fallback: string) {
    const normalizedSubject = subject.toLowerCase();

    if (targetInbox.includes('kvkk')) {
      return 'KVKK_ALERT';
    }

    if (targetInbox.includes('admin')) {
      return 'SYSTEM_ADMIN';
    }

    if (normalizedSubject.includes('demo')) {
      return 'DEMO_REQUEST';
    }

    if (normalizedSubject.includes('destek')) {
      return 'TECHNICAL_SUPPORT';
    }

    if (normalizedSubject.includes('kariyer') || normalizedSubject.includes('iş')) {
      return 'CAREER';
    }

    return fallback;
  }

  private mapContactItem(item: any) {
    return {
      id: item.id,
      itemType: 'CONTACT',
      fromName: `${item.firstName} ${item.lastName}`.trim(),
      fromEmail: item.email,
      subject: item.subject,
      body: item.message,
      status: item.status,
      category: item.category,
      targetInbox: item.targetInbox,
      sourceChannel: item.sourceChannel,
      sourcePage: item.sourcePage,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private mapDemoItem(item: any) {
    return {
      id: item.id,
      itemType: 'DEMO',
      fromName: item.contactName,
      fromEmail: item.email,
      subject: `Demo Talebi: ${item.schoolName}`,
      body: item.notes || `${item.schoolName} için demo talebi alındı.`,
      status: item.status,
      category: item.category,
      targetInbox: item.targetInbox,
      sourceChannel: item.sourceChannel,
      sourcePage: item.sourcePage,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      schoolName: item.schoolName,
      phone: item.phone,
      city: item.city,
      studentCount: item.studentCount,
    };
  }

  private mapLicenseAlert(item: any) {
    const remainingDays = Math.max(
      0,
      Math.ceil(
        (new Date(item.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      ),
    );

    return {
      id: item.id,
      itemType: 'LICENSE',
      fromName: item.school.name,
      fromEmail: null,
      subject: `${item.school.name} lisans uyarısı`,
      body: `${item.school.name} okulunun ${item.plan.planName} planı ${remainingDays} gün içinde sona eriyor.`,
      status: item.status,
      category: 'LICENSE_ALERT',
      targetInbox: 'admin@denemetakip.net',
      sourceChannel: 'SYSTEM_ALERT',
      sourcePage: null,
      createdAt: item.updatedAt,
      updatedAt: item.updatedAt,
      schoolName: item.school.name,
      licenseEndDate: item.endDate,
      remainingDays,
      planName: item.plan.planName,
    };
  }

  // ==========================================
  // Contact Messages
  // ==========================================

  async createContactMessage(dto: CreateContactMessageDto) {
    const targetInbox = this.normalizeInbox(dto.targetInbox);
    const category = this.inferCategory(
      dto.category || dto.subject,
      targetInbox,
      dto.category || 'GENERAL_INFO',
    );

    return this.prisma.contactMessage.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
        targetInbox,
        category,
        sourceChannel: 'CONTACT_FORM',
        sourcePage: dto.sourcePage || '/iletisim',
      },
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
    const targetInbox = this.normalizeInbox(dto.targetInbox);
    const category = this.inferCategory(
      dto.category || 'Demo Talebi',
      targetInbox,
      dto.category || 'DEMO_REQUEST',
    );

    return this.prisma.demoRequest.create({
      data: {
        schoolName: dto.schoolName,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        studentCount: dto.studentCount,
        city: dto.city,
        notes: dto.notes,
        targetInbox,
        category,
        sourceChannel: 'DEMO_FORM',
        sourcePage: dto.sourcePage || '/demo',
      },
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

  async getMailCenter(options: {
    page: number;
    limit: number;
    category?: string;
    targetInbox?: string;
    itemType?: string;
  }) {
    const { page, limit, category, targetInbox, itemType } = options;
    const normalizedInbox = targetInbox
      ? this.normalizeInbox(targetInbox, targetInbox)
      : undefined;

    const contactWhere: any = {};
    const demoWhere: any = {};

    if (category) {
      contactWhere.category = category;
      demoWhere.category = category;
    }

    if (normalizedInbox) {
      contactWhere.targetInbox = normalizedInbox;
      demoWhere.targetInbox = normalizedInbox;
    }

    const [contacts, demos, licenses] = await Promise.all([
      itemType && itemType !== 'CONTACT'
        ? Promise.resolve([])
        : this.prisma.contactMessage.findMany({
            where: contactWhere,
            orderBy: { createdAt: 'desc' },
            take: 100,
          }),
      itemType && itemType !== 'DEMO'
        ? Promise.resolve([])
        : this.prisma.demoRequest.findMany({
            where: demoWhere,
            orderBy: { createdAt: 'desc' },
            take: 100,
          }),
      itemType && itemType !== 'LICENSE'
        ? Promise.resolve([])
        : this.prisma.schoolLicense.findMany({
            where: {
              status: { in: ['ACTIVE', 'GRACE'] },
              endDate: {
                lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
              },
            },
            include: {
              school: true,
              plan: true,
            },
            orderBy: { endDate: 'asc' },
            take: 100,
          }),
    ]);

    const items = [
      ...contacts.map((item) => this.mapContactItem(item)),
      ...demos.map((item) => this.mapDemoItem(item)),
      ...licenses.map((item) => this.mapLicenseAlert(item)),
    ]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );

    const start = (page - 1) * limit;
    const pagedItems = items.slice(start, start + limit);

    return {
      items: pagedItems,
      total: items.length,
      page,
      totalPages: Math.ceil(items.length / limit) || 1,
    };
  }

  async getMailCenterStats() {
    const [contacts, demos, expiringLicenses] = await Promise.all([
      this.prisma.contactMessage.groupBy({
        by: ['targetInbox', 'category'],
        _count: true,
      }),
      this.prisma.demoRequest.groupBy({
        by: ['targetInbox', 'category'],
        _count: true,
      }),
      this.prisma.schoolLicense.count({
        where: {
          status: { in: ['ACTIVE', 'GRACE'] },
          endDate: {
            lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
          },
        },
      }),
    ]);

    return {
      inboxes: [...contacts, ...demos].reduce<Record<string, number>>((acc, item) => {
        acc[item.targetInbox] = (acc[item.targetInbox] || 0) + item._count;
        return acc;
      }, {}),
      categories: [...contacts, ...demos].reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item._count;
        return acc;
      }, {}),
      expiringLicenses,
    };
  }
}

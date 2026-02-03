import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { ExamType } from '@prisma/client';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: {
        name: dto.name,
        examType: dto.examType as ExamType,
        gradeLevels: dto.gradeLevels,
        order: dto.order ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(examType?: string, gradeLevel?: number) {
    const where: any = { isActive: true };
    
    // ExamType verilmişse, hem o türü hem de COMMON türünü getir
    if (examType) {
      where.OR = [
        { examType: examType },
        { examType: 'COMMON' }  // Sabit aktiviteler her zaman dahil
      ];
    }
    
    if (gradeLevel) {
      where.gradeLevels = { has: gradeLevel };
    }

    return this.prisma.subject.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        topics: {
          where: { parentTopicId: null },
          orderBy: { order: 'asc' },
          include: {
            childTopics: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        topics: {
          where: { parentTopicId: null },
          orderBy: { order: 'asc' },
          include: {
            childTopics: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto) {
    await this.findOne(id);

    return this.prisma.subject.update({
      where: { id },
      data: {
        name: dto.name,
        examType: dto.examType as ExamType,
        gradeLevels: dto.gradeLevels,
        order: dto.order,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete - just mark as inactive
    return this.prisma.subject.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Topic methods
  async createTopic(subjectId: string, name: string, parentTopicId?: string, order: number = 0) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (parentTopicId) {
      const parentTopic = await this.prisma.topic.findUnique({
        where: { id: parentTopicId },
      });

      if (!parentTopic) {
        throw new NotFoundException('Parent topic not found');
      }
    }

    return this.prisma.topic.create({
      data: {
        name,
        subjectId,
        parentTopicId,
        order,
      },
    });
  }

  async findTopics(subjectId?: string, parentTopicId?: string) {
    const where: any = {};
    
    if (subjectId) {
      where.subjectId = subjectId;
    }
    
    if (parentTopicId !== undefined) {
      where.parentTopicId = parentTopicId || null;
    }

    return this.prisma.topic.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        subject: {
          select: { name: true, examType: true },
        },
        childTopics: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findSpecialActivities() {
    // Get topics that are not associated with any subject (special activities like MEBİ, TYT, AYT exams)
    return this.prisma.topic.findMany({
      where: {
        isSpecialActivity: true,
        subjectId: null,
      },
      orderBy: { order: 'asc' },
    });
  }

  async updateTopic(id: string, name: string, order?: number) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return this.prisma.topic.update({
      where: { id },
      data: {
        name,
        order: order ?? topic.order,
      },
    });
  }

  async removeTopic(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: { childTopics: true },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    // Delete child topics first
    if (topic.childTopics.length > 0) {
      await this.prisma.topic.deleteMany({
        where: { parentTopicId: id },
      });
    }

    return this.prisma.topic.delete({
      where: { id },
    });
  }
}

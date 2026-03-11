import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { ExamType } from '@prisma/client';
import { SubjectSeedPreset } from './dto';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SUBJECT_SEED_SCRIPTS: Record<SubjectSeedPreset, string[]> = {
  TYT: [
    'seed-tyt-matematik.ts',
    'seed-tyt-fizik.ts',
    'seed-tyt-kimya.ts',
    'seed-tyt-biyoloji.ts',
    'seed-tyt-tarih.ts',
    'seed-tyt-cografya.ts',
    'seed-tyt-felsefe.ts',
    'seed-tyt-din.ts',
    'seed-tyt-turkce.ts',
    'seed-tyt-geometri.ts',
  ],
  AYT: [
    'seed-ayt-matematik.ts',
    'seed-ayt-fizik.ts',
    'seed-ayt-kimya.ts',
    'seed-ayt-biyoloji.ts',
    'seed-ayt-edebiyat.ts',
    'seed-ayt-tarih1.ts',
    'seed-ayt-cografya1.ts',
    'seed-ayt-felsefe.ts',
    'seed-ayt-din.ts',
    'seed-ayt-geometri.ts',
  ],
  LGS: [
    'seed-lgs-matematik.ts',
    'seed-lgs-fen.ts',
    'seed-lgs-turkce.ts',
    'seed-lgs-inkilap.ts',
    'seed-lgs-din.ts',
    'seed-lgs-ingilizce.ts',
  ],
  ACTIVITIES: ['seed-common-activities.ts', 'seed-special-subjects.ts'],
};

type SeedScriptCheck =
  | {
      mode: 'subject_topics';
      examType: 'TYT' | 'AYT' | 'LGS';
      subjectName: string;
      expectedTopicCount: number;
    }
  | { mode: 'common_subjects'; expectedSubjectCount: number }
  | {
      mode: 'special_bundle';
      expectedSubjectCount: number;
      expectedSpecialTopicCount: number;
    };

const SEED_SCRIPT_CHECKS: Record<string, SeedScriptCheck> = {
  'seed-tyt-matematik.ts': {
    mode: 'subject_topics',
    examType: 'TYT',
    subjectName: 'matematik',
    expectedTopicCount: 31,
  },
  'seed-tyt-fizik.ts': {
    mode: 'subject_topics',
    examType: 'TYT',
    subjectName: 'fizik',
    expectedTopicCount: 37,
  },
  'seed-tyt-kimya.ts': {
    mode: 'subject_topics',
    examType: 'TYT',
    subjectName: 'kimya',
    expectedTopicCount: 35,
  },
  'seed-tyt-biyoloji.ts': {
    mode: 'subject_topics',
    examType: 'TYT',
    subjectName: 'biyoloji',
    expectedTopicCount: 36,
  },
  'seed-tyt-tarih.ts': {
    mode: 'subject_topics',
    examType: 'TYT',
    subjectName: 'tarih',
    expectedTopicCount: 48,
  },
  'seed-tyt-cografya.ts': {
    mode: 'subject_topics',
    examType: 'TYT',
    subjectName: 'cografya',
    expectedTopicCount: 50,
  },
  'seed-tyt-felsefe.ts': {
    mode: 'subject_topics',
    examType: 'TYT',
    subjectName: 'felsefe',
    expectedTopicCount: 49,
  },
  'seed-tyt-din.ts': {
    mode: 'subject_topics',
    examType: 'TYT',
    subjectName: 'din kulturu ve ahlak bilgisi',
    expectedTopicCount: 47,
  },
  'seed-tyt-turkce.ts': {
    mode: 'subject_topics',
    examType: 'TYT',
    subjectName: 'turkce',
    expectedTopicCount: 29,
  },
  'seed-tyt-geometri.ts': {
    mode: 'subject_topics',
    examType: 'TYT',
    subjectName: 'geometri',
    expectedTopicCount: 24,
  },

  'seed-ayt-matematik.ts': {
    mode: 'subject_topics',
    examType: 'AYT',
    subjectName: 'matematik',
    expectedTopicCount: 68,
  },
  'seed-ayt-fizik.ts': {
    mode: 'subject_topics',
    examType: 'AYT',
    subjectName: 'fizik',
    expectedTopicCount: 133,
  },
  'seed-ayt-kimya.ts': {
    mode: 'subject_topics',
    examType: 'AYT',
    subjectName: 'kimya',
    expectedTopicCount: 139,
  },
  'seed-ayt-biyoloji.ts': {
    mode: 'subject_topics',
    examType: 'AYT',
    subjectName: 'biyoloji',
    expectedTopicCount: 171,
  },
  'seed-ayt-edebiyat.ts': {
    mode: 'subject_topics',
    examType: 'AYT',
    subjectName: 'turk dili ve edebiyati',
    expectedTopicCount: 163,
  },
  'seed-ayt-tarih1.ts': {
    mode: 'subject_topics',
    examType: 'AYT',
    subjectName: 'tarih1',
    expectedTopicCount: 102,
  },
  'seed-ayt-cografya1.ts': {
    mode: 'subject_topics',
    examType: 'AYT',
    subjectName: 'cografya1',
    expectedTopicCount: 93,
  },
  'seed-ayt-felsefe.ts': {
    mode: 'subject_topics',
    examType: 'AYT',
    subjectName: 'felsefe',
    expectedTopicCount: 175,
  },
  'seed-ayt-din.ts': {
    mode: 'subject_topics',
    examType: 'AYT',
    subjectName: 'din kulturu ve ahlak bilgisi',
    expectedTopicCount: 113,
  },
  'seed-ayt-geometri.ts': {
    mode: 'subject_topics',
    examType: 'AYT',
    subjectName: 'geometri',
    expectedTopicCount: 42,
  },

  'seed-lgs-matematik.ts': {
    mode: 'subject_topics',
    examType: 'LGS',
    subjectName: 'matematik',
    expectedTopicCount: 76,
  },
  'seed-lgs-fen.ts': {
    mode: 'subject_topics',
    examType: 'LGS',
    subjectName: 'fen bilimleri',
    expectedTopicCount: 113,
  },
  'seed-lgs-turkce.ts': {
    mode: 'subject_topics',
    examType: 'LGS',
    subjectName: 'turkce',
    expectedTopicCount: 80,
  },
  'seed-lgs-inkilap.ts': {
    mode: 'subject_topics',
    examType: 'LGS',
    subjectName: 'tc inkilap tarihi ve ataturkculuk',
    expectedTopicCount: 136,
  },
  'seed-lgs-din.ts': {
    mode: 'subject_topics',
    examType: 'LGS',
    subjectName: 'din kulturu ve ahlak bilgisi',
    expectedTopicCount: 115,
  },
  'seed-lgs-ingilizce.ts': {
    mode: 'subject_topics',
    examType: 'LGS',
    subjectName: 'ingilizce',
    expectedTopicCount: 136,
  },

  'seed-common-activities.ts': {
    mode: 'common_subjects',
    expectedSubjectCount: 55,
  },
  'seed-special-subjects.ts': {
    mode: 'special_bundle',
    expectedSubjectCount: 53,
    expectedSpecialTopicCount: 6,
  },
};

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  private resolveSchoolScope(schoolId?: string | null): string | null {
    return schoolId ?? null;
  }

  private createCatalogKey(subject: {
    name: string;
    examType: string;
    type?: string | null;
  }) {
    return [subject.examType, subject.type || 'NORMAL', this.normalizeText(subject.name)].join('::');
  }

  private async syncGlobalCatalogToSchool(schoolId: string) {
    const globalSubjects = await this.prisma.subject.findMany({
      where: {
        schoolId: null,
        isActive: true,
      },
      orderBy: [{ examType: 'asc' }, { order: 'asc' }, { name: 'asc' }],
    });

    if (globalSubjects.length === 0) {
      return;
    }

    const schoolSubjects = await this.prisma.subject.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        examType: true,
        type: true,
      },
    });

    const schoolSubjectMap = new Map(
      schoolSubjects.map((subject) => [this.createCatalogKey(subject), subject.id]),
    );

    const globalTopics = await this.prisma.topic.findMany({
      where: {
        schoolId: null,
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        order: true,
        subjectId: true,
        parentTopicId: true,
        isSpecialActivity: true,
      },
    });

    const globalTopicsBySubjectId = new Map<string | null, typeof globalTopics>();
    for (const topic of globalTopics) {
      const key = topic.subjectId ?? null;
      const items = globalTopicsBySubjectId.get(key) ?? [];
      items.push(topic);
      globalTopicsBySubjectId.set(key, items);
    }

    for (const globalSubject of globalSubjects) {
      const subjectKey = this.createCatalogKey(globalSubject);
      let schoolSubjectId = schoolSubjectMap.get(subjectKey);

      if (!schoolSubjectId) {
        const createdSubject = await this.prisma.subject.create({
          data: {
            schoolId,
            name: globalSubject.name,
            examType: globalSubject.examType,
            gradeLevels: globalSubject.gradeLevels,
            order: globalSubject.order,
            type: globalSubject.type,
            isActive: globalSubject.isActive,
          },
        });
        schoolSubjectId = createdSubject.id;
        schoolSubjectMap.set(subjectKey, schoolSubjectId);
      }

      await this.syncSubjectTopicsToSchool(
        schoolId,
        globalTopicsBySubjectId.get(globalSubject.id) ?? [],
        schoolSubjectId,
      );
    }

    await this.syncSubjectTopicsToSchool(
      schoolId,
      (globalTopicsBySubjectId.get(null) ?? []).filter((topic) => topic.isSpecialActivity),
      null,
    );
  }

  private async syncSubjectTopicsToSchool(
    schoolId: string,
    globalTopics: Array<{
      id: string;
      name: string;
      order: number;
      subjectId: string | null;
      parentTopicId: string | null;
      isSpecialActivity: boolean;
    }>,
    schoolSubjectId: string | null,
  ) {
    if (globalTopics.length === 0) {
      return;
    }

    const schoolTopics = await this.prisma.topic.findMany({
      where: {
        schoolId,
        subjectId: schoolSubjectId,
      },
      select: {
        id: true,
        name: true,
        parentTopicId: true,
        order: true,
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });

    const childrenByParent = new Map<string | null, typeof globalTopics>();
    for (const topic of globalTopics) {
      const bucket = childrenByParent.get(topic.parentTopicId ?? null) ?? [];
      bucket.push(topic);
      childrenByParent.set(topic.parentTopicId ?? null, bucket);
    }

    const existingByParent = new Map<string | null, typeof schoolTopics>();
    for (const topic of schoolTopics) {
      const bucket = existingByParent.get(topic.parentTopicId ?? null) ?? [];
      bucket.push(topic);
      existingByParent.set(topic.parentTopicId ?? null, bucket);
    }

    const cloneChildren = async (globalParentId: string | null, schoolParentId: string | null) => {
      const globalChildren = childrenByParent.get(globalParentId) ?? [];
      for (const globalChild of globalChildren) {
        const siblingTopics = existingByParent.get(schoolParentId) ?? [];
        let schoolChild = siblingTopics.find(
          (topic) => this.normalizeText(topic.name) === this.normalizeText(globalChild.name),
        );

        if (!schoolChild) {
          schoolChild = await this.prisma.topic.create({
            data: {
              schoolId,
              subjectId: schoolSubjectId,
              parentTopicId: schoolParentId,
              name: globalChild.name,
              order: globalChild.order,
              isSpecialActivity: globalChild.isSpecialActivity,
            },
            select: {
              id: true,
              name: true,
              parentTopicId: true,
              order: true,
            },
          });

          const updatedSiblings = existingByParent.get(schoolParentId) ?? [];
          updatedSiblings.push(schoolChild);
          existingByParent.set(schoolParentId, updatedSiblings);
        }

        await cloneChildren(globalChild.id, schoolChild.id);
      }
    };

    await cloneChildren(null, null);
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  private async countTopicsForNormalizedSubject(
    schoolId: string | null,
    examType: 'TYT' | 'AYT' | 'LGS',
    normalizedName: string,
  ): Promise<number> {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);

    const subjects = await this.prisma.subject.findMany({
      where: { schoolId: scopedSchoolId, examType, isActive: true },
      select: { id: true, name: true },
    });

    const normalizedTarget = this.normalizeText(normalizedName);
    const matchingSubjectIds = subjects
      .filter(
        (subject) => this.normalizeText(subject.name) === normalizedTarget,
      )
      .map((subject) => subject.id);

    if (matchingSubjectIds.length === 0) {
      return 0;
    }

    return this.prisma.topic.count({
      where: { schoolId: scopedSchoolId, subjectId: { in: matchingSubjectIds } },
    });
  }

  private async countCommonSubjects(schoolId: string | null): Promise<number> {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);

    return this.prisma.subject.count({
      where: {
        schoolId: scopedSchoolId,
        examType: 'COMMON',
        isActive: true,
      },
    });
  }

  private async countSpecialBundleSubjects(schoolId: string | null): Promise<number> {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);

    return this.prisma.subject.count({
      where: {
        schoolId: scopedSchoolId,
        isActive: true,
        OR: [
          { type: { contains: 'DENEMESI' } },
          { type: { contains: 'TEKRARI' } },
        ],
      },
    });
  }

  private async countSpecialActivityTopics(schoolId: string | null): Promise<number> {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);

    return this.prisma.topic.count({
      where: {
        schoolId: scopedSchoolId,
        isSpecialActivity: true,
        subjectId: null,
      },
    });
  }

  private async isScriptAlreadyLoaded(
    scriptName: string,
    schoolId: string | null,
  ): Promise<boolean> {
    const check = SEED_SCRIPT_CHECKS[scriptName];
    if (!check) {
      return false;
    }

    if (check.mode === 'subject_topics') {
      const topicCount = await this.countTopicsForNormalizedSubject(
        schoolId,
        check.examType,
        check.subjectName,
      );
      return topicCount >= check.expectedTopicCount;
    }

    if (check.mode === 'common_subjects') {
      const commonSubjectCount = await this.countCommonSubjects(schoolId);
      return commonSubjectCount >= check.expectedSubjectCount;
    }

    const [specialSubjectCount, specialTopicCount] = await Promise.all([
      this.countSpecialBundleSubjects(schoolId),
      this.countSpecialActivityTopics(schoolId),
    ]);

    return (
      specialSubjectCount >= check.expectedSubjectCount &&
      specialTopicCount >= check.expectedSpecialTopicCount
    );
  }

  private resolveBackendRoot(): string {
    const candidates = [
      process.cwd(),
      path.resolve(__dirname, '..', '..'),
      path.resolve(__dirname, '..', '..', '..'),
    ];

    for (const candidate of candidates) {
      if (
        fs.existsSync(path.join(candidate, 'prisma')) &&
        fs.existsSync(path.join(candidate, 'package.json'))
      ) {
        return candidate;
      }
    }

    throw new InternalServerErrorException('Backend root bulunamadı');
  }

  private runSeedScript(scriptName: string): Promise<void> {
    const backendRoot = this.resolveBackendRoot();
    const scriptPath = path.join('prisma', scriptName);
    const tsNodeBinPath = path.join(
      backendRoot,
      'node_modules',
      'ts-node',
      'dist',
      'bin.js',
    );
    const useDirectTsNode = fs.existsSync(tsNodeBinPath);

    const command = useDirectTsNode ? process.execPath : 'npx';
    const args = useDirectTsNode
      ? [tsNodeBinPath, scriptPath]
      : ['ts-node', scriptPath];

    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: backendRoot,
        env: process.env,
        windowsHide: true,
        shell: useDirectTsNode ? false : true,
      });

      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(
          new Error(
            stderr ||
              stdout ||
              `${scriptName} çalıştırılamadı (exit code: ${code})`,
          ),
        );
      });
    });
  }

  async create(dto: CreateSubjectDto, schoolId: string) {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);

    return this.prisma.subject.create({
      data: {
        schoolId: scopedSchoolId,
        name: dto.name,
        examType: dto.examType,
        gradeLevels: dto.gradeLevels,
        order: dto.order ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(schoolId: string, examType?: string, gradeLevel?: number) {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);
    if (scopedSchoolId) {
      await this.syncGlobalCatalogToSchool(scopedSchoolId);
    }

    const where: any = { isActive: true };
    where.schoolId = scopedSchoolId;

    // ExamType verilmişse, hem o türü hem de COMMON türünü getir
    if (examType) {
      where.OR = [
        { examType: examType },
        { examType: 'COMMON' }, // Sabit aktiviteler her zaman dahil
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

  async findOne(id: string, schoolId: string) {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);
    if (scopedSchoolId) {
      await this.syncGlobalCatalogToSchool(scopedSchoolId);
    }

    const subject = await this.prisma.subject.findFirst({
      where: { id, schoolId: scopedSchoolId },
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

  async update(id: string, schoolId: string, dto: UpdateSubjectDto) {
    await this.findOne(id, schoolId);

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

  async remove(id: string, schoolId: string) {
    await this.findOne(id, schoolId);

    // Soft delete - just mark as inactive
    return this.prisma.subject.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Topic methods
  async createTopic(
    subjectId: string,
    schoolId: string,
    name: string,
    parentTopicId?: string,
    order: number = 0,
  ) {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);

    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, schoolId: scopedSchoolId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (parentTopicId) {
      const parentTopic = await this.prisma.topic.findFirst({
        where: { id: parentTopicId, schoolId: scopedSchoolId },
      });

      if (!parentTopic) {
        throw new NotFoundException('Parent topic not found');
      }
    }

    return this.prisma.topic.create({
      data: {
        schoolId: scopedSchoolId,
        name,
        subjectId,
        parentTopicId,
        order,
      },
    });
  }

  async findTopics(schoolId: string, subjectId?: string, parentTopicId?: string) {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);
    if (scopedSchoolId) {
      await this.syncGlobalCatalogToSchool(scopedSchoolId);
    }

    const where: any = { schoolId: scopedSchoolId };

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

  async findSpecialActivities(schoolId: string) {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);
    if (scopedSchoolId) {
      await this.syncGlobalCatalogToSchool(scopedSchoolId);
    }

    // Get topics that are not associated with any subject (special activities like MEBİ, TYT, AYT exams)
    return this.prisma.topic.findMany({
      where: {
        schoolId: scopedSchoolId,
        isSpecialActivity: true,
        subjectId: null,
      },
      orderBy: { order: 'asc' },
    });
  }

  async updateTopic(id: string, schoolId: string, name: string, order?: number) {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);

    const topic = await this.prisma.topic.findFirst({
      where: { id, schoolId: scopedSchoolId },
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

  async removeTopic(id: string, schoolId: string) {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);

    const topic = await this.prisma.topic.findFirst({
      where: { id, schoolId: scopedSchoolId },
      include: { childTopics: true },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    // Delete child topics first
    if (topic.childTopics.length > 0) {
      await this.prisma.topic.deleteMany({
        where: { parentTopicId: id, schoolId: scopedSchoolId },
      });
    }

    return this.prisma.topic.delete({
      where: { id },
    });
  }

  async seedPreset(preset: SubjectSeedPreset, schoolId: string) {
    const scopedSchoolId = this.resolveSchoolScope(schoolId);

    const scripts = SUBJECT_SEED_SCRIPTS[preset];
    if (!scripts || scripts.length === 0) {
      throw new BadRequestException('Geçersiz seed preset');
    }

    const skippedScripts: string[] = [];
    const completedScripts: string[] = [];

    try {
      for (const script of scripts) {
        const alreadyLoaded = await this.isScriptAlreadyLoaded(script, scopedSchoolId);
        if (alreadyLoaded) {
          skippedScripts.push(script);
          continue;
        }

        await this.runSeedScript(script);
        if (scopedSchoolId) {
          await this.syncGlobalCatalogToSchool(scopedSchoolId);
        }
        completedScripts.push(script);
      }

      if (scopedSchoolId) {
        await this.syncGlobalCatalogToSchool(scopedSchoolId);
      }

      if (completedScripts.length === 0) {
        return {
          success: true,
          preset,
          alreadyLoaded: true,
          scriptsRun: [],
          skippedScripts,
          message: `${preset} icin icerikler zaten yuklu`,
        };
      }

      return {
        success: true,
        preset,
        alreadyLoaded: false,
        scriptsRun: completedScripts,
        skippedScripts,
        message: `${preset} yuklemesi tamamlandi`,
      };
    } catch (error: any) {
      throw new InternalServerErrorException({
        message: `${preset} verileri yuklenirken hata olustu`,
        detail: error?.message || 'Bilinmeyen hata',
        completedScripts,
        skippedScripts,
      });
    }
  }
}

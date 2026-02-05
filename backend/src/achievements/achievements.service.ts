import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementCategory, ExamType } from '@prisma/client';

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  // Get all achievements for a school
  async findAll(schoolId: string, includeInactive = false) {
    return this.prisma.achievement.findMany({
      where: {
        schoolId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [
        { category: 'asc' },
        { points: 'desc' },
      ],
    });
  }

  // Get student's achievements
  async findStudentAchievements(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true },
    });

    if (!student) throw new NotFoundException('Student not found');

    const [unlocked, available] = await Promise.all([
      // Unlocked achievements
      this.prisma.studentAchievement.findMany({
        where: {
          studentId,
          unlockedAt: { not: null },
        },
        include: {
          achievement: true,
        },
        orderBy: { unlockedAt: 'desc' },
      }),
      // Available achievements (not yet unlocked)
      this.prisma.achievement.findMany({
        where: {
          schoolId: student.schoolId,
          isActive: true,
          NOT: {
            studentAchievements: {
              some: {
                studentId,
                unlockedAt: { not: null },
              },
            },
          },
        },
        orderBy: [
          { category: 'asc' },
          { points: 'desc' },
        ],
      }),
    ]);

    return { unlocked, available };
  }

  // Get achievement by ID with users who unlocked it
  async findOneWithUnlockers(id: string, schoolId: string) {
    const achievement = await this.prisma.achievement.findFirst({
      where: { id, schoolId },
      include: {
        studentAchievements: {
          where: { unlockedAt: { not: null } },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
                class: {
                  include: {
                    grade: true,
                  },
                },
              },
            },
          },
          orderBy: { unlockedAt: 'desc' },
        },
      },
    });

    if (!achievement) throw new NotFoundException('Achievement not found');

    return achievement;
  }

  // Create new achievement
  async create(data: {
    name: string;
    description: string;
    category: AchievementCategory;
    type: string;
    requirement: any;
    iconName: string;
    colorScheme: string;
    points?: number;
    examType?: ExamType;
    schoolId: string;
  }) {
    return this.prisma.achievement.create({
      data: {
        ...data,
        points: data.points || 0,
      },
    });
  }

  // Update achievement
  async update(id: string, schoolId: string, data: Partial<{
    name: string;
    description: string;
    category: AchievementCategory;
    type: string;
    requirement: any;
    iconName: string;
    colorScheme: string;
    points: number;
    isActive: boolean;
    examType: ExamType;
  }>) {
    const achievement = await this.prisma.achievement.findFirst({
      where: { id, schoolId },
    });

    if (!achievement) throw new NotFoundException('Achievement not found');

    return this.prisma.achievement.update({
      where: { id },
      data,
    });
  }

  // Delete achievement
  async remove(id: string, schoolId: string) {
    const achievement = await this.prisma.achievement.findFirst({
      where: { id, schoolId },
    });

    if (!achievement) throw new NotFoundException('Achievement not found');

    return this.prisma.achievement.delete({
      where: { id },
    });
  }

  // Toggle achievement active status
  async toggleActive(id: string, schoolId: string) {
    const achievement = await this.prisma.achievement.findFirst({
      where: { id, schoolId },
    });

    if (!achievement) throw new NotFoundException('Achievement not found');

    return this.prisma.achievement.update({
      where: { id },
      data: { isActive: !achievement.isActive },
    });
  }

  // Check and unlock achievement for student
  async checkAndUnlock(studentId: string, achievementType: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true },
    });

    if (!student) return null;

    const achievement = await this.prisma.achievement.findFirst({
      where: {
        type: achievementType,
        schoolId: student.schoolId,
        isActive: true,
      },
    });

    if (!achievement) return null;

    // Check if already unlocked
    const existing = await this.prisma.studentAchievement.findUnique({
      where: {
        studentId_achievementId: {
          studentId,
          achievementId: achievement.id,
        },
      },
    });

    if (existing?.unlockedAt) return existing;

    // Unlock achievement
    return this.prisma.studentAchievement.upsert({
      where: {
        studentId_achievementId: {
          studentId,
          achievementId: achievement.id,
        },
      },
      update: {
        unlockedAt: new Date(),
        progress: 100,
      },
      create: {
        studentId,
        achievementId: achievement.id,
        schoolId: student.schoolId,
        progress: 100,
        unlockedAt: new Date(),
      },
      include: {
        achievement: true,
      },
    });
  }

  // Auto-check achievements after exam is submitted
  async checkAchievementsForExam(attemptId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        student: {
          include: {
            class: true,
            examAttempts: {
              include: {
                scores: true,
              },
            },
          },
        },
        exam: true,
        scores: true,
        lessonResults: {
          include: {
            lesson: true,
          },
        },
      },
    });

    if (!attempt) return [];

    const unlockedAchievements: any[] = [];
    const studentId = attempt.studentId;
    const examType = attempt.exam.type;
    const score = attempt.scores[0]?.score || 0;

    // 1. Check Class Ranking Achievements
    if (attempt.scores[0]?.rankClass) {
      const classRank = attempt.scores[0].rankClass;
      if (classRank === 1) {
        const unlocked = await this.checkAndUnlock(studentId, 'RANK_CLASS_1');
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (classRank <= 3) {
        const unlocked = await this.checkAndUnlock(studentId, 'RANK_CLASS_3');
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (classRank <= 5) {
        const unlocked = await this.checkAndUnlock(studentId, 'RANK_CLASS_5');
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (classRank <= 10) {
        const unlocked = await this.checkAndUnlock(studentId, 'RANK_CLASS_10');
        if (unlocked) unlockedAchievements.push(unlocked);
      }
    }

    // 2. Check School Ranking Achievements
    if (attempt.scores[0]?.rankSchool) {
      const schoolRank = attempt.scores[0].rankSchool;
      if (schoolRank === 1) {
        const unlocked = await this.checkAndUnlock(studentId, `RANK_SCHOOL_1_${examType}`);
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (schoolRank <= 3) {
        const unlocked = await this.checkAndUnlock(studentId, `RANK_SCHOOL_3_${examType}`);
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (schoolRank <= 5) {
        const unlocked = await this.checkAndUnlock(studentId, `RANK_SCHOOL_5_${examType}`);
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (schoolRank <= 10) {
        const unlocked = await this.checkAndUnlock(studentId, `RANK_SCHOOL_10_${examType}`);
        if (unlocked) unlockedAchievements.push(unlocked);
      }
    }

    // 3. Check District/City/National Rankings (if available)
    if (attempt.scores[0]?.rankDistrict === 1) {
      const unlocked = await this.checkAndUnlock(studentId, `RANK_DISTRICT_1_${examType}`);
      if (unlocked) unlockedAchievements.push(unlocked);
    }
    if (attempt.scores[0]?.rankCity === 1) {
      const unlocked = await this.checkAndUnlock(studentId, `RANK_CITY_1_${examType}`);
      if (unlocked) unlockedAchievements.push(unlocked);
    }

    // 4. Check Score Milestones (LGS specific)
    if (examType === ExamType.LGS) {
      if (score >= 500) {
        const unlocked = await this.checkAndUnlock(studentId, 'SCORE_500_LGS');
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (score >= 480) {
        const unlocked = await this.checkAndUnlock(studentId, 'SCORE_480_LGS');
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (score >= 450) {
        const unlocked = await this.checkAndUnlock(studentId, 'SCORE_450_LGS');
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (score >= 400) {
        const unlocked = await this.checkAndUnlock(studentId, 'SCORE_400_LGS');
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (score >= 350) {
        const unlocked = await this.checkAndUnlock(studentId, 'SCORE_350_LGS');
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (score >= 300) {
        const unlocked = await this.checkAndUnlock(studentId, 'SCORE_300_LGS');
        if (unlocked) unlockedAchievements.push(unlocked);
      }

      // Check perfect/near-perfect scores
      const totalNet = attempt.lessonResults.reduce((sum, lr) => sum + lr.net, 0);
      if (totalNet >= 90) {
        const unlocked = await this.checkAndUnlock(studentId, 'PERFECT_LGS');
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (totalNet >= 89) {
        const unlocked = await this.checkAndUnlock(studentId, 'NEAR_PERFECT_1_LGS');
        if (unlocked) unlockedAchievements.push(unlocked);
      } else if (totalNet >= 88) {
        const unlocked = await this.checkAndUnlock(studentId, 'NEAR_PERFECT_2_LGS');
        if (unlocked) unlockedAchievements.push(unlocked);
      }
    }

    // 5. Check Subject Mastery Achievements (Full score in a subject)
    for (const lessonResult of attempt.lessonResults) {
      const lessonName = lessonResult.lesson.name;
      const maxQuestions = this.getMaxQuestionsForLesson(lessonName, examType);
      
      if (maxQuestions && lessonResult.correct === maxQuestions) {
        const achievementType = `SUBJECT_${lessonName.toUpperCase().replace(/\s+/g, '_')}_${examType}`;
        const unlocked = await this.checkAndUnlock(studentId, achievementType);
        if (unlocked) unlockedAchievements.push(unlocked);
      }
    }

    // 6. Check Exam Count Milestones
    const totalExamCount = attempt.student.examAttempts.length;
    if (totalExamCount >= 50) {
      const unlocked = await this.checkAndUnlock(studentId, 'CONSISTENCY_50_EXAMS');
      if (unlocked) unlockedAchievements.push(unlocked);
    } else if (totalExamCount >= 25) {
      const unlocked = await this.checkAndUnlock(studentId, 'CONSISTENCY_25_EXAMS');
      if (unlocked) unlockedAchievements.push(unlocked);
    } else if (totalExamCount >= 10) {
      const unlocked = await this.checkAndUnlock(studentId, 'CONSISTENCY_10_EXAMS');
      if (unlocked) unlockedAchievements.push(unlocked);
    }

    return unlockedAchievements;
  }

  // Helper: Get max questions for a lesson
  private getMaxQuestionsForLesson(lessonName: string, examType: ExamType): number | null {
    const lessonQuestions: Record<string, Record<string, number>> = {
      LGS: {
        'Matematik': 20,
        'Türkçe': 20,
        'Fen Bilimleri': 20,
        'T.C. İnkılap Tarihi': 10,
        'Din Kültürü': 10,
        'İngilizce': 10,
      },
      TYT: {
        'Matematik': 40,
        'Türkçe': 40,
        'Fen': 20,
        'Sosyal': 20,
      },
    };

    return lessonQuestions[examType]?.[lessonName] || null;
  }

  // Seed default achievements for a school
  async seedDefaultAchievements(schoolId: string) {
    const defaultAchievements = [
      // Study Plan Streaks
      {
        name: '1 Hafta Düzenli',
        description: '1 hafta boyunca tüm görevlerini tamamladın',
        category: 'STREAK' as AchievementCategory,
        type: 'STREAK_1W',
        requirement: { weeks: 1 },
        iconName: 'flame',
        colorScheme: 'orange',
        points: 10,
        schoolId,
      },
      {
        name: '2 Hafta Düzenli',
        description: '2 hafta üst üste tüm görevlerini tamamladın',
        category: 'STREAK' as AchievementCategory,
        type: 'STREAK_2W',
        requirement: { weeks: 2 },
        iconName: 'flame',
        colorScheme: 'orange',
        points: 25,
        schoolId,
      },
      {
        name: '3 Hafta Düzenli',
        description: '3 hafta üst üste tüm görevlerini tamamladın',
        category: 'STREAK' as AchievementCategory,
        type: 'STREAK_3W',
        requirement: { weeks: 3 },
        iconName: 'flame',
        colorScheme: 'orange',
        points: 50,
        schoolId,
      },
      {
        name: '5 Hafta Düzenli',
        description: '5 hafta üst üste tüm görevlerini tamamladın',
        category: 'STREAK' as AchievementCategory,
        type: 'STREAK_5W',
        requirement: { weeks: 5 },
        iconName: 'flame',
        colorScheme: 'orange',
        points: 100,
        schoolId,
      },

      // School Rankings - LGS
      {
        name: 'Okulda 1.',
        description: 'Okulunda 1. oldun',
        category: 'MILESTONE' as AchievementCategory,
        type: 'RANK_SCHOOL_1',
        requirement: { rank: 1, scope: 'SCHOOL' },
        iconName: 'trophy',
        colorScheme: 'gold',
        points: 50,
        schoolId,
        examType: 'LGS' as ExamType,
      },
      {
        name: 'Okulda İlk 3',
        description: 'Okulunda ilk 3\'e girdin',
        category: 'MILESTONE' as AchievementCategory,
        type: 'RANK_SCHOOL_3',
        requirement: { rank: 3, scope: 'SCHOOL' },
        iconName: 'trophy',
        colorScheme: 'blue',
        points: 30,
        schoolId,
        examType: 'LGS' as ExamType,
      },
      {
        name: 'Okulda İlk 5',
        description: 'Okulunda ilk 5\'e girdin',
        category: 'MILESTONE' as AchievementCategory,
        type: 'RANK_SCHOOL_5',
        requirement: { rank: 5, scope: 'SCHOOL' },
        iconName: 'award',
        colorScheme: 'blue',
        points: 20,
        schoolId,
        examType: 'LGS' as ExamType,
      },
      {
        name: 'Okulda İlk 10',
        description: 'Okulunda ilk 10\'a girdin',
        category: 'MILESTONE' as AchievementCategory,
        type: 'RANK_SCHOOL_10',
        requirement: { rank: 10, scope: 'SCHOOL' },
        iconName: 'award',
        colorScheme: 'blue',
        points: 10,
        schoolId,
        examType: 'LGS' as ExamType,
      },
      {
        name: 'İlçede 1.',
        description: 'İlçende 1. oldun',
        category: 'MILESTONE' as AchievementCategory,
        type: 'RANK_DISTRICT_1',
        requirement: { rank: 1, scope: 'DISTRICT' },
        iconName: 'crown',
        colorScheme: 'gold',
        points: 100,
        schoolId,
        examType: 'LGS' as ExamType,
      },
      {
        name: 'İlçede İlk 10',
        description: 'İlçende ilk 10\'a girdin',
        category: 'MILESTONE' as AchievementCategory,
        type: 'RANK_DISTRICT_10',
        requirement: { rank: 10, scope: 'DISTRICT' },
        iconName: 'award',
        colorScheme: 'purple',
        points: 50,
        schoolId,
        examType: 'LGS' as ExamType,
      },

      // Score Milestones - LGS
      {
        name: '400+ Puan',
        description: 'LGS\'de 400 puanı geçtin',
        category: 'MILESTONE' as AchievementCategory,
        type: 'SCORE_400',
        requirement: { score: 400 },
        iconName: 'target',
        colorScheme: 'blue',
        points: 30,
        schoolId,
        examType: 'LGS' as ExamType,
      },
      {
        name: '450+ Puan',
        description: 'LGS\'de 450 puanı geçtin',
        category: 'MILESTONE' as AchievementCategory,
        type: 'SCORE_450',
        requirement: { score: 450 },
        iconName: 'target',
        colorScheme: 'purple',
        points: 50,
        schoolId,
        examType: 'LGS' as ExamType,
      },
      {
        name: '480+ Puan',
        description: 'LGS\'de 480 puanı geçtin',
        category: 'MILESTONE' as AchievementCategory,
        type: 'SCORE_480',
        requirement: { score: 480 },
        iconName: 'star',
        colorScheme: 'gold',
        points: 100,
        schoolId,
        examType: 'LGS' as ExamType,
      },

      // Perfect Scores - LGS
      {
        name: '90 Tam Puan',
        description: 'LGS denemesinde 90 sorunun hepsini doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'PERFECT_90',
        requirement: { correct: 90, total: 90 },
        iconName: 'star',
        colorScheme: 'gold',
        points: 200,
        schoolId,
        examType: 'LGS' as ExamType,
      },
      {
        name: 'Sadece 1 Yanlış',
        description: 'LGS denemesinde sadece 1 yanlış yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'ALMOST_PERFECT',
        requirement: { wrong: 1, total: 90 },
        iconName: 'star',
        colorScheme: 'gold',
        points: 150,
        schoolId,
        examType: 'LGS' as ExamType,
      },

      // Subject Full Scores - LGS
      {
        name: 'Matematik Ustası',
        description: 'Matematik dersinde tüm soruları doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'FULL_MATH_LGS',
        requirement: { subject: 'Matematik', correct: 20 },
        iconName: 'award',
        colorScheme: 'blue',
        points: 50,
        schoolId,
        examType: 'LGS' as ExamType,
      },
      {
        name: 'Türkçe Ustası',
        description: 'Türkçe dersinde tüm soruları doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'FULL_TURKISH_LGS',
        requirement: { subject: 'Türkçe', correct: 20 },
        iconName: 'award',
        colorScheme: 'green',
        points: 50,
        schoolId,
        examType: 'LGS' as ExamType,
      },
      {
        name: 'Fen Bilimleri Ustası',
        description: 'Fen Bilimleri dersinde tüm soruları doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'FULL_SCIENCE_LGS',
        requirement: { subject: 'Fen Bilimleri', correct: 20 },
        iconName: 'award',
        colorScheme: 'purple',
        points: 50,
        schoolId,
        examType: 'LGS' as ExamType,
      },

      // TYT Achievements
      {
        name: 'TYT 120 Tam Puan',
        description: 'TYT\'de 120 sorunun hepsini doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'PERFECT_TYT_120',
        requirement: { correct: 120, total: 120 },
        iconName: 'star',
        colorScheme: 'gold',
        points: 300,
        schoolId,
        examType: 'TYT' as ExamType,
      },
      {
        name: 'TYT Matematik Ustası',
        description: 'TYT Matematik\'te 40 sorunun hepsini doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'FULL_MATH_TYT',
        requirement: { subject: 'Matematik', correct: 40 },
        iconName: 'award',
        colorScheme: 'blue',
        points: 80,
        schoolId,
        examType: 'TYT' as ExamType,
      },

      // AYT Sayısal (MF)
      {
        name: 'AYT Matematik Ustası (MF)',
        description: 'AYT Matematik\'te 40 sorunun hepsini doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'FULL_MATH_AYT_MF',
        requirement: { subject: 'Matematik', correct: 40, field: 'MF' },
        iconName: 'award',
        colorScheme: 'blue',
        points: 100,
        schoolId,
        examType: 'AYT' as ExamType,
      },
      {
        name: 'AYT Fen Ustası (MF)',
        description: 'AYT Fen Bilimleri\'nde 40 sorunun hepsini doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'FULL_SCIENCE_AYT_MF',
        requirement: { subjects: ['Fizik', 'Kimya', 'Biyoloji'], correct: 40, field: 'MF' },
        iconName: 'award',
        colorScheme: 'purple',
        points: 100,
        schoolId,
        examType: 'AYT' as ExamType,
      },
      {
        name: 'Sayısal Şampiyonu (MF)',
        description: 'AYT Sayısal\'da 80 sorunun hepsini doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'PERFECT_AYT_MF_80',
        requirement: { correct: 80, total: 80, field: 'MF' },
        iconName: 'crown',
        colorScheme: 'gold',
        points: 250,
        schoolId,
        examType: 'AYT' as ExamType,
      },

      // AYT Sözel (TS)
      {
        name: 'Edebiyat Ustası (TS)',
        description: 'AYT Edebiyat\'ta 24 sorunun hepsini doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'FULL_LIT_AYT_TS',
        requirement: { subject: 'Edebiyat', correct: 24, field: 'TS' },
        iconName: 'award',
        colorScheme: 'green',
        points: 80,
        schoolId,
        examType: 'AYT' as ExamType,
      },
      {
        name: 'Sözel Şampiyonu (TS)',
        description: 'AYT Sözel testlerinde 120 sorunun hepsini doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'PERFECT_AYT_TS_120',
        requirement: { correct: 120, total: 120, field: 'TS' },
        iconName: 'crown',
        colorScheme: 'gold',
        points: 250,
        schoolId,
        examType: 'AYT' as ExamType,
      },

      // AYT Eşit Ağırlık (TM)
      {
        name: 'Eşit Ağırlık Ustası (TM)',
        description: 'AYT Eşit Ağırlık testlerinde 96 sorunun hepsini doğru yaptın',
        category: 'MILESTONE' as AchievementCategory,
        type: 'PERFECT_AYT_TM_96',
        requirement: { correct: 96, total: 96, field: 'TM' },
        iconName: 'crown',
        colorScheme: 'gold',
        points: 250,
        schoolId,
        examType: 'AYT' as ExamType,
      },
    ];

    const created = await this.prisma.achievement.createMany({
      data: defaultAchievements,
      skipDuplicates: true,
    });

    return created;
  }
}

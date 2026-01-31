import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExamType } from '@prisma/client';

export interface ExamReportSummary {
  examId: string;
  examTitle: string;
  examDate: Date;
  participantCount: number;
  lessonAverages: {
    lessonName: string;
    averageNet: number;
    averageCorrect: number;
    averageIncorrect: number;
    averageEmpty: number;
  }[];
  scoreAverages: {
    type: string;
    averageScore: number;
  }[];
  branchAverages?: {
    branchId: string;
    branchName: string;
    participantCount: number;
    lessonAverages: {
      lessonName: string;
      averageNet: number;
      averageCorrect: number;
      averageIncorrect: number;
      averageEmpty: number;
    }[];
    scoreAverages: {
      type: string;
      averageScore: number;
    }[];
  }[];
}

export interface ExamReportDetailed extends ExamReportSummary {
  lessonDetails: {
    lessonName: string;
    averageCorrect: number;
    averageIncorrect: number;
    averageEmpty: number;
    averageNet: number;
  }[];
}

export interface SubjectReportSummary {
  lessonName: string;
  exams: {
    examId: string;
    examTitle: string;
    examDate: Date;
    participantCount: number;
    averageNet: number;
    averageCorrect: number;
    averageIncorrect: number;
    averageEmpty: number;
  }[];
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Okuldaki belirli sınıf ve sınav türüne göre tüm denemelerin özet raporunu getirir
   */
  async getExamsSummaryReport(
    schoolId: string,
    examType: ExamType,
    gradeLevel?: number,
  ): Promise<ExamReportSummary[]> {
    // Filtrelere göre sınavları getir
    const exams = await this.prisma.exam.findMany({
      where: {
        schoolId,
        type: examType,
        ...(gradeLevel && { gradeLevel }),
      },
      orderBy: { date: 'desc' },
      include: {
        attempts: {
          include: {
            student: {
              include: {
                class: true,
              },
            },
            lessonResults: {
              include: {
                lesson: true,
              },
            },
            scores: true,
          },
        },
      },
    });

    // Her sınav için özet rapor oluştur
    const reports: ExamReportSummary[] = [];

    for (const exam of exams) {
      const participantCount = exam.attempts.length;

      // Ders bazında ortalamalar
      const lessonMap = new Map<
        string,
        { correct: number[]; incorrect: number[]; empty: number[]; net: number[] }
      >();

      exam.attempts.forEach((attempt) => {
        attempt.lessonResults.forEach((result) => {
          const lessonName = result.lesson.name;
          if (!lessonMap.has(lessonName)) {
            lessonMap.set(lessonName, {
              correct: [],
              incorrect: [],
              empty: [],
              net: [],
            });
          }
          const lessonData = lessonMap.get(lessonName)!;
          lessonData.correct.push(result.correct);
          lessonData.incorrect.push(result.incorrect);
          lessonData.empty.push(result.empty);
          lessonData.net.push(result.net);
        });
      });

      const lessonAverages = Array.from(lessonMap.entries()).map(
        ([lessonName, data]) => ({
          lessonName,
          averageNet: this.calculateAverage(data.net),
          averageCorrect: this.calculateAverage(data.correct),
          averageIncorrect: this.calculateAverage(data.incorrect),
          averageEmpty: this.calculateAverage(data.empty),
        }),
      );

      // Puan bazında ortalamalar
      const scoreMap = new Map<string, number[]>();

      exam.attempts.forEach((attempt) => {
        attempt.scores.forEach((score) => {
          if (!scoreMap.has(score.type)) {
            scoreMap.set(score.type, []);
          }
          scoreMap.get(score.type)!.push(score.score);
        });
      });

      const scoreAverages = Array.from(scoreMap.entries()).map(
        ([type, scores]) => ({
          type,
          averageScore: this.calculateAverage(scores),
        }),
      );

      // Şube bazında ortalamalar
      const branchMap = new Map<string, {
        branchId: string;
        branchName: string;
        attempts: typeof exam.attempts;
      }>();

      exam.attempts.forEach((attempt) => {
        const branchId = attempt.student.class.id;
        const branchName = attempt.student.class.name;

        if (!branchMap.has(branchId)) {
          branchMap.set(branchId, {
            branchId,
            branchName,
            attempts: [],
          });
        }
        branchMap.get(branchId)!.attempts.push(attempt);
      });

      const branchAverages = Array.from(branchMap.values()).map((branch) => {
        // Şube içindeki ders bazında ortalamalar
        const branchLessonMap = new Map<
          string,
          { correct: number[]; incorrect: number[]; empty: number[]; net: number[] }
        >();

        branch.attempts.forEach((attempt) => {
          attempt.lessonResults.forEach((result) => {
            const lessonName = result.lesson.name;
            if (!branchLessonMap.has(lessonName)) {
              branchLessonMap.set(lessonName, {
                correct: [],
                incorrect: [],
                empty: [],
                net: [],
              });
            }
            const lessonData = branchLessonMap.get(lessonName)!;
            lessonData.correct.push(result.correct);
            lessonData.incorrect.push(result.incorrect);
            lessonData.empty.push(result.empty);
            lessonData.net.push(result.net);
          });
        });

        const branchLessonAverages = Array.from(branchLessonMap.entries()).map(
          ([lessonName, data]) => ({
            lessonName,
            averageNet: this.calculateAverage(data.net),
            averageCorrect: this.calculateAverage(data.correct),
            averageIncorrect: this.calculateAverage(data.incorrect),
            averageEmpty: this.calculateAverage(data.empty),
          }),
        );

        // Şube içindeki puan bazında ortalamalar
        const branchScoreMap = new Map<string, number[]>();

        branch.attempts.forEach((attempt) => {
          attempt.scores.forEach((score) => {
            if (!branchScoreMap.has(score.type)) {
              branchScoreMap.set(score.type, []);
            }
            branchScoreMap.get(score.type)!.push(score.score);
          });
        });

        const branchScoreAverages = Array.from(branchScoreMap.entries()).map(
          ([type, scores]) => ({
            type,
            averageScore: this.calculateAverage(scores),
          }),
        );

        return {
          branchId: branch.branchId,
          branchName: branch.branchName,
          participantCount: branch.attempts.length,
          lessonAverages: branchLessonAverages,
          scoreAverages: branchScoreAverages,
        };
      });

      reports.push({
        examId: exam.id,
        examTitle: exam.title,
        examDate: exam.date,
        participantCount,
        lessonAverages,
        scoreAverages,
        branchAverages: branchAverages.sort((a, b) => a.branchName.localeCompare(b.branchName)),
      });
    }

    return reports;
  }

  /**
   * Okuldaki belirli sınıf ve sınav türüne göre tüm denemelerin ayrıntılı raporunu getirir
   */
  async getExamsDetailedReport(
    schoolId: string,
    examType: ExamType,
    gradeLevel?: number,
  ): Promise<ExamReportDetailed[]> {
    const summaryReports = await this.getExamsSummaryReport(
      schoolId,
      examType,
      gradeLevel,
    );

    // Özet raporlara ayrıntılı bilgi ekleyerek döndür
    return summaryReports.map((report) => ({
      ...report,
      lessonDetails: report.lessonAverages,
    }));
  }

  /**
   * Okuldaki belirli ders ve sınav türüne göre tüm denemelerin ders bazlı raporunu getirir
   */
  async getSubjectReport(
    schoolId: string,
    examType: ExamType,
    lessonName: string,
    gradeLevel?: number,
  ): Promise<SubjectReportSummary> {
    // Dersi bul
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        schoolId,
        name: lessonName,
        examType,
      },
    });

    if (!lesson) {
      throw new Error('Ders bulunamadı');
    }

    // Filtrelere göre sınavları getir
    const exams = await this.prisma.exam.findMany({
      where: {
        schoolId,
        type: examType,
        ...(gradeLevel && { gradeLevel }),
      },
      orderBy: { date: 'desc' },
      include: {
        attempts: {
          include: {
            lessonResults: {
              where: {
                lessonId: lesson.id,
              },
            },
          },
        },
      },
    });

    const examSummaries = exams.map((exam) => {
      const lessonResults = exam.attempts.flatMap(
        (attempt) => attempt.lessonResults,
      );

      const participantCount = lessonResults.length;

      const correct = lessonResults.map((r) => r.correct);
      const incorrect = lessonResults.map((r) => r.incorrect);
      const empty = lessonResults.map((r) => r.empty);
      const net = lessonResults.map((r) => r.net);

      return {
        examId: exam.id,
        examTitle: exam.title,
        examDate: exam.date,
        participantCount,
        averageNet: this.calculateAverage(net),
        averageCorrect: this.calculateAverage(correct),
        averageIncorrect: this.calculateAverage(incorrect),
        averageEmpty: this.calculateAverage(empty),
      };
    });

    return {
      lessonName,
      exams: examSummaries,
    };
  }

  /**
   * Belirli bir sınav için ayrıntılı rapor getirir
   */
  async getSingleExamReport(examId: string): Promise<ExamReportDetailed> {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        attempts: {
          include: {
            lessonResults: {
              include: {
                lesson: true,
              },
            },
            scores: true,
          },
        },
      },
    });

    if (!exam) {
      throw new Error('Sınav bulunamadı');
    }

    const participantCount = exam.attempts.length;

    // Ders bazında ortalamalar
    const lessonMap = new Map<
      string,
      { correct: number[]; incorrect: number[]; empty: number[]; net: number[] }
    >();

    exam.attempts.forEach((attempt) => {
      attempt.lessonResults.forEach((result) => {
        const lessonName = result.lesson.name;
        if (!lessonMap.has(lessonName)) {
          lessonMap.set(lessonName, {
            correct: [],
            incorrect: [],
            empty: [],
            net: [],
          });
        }
        const lessonData = lessonMap.get(lessonName)!;
        lessonData.correct.push(result.correct);
        lessonData.incorrect.push(result.incorrect);
        lessonData.empty.push(result.empty);
        lessonData.net.push(result.net);
      });
    });

    const lessonAverages = Array.from(lessonMap.entries()).map(
      ([lessonName, data]) => ({
        lessonName,
        averageNet: this.calculateAverage(data.net),
        averageCorrect: this.calculateAverage(data.correct),
        averageIncorrect: this.calculateAverage(data.incorrect),
        averageEmpty: this.calculateAverage(data.empty),
      }),
    );

    // Puan bazında ortalamalar
    const scoreMap = new Map<string, number[]>();

    exam.attempts.forEach((attempt) => {
      attempt.scores.forEach((score) => {
        if (!scoreMap.has(score.type)) {
          scoreMap.set(score.type, []);
        }
        scoreMap.get(score.type)!.push(score.score);
      });
    });

    const scoreAverages = Array.from(scoreMap.entries()).map(
      ([type, scores]) => ({
        type,
        averageScore: this.calculateAverage(scores),
      }),
    );

    return {
      examId: exam.id,
      examTitle: exam.title,
      examDate: exam.date,
      participantCount,
      lessonAverages,
      scoreAverages,
      lessonDetails: lessonAverages,
    };
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / numbers.length) * 100) / 100;
  }

  /**
   * Sınıf sıralama matris raporu
   */
  async getClassRankingMatrix(
    classId: string,
    schoolId: string,
    examType?: ExamType,
    startDate?: Date,
    endDate?: Date,
  ) {
    // 1. Sınıf bilgilerini al
    const classInfo = await this.prisma.class.findFirst({
      where: { id: classId, schoolId },
      include: {
        grade: true,
        _count: { select: { students: true } },
      },
    });

    if (!classInfo) {
      throw new Error('Sınıf bulunamadı');
    }

    // 2. Sınıfa ait öğrencileri al
    const students = await this.prisma.student.findMany({
      where: { classId },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { studentNumber: 'asc' },
    });

    // 3. Filtrelere uygun sınavları al
    const exams = await this.prisma.exam.findMany({
      where: {
        schoolId,
        ...(examType && { type: examType }),
        ...(startDate && { date: { gte: startDate } }),
        ...(endDate && { date: { lte: endDate } }),
        attempts: {
          some: {
            student: { classId },
          },
        },
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        date: true,
        type: true,
        schoolParticipantCount: true,
      },
    });

    // 4. Her öğrenci için sıralama verilerini hesapla
    const studentRankings = await Promise.all(
      students.map(async (student) => {
        const rankings = await Promise.all(
          exams.map(async (exam) => {
            const attempt = await this.prisma.examAttempt.findFirst({
              where: {
                examId: exam.id,
                studentId: student.id,
              },
              include: {
                scores: {
                  select: { rankSchool: true },
                },
              },
            });

            return {
              examId: exam.id,
              rank: attempt?.scores[0]?.rankSchool || null,
            };
          })
        );

        const validRanks = rankings
          .map(r => r.rank)
          .filter((r): r is number => r !== null);

        const averageRank = validRanks.length > 0
          ? validRanks.reduce((a, b) => a + b, 0) / validRanks.length
          : 0;

        return {
          studentId: student.id,
          studentNumber: student.studentNumber || '-',
          fullName: `${student.user.firstName} ${student.user.lastName}`,
          rankings,
          averageRank: Number(averageRank.toFixed(2)),
          bestRank: validRanks.length > 0 ? Math.min(...validRanks) : 0,
          worstRank: validRanks.length > 0 ? Math.max(...validRanks) : 0,
          examsAttended: validRanks.length,
          examsMissed: exams.length - validRanks.length,
        };
      })
    );

    // 5. İstatistikleri hesapla
    const validStudents = studentRankings.filter(s => s.examsAttended > 0);
    const topPerformer = validStudents.length > 0
      ? validStudents.reduce((best, current) => 
          current.averageRank < best.averageRank ? current : best
        )
      : null;

    return {
      classInfo: {
        id: classInfo.id,
        name: classInfo.name,
        gradeName: classInfo.grade.name,
        studentCount: classInfo._count.students,
      },
      exams: exams.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date.toISOString(),
        type: e.type,
        participantCount: e.schoolParticipantCount || 0,
      })),
      students: studentRankings,
      statistics: {
        totalExams: exams.length,
        averageParticipation: exams.length > 0
          ? validStudents.reduce((sum, s) => sum + s.examsAttended, 0) / 
            (validStudents.length * exams.length) * 100
          : 0,
        topPerformer: topPerformer ? {
          studentId: topPerformer.studentId,
          fullName: topPerformer.fullName,
          averageRank: topPerformer.averageRank,
        } : null,
      },
    };
  }

  async getGradeRankingMatrix(
    gradeId: string,
    schoolId: string,
    examType?: ExamType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    // 1. Grade bilgilerini ve sınıfları al
    const grade = await this.prisma.grade.findFirst({
      where: { id: gradeId, schoolId },
      include: {
        classes: {
          include: {
            _count: { select: { students: true } },
          },
        },
      },
    });

    if (!grade) {
      throw new NotFoundException('Sınıf seviyesi bulunamadı');
    }

    // 2. Tüm sınıflardan öğrencileri al
    const students = await this.prisma.student.findMany({
      where: {
        class: {
          gradeId,
          schoolId,
        },
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        class: { select: { name: true } },
      },
      orderBy: { studentNumber: 'asc' },
    });

    // 3. Filtrelere uygun sınavları al
    const exams = await this.prisma.exam.findMany({
      where: {
        schoolId,
        ...(examType && { type: examType }),
        ...(startDate && { date: { gte: startDate } }),
        ...(endDate && { date: { lte: endDate } }),
        attempts: {
          some: {
            student: {
              class: { gradeId },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        date: true,
        type: true,
        schoolParticipantCount: true,
      },
    });

    // 4. Her öğrenci için sıralama verilerini hesapla
    const studentRankings = await Promise.all(
      students.map(async (student) => {
        const rankings = await Promise.all(
          exams.map(async (exam) => {
            const attempt = await this.prisma.examAttempt.findFirst({
              where: {
                examId: exam.id,
                studentId: student.id,
              },
              include: {
                scores: {
                  select: { rankSchool: true },
                },
              },
            });

            return {
              examId: exam.id,
              rank: attempt?.scores[0]?.rankSchool || null,
            };
          })
        );

        const validRanks = rankings
          .map(r => r.rank)
          .filter((r): r is number => r !== null);

        const averageRank = validRanks.length > 0
          ? validRanks.reduce((a, b) => a + b, 0) / validRanks.length
          : 0;

        return {
          studentId: student.id,
          studentNumber: student.studentNumber || '-',
          fullName: `${student.user.firstName} ${student.user.lastName}`,
          className: student.class.name,
          rankings,
          averageRank: Number(averageRank.toFixed(2)),
          bestRank: validRanks.length > 0 ? Math.min(...validRanks) : 0,
          worstRank: validRanks.length > 0 ? Math.max(...validRanks) : 0,
          examsAttended: validRanks.length,
          examsMissed: exams.length - validRanks.length,
        };
      })
    );

    // 5. İstatistikleri hesapla
    const validStudents = studentRankings.filter(s => s.examsAttended > 0);
    const topPerformer = validStudents.length > 0
      ? validStudents.reduce((best, current) => 
          current.averageRank < best.averageRank ? current : best
        )
      : null;

    const totalStudents = students.length;

    return {
      classInfo: {
        id: grade.id,
        name: `Tüm ${grade.name}. Sınıflar`,
        gradeName: grade.name,
        studentCount: totalStudents,
        classes: grade.classes.map(c => ({
          id: c.id,
          name: c.name,
          studentCount: c._count.students,
        })),
      },
      exams: exams.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date.toISOString(),
        type: e.type,
        participantCount: e.schoolParticipantCount || 0,
      })),
      students: studentRankings,
      statistics: {
        totalExams: exams.length,
        averageParticipation: exams.length > 0
          ? validStudents.reduce((sum, s) => sum + s.examsAttended, 0) / 
            (validStudents.length * exams.length) * 100
          : 0,
        topPerformer: topPerformer ? {
          studentId: topPerformer.studentId,
          fullName: topPerformer.fullName,
          averageRank: topPerformer.averageRank,
        } : null,
      },
    };
  }
}

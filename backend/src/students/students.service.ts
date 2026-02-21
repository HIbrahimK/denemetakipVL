import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as ExcelJS from 'exceljs';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    schoolId: string,
    query: {
      gradeId?: string;
      classId?: string;
      search?: string;
      className?: string;
    },
  ) {
    const { gradeId, classId, search, className } = query;

    // Parse className if provided (format: "12-B")
    let parsedGradeName: string | undefined;
    let parsedClassName: string | undefined;
    if (className) {
      const parts = className.split('-');
      if (parts.length === 2) {
        parsedGradeName = parts[0];
        parsedClassName = parts[1];
      }
    }

    return this.prisma.student.findMany({
      where: {
        schoolId,
        ...(classId && { classId }),
        ...(gradeId && {
          class: {
            gradeId,
          },
        }),
        ...(parsedGradeName &&
          parsedClassName && {
            class: {
              grade: {
                name: {
                  equals: parsedGradeName,
                  mode: 'insensitive',
                },
              },
              name: {
                equals: parsedClassName,
                mode: 'insensitive',
              },
            },
          }),
        ...(search && {
          OR: [
            { user: { firstName: { contains: search, mode: 'insensitive' } } },
            { user: { lastName: { contains: search, mode: 'insensitive' } } },
            { studentNumber: { contains: search, mode: 'insensitive' } },
            { tcNo: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        user: true,
        class: {
          include: {
            grade: true,
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

  async findOne(id: string, schoolId: string, requestingUser?: any) {
    if (requestingUser) {
      const isStudent = requestingUser.role === 'STUDENT';
      const isOwnData = requestingUser.student?.id === id;
      const isTeacherOrAdmin = [
        'TEACHER',
        'SCHOOL_ADMIN',
        'SUPER_ADMIN',
      ].includes(requestingUser.role);
      const isParent = requestingUser.role === 'PARENT';

      if (isStudent && !isOwnData) {
        throw new ForbiddenException(
          'Öğrenciler sadece kendi bilgilerini görüntüleyebilir',
        );
      }

      if (isParent) {
        const parent = await this.prisma.parent.findUnique({
          where: { userId: requestingUser.id },
          include: {
            students: {
              select: { id: true },
            },
          },
        });

        const hasAccess = parent?.students.some((s) => s.id === id);
        if (!hasAccess) {
          throw new ForbiddenException('Bu öğrenciye erişim yetkiniz yok');
        }
      }

      if (!isStudent && !isTeacherOrAdmin && !isParent) {
        throw new ForbiddenException('Bu kaynağa erişim yetkiniz yok');
      }
    }

    const student = await this.prisma.student.findFirst({
      where: { id, schoolId },
      include: {
        user: true,
        class: {
          include: {
            grade: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Öğrenci bulunamadı');
    }

    return student;
  }

  async create(schoolId: string, dto: CreateStudentDto) {
    // Check if student number exists in this school
    if (dto.studentNumber) {
      const existing = await this.prisma.student.findFirst({
        where: { studentNumber: dto.studentNumber, schoolId },
      });
      if (existing) {
        throw new ConflictException('Bu öğrenci numarası zaten kullanımda');
      }
    }

    // Check if TC exists
    if (dto.tcNo) {
      const existingTc = await this.prisma.student.findUnique({
        where: { tcNo: dto.tcNo },
      });
      if (existingTc) {
        throw new ConflictException('Bu TC numarası zaten kullanımda');
      }
    }

    // Find or create grade
    let grade = await this.prisma.grade.findFirst({
      where: { name: dto.gradeName, schoolId },
    });
    if (!grade) {
      grade = await this.prisma.grade.create({
        data: { name: dto.gradeName, schoolId },
      });
    }

    // Find or create class
    let studentClass = await this.prisma.class.findFirst({
      where: { name: dto.className, gradeId: grade.id, schoolId },
    });
    if (!studentClass) {
      studentClass = await this.prisma.class.create({
        data: { name: dto.className, gradeId: grade.id, schoolId },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password || '123456', 10);

    return this.prisma.user.create({
      data: {
        email: null,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: 'STUDENT',
        schoolId,
        student: {
          create: {
            studentNumber: dto.studentNumber,
            tcNo: dto.tcNo,
            classId: studentClass.id,
            schoolId,
          },
        },
      },
      include: {
        student: {
          include: {
            class: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, schoolId: string, dto: UpdateStudentDto) {
    const student = await this.findOne(id, schoolId);

    // If grade/class changed, update them
    let classId = student.classId;
    if (dto.gradeName || dto.className) {
      const gradeName = dto.gradeName || student.class.grade.name;
      const className = dto.className || student.class.name;

      let grade = await this.prisma.grade.findFirst({
        where: { name: gradeName, schoolId },
      });
      if (!grade) {
        grade = await this.prisma.grade.create({
          data: { name: gradeName, schoolId },
        });
      }

      let studentClass = await this.prisma.class.findFirst({
        where: { name: className, gradeId: grade.id, schoolId },
      });
      if (!studentClass) {
        studentClass = await this.prisma.class.create({
          data: { name: className, gradeId: grade.id, schoolId },
        });
      }
      classId = studentClass.id;
    }

    if (dto.firstName || dto.lastName) {
      await this.prisma.user.update({
        where: { id: student.userId },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        studentNumber: dto.studentNumber,
        tcNo: dto.tcNo,
        classId,
      },
      include: {
        user: true,
        class: {
          include: {
            grade: true,
          },
        },
      },
    });
  }

  async remove(id: string, schoolId: string) {
    const student = await this.findOne(id, schoolId);
    // Delete dependent exam attempts first to satisfy FK constraints
    await this.prisma.examAttempt.deleteMany({ where: { studentId: id } });

    // Delete student and associated user
    await this.prisma.student.delete({ where: { id } });
    await this.prisma.user.delete({ where: { id: student.userId } });

    return { success: true };
  }

  async bulkDelete(studentIds: string[], schoolId: string) {
    // Verify all students belong to this school
    const students = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId,
      },
      select: { id: true, userId: true },
    });

    if (students.length !== studentIds.length) {
      throw new NotFoundException(
        'Bazı öğrenciler bulunamadı veya farklı okula ait',
      );
    }

    const userIds = students.map((s) => s.userId);

    // Delete records in proper order to avoid FK constraint issues
    await this.prisma.$transaction(async (tx) => {
      await tx.examAttempt.deleteMany({
        where: { studentId: { in: studentIds } },
      });
      await tx.student.deleteMany({ where: { id: { in: studentIds } } });
      await tx.user.deleteMany({ where: { id: { in: userIds } } });
    });

    return {
      success: true,
      count: students.length,
      message: `${students.length} öğrenci silindi`,
    };
  }

  async bulkTransfer(
    studentIds: string[],
    schoolId: string,
    gradeName: string,
    className: string,
  ) {
    // Verify all students belong to this school
    const students = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
        schoolId,
      },
    });

    if (students.length !== studentIds.length) {
      throw new NotFoundException(
        'Bazı öğrenciler bulunamadı veya farklı okula ait',
      );
    }

    // Find or create grade
    let grade = await this.prisma.grade.findFirst({
      where: { name: gradeName, schoolId },
    });
    if (!grade) {
      grade = await this.prisma.grade.create({
        data: { name: gradeName, schoolId },
      });
    }

    // Find or create class
    let studentClass = await this.prisma.class.findFirst({
      where: { name: className, gradeId: grade.id, schoolId },
    });
    if (!studentClass) {
      studentClass = await this.prisma.class.create({
        data: { name: className, gradeId: grade.id, schoolId },
      });
    }

    // Update all students
    await this.prisma.student.updateMany({
      where: { id: { in: studentIds } },
      data: { classId: studentClass.id },
    });

    return {
      success: true,
      count: students.length,
      message: `${students.length} öğrenci ${gradeName} ${className} sınıfına aktarıldı`,
    };
  }

  async changePassword(id: string, schoolId: string, dto: ChangePasswordDto) {
    const student = await this.findOne(id, schoolId);
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: student.userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  }

  async changeParentPassword(
    id: string,
    schoolId: string,
    dto: ChangePasswordDto,
  ) {
    const student = await this.findOne(id, schoolId);

    // Check if student has a parent
    if (!student.parentId) {
      throw new NotFoundException('Bu öğrencinin velisi bulunamadı');
    }

    // Get parent user
    const parent = await this.prisma.parent.findUnique({
      where: { id: student.parentId },
      include: { user: true },
    });

    if (!parent) {
      throw new NotFoundException('Veli bulunamadı');
    }

    // Update parent password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: parent.userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Veli şifresi başarıyla değiştirildi' };
  }

  async importFromExcel(schoolId: string, buffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error('Excel sayfası bulunamadı.');

    const students: CreateStudentDto[] = [];
    // Row 1 is header
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex < 2) return;

      const firstName = row.getCell(1).text?.trim();
      const lastName = row.getCell(2).text?.trim();
      const studentNumber = row.getCell(3).text?.trim();
      const gradeName = row.getCell(4).text?.trim();
      const className = row.getCell(5).text?.trim();
      const password = row.getCell(6).text?.trim();

      if (firstName && lastName) {
        students.push({
          firstName,
          lastName,
          studentNumber: studentNumber?.toString(),
          gradeName: gradeName?.toString() || '',
          className: className?.toString() || '',
          password: password?.toString() || '123456',
        });
      }
    });

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const studentData of students) {
      try {
        await this.create(schoolId, studentData);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(
          `${studentData.firstName} ${studentData.lastName}: ${error.message}`,
        );
      }
    }

    return results;
  }

  async getFilters(schoolId: string) {
    const grades = await this.prisma.grade.findMany({
      where: { schoolId },
      include: {
        classes: true,
      },
      orderBy: { name: 'asc' },
    });

    return grades;
  }

  async getStudentExamHistory(
    studentId: string,
    schoolId: string,
    requestingUser?: any,
  ) {
    // Authorization check: Students can only access their own data
    if (requestingUser) {
      const isStudent = requestingUser.role === 'STUDENT';
      const isOwnData = requestingUser.student?.id === studentId;
      const isTeacherOrAdmin = [
        'TEACHER',
        'SCHOOL_ADMIN',
        'SUPER_ADMIN',
      ].includes(requestingUser.role);
      const isParent = requestingUser.role === 'PARENT';

      if (isStudent && !isOwnData) {
        throw new ForbiddenException(
          'Ogrenciler sadece kendi sonuclarini goruntuleyebilir',
        );
      }

      // Check if parent has access to this student
      if (isParent) {
        const parent = await this.prisma.parent.findUnique({
          where: { userId: requestingUser.id },
          include: {
            students: {
              select: { id: true },
            },
          },
        });

        const hasAccess = parent?.students.some((s) => s.id === studentId);
        if (!hasAccess) {
          throw new ForbiddenException(
            'Bu ogrencinin sonuclarina erisim yetkiniz yok',
          );
        }
      }

      if (!isStudent && !isTeacherOrAdmin && !isParent) {
        throw new ForbiddenException('Bu kaynaga erisim yetkiniz yok');
      }
    }

    // Get student with class info to determine grade level
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        class: {
          include: {
            grade: true,
          },
        },
        examAttempts: {
          include: {
            exam: {
              include: {
                _count: {
                  select: { attempts: true },
                },
              },
            },
            lessonResults: {
              include: {
                lesson: true,
              },
            },
            scores: true,
          },
          orderBy: {
            exam: {
              date: 'desc',
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Ogrenci bulunamadi');
    }

    // Extract grade level number from grade name (e.g., "5. Sinif" -> 5)
    const gradeName = student.class.grade.name;
    const gradeLevel = parseInt(gradeName.match(/\d+/)?.[0] || '0');

    // Active academic period is defined as June 1 -> May 31.
    const now = new Date();
    const activePeriod = this.getAcademicPeriodForDate(now);
    const activePeriodEnd = now < activePeriod.endDate ? now : activePeriod.endDate;

    // Get all exams for this school and grade level to find missed exams
    const allSchoolExams = await this.prisma.exam.findMany({
      where: {
        schoolId,
        isArchived: false,
        isPublished: true,
        // Only get exams for the same grade level
        gradeLevel: gradeLevel > 0 ? gradeLevel : undefined,
        date: {
          gte: activePeriod.startDate,
          lte: activePeriodEnd,
        },
      },
      include: {
        attempts: {
          where: {
            studentId,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Find exams student didn't take
    const missedExams = allSchoolExams
      .filter((exam) => exam.attempts.length === 0)
      .map((exam) => ({
        id: exam.id,
        title: exam.title,
        date: exam.date,
        type: exam.type,
        publisher: exam.publisher,
      }));

    // Build school/class comparison metrics for each exam in history
    const examIds = student.examAttempts.map((attempt) => attempt.examId);
    const examComparisonMap = new Map<
      string,
      {
        schoolAverageNet: number | null;
        classAverageNet: number | null;
        schoolAverageScoreByType: Record<string, number>;
        classAverageScoreByType: Record<string, number>;
      }
    >();

    if (examIds.length > 0) {
      const allExamAttempts = await this.prisma.examAttempt.findMany({
        where: {
          examId: { in: examIds },
          exam: { schoolId },
        },
        include: {
          student: {
            select: {
              classId: true,
            },
          },
          lessonResults: {
            select: {
              net: true,
            },
          },
          scores: {
            select: {
              type: true,
              score: true,
            },
          },
        },
      });

      type NetScoreBucket = {
        schoolNetTotal: number;
        schoolNetCount: number;
        classNetTotal: number;
        classNetCount: number;
        schoolScoresByType: Map<string, number[]>;
        classScoresByType: Map<string, number[]>;
      };

      const aggregateByExam = new Map<string, NetScoreBucket>();
      const studentClassId = student.classId;

      for (const attempt of allExamAttempts) {
        const existing = aggregateByExam.get(attempt.examId) ?? {
          schoolNetTotal: 0,
          schoolNetCount: 0,
          classNetTotal: 0,
          classNetCount: 0,
          schoolScoresByType: new Map<string, number[]>(),
          classScoresByType: new Map<string, number[]>(),
        };

        const attemptTotalNet = attempt.lessonResults.reduce(
          (sum, lesson) => sum + lesson.net,
          0,
        );
        existing.schoolNetTotal += attemptTotalNet;
        existing.schoolNetCount += 1;

        const isSameClass = attempt.student.classId === studentClassId;
        if (isSameClass) {
          existing.classNetTotal += attemptTotalNet;
          existing.classNetCount += 1;
        }

        for (const score of attempt.scores) {
          const schoolTypeScores =
            existing.schoolScoresByType.get(score.type) ?? [];
          schoolTypeScores.push(score.score);
          existing.schoolScoresByType.set(score.type, schoolTypeScores);

          if (isSameClass) {
            const classTypeScores =
              existing.classScoresByType.get(score.type) ?? [];
            classTypeScores.push(score.score);
            existing.classScoresByType.set(score.type, classTypeScores);
          }
        }

        aggregateByExam.set(attempt.examId, existing);
      }

      for (const [examId, aggregate] of aggregateByExam.entries()) {
        const schoolAverageScoreByType = Object.fromEntries(
          Array.from(aggregate.schoolScoresByType.entries()).map(
            ([type, scores]) => [
              type,
              scores.length > 0
                ? Number(
                    (
                      scores.reduce((sum, score) => sum + score, 0) /
                      scores.length
                    ).toFixed(2),
                  )
                : 0,
            ],
          ),
        );

        const classAverageScoreByType = Object.fromEntries(
          Array.from(aggregate.classScoresByType.entries()).map(
            ([type, scores]) => [
              type,
              scores.length > 0
                ? Number(
                    (
                      scores.reduce((sum, score) => sum + score, 0) /
                      scores.length
                    ).toFixed(2),
                  )
                : 0,
            ],
          ),
        );

        examComparisonMap.set(examId, {
          schoolAverageNet:
            aggregate.schoolNetCount > 0
              ? Number(
                  (aggregate.schoolNetTotal / aggregate.schoolNetCount).toFixed(
                    2,
                  ),
                )
              : null,
          classAverageNet:
            aggregate.classNetCount > 0
              ? Number(
                  (aggregate.classNetTotal / aggregate.classNetCount).toFixed(
                    2,
                  ),
                )
              : null,
          schoolAverageScoreByType,
          classAverageScoreByType,
        });
      }
    }

    // Process exam attempts
    const examHistory = student.examAttempts.map((attempt) => {
      // Calculate total net
      const totalNet = attempt.lessonResults.reduce(
        (sum, lr) => sum + lr.net,
        0,
      );

      // Group lesson results by lesson name
      const lessonResults = attempt.lessonResults.map((lr) => ({
        lessonName: lr.lesson.name,
        correct: lr.correct,
        incorrect: lr.incorrect,
        empty: lr.empty,
        net: lr.net,
        point: lr.point,
      }));

      // Process scores with rankings
      const scores = attempt.scores.map((score) => ({
        type: score.type,
        score: score.score,
        rankSchool: score.rankSchool,
        rankClass: score.rankClass,
        rankDistrict: score.rankDistrict,
        rankCity: score.rankCity,
        rankGen: score.rankGen,
      }));

      const primaryScoreType = scores.length > 0 ? scores[0].type : null;
      const comparison = examComparisonMap.get(attempt.exam.id);

      return {
        attemptId: attempt.id,
        examId: attempt.exam.id,
        examTitle: attempt.exam.title,
        examDate: attempt.exam.date,
        examType: attempt.exam.type,
        publisher: attempt.exam.publisher,
        answerKeyUrl: this.getPublicAnswerKeyUrl(attempt.exam, requestingUser),
        totalNet,
        lessonResults,
        scores,
        primaryScoreType,
        schoolAverageNet: comparison?.schoolAverageNet ?? null,
        classAverageNet: comparison?.classAverageNet ?? null,
        schoolAverageScore:
          primaryScoreType && comparison?.schoolAverageScoreByType
            ? (comparison.schoolAverageScoreByType[primaryScoreType] ?? null)
            : null,
        classAverageScore:
          primaryScoreType && comparison?.classAverageScoreByType
            ? (comparison.classAverageScoreByType[primaryScoreType] ?? null)
            : null,
        // Katilim sayilari - eger null ise attempts sayisindan hesapla
        schoolParticipantCount:
          attempt.exam.schoolParticipantCount ||
          attempt.exam._count?.attempts ||
          null,
        districtParticipantCount: attempt.exam.districtParticipantCount,
        cityParticipantCount: attempt.exam.cityParticipantCount,
        generalParticipantCount: attempt.exam.generalParticipantCount,
      };
    });

    // Calculate statistics
    const totalExams = examHistory.length;
    const highestScore =
      examHistory.length > 0
        ? Math.max(...examHistory.flatMap((e) => e.scores.map((s) => s.score)))
        : 0;

    // Calculate average rankings (school rank)
    const schoolRanks = examHistory.flatMap((e) =>
      e.scores.map((s) => s.rankSchool).filter((r) => r !== null),
    );
    const avgSchoolRank =
      schoolRanks.length > 0
        ? Math.round(
            schoolRanks.reduce((a, b) => a + (b || 0), 0) / schoolRanks.length,
          )
        : null;

    return {
      studentInfo: {
        id: student.id,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        studentNumber: student.studentNumber,
        className: student.class.name,
        gradeName: student.class.grade.name,
      },
      statistics: {
        totalExams,
        highestScore,
        avgSchoolRank,
      },
      activeAcademicPeriod: {
        label: activePeriod.label,
        startDate: activePeriod.startDate,
        endDate: activePeriod.endDate,
      },
      examHistory,
      missedExams,
    };
  }

  private getAcademicPeriodForDate(referenceDate: Date) {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth(); // 0-indexed

    // June (5) starts new academic period
    const startYear = month >= 5 ? year : year - 1;
    const endYear = startYear + 1;

    const startDate = new Date(startYear, 5, 1, 0, 0, 0, 0); // June 1
    const endDate = new Date(endYear, 4, 31, 23, 59, 59, 999); // May 31

    return {
      startDate,
      endDate,
      label: `${startYear}-${endYear}`,
    };
  }

  private getPublicAnswerKeyUrl(exam: any, requestingUser?: any) {
    if (!exam?.answerKeyUrl) return null;

    const role = requestingUser?.role;
    const isStaff = ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'].includes(role);
    const isStudentOrParent = ['STUDENT', 'PARENT'].includes(role);

    if (isStaff) {
      return `/exams/${exam.id}/answer-key`;
    }

    if (isStudentOrParent) {
      return `/exams/${exam.id}/answer-key`;
    }

    return null;
  }
}

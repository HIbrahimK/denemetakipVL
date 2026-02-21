import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Normalize class name to handle various formats: 12B, 12/B, 12-B -> 12-B
   */
  private normalizeClassName(className: string): string {
    return className.toUpperCase().replace(/[/\s]/g, '-');
  }

  async globalSearch(query: string, schoolId: string) {
    const searchTerm = query.trim();
    const normalizedClassName = this.normalizeClassName(searchTerm);
    const studentClassParts = normalizedClassName.split('-');

    // Build student search conditions
    const studentOrConditions: any[] = [
      {
        user: {
          firstName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      },
      {
        user: {
          lastName: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      },
      {
        studentNumber: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
    ];

    // If it looks like a grade-class format (e.g., "8-B"), use exact match
    if (studentClassParts.length === 2) {
      const gradeName = studentClassParts[0];
      const className = studentClassParts[1];
      studentOrConditions.push({
        class: {
          grade: {
            name: {
              equals: gradeName,
              mode: 'insensitive',
            },
          },
          name: {
            equals: className,
            mode: 'insensitive',
          },
        },
      });
    } else {
      // Fallback to contains search
      studentOrConditions.push(
        {
          class: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
        {
          class: {
            grade: {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        },
      );
    }

    // Search students by name or student number
    const students = await this.prisma.student.findMany({
      where: {
        schoolId,
        OR: studentOrConditions,
      },
      select: {
        id: true,
        studentNumber: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        class: {
          select: {
            name: true,
            grade: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: 20,
    });

    // Search exams by title
    const exams = await this.prisma.exam.findMany({
      where: {
        schoolId,
        title: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        title: true,
        date: true,
        type: true,
        gradeLevel: true,
      },
      take: 10,
    });

    // Get unique classes matching the search
    // Try to parse as Grade-Class format (e.g., "8-B")
    const examClassParts = normalizedClassName.split('-');
    const classesQuery: any = {
      schoolId,
    };

    if (examClassParts.length === 2) {
      // Exact match for Grade-Class format
      const gradeName = examClassParts[0];
      const className = examClassParts[1];
      classesQuery.grade = {
        name: {
          equals: gradeName,
          mode: 'insensitive',
        },
      };
      classesQuery.name = {
        equals: className,
        mode: 'insensitive',
      };
    } else {
      // Fallback to contains search
      classesQuery.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          grade: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const classes = await this.prisma.class.findMany({
      where: classesQuery,
      include: {
        grade: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
      take: 10,
    });

    return {
      students: students.map((s) => ({
        id: s.id,
        firstName: s.user.firstName,
        lastName: s.user.lastName,
        studentNumber: s.studentNumber,
        className: `${s.class.grade.name}-${s.class.name}`,
        type: 'student',
        label: `${s.user.firstName} ${s.user.lastName} (${s.studentNumber})`,
        subtitle: `${s.class.grade.name}-${s.class.name}`,
      })),
      exams: exams.map((e) => ({
        ...e,
        type: 'exam',
        label: e.title,
        subtitle: `${e.type} - ${e.gradeLevel}. Sınıf`,
      })),
      classes: classes.map((c) => ({
        className: `${c.grade.name}-${c.name}`,
        studentCount: c._count.students,
        type: 'class',
        label: `${c.grade.name}-${c.name}`,
        subtitle: `${c._count.students} öğrenci`,
      })),
    };
  }

  async autocomplete(query: string, schoolId: string) {
    const searchTerm = query.trim();
    const normalizedClassName = this.normalizeClassName(searchTerm);

    const [students, exams, classes] = await Promise.all([
      // Top 5 students
      this.prisma.student.findMany({
        where: {
          schoolId,
          OR: [
            {
              user: {
                firstName: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
            {
              user: {
                lastName: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
            {
              studentNumber: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          studentNumber: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          class: {
            select: {
              name: true,
              grade: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        take: 5,
      }),

      // Top 3 exams
      this.prisma.exam.findMany({
        where: {
          schoolId,
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          title: true,
          type: true,
        },
        take: 3,
      }),

      // Top 3 classes
      (async () => {
        // Try to parse as Grade-Class format (e.g., "8-B")
        const classSearchParts = normalizedClassName.split('-');
        const classesQuery: any = {
          schoolId,
        };

        if (classSearchParts.length === 2) {
          // Exact match for Grade-Class format
          const gradeName = classSearchParts[0];
          const className = classSearchParts[1];
          classesQuery.grade = {
            name: {
              equals: gradeName,
              mode: 'insensitive',
            },
          };
          classesQuery.name = {
            equals: className,
            mode: 'insensitive',
          };
        } else {
          // Fallback to contains search
          classesQuery.OR = [
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              grade: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            },
          ];
        }

        return this.prisma.class.findMany({
          where: classesQuery,
          include: {
            grade: true,
            _count: {
              select: {
                students: true,
              },
            },
          },
          take: 3,
        });
      })(),
    ]);

    const results: any[] = [];

    students.forEach((s) => {
      results.push({
        id: s.id,
        type: 'student',
        label: `${s.user.firstName} ${s.user.lastName}`,
        subtitle: `${s.studentNumber} - ${s.class.grade.name}-${s.class.name}`,
        icon: 'user',
      });
    });

    exams.forEach((e) => {
      results.push({
        id: e.id,
        type: 'exam',
        label: e.title,
        subtitle: e.type,
        icon: 'book',
      });
    });

    classes.forEach((c) => {
      results.push({
        type: 'class',
        className: `${c.grade.name}-${c.name}`,
        label: `${c.grade.name}-${c.name}`,
        subtitle: `${c._count.students} öğrenci`,
        icon: 'users',
      });
    });

    return results;
  }
}

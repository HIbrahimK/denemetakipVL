import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  async getParentStudents(userId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
      include: {
        students: {
          include: {
            user: true,
            class: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return { students: [] };
    }

    return {
      students: parent.students.map((student) => ({
        id: student.id,
        studentNumber: student.studentNumber,
        tcNo: student.tcNo,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        className: student.class.name,
        gradeName: student.class.grade.name,
      })),
    };
  }
}

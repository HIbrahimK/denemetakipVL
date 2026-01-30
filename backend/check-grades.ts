import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGrades() {
  try {
    const grades = await prisma.grade.findMany({
      include: {
        classes: true,
      },
    });

    console.log('Grades found:', grades.length);
    console.log(JSON.stringify(grades, null, 2));

    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    console.log('\nSchools:', schools);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGrades();

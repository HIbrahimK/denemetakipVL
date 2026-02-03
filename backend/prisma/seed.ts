import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Hash default password
    const defaultPassword = await bcrypt.hash('12345', 10);

    // Create or get school
    let school = await prisma.school.findFirst();

    if (!school) {
        school = await prisma.school.create({
            data: {
                name: 'DenemeTakip.net',
                logoUrl: null,
            },
        });
        console.log('✅ School created:', school.name);
    } else {
        console.log('✅ Using existing school:', school.name);
    }

    // Create Grades (5-12) with numeric names for consistency
    const gradeLevels = ['5', '6', '7', '8', '9', '10', '11', '12'];
    
    const gradeMap: { [key: string]: string } = {};
    
    for (const gradeName of gradeLevels) {
        let grade = await prisma.grade.findFirst({
            where: { name: gradeName, schoolId: school.id },
        });

        if (!grade) {
            grade = await prisma.grade.create({
                data: {
                    name: gradeName,
                    schoolId: school.id,
                },
            });
            console.log('✅ Grade created:', grade.name);
        }
        gradeMap[gradeName] = grade.id;

        // Create sample classes for each grade (A, B sections)
        const sectionNames = ['A', 'B'];
        for (const section of sectionNames) {
            let classRoom = await prisma.class.findFirst({
                where: { name: section, gradeId: grade.id },
            });

            if (!classRoom) {
                classRoom = await prisma.class.create({
                    data: {
                        name: section,
                        gradeId: grade.id,
                        schoolId: school.id,
                    },
                });
                console.log('✅ Class created:', `${gradeName}-${section}`);
            }
        }
    }

    // 1. Create School Admin User
    const adminEmail = 'admin@test.com';
    let adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!adminUser) {
        adminUser = await prisma.user.create({
            data: {
                email: adminEmail,
                password: defaultPassword,
                firstName: 'Okul',
                lastName: 'Yöneticisi',
                role: 'SCHOOL_ADMIN',
                schoolId: school.id,
            },
        });
        console.log('✅ School Admin created: admin@test.com / 12345');
    } else {
        // Update password to ensure it's hashed
        await prisma.user.update({
            where: { id: adminUser.id },
            data: { password: defaultPassword },
        });
        console.log('✅ School Admin exists (password updated): admin@test.com / 12345');
    }

    // 2. Create Teacher User
    const teacherEmail = 'teacher@test.com';
    let teacherUser = await prisma.user.findUnique({
        where: { email: teacherEmail },
    });

    if (!teacherUser) {
        teacherUser = await prisma.user.create({
            data: {
                email: teacherEmail,
                password: defaultPassword,
                firstName: 'Test',
                lastName: 'Öğretmen',
                role: 'TEACHER',
                branch: 'Matematik',
                schoolId: school.id,
            },
        });
        console.log('✅ Teacher created: teacher@test.com / 1234 (Matematik Öğretmeni)');
    } else {
        await prisma.user.update({
            where: { id: teacherUser.id },
            data: {
                password: defaultPassword,
                branch: 'Matematik'
            },
        });
        console.log('✅ Teacher exists (password updated): teacher@test.com / 1234');
    }

    // 3. Create Student User (using 12-A class)
    const studentNumber = '2024001';
    const class12A = gradeMap['12'] ? (
        await prisma.class.findFirst({
            where: { name: 'A', gradeId: gradeMap['12'] },
        })
    ) : null;

    let studentUser = await prisma.user.findFirst({
        where: {
            student: {
                studentNumber: studentNumber,
            },
        },
        include: { student: true },
    });

    if (!studentUser && class12A) {
        studentUser = await prisma.user.create({
            data: {
                email: 'student1@test.com',
                password: defaultPassword,
                firstName: 'Ahmet',
                lastName: 'Yılmaz',
                role: 'STUDENT',
                schoolId: school.id,
                student: {
                    create: {
                        studentNumber: studentNumber,
                        tcNo: '12345678901',
                        schoolId: school.id,
                        classId: class12A.id,
                    },
                },
            },
            include: { student: true },
        });
        console.log(`✅ Student created: ${studentNumber} / 1234`);
    } else if (studentUser) {
        await prisma.user.update({
            where: { id: studentUser.id },
            data: { password: defaultPassword },
        });
        console.log(`✅ Student exists (password updated): ${studentNumber} / 1234`);
    }

    // 4. Create Parent User
    const parentStudentNumber = studentNumber; // Parent logs in with student number
    
    // Get student ID separately
    const student = class12A ? await prisma.student.findFirst({
        where: { studentNumber: parentStudentNumber, classId: class12A.id },
    }) : null;

    let parentUser = await prisma.user.findFirst({
        where: {
            role: 'PARENT',
            parent: {
                students: {
                    some: {
                        studentNumber: parentStudentNumber,
                    },
                },
            },
        },
        include: {
            parent: {
                include: {
                    students: true,
                },
            },
        },
    });

    if (!parentUser && student) {
        parentUser = await prisma.user.create({
            data: {
                email: 'parent1@test.com',
                password: defaultPassword,
                firstName: 'Mehmet',
                lastName: 'Yılmaz',
                role: 'PARENT',
                schoolId: school.id,
                parent: {
                    create: {
                        students: {
                            connect: {
                                id: student.id,
                            },
                        },
                    },
                },
            },
            include: {
                parent: {
                    include: {
                        students: true,
                    },
                },
            },
        });
        console.log(`✅ Parent created: ${parentStudentNumber} (öğrenci no ile giriş) / 1234`);
    } else if (parentUser) {
        await prisma.user.update({
            where: { id: parentUser.id },
            data: { password: defaultPassword },
        });
        console.log(`✅ Parent exists (password updated): ${parentStudentNumber} / 1234`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 5. Create Subjects and Topics
    console.log('\n📚 Creating Subjects and Topics...');

    interface SubjectDef {
        name: string;
        examType: string;
        type?: string;
        gradeLevels: number[];
        topics?: string[];
    }

    const subjects: SubjectDef[] = [
        { name: 'Matematik', examType: 'TYT', gradeLevels: [9, 10, 11, 12] },
        { name: 'Türkçe', examType: 'TYT', gradeLevels: [9, 10, 11, 12] },
        { name: 'Fizik', examType: 'AYT', gradeLevels: [11, 12] },
        { name: 'Kimya', examType: 'AYT', gradeLevels: [11, 12] },
        { name: 'Biyoloji', examType: 'AYT', gradeLevels: [11, 12] },
        { name: 'Tarih', examType: 'TYT', gradeLevels: [9, 10, 11, 12] },
        { name: 'Coğrafya', examType: 'TYT', gradeLevels: [9, 10, 11, 12] },
        {
            name: 'Aktiviteler',
            examType: 'GENEL',
            type: 'ACTIVITY',
            gradeLevels: [9, 10, 11, 12],
            topics: ['MEBİ DENEMESİ', 'TYT DENEMESİ', 'AYT DENEMESİ', 'MSÜ DENEMESİ']
        }
    ];

    for (const sub of subjects) {
        let subject = await prisma.subject.findFirst({
            where: { name: sub.name, examType: sub.examType }
        });

        if (!subject) {
            subject = await prisma.subject.create({
                data: {
                    name: sub.name,
                    examType: sub.examType,
                    gradeLevels: sub.gradeLevels,
                    type: sub.type || 'NORMAL',
                    isActive: true
                }
            });
            console.log(`✅ Subject created: ${sub.name}`);
        }

        // Add standard special topics for normal subjects
        if (sub.type !== 'ACTIVITY') {
            const specialTopics = [
                { name: `${sub.name} Branş Denemesi`, isSpecialActivity: true },
                { name: `${sub.name} Konu Tekrarı`, isSpecialActivity: true }
            ];

            for (const t of specialTopics) {
                const existing = await prisma.topic.findFirst({
                    where: { subjectId: subject.id, name: t.name }
                });

                if (!existing) {
                    await prisma.topic.create({
                        data: {
                            name: t.name,
                            subjectId: subject.id,
                            isSpecialActivity: t.isSpecialActivity,
                            order: 999
                        }
                    });
                    console.log(`   + Topic created: ${t.name}`);
                }
            }
        } else if (sub.topics) {
            // Add defined topics for Activity subject
            for (const tName of sub.topics) {
                const existing = await prisma.topic.findFirst({
                    where: { subjectId: subject.id, name: tName }
                });

                if (!existing) {
                    await prisma.topic.create({
                        data: {
                            name: tName,
                            subjectId: subject.id,
                            isSpecialActivity: true,
                            order: 0
                        }
                    });
                    console.log(`   + Activity Topic created: ${tName}`);
                }
            }
        }
    }
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

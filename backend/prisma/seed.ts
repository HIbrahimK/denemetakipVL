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

    // Create Grade and Class
    let grade = await prisma.grade.findFirst({
        where: { schoolId: school.id },
    });

    if (!grade) {
        grade = await prisma.grade.create({
            data: {
                name: '12. Sınıf',
                schoolId: school.id,
            },
        });
        console.log('✅ Grade created:', grade.name);
    }

    let classRoom = await prisma.class.findFirst({
        where: { gradeId: grade.id },
    });

    if (!classRoom) {
        classRoom = await prisma.class.create({
            data: {
                name: '12-A',
                gradeId: grade.id,
                schoolId: school.id,
            },
        });
        console.log('✅ Class created:', classRoom.name);
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
                schoolId: school.id,
            },
        });
        console.log('✅ Teacher created: teacher@test.com / 1234');
    } else {
        await prisma.user.update({
            where: { id: teacherUser.id },
            data: { password: defaultPassword },
        });
        console.log('✅ Teacher exists (password updated): teacher@test.com / 1234');
    }

    // 3. Create Student User
    const studentNumber = '2024001';
    let studentUser = await prisma.user.findFirst({
        where: {
            student: {
                studentNumber: studentNumber,
            },
        },
        include: { student: true },
    });

    if (!studentUser) {
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
                        classId: classRoom.id,
                    },
                },
            },
            include: { student: true },
        });
        console.log(`✅ Student created: ${studentNumber} / 1234`);
    } else {
        await prisma.user.update({
            where: { id: studentUser.id },
            data: { password: defaultPassword },
        });
        console.log(`✅ Student exists (password updated): ${studentNumber} / 1234`);
    }

    // 4. Create Parent User
    const parentStudentNumber = studentNumber; // Parent logs in with student number
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

    if (!parentUser) {
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
                                id: studentUser.student!.id,
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
    } else {
        await prisma.user.update({
            where: { id: parentUser.id },
            data: { password: defaultPassword },
        });
        console.log(`✅ Parent exists (password updated): ${parentStudentNumber} / 1234`);
    }

    console.log('\n📋 Test Kullanıcıları:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏫 Okul Yöneticisi:');
    console.log('   Email: admin@test.com');
    console.log('   Şifre: 12345');
    console.log('');
    console.log('👨‍🏫 Öğretmen:');
    console.log('   Email: teacher@test.com');
    console.log('   Şifre: 1234');
    console.log('');
    console.log('🎓 Öğrenci:');
    console.log('   Öğrenci No: 2024001');
    console.log('   Şifre: 1234');
    console.log('');
    console.log('👨‍👩‍👧 Veli:');
    console.log('   Öğrenci No: 2024001 (öğrencinin numarası)');
    console.log('   Şifre: 1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

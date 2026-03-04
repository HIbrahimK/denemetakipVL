import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SUPER_ADMIN user...');

  const email = 'superadmin@denemetakip.net';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Get or create a school (SUPER_ADMIN still needs a schoolId due to schema)
  let school = await prisma.school.findFirst();

  if (!school) {
    school = await prisma.school.create({
      data: {
        name: 'DenemeTakip.net',
        code: 'DENEMETAKIP',
        logoUrl: null,
      },
    });
    console.log('✅ Default school created:', school.name);
  }

  // Upsert SUPER_ADMIN user
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✅ SUPER_ADMIN updated (password reset)');
  } else {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        schoolId: school.id,
        isActive: true,
      },
    });
    console.log('✅ SUPER_ADMIN created');
  }

  console.log('');
  console.log('========================================');
  console.log('  SUPER ADMIN GİRİŞ BİLGİLERİ');
  console.log('========================================');
  console.log(`  Email:    ${email}`);
  console.log(`  Şifre:    ${password}`);
  console.log(`  Giriş:    http://localhost:3002/giris`);
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

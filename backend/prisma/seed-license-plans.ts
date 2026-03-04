import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLicensePlans() {
  console.log('🏷️  Lisans planları ekleniyor...');

  const plans = [
    {
      name: 'Başlangıç',
      maxStudents: 100,
      maxUsers: 10,
      maxStorage: 1024, // 1 GB
      monthlyPrice: 499,
      yearlyPrice: 4790,
      features: {
        basicReports: true,
        advancedReports: false,
        messaging: true,
        studyPlans: false,
        achievements: false,
        pushNotifications: false,
        emailSupport: true,
        whatsappSupport: false,
        prioritySupport: false,
      },
    },
    {
      name: 'Profesyonel',
      maxStudents: 500,
      maxUsers: 50,
      maxStorage: 10240, // 10 GB
      monthlyPrice: 999,
      yearlyPrice: 9590,
      features: {
        basicReports: true,
        advancedReports: true,
        messaging: true,
        studyPlans: true,
        achievements: true,
        pushNotifications: true,
        emailSupport: true,
        whatsappSupport: true,
        prioritySupport: false,
      },
    },
    {
      name: 'Kurumsal',
      maxStudents: -1, // sınırsız
      maxUsers: -1,
      maxStorage: 102400, // 100 GB
      monthlyPrice: 0, // özel teklif
      yearlyPrice: 0,
      features: {
        basicReports: true,
        advancedReports: true,
        messaging: true,
        studyPlans: true,
        achievements: true,
        pushNotifications: true,
        emailSupport: true,
        whatsappSupport: true,
        prioritySupport: true,
        customDevelopment: true,
        sla: true,
        dedicatedSupport: true,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.licensePlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✅ ${plan.name} planı oluşturuldu`);
  }

  console.log('✅ Lisans planları tamamlandı!\n');
}

seedLicensePlans()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

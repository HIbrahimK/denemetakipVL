// TYT Geometri Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('TYT Geometri dersi ve konuları ekleniyor...');

  // TYT Geometri Dersini oluştur
  const geometriSubject = await prisma.subject.create({
    data: {
      name: 'Geometri',
      examType: ExamType.TYT,
      gradeLevels: [9, 10, 11, 12],
      order: 3,
      isActive: true,
    },
  });

  console.log(`Geometri dersi oluşturuldu: ${geometriSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Doğruda ve Üçgende Açılar',
      order: 1,
      children: [],
    },
    {
      name: 'Üçgende Kenarlar',
      order: 2,
      children: [],
    },
    {
      name: 'Özel Üçgenler',
      order: 3,
      children: [
        { name: 'İkizkenar Üçgen', order: 1 },
        { name: 'Eşkenar Üçgen', order: 2 },
        { name: 'Dik Üçgen', order: 3 },
        { name: '30-60-90 Üçgeni', order: 4 },
        { name: '45-45-90 Üçgeni', order: 5 },
      ],
    },
    {
      name: 'Üçgende Alanlar',
      order: 4,
      children: [],
    },
    {
      name: 'Üçgende Açıortay ve Kenarortay',
      order: 5,
      children: [],
    },
    {
      name: 'Üçgende Eşlik ve Benzerlik',
      order: 6,
      children: [],
    },
    {
      name: 'Dik Üçgende Trigonometrik Bağıntılar',
      order: 7,
      children: [],
    },
    {
      name: 'Üçgende Çevrel Çember ve İç Teğet Çember',
      order: 8,
      children: [],
    },
    {
      name: 'Çokgenler',
      order: 9,
      children: [
        { name: 'Dörtgenler', order: 1 },
        { name: 'Paralelkenar', order: 2 },
        { name: 'Eşkenar Dörtgen', order: 3 },
        { name: 'Dikdörtgen', order: 4 },
        { name: 'Kare', order: 5 },
        { name: 'Yamuk', order: 6 },
        { name: 'Kirisler Dörtgeni', order: 7 },
      ],
    },
    {
      name: 'Çemberde Açılar',
      order: 10,
      children: [],
    },
    {
      name: 'Çemberde Uzunluklar',
      order: 11,
      children: [],
    },
    {
      name: 'Dairenin Çevresi ve Alanı',
      order: 12,
      children: [],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    const parentTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: geometriSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu eklendi: ${konu.name}`);

    // Alt konuları ekle
    for (const child of konu.children) {
      await prisma.topic.create({
        data: {
          name: child.name,
          subjectId: geometriSubject.id,
          parentTopicId: parentTopic.id,
          order: child.order,
        },
      });
      console.log(`    Alt konu eklendi: ${child.name}`);
    }
  }

  console.log('\nTYT Geometri konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

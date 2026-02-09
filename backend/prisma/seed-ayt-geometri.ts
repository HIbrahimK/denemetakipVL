// AYT Geometri Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AYT Geometri dersi ve konuları ekleniyor...');

  // AYT Geometri Dersini kontrol et veya oluştur
  let geometriSubject = await prisma.subject.findFirst({
    where: { name: 'Geometri', examType: ExamType.AYT },
  });

  if (!geometriSubject) {
    geometriSubject = await prisma.subject.create({
      data: {
        name: 'Geometri',
        examType: ExamType.AYT,
        gradeLevels: [9, 10, 11, 12],
        order: 2,
        isActive: true,
      },
    });
    console.log(`AYT Geometri dersi oluşturuldu: ${geometriSubject.id}`);
  } else {
    console.log(`AYT Geometri dersi zaten mevcut: ${geometriSubject.id}`);
  }

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Üçgenler',
      order: 1,
      children: [],
    },
    {
      name: 'Üçgende Açılar',
      order: 2,
      children: [],
    },
    {
      name: 'Üçgende Alanlar',
      order: 3,
      children: [],
    },
    {
      name: 'Üçgende Açıortay ve Kenarortay',
      order: 4,
      children: [],
    },
    {
      name: 'Dik Üçgende Trigonometrik Bağıntılar',
      order: 5,
      children: [],
    },
    {
      name: 'İkizkenar ve Eşkenar Üçgen',
      order: 6,
      children: [],
    },
    {
      name: 'Üçgende Eşlik ve Benzerlik',
      order: 7,
      children: [],
    },
    {
      name: 'Üçgende Açı-Kenar Bağıntıları',
      order: 8,
      children: [],
    },
    {
      name: 'Çokgenler',
      order: 9,
      children: [],
    },
    {
      name: 'Dörtgenler',
      order: 10,
      children: [],
    },
    {
      name: 'Yamuk',
      order: 11,
      children: [],
    },
    {
      name: 'Paralelkenar',
      order: 12,
      children: [],
    },
    {
      name: 'Dikdörtgen',
      order: 13,
      children: [],
    },
    {
      name: 'Eşkenar Dörtgen ve Kare',
      order: 14,
      children: [],
    },
    {
      name: 'Çemberde Açılar',
      order: 15,
      children: [],
    },
    {
      name: 'Çemberde Uzunluk',
      order: 16,
      children: [],
    },
    {
      name: 'Daire',
      order: 17,
      children: [],
    },
    {
      name: 'Analitik Geometri - Nokta ve Doğru',
      order: 18,
      children: [],
    },
    {
      name: 'Doğrunun Analitik İncelenmesi',
      order: 19,
      children: [],
    },
    {
      name: 'Çemberin Analitik İncelenmesi',
      order: 20,
      children: [],
    },
    {
      name: 'Koordinat Dönüşümleri',
      order: 21,
      children: [],
    },
    {
      name: 'Uzay Geometri',
      order: 22,
      children: [],
    },
    {
      name: 'Katı Cisimler',
      order: 23,
      children: [],
    },
    {
      name: 'Prizma',
      order: 24,
      children: [],
    },
    {
      name: 'Piramit',
      order: 25,
      children: [],
    },
    {
      name: 'Küre',
      order: 26,
      children: [],
    },
    {
      name: 'Koni ve Silindir',
      order: 27,
      children: [],
    },
    {
      name: 'Vektörler',
      order: 28,
      children: [],
    },
    {
      name: 'Vektörlerde Çarpma İşlemleri',
      order: 29,
      children: [],
    },
    {
      name: 'Doğru ve Düzlemin Analitik İncelenmesi',
      order: 30,
      children: [],
    },
    {
      name: 'Açı ve Açı Ölçüleri',
      order: 31,
      children: [],
    },
    {
      name: 'Doğru ve Açılar',
      order: 32,
      children: [],
    },
    {
      name: 'Düzlemde Doğruların Konumları',
      order: 33,
      children: [],
    },
    {
      name: 'Özel Üçgenler',
      order: 34,
      children: [
        { name: '30-60-90 Üçgeni', order: 1 },
        { name: '45-45-90 Üçgeni', order: 2 },
      ],
    },
    {
      name: 'Trigonometri',
      order: 35,
      children: [
        { name: 'Trigonometrik Fonksiyonlar', order: 1 },
        { name: 'Trigonometrik Denklemler', order: 2 },
        { name: 'Trigonometrik Oranlar', order: 3 },
      ],
    },
    {
      name: 'Geometrik Cisimler',
      order: 36,
      children: [],
    },
    {
      name: 'Yansıma ve Dönüşüm Geometrisi',
      order: 37,
      children: [],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    let parentTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: geometriSubject.id, parentTopicId: null },
    });

    if (!parentTopic) {
      parentTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: geometriSubject.id,
          order: konu.order,
        },
      });
      console.log(`  Ana konu eklendi: ${konu.name}`);
    } else {
      console.log(`  Ana konu zaten mevcut: ${konu.name}`);
    }

    // Alt konuları ekle
    for (const child of konu.children) {
      const existingChild = await prisma.topic.findFirst({
        where: { name: child.name, subjectId: geometriSubject.id, parentTopicId: parentTopic.id },
      });

      if (!existingChild) {
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
  }

  console.log('\nAYT Geometri konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

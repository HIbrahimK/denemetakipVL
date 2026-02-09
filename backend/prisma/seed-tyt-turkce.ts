// TYT Türkçe Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('TYT Türkçe dersi ve konuları ekleniyor...');

  // TYT Türkçe Dersini oluştur veya güncelle
  let turkceSubject = await prisma.subject.findFirst({
    where: { name: 'Türkçe', examType: ExamType.TYT },
  });

  if (!turkceSubject) {
    turkceSubject = await prisma.subject.create({
      data: {
        name: 'Türkçe',
        examType: ExamType.TYT,
        gradeLevels: [9, 10, 11, 12],
        order: 1,
        isActive: true,
      },
    });
    console.log(`Türkçe dersi oluşturuldu: ${turkceSubject.id}`);
  } else {
    console.log(`Türkçe dersi zaten mevcut: ${turkceSubject.id}`);
  }

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Sözcükte Anlam',
      order: 1,
      children: [
        { name: 'Söz Yorumu', order: 1 },
        { name: 'Deyim ve Atasözü', order: 2 },
      ],
    },
    {
      name: 'Cümlede Anlam',
      order: 2,
      children: [],
    },
    {
      name: 'Paragraf',
      order: 3,
      children: [
        { name: 'Paragrafta Anlatım Teknikleri', order: 1 },
        { name: 'Paragrafta Düşünceyi Geliştirme Yolları', order: 2 },
        { name: 'Paragrafta Yapı', order: 3 },
        { name: 'Paragrafta Konu-Ana Düşünce', order: 4 },
        { name: 'Paragrafta Yardımcı Düşünce', order: 5 },
      ],
    },
    {
      name: 'Ses Bilgisi',
      order: 4,
      children: [],
    },
    {
      name: 'Yazım Kuralları',
      order: 5,
      children: [],
    },
    {
      name: 'Noktalama İşaretleri',
      order: 6,
      children: [],
    },
    {
      name: 'Sözcükte Yapı/Ekler',
      order: 7,
      children: [],
    },
    {
      name: 'Sözcük Türleri',
      order: 8,
      children: [
        { name: 'İsimler', order: 1 },
        { name: 'Zamirler', order: 2 },
        { name: 'Sıfatlar', order: 3 },
        { name: 'Zarflar', order: 4 },
        { name: 'Edat – Bağlaç – Ünlem', order: 5 },
        { name: 'Fiiller', order: 6 },
      ],
    },
    {
      name: 'Fiilde Anlam (Kip-Kişi-Yapı)',
      order: 9,
      children: [],
    },
    {
      name: 'Ek Fiil',
      order: 10,
      children: [],
    },
    {
      name: 'Fiilimsi',
      order: 11,
      children: [],
    },
    {
      name: 'Fiilde Çatı',
      order: 12,
      children: [],
    },
    {
      name: 'Sözcük Grupları',
      order: 13,
      children: [],
    },
    {
      name: 'Cümlenin Ögeleri',
      order: 14,
      children: [],
    },
    {
      name: 'Cümle Türleri',
      order: 15,
      children: [],
    },
    {
      name: 'Anlatım Bozukluğu',
      order: 16,
      children: [],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    let parentTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: turkceSubject.id, parentTopicId: null },
    });

    if (!parentTopic) {
      parentTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: turkceSubject.id,
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
        where: { name: child.name, subjectId: turkceSubject.id, parentTopicId: parentTopic.id },
      });

      if (!existingChild) {
        await prisma.topic.create({
          data: {
            name: child.name,
            subjectId: turkceSubject.id,
            parentTopicId: parentTopic.id,
            order: child.order,
          },
        });
        console.log(`    Alt konu eklendi: ${child.name}`);
      }
    }
  }

  console.log('\nTYT Türkçe konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

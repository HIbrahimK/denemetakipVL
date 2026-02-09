// TYT Biyoloji Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('TYT Biyoloji dersi ve konuları ekleniyor...');

  // TYT Biyoloji Dersini oluştur veya güncelle
  let biyolojiSubject = await prisma.subject.findFirst({
    where: { name: 'Biyoloji', examType: ExamType.TYT },
  });

  if (!biyolojiSubject) {
    biyolojiSubject = await prisma.subject.create({
      data: {
        name: 'Biyoloji',
        examType: ExamType.TYT,
        gradeLevels: [9, 10, 11, 12],
        order: 6,
        isActive: true,
      },
    });
    console.log(`Biyoloji dersi oluşturuldu: ${biyolojiSubject.id}`);
  } else {
    console.log(`Biyoloji dersi zaten mevcut: ${biyolojiSubject.id}`);
  }

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Biyoloji Bilimi',
      order: 1,
      children: [
        { name: 'Biyolojinin Kapsamı ve Önemi', order: 1 },
        { name: 'Canlıların Ortak Özellikleri', order: 2 },
        { name: 'Canlıların Sınıflandırılması', order: 3 },
        { name: 'Biyolojinin Alt Dalları', order: 4 },
      ],
    },
    {
      name: 'Hücre ve Organeller',
      order: 2,
      children: [
        { name: 'Hücre Teorisi', order: 1 },
        { name: 'Prokaryot ve Ökaryot Hücre', order: 2 },
        { name: 'Hücre Zarı ve Yapısı', order: 3 },
        { name: 'Sitoplazma ve Organeller', order: 4 },
        { name: 'Hücre Çekirdeği', order: 5 },
      ],
    },
    {
      name: 'Hücrenin Yapısı ve İşlevleri',
      order: 3,
      children: [
        { name: 'Hücre Duvarı ve Hücre Zarı', order: 1 },
        { name: 'Endoplazmik Retikulum', order: 2 },
        { name: 'Golgi Cisimciği', order: 3 },
        { name: 'Lizozom ve Vakuoller', order: 4 },
        { name: 'Mitokondri ve Kloroplast', order: 5 },
        { name: 'Ribozom ve Sentrozom', order: 6 },
      ],
    },
    {
      name: 'Madde Geçişleri',
      order: 4,
      children: [
        { name: 'Seçici Geçirgenlik', order: 1 },
        { name: 'Pasif Taşıma', order: 2 },
        { name: 'Aktif Taşıma', order: 3 },
        { name: 'Endositoz ve Egzositoz', order: 4 },
        { name: 'Osmoz ve Hücrede Su Dengesi', order: 5 },
      ],
    },
    {
      name: 'Canlıların Temel Bileşenleri',
      order: 5,
      children: [
        { name: 'Karbon ve Fonksiyonel Gruplar', order: 1 },
        { name: 'Karbohidratlar', order: 2 },
        { name: 'Lipidler', order: 3 },
        { name: 'Proteinler', order: 4 },
        { name: 'Nükleik Asitler', order: 5 },
        { name: 'Vitamin ve Mineraller', order: 6 },
      ],
    },
    {
      name: 'Hücre Bölünmesi',
      order: 6,
      children: [
        { name: 'Hücre Döngüsü', order: 1 },
        { name: 'Mitoz Bölünme', order: 2 },
        { name: 'Mayoz Bölünme', order: 3 },
        { name: 'Eşeysiz ve Eşeyli Üreme', order: 4 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    let parentTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: biyolojiSubject.id, parentTopicId: null },
    });

    if (!parentTopic) {
      parentTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: biyolojiSubject.id,
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
        where: { name: child.name, subjectId: biyolojiSubject.id, parentTopicId: parentTopic.id },
      });

      if (!existingChild) {
        await prisma.topic.create({
          data: {
            name: child.name,
            subjectId: biyolojiSubject.id,
            parentTopicId: parentTopic.id,
            order: child.order,
          },
        });
        console.log(`    Alt konu eklendi: ${child.name}`);
      }
    }
  }

  console.log('\nTYT Biyoloji konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// TYT Felsefe Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('TYT Felsefe dersi ve konuları ekleniyor...');

  // TYT Felsefe Dersini oluştur veya güncelle
  let felsefeSubject = await prisma.subject.findFirst({
    where: { name: 'Felsefe', examType: ExamType.TYT },
  });

  if (!felsefeSubject) {
    felsefeSubject = await prisma.subject.create({
      data: {
        name: 'Felsefe',
        examType: ExamType.TYT,
        gradeLevels: [9, 10, 11, 12],
        order: 9,
        isActive: true,
      },
    });
    console.log(`Felsefe dersi oluşturuldu: ${felsefeSubject.id}`);
  } else {
    console.log(`Felsefe dersi zaten mevcut: ${felsefeSubject.id}`);
  }

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Felsefe\'nin Konusu',
      order: 1,
      children: [
        { name: 'Felsefe Nedir?', order: 1 },
        { name: 'Felsefenin Doğuşu ve Tanımı', order: 2 },
        { name: 'Felsefe ve Bilim İlişkisi', order: 3 },
        { name: 'Felsefe ve Din İlişkisi', order: 4 },
        { name: 'Felsefe ve Sanat İlişkisi', order: 5 },
      ],
    },
    {
      name: 'Bilgi Felsefesi',
      order: 2,
      children: [
        { name: 'Bilginin İmkanı', order: 1 },
        { name: 'Doğuculuk ve Rasyonalizm', order: 2 },
        { name: 'Empirizm ve Akılcılık', order: 3 },
        { name: 'Şüphecilik', order: 4 },
        { name: 'Eleştirel Düşünce', order: 5 },
      ],
    },
    {
      name: 'Varlık Felsefesi',
      order: 3,
      children: [
        { name: 'Varlık Nedir?', order: 1 },
        { name: 'İdealizm ve Materyalizm', order: 2 },
        { name: 'Tekil ve Tümel', order: 3 },
        { name: 'Zihin-Beden Problemi', order: 4 },
        { name: 'Determinizm ve Özgürlük', order: 5 },
      ],
    },
    {
      name: 'Ahlak Felsefesi',
      order: 4,
      children: [
        { name: 'Ahlak Nedir?', order: 1 },
        { name: 'Ahlaki Düşüncenin Temelleri', order: 2 },
        { name: 'Faydacılık', order: 3 },
        { name: 'Ödev Ahlakı', order: 4 },
        { name: 'Erdem Etiği', order: 5 },
        { name: 'Varoluşçu Ahlak', order: 6 },
      ],
    },
    {
      name: 'Sanat Felsefesi',
      order: 5,
      children: [
        { name: 'Sanat Nedir?', order: 1 },
        { name: 'Sanatın İşlevi', order: 2 },
        { name: 'Güzellik ve Estetik', order: 3 },
        { name: 'Sanat ve Toplum', order: 4 },
        { name: 'Sanat Eseri ve Yorum', order: 5 },
      ],
    },
    {
      name: 'Din Felsefesi',
      order: 6,
      children: [
        { name: 'Din Felsefesinin Konusu', order: 1 },
        { name: 'Din ve Felsefe İlişkisi', order: 2 },
        { name: 'Tanrı\'nın Varlığı', order: 3 },
        { name: 'Kötülük Problemi', order: 4 },
        { name: 'Din ve Ahlak', order: 5 },
      ],
    },
    {
      name: 'Siyaset Felsefesi',
      order: 7,
      children: [
        { name: 'Siyaset Felsefesinin Konusu', order: 1 },
        { name: 'Devlet ve İktidar', order: 2 },
        { name: 'Adalet Kavramı', order: 3 },
        { name: 'Hak ve Özgürlükler', order: 4 },
        { name: 'Demokrasi ve Yönetim Biçimleri', order: 5 },
      ],
    },
    {
      name: 'Bilim Felsefesi',
      order: 8,
      children: [
        { name: 'Bilim Felsefesinin Konusu', order: 1 },
        { name: 'Bilimsel Yöntem', order: 2 },
        { name: 'Bilimsel Açıklama ve Kanun', order: 3 },
        { name: 'Bilimsel Devrimler', order: 4 },
        { name: 'Bilim ve Toplum', order: 5 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    let parentTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: felsefeSubject.id, parentTopicId: null },
    });

    if (!parentTopic) {
      parentTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: felsefeSubject.id,
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
        where: { name: child.name, subjectId: felsefeSubject.id, parentTopicId: parentTopic.id },
      });

      if (!existingChild) {
        await prisma.topic.create({
          data: {
            name: child.name,
            subjectId: felsefeSubject.id,
            parentTopicId: parentTopic.id,
            order: child.order,
          },
        });
        console.log(`    Alt konu eklendi: ${child.name}`);
      }
    }
  }

  console.log('\nTYT Felsefe konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

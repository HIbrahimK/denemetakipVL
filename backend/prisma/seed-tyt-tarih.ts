// TYT Tarih Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('TYT Tarih dersi ve konuları ekleniyor...');

  // TYT Tarih Dersini oluştur veya güncelle
  let tarihSubject = await prisma.subject.findFirst({
    where: { name: 'Tarih', examType: ExamType.TYT },
  });

  if (!tarihSubject) {
    tarihSubject = await prisma.subject.create({
      data: {
        name: 'Tarih',
        examType: ExamType.TYT,
        gradeLevels: [9, 10, 11, 12],
        order: 7,
        isActive: true,
      },
    });
    console.log(`Tarih dersi oluşturuldu: ${tarihSubject.id}`);
  } else {
    console.log(`Tarih dersi zaten mevcut: ${tarihSubject.id}`);
  }

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Tarih Bilimi',
      order: 1,
      children: [
        { name: 'Tarihin Tanımı ve Kapsamı', order: 1 },
        { name: 'Tarihçilik ve Kaynaklar', order: 2 },
        { name: 'Tarihte Zaman Kavramı', order: 3 },
        { name: 'Tarihte Yazı ve İletişim', order: 4 },
      ],
    },
    {
      name: 'İlk ve Orta Çağlarda Türk Dünyası',
      order: 2,
      children: [
        { name: 'Türklerin Kökeni ve İlk Yurtları', order: 1 },
        { name: 'İlk Türk Devletleri', order: 2 },
        { name: 'Göktürkler', order: 3 },
        { name: 'Uygurlar', order: 4 },
        { name: 'İslamiyet Öncesi Türk Kültürü', order: 5 },
      ],
    },
    {
      name: 'İslam Tarihi ve Medeniyeti',
      order: 3,
      children: [
        { name: 'İslamiyet\'in Doğuşu', order: 1 },
        { name: 'Dört Halife Dönemi', order: 2 },
        { name: 'Emeviler ve Abbasiler', order: 3 },
        { name: 'Türklerin İslamiyet\'i Kabulü', order: 4 },
        { name: 'Selçuklular', order: 5 },
      ],
    },
    {
      name: 'Türkiye Tarihi',
      order: 4,
      children: [
        { name: 'Anadolu\'da Türk Beylikleri', order: 1 },
        { name: 'Osmanlı Beyliği\'nin Kuruluşu', order: 2 },
        { name: 'Osmanlı Devleti\'nin Yükselişi', order: 3 },
        { name: 'Osmanlı Devleti\'nin Duraklama Dönemi', order: 4 },
        { name: 'Osmanlı Devleti\'nin Gerileme Dönemi', order: 5 },
        { name: 'Osmanlı Devleti\'nde Islahatlar', order: 6 },
      ],
    },
    {
      name: '20. Yüzyıl Başlarında Osmanlı Devleti ve Dünya',
      order: 5,
      children: [
        { name: 'Dünya\'de Siyasi ve Ekonomik Durum', order: 1 },
        { name: 'Trablusgarp ve Balkan Savaşları', order: 2 },
        { name: 'I. Dünya Savaşı', order: 3 },
        { name: 'Mondros Ateşkes Anlaşması', order: 4 },
        { name: 'İşgaller ve Direniş', order: 5 },
      ],
    },
    {
      name: 'Kurtuluş Savaşı ve Cumhuriyet Dönemi',
      order: 6,
      children: [
        { name: 'Kurtuluş Savaşı\'na Hazırlık', order: 1 },
        { name: 'Kongreler ve Misak-ı Milli', order: 2 },
        { name: 'TBMM\'nin Açılması ve Savaş', order: 3 },
        { name: 'Lozan Barış Konferansı', order: 4 },
        { name: 'Cumhuriyet\'in İlanı', order: 5 },
        { name: 'Atatürk İlkeleri ve İnkılaplar', order: 6 },
      ],
    },
    {
      name: 'II. Dünya Savaşı ve Soğuk Savaş Dönemi',
      order: 7,
      children: [
        { name: 'II. Dünya Savaşı\'nın Nedenleri', order: 1 },
        { name: 'Savaşın Seyri ve Sonuçları', order: 2 },
        { name: 'Soğuk Savaş Dönemi', order: 3 },
        { name: 'Birleşmiş Milletler', order: 4 },
        { name: 'Çok Kutuplu Dünya', order: 5 },
      ],
    },
    {
      name: 'Türkiye Cumhuriyeti\'nin Dış Politikası',
      order: 8,
      children: [
        { name: 'Atatürk Dönemi Dış Politika', order: 1 },
        { name: 'II. Dünya Savaşı\'nda Türkiye', order: 2 },
        { name: 'Soğuk Savaş Döneminde Türkiye', order: 3 },
        { name: 'AB ve Türkiye İlişkileri', order: 4 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    let parentTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: tarihSubject.id, parentTopicId: null },
    });

    if (!parentTopic) {
      parentTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: tarihSubject.id,
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
        where: { name: child.name, subjectId: tarihSubject.id, parentTopicId: parentTopic.id },
      });

      if (!existingChild) {
        await prisma.topic.create({
          data: {
            name: child.name,
            subjectId: tarihSubject.id,
            parentTopicId: parentTopic.id,
            order: child.order,
          },
        });
        console.log(`    Alt konu eklendi: ${child.name}`);
      }
    }
  }

  console.log('\nTYT Tarih konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

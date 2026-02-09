// AYT Tarih-1 Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AYT Tarih-1 dersi ve konuları ekleniyor...');

  // AYT Tarih-1 Dersini kontrol et veya oluştur
  let tarihSubject = await prisma.subject.findFirst({
    where: { name: 'Tarih-1', examType: ExamType.AYT },
  });

  if (!tarihSubject) {
    tarihSubject = await prisma.subject.create({
      data: {
        name: 'Tarih-1',
        examType: ExamType.AYT,
        gradeLevels: [9, 10, 11, 12],
        order: 4,
        isActive: true,
      },
    });
    console.log(`AYT Tarih-1 dersi oluşturuldu: ${tarihSubject.id}`);
  } else {
    console.log(`AYT Tarih-1 dersi zaten mevcut: ${tarihSubject.id}`);
  }

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Tarih Bilimi',
      order: 1,
      children: [
        { name: 'Tarihin Tanımı ve Konusu', order: 1 },
        { name: 'Tarihin Dalları', order: 2 },
        { name: 'Tarih ve Zaman', order: 3 },
        { name: 'Tarihte Kullanılan Kaynaklar', order: 4 },
        { name: 'Tarih Yazımı ve Tarihçilik', order: 5 },
      ],
    },
    {
      name: 'Uygarlığın Doğuşu ve İlk Uygarlıklar',
      order: 2,
      children: [
        { name: 'İnsanlığın İlk Dönemleri', order: 1 },
        { name: 'Mezopotamya Uygarlıkları', order: 2 },
        { name: 'Mısır Uygarlığı', order: 3 },
        { name: 'Anadolu Uygarlıkları', order: 4 },
        { name: 'İran ve Hint Uygarlıkları', order: 5 },
        { name: 'Yunan Uygarlığı', order: 6 },
        { name: 'Roma Uygarlığı', order: 7 },
      ],
    },
    {
      name: 'İlk Türk Devletleri',
      order: 3,
      children: [
        { name: 'Türklerin Kökeni ve Yayılışı', order: 1 },
        { name: 'Hunlar', order: 2 },
        { name: 'Göktürkler', order: 3 },
        { name: 'Uygurlar', order: 4 },
        { name: 'Avarlar', order: 5 },
        { name: 'Hazarlar', order: 6 },
        { name: 'Karahanlılar', order: 7 },
        { name: 'Gazneliler', order: 8 },
        { name: 'Büyük Selçuklu Devleti', order: 9 },
        { name: 'Anadolu Selçuklu Devleti', order: 10 },
        { name: 'Beylikler Dönemi', order: 11 },
      ],
    },
    {
      name: 'Osmanlı Devleti - Kuruluş ve Yükseliş Dönemi (1299-1600)',
      order: 4,
      children: [
        { name: 'Osmanli Devletinin Kurulusu', order: 1 },
        { name: 'Fetihler ve İlk Padişahlar', order: 2 },
        { name: 'İstanbulun Fethi', order: 3 },
        { name: 'Yavuz Sultan Selim Dönemi', order: 4 },
        { name: 'Kanuni Sultan Süleyman Dönemi', order: 5 },
        { name: 'Devlet Teşkilatı', order: 6 },
        { name: 'Osmanlı Toplum ve Ekonomisi', order: 7 },
        { name: 'Osmanlı Kültür ve Medeniyeti', order: 8 },
      ],
    },
    {
      name: 'Osmanlı Devleti - Duraklama ve Gerileme Dönemi (1600-1792)',
      order: 5,
      children: [
        { name: '17. Yüzyılın Siyasi Olayları', order: 1 },
        { name: '18. Yüzyılın Siyasi Olayları', order: 2 },
        { name: 'Islahat Hareketleri', order: 3 },
        { name: 'Osmanlı Toplum ve Ekonomisinde Değişim', order: 4 },
      ],
    },
    {
      name: 'Osmanlı Devleti - Dağılma Dönemi (1792-1922)',
      order: 6,
      children: [
        { name: 'Nizam-i Cedid ve Tanzimata Giden Süreç', order: 1 },
        { name: 'Tanzimat Dönemi', order: 2 },
        { name: 'Islahat Fermanı ve Sonrası', order: 3 },
        { name: 'I. ve II. Meşrutiyet', order: 4 },
        { name: 'Trablusgarp ve Balkan Savaşları', order: 5 },
        { name: 'I. Dünya Savaşı', order: 6 },
        { name: 'Mondros Mütarekesi ve İşgaller', order: 7 },
      ],
    },
    {
      name: 'Türk İnkılap Tarihi',
      order: 7,
      children: [
        { name: 'İnkılap Kavramı ve Önemi', order: 1 },
        { name: 'Kurtuluş Savaşına Giden Süreç', order: 2 },
        { name: 'Mustafa Kemal ve Milli Mücadele', order: 3 },
        { name: 'Kongreler Dönemi', order: 4 },
        { name: 'TBMMnin Açılması', order: 5 },
        { name: 'Kurtuluş Savaşının Askeri Safhaları', order: 6 },
        { name: 'Lozan Barış Konferansı ve Antlaşması', order: 7 },
      ],
    },
    {
      name: 'Atatürk İlkeleri ve İnkılapları',
      order: 8,
      children: [
        { name: 'Hukuk Alanında İnkılaplar', order: 1 },
        { name: 'Eğitim ve Kültür Alanında İnkılaplar', order: 2 },
        { name: 'Sosyal Hayatta İnkılaplar', order: 3 },
        { name: 'Ekonomi Alanında İnkılaplar', order: 4 },
        { name: 'Siyasi Alan İnkılaplar', order: 5 },
        { name: 'Atatürk İlkeleri', order: 6 },
        { name: 'Atatürk Dönemi Dış Politika', order: 7 },
      ],
    },
    {
      name: '20. Yüzyılda Osmanlı Devleti ve Dünya',
      order: 9,
      children: [
        { name: '19. Yüzyılda Osmanlı Devleti', order: 1 },
        { name: 'I. Dünya Savaşı ve Sonrası', order: 2 },
        { name: 'Rus Devrimi ve Etkileri', order: 3 },
        { name: 'II. Dünya Savaşı', order: 4 },
        { name: 'Soğuk Savaş Dönemi', order: 5 },
      ],
    },
    {
      name: 'Cumhuriyet Dönemi Türkiye (1923-1960)',
      order: 10,
      children: [
        { name: 'Cumhuriyetin İlanı ve İlk Yıllar', order: 1 },
        { name: 'Tek Parti Dönemi', order: 2 },
        { name: 'Çok Partili Hayata Geçiş', order: 3 },
        { name: 'Demokrat Parti Dönemi', order: 4 },
      ],
    },
    {
      name: 'Cumhuriyet Dönemi Türkiye (1960-1980)',
      order: 11,
      children: [
        { name: '27 Mayıs 1960 İhtilali', order: 1 },
        { name: 'Anayasa Mahkemesi ve Yeni Anayasa', order: 2 },
        { name: '12 Mart 1971 Muhtırası', order: 3 },
        { name: '12 Eylül 1980 Darbesi', order: 4 },
      ],
    },
    {
      name: 'Cumhuriyet Dönemi Türkiye (1980-Günümüz)',
      order: 12,
      children: [
        { name: '1982 Anayasası', order: 1 },
        { name: 'Özal Dönemi ve Sonrası', order: 2 },
        { name: '28 Şubat Süreci', order: 3 },
        { name: '2000li Yıllar ve Sonrası', order: 4 },
        { name: 'Güncel Siyasi Gelişmeler', order: 5 },
      ],
    },
    {
      name: 'Türk Kültür ve Medeniyeti',
      order: 13,
      children: [
        { name: 'Türk Kültürünün Temel Özellikleri', order: 1 },
        { name: 'Türk Edebiyatı', order: 2 },
        { name: 'Türk Sanatı', order: 3 },
        { name: 'Türk Müziği', order: 4 },
        { name: 'Türk Mimarisi', order: 5 },
      ],
    },
    {
      name: 'Dünya Tarihi - Orta Çağ',
      order: 14,
      children: [
        { name: 'Feodalite ve Şövalye Kültürü', order: 1 },
        { name: 'Haçlı Seferleri', order: 2 },
        { name: 'Rönesans ve Reform', order: 3 },
        { name: 'Coğrafi Keşifler', order: 4 },
      ],
    },
    {
      name: 'Dünya Tarihi - Yeni Çağ ve Yakın Çağ',
      order: 15,
      children: [
        { name: 'Sanayi Devrimi', order: 1 },
        { name: 'Amerikan ve Fransız Devrimleri', order: 2 },
        { name: 'Milliyetçilik Akımları', order: 3 },
        { name: 'Emperyalizm ve Sömürgecilik', order: 4 },
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

  console.log('\nAYT Tarih-1 konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

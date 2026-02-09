// AYT Din Kültürü ve Ahlak Bilgisi Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AYT Din Kültürü ve Ahlak Bilgisi dersi ve konuları ekleniyor...');

  // AYT Din Kültürü ve Ahlak Bilgisi Dersini oluştur veya güncelle
  let dinSubject = await prisma.subject.findFirst({
    where: { name: 'Din Kültürü ve Ahlak Bilgisi', examType: ExamType.AYT },
  });

  if (!dinSubject) {
    dinSubject = await prisma.subject.create({
      data: {
        name: 'Din Kültürü ve Ahlak Bilgisi',
        examType: ExamType.AYT,
        gradeLevels: [9, 10, 11, 12],
        order: 7,
        isActive: true,
      },
    });
    console.log(`AYT Din Kültürü ve Ahlak Bilgisi dersi oluşturuldu: ${dinSubject.id}`);
  } else {
    console.log(`AYT Din Kültürü ve Ahlak Bilgisi dersi zaten mevcut: ${dinSubject.id}`);
  }

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'İslam ve İnsan',
      order: 1,
      children: [
        { name: 'İslamın Anlamı ve Özellikleri', order: 1 },
        { name: 'İslamın İnsana Bakışı', order: 2 },
        { name: 'İnsan ve Sorumluluk', order: 3 },
        { name: 'Özgür İrade ve Sorumluluk', order: 4 },
        { name: 'İslamda İnsan Hakları', order: 5 },
      ],
    },
    {
      name: 'İman Esasları',
      order: 2,
      children: [
        { name: 'Allahın Varlığı ve Birliği', order: 1 },
        { name: 'Melekler', order: 2 },
        { name: 'Kitaplar', order: 3 },
        { name: 'Peygamberler', order: 4 },
        { name: 'Ahiret', order: 5 },
        { name: 'Kaza ve Kader', order: 6 },
      ],
    },
    {
      name: 'İslamın İbadet Esasları',
      order: 3,
      children: [
        { name: 'Namaz', order: 1 },
        { name: 'Oruç', order: 2 },
        { name: 'Hac', order: 3 },
        { name: 'Zekat', order: 4 },
        { name: 'İbadetin Anlamı ve Önemi', order: 5 },
      ],
    },
    {
      name: 'Kuran-ı Kerim ve Özellikleri',
      order: 4,
      children: [
        { name: 'Kuranın İndirilişi', order: 1 },
        { name: 'Kuranın Temel Konuları', order: 2 },
        { name: 'Kuranı Anlama ve Yorumlama', order: 3 },
        { name: 'Kuran ve Bilim', order: 4 },
        { name: 'Kuranın Üslubu', order: 5 },
      ],
    },
    {
      name: 'Hz. Muhammedin Hayatı',
      order: 5,
      children: [
        { name: 'Doğumu ve Çocukluğu', order: 1 },
        { name: 'Gençliği ve Ticaret Hayatı', order: 2 },
        { name: 'Peygamberlik Görevi', order: 3 },
        { name: 'Mekke Dönemi', order: 4 },
        { name: 'Medine Dönemi', order: 5 },
        { name: 'Veda Haccı ve Veda Hutbesi', order: 6 },
        { name: 'Hz. Muhammedin Ahlakı', order: 7 },
      ],
    },
    {
      name: 'İslam Tarihi',
      order: 6,
      children: [
        { name: 'Dört Halife Dönemi', order: 1 },
        { name: 'Emeviler', order: 2 },
        { name: 'Abbasiler', order: 3 },
        { name: 'Endülüs Emevi Devleti', order: 4 },
        { name: 'Selçuklular', order: 5 },
        { name: 'Osmanlı Devleti ve İslam', order: 6 },
        { name: 'İslam Medeniyeti', order: 7 },
        { name: 'İslam Bilim Tarihi', order: 8 },
      ],
    },
    {
      name: 'İslam Ahlakı',
      order: 7,
      children: [
        { name: 'Ahlakın Tanımı ve Önemi', order: 1 },
        { name: 'İslam Ahlakının Temelleri', order: 2 },
        { name: 'Güzel Ahlak', order: 3 },
        { name: 'Kötü Ahlak', order: 4 },
        { name: 'Dürüstlük ve Güvenilirlik', order: 5 },
        { name: 'Cömertlik ve İhsan', order: 6 },
        { name: 'Sabır ve Şükür', order: 7 },
        { name: 'Affetme ve Hoşgörü', order: 8 },
      ],
    },
    {
      name: 'Aile ve Toplum Hayatı',
      order: 8,
      children: [
        { name: 'Ailenin Önemi', order: 1 },
        { name: 'Evlilik ve Aile Kurumu', order: 2 },
        { name: 'Ebeveyn-Çocuk İlişkileri', order: 3 },
        { name: 'Komşu Hakları', order: 4 },
        { name: 'Toplum Hayatı', order: 5 },
        { name: 'Sosyal Dayanışma', order: 6 },
      ],
    },
    {
      name: 'İslamda Hukuk ve Adalet',
      order: 9,
      children: [
        { name: 'İslam Hukukunun Kaynakları', order: 1 },
        { name: 'Hukukun Temel İlkeleri', order: 2 },
        { name: 'Adalet ve Hakkaniyet', order: 3 },
        { name: 'Mülkiyet Hakkı', order: 4 },
        { name: 'Sözleşme ve Borçlar', order: 5 },
        { name: 'Ceza Hukuku', order: 6 },
      ],
    },
    {
      name: 'Dünya Dinleri',
      order: 10,
      children: [
        { name: 'Yahudilik', order: 1 },
        { name: 'Hristiyanlık', order: 2 },
        { name: 'Musevilik', order: 3 },
        { name: 'Hinduizm', order: 4 },
        { name: 'Budizm', order: 5 },
        { name: 'Diğer Dinler', order: 6 },
        { name: 'Dinlerarası Diyalog', order: 7 },
      ],
    },
    {
      name: 'İslam Mezhepleri ve Akımlar',
      order: 11,
      children: [
        { name: 'Sünni Mezhepler', order: 1 },
        { name: 'Şii Mezhepleri', order: 2 },
        { name: 'Sufizm (Tasavvuf)', order: 3 },
        { name: 'İslam Düşünce Tarihi', order: 4 },
        { name: 'Günümüz İslam Düşüncesi', order: 5 },
      ],
    },
    {
      name: 'Kurani Kavramlar',
      order: 12,
      children: [
        { name: 'Tevhid', order: 1 },
        { name: 'Adalet', order: 2 },
        { name: 'Merhamet', order: 3 },
        { name: 'Hikmet', order: 4 },
        { name: 'Hidayet', order: 5 },
        { name: 'Takva', order: 6 },
        { name: 'Cihad', order: 7 },
        { name: 'Şirk', order: 8 },
      ],
    },
    {
      name: 'İslam ve Güncel Meseleler',
      order: 13,
      children: [
        { name: 'İslam ve Modernleşme', order: 1 },
        { name: 'İslam ve Bilim', order: 2 },
        { name: 'İslam ve Kadın', order: 3 },
        { name: 'İslam ve Çevre', order: 4 },
        { name: 'İslam ve Ekonomi', order: 5 },
        { name: 'İslam ve Barış', order: 6 },
      ],
    },
    {
      name: 'Dua ve Zikir',
      order: 14,
      children: [
        { name: 'Duanın Anlamı ve Önemi', order: 1 },
        { name: 'Dua Türleri', order: 2 },
        { name: 'Zikrin Anlamı ve Önemi', order: 3 },
        { name: 'Esma-i Hüsna', order: 4 },
        { name: 'Günlük Dualar', order: 5 },
      ],
    },
    {
      name: 'Dini Gün ve Geceler',
      order: 15,
      children: [
        { name: 'Kandiller', order: 1 },
        { name: 'Ramazan ve Kurban Bayramı', order: 2 },
        { name: 'Mevlid Kandili', order: 3 },
        { name: 'Regaip Kandili', order: 4 },
        { name: 'Berat Kandili', order: 5 },
        { name: 'Mirac Kandili', order: 6 },
      ],
    },
    {
      name: 'İslam Eğitimi ve Öğretimi',
      order: 16,
      children: [
        { name: 'İslamda İlim ve Eğitim', order: 1 },
        { name: 'Medrese ve Eğitim', order: 2 },
        { name: 'Günümüzde Din Eğitimi', order: 3 },
        { name: 'Ailede Din Eğitimi', order: 4 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    let parentTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: dinSubject.id, parentTopicId: null },
    });

    if (!parentTopic) {
      parentTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: dinSubject.id,
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
        where: { name: child.name, subjectId: dinSubject.id, parentTopicId: parentTopic.id },
      });

      if (!existingChild) {
        await prisma.topic.create({
          data: {
            name: child.name,
            subjectId: dinSubject.id,
            parentTopicId: parentTopic.id,
            order: child.order,
          },
        });
        console.log(`    Alt konu eklendi: ${child.name}`);
      }
    }
  }

  console.log('\nAYT Din Kültürü ve Ahlak Bilgisi konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

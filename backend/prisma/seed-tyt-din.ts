// TYT Din Kültürü ve Ahlak Bilgisi Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('TYT Din Kültürü ve Ahlak Bilgisi dersi ve konuları ekleniyor...');

  // TYT Din Kültürü ve Ahlak Bilgisi Dersini oluştur
  const dinSubject = await prisma.subject.create({
    data: {
      name: 'Din Kültürü ve Ahlak Bilgisi',
      examType: ExamType.TYT,
      gradeLevels: [9, 10, 11, 12],
      order: 10,
      isActive: true,
    },
  });

  console.log(`Din Kültürü ve Ahlak Bilgisi dersi oluşturuldu: ${dinSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Kur\'an-ı Kerim ve Özellikleri',
      order: 1,
      children: [
        { name: 'Kur\'an-ı Kerim\'in İndirilişi', order: 1 },
        { name: 'Kur\'an-ı Kerim\'in Özellikleri', order: 2 },
        { name: 'Kur\'an-ı Kerim\'in Anlaşılması', order: 3 },
        { name: 'Sure ve Ayetler', order: 4 },
      ],
    },
    {
      name: 'İnanç Esasları',
      order: 2,
      children: [
        { name: 'Allah\'a İman', order: 1 },
        { name: 'Meleklere İman', order: 2 },
        { name: 'Kitaplara İman', order: 3 },
        { name: 'Peygamberlere İman', order: 4 },
        { name: 'Ahirete İman', order: 5 },
        { name: 'Kaza ve Kadere İman', order: 6 },
      ],
    },
    {
      name: 'İslam\'ın Şartları',
      order: 3,
      children: [
        { name: 'Kelime-i Şehadet', order: 1 },
        { name: 'Namaz', order: 2 },
        { name: 'Oruç', order: 3 },
        { name: 'Zekat', order: 4 },
        { name: 'Hac', order: 5 },
      ],
    },
    {
      name: 'Hz. Muhammed\'in Hayatı',
      order: 4,
      children: [
        { name: 'Peygamberimizin Doğumu ve Çocukluğu', order: 1 },
        { name: 'Peygamberimizin Gençliği', order: 2 },
        { name: 'Nübüvvet ve Mekke Dönemi', order: 3 },
        { name: 'Medine Dönemi', order: 4 },
        { name: 'Peygamberimizin Ahlakı', order: 5 },
      ],
    },
    {
      name: 'İslam Ahlakı',
      order: 5,
      children: [
        { name: 'Ahlak ve İslam', order: 1 },
        { name: 'Kişisel Ahlak', order: 2 },
        { name: 'Aile Ahlakı', order: 3 },
        { name: 'Sosyal Ahlak', order: 4 },
        { name: 'Mesleki Ahlak', order: 5 },
      ],
    },
    {
      name: 'İbadetler',
      order: 6,
      children: [
        { name: 'İbadet Kavramı', order: 1 },
        { name: 'Namazın Önemi ve Hükümleri', order: 2 },
        { name: 'Orucun Önemi ve Hükümleri', order: 3 },
        { name: 'Zekat ve Sadaka', order: 4 },
        { name: 'Hac ve Umre', order: 5 },
      ],
    },
    {
      name: 'Din ve Hayat',
      order: 7,
      children: [
        { name: 'İslam\'da Temel Değerler', order: 1 },
        { name: 'Din ve Bilim', order: 2 },
        { name: 'Din ve Sanat', order: 3 },
        { name: 'Din ve Ekonomi', order: 4 },
        { name: 'Din ve Çevre', order: 5 },
      ],
    },
    {
      name: 'Vahiy ve Akıl',
      order: 8,
      children: [
        { name: 'Vahiy Kavramı', order: 1 },
        { name: 'Akıl ve İman', order: 2 },
        { name: 'Din ve İrfan', order: 3 },
        { name: 'İslam Düşünce Geleneği', order: 4 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    const parentTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: dinSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu eklendi: ${konu.name}`);

    // Alt konuları ekle
    for (const child of konu.children) {
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

  console.log('\nTYT Din Kültürü ve Ahlak Bilgisi konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

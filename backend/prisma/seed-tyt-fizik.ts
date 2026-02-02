// TYT Fizik Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('TYT Fizik dersi ve konuları ekleniyor...');

  // TYT Fizik Dersini oluştur
  const fizikSubject = await prisma.subject.create({
    data: {
      name: 'Fizik',
      examType: ExamType.TYT,
      gradeLevels: [9, 10, 11, 12],
      order: 4,
      isActive: true,
    },
  });

  console.log(`Fizik dersi oluşturuldu: ${fizikSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Fizik Bilimine Giriş',
      order: 1,
      children: [
        { name: 'Fizik ve Ölçme', order: 1 },
        { name: 'Fiziksel Nicelikler ve Birimler', order: 2 },
        { name: 'Bilimsel Yöntem', order: 3 },
      ],
    },
    {
      name: 'Madde ve Özellikleri',
      order: 2,
      children: [
        { name: 'Madde ve Ayırt Edici Özellikleri', order: 1 },
        { name: 'Yoğunluk', order: 2 },
        { name: 'Saf Maddeler ve Karışımlar', order: 3 },
        { name: 'Maddenin Halleri', order: 4 },
      ],
    },
    {
      name: 'Hareket ve Kuvvet',
      order: 3,
      children: [
        { name: 'Konum ve Yer Değiştirme', order: 1 },
        { name: 'Hız ve Hızlanma', order: 2 },
        { name: 'Doğrusal Hareket', order: 3 },
        { name: 'Kuvvet ve Hareket', order: 4 },
        { name: 'Newton\'un Hareket Yasaları', order: 5 },
        { name: 'Sürtünme Kuvveti', order: 6 },
      ],
    },
    {
      name: 'Enerji',
      order: 4,
      children: [
        { name: 'İş ve Enerji', order: 1 },
        { name: 'Potansiyel ve Kinetik Enerji', order: 2 },
        { name: 'Enerjinin Korunumu', order: 3 },
        { name: 'Verim ve Güç', order: 4 },
      ],
    },
    {
      name: 'Isı ve Sıcaklık',
      order: 5,
      children: [
        { name: 'Isı ve Sıcaklık Kavramları', order: 1 },
        { name: 'Isı Transferi', order: 2 },
        { name: 'Hal Değişimi ve Isı', order: 3 },
        { name: 'Genleşme', order: 4 },
      ],
    },
    {
      name: 'Elektrostatik',
      order: 6,
      children: [
        { name: 'Elektrik Yükleri', order: 1 },
        { name: 'Coulomb Kanunu', order: 2 },
        { name: 'Elektrik Alan', order: 3 },
        { name: 'Elektrik Potansiyeli', order: 4 },
      ],
    },
    {
      name: 'Elektrik Akımı ve Devreler',
      order: 7,
      children: [
        { name: 'Elektrik Akımı ve Potansiyel Farkı', order: 1 },
        { name: 'Ohm Kanunu', order: 2 },
        { name: 'Direnç ve İletkenlik', order: 3 },
        { name: 'Seri ve Paralel Devreler', order: 4 },
        { name: 'Elektrik Gücü ve Enerji', order: 5 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    const parentTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: fizikSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu eklendi: ${konu.name}`);

    // Alt konuları ekle
    for (const child of konu.children) {
      await prisma.topic.create({
        data: {
          name: child.name,
          subjectId: fizikSubject.id,
          parentTopicId: parentTopic.id,
          order: child.order,
        },
      });
      console.log(`    Alt konu eklendi: ${child.name}`);
    }
  }

  console.log('\nTYT Fizik konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

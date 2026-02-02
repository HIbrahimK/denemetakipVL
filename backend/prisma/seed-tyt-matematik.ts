// TYT Matematik Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('TYT Matematik dersi ve konuları ekleniyor...');

  // TYT Matematik Dersini oluştur
  const matematikSubject = await prisma.subject.create({
    data: {
      name: 'Matematik',
      examType: ExamType.TYT,
      gradeLevels: [9, 10, 11, 12],
      order: 2,
      isActive: true,
    },
  });

  console.log(`Matematik dersi oluşturuldu: ${matematikSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Temel Kavramlar',
      order: 1,
      children: [],
    },
    {
      name: 'Sayı Basamakları',
      order: 2,
      children: [],
    },
    {
      name: 'Bölme ve Bölünebilme',
      order: 3,
      children: [],
    },
    {
      name: 'EBOB – EKOK',
      order: 4,
      children: [],
    },
    {
      name: 'Rasyonel Sayılar',
      order: 5,
      children: [],
    },
    {
      name: 'Basit Eşitsizlikler',
      order: 6,
      children: [],
    },
    {
      name: 'Mutlak Değer',
      order: 7,
      children: [],
    },
    {
      name: 'Üslü Sayılar',
      order: 8,
      children: [],
    },
    {
      name: 'Köklü Sayılar',
      order: 9,
      children: [],
    },
    {
      name: 'Çarpanlara Ayırma',
      order: 10,
      children: [],
    },
    {
      name: 'Oran Orantı',
      order: 11,
      children: [],
    },
    {
      name: 'Denklem Çözme',
      order: 12,
      children: [],
    },
    {
      name: 'Problemler',
      order: 13,
      children: [
        { name: 'Sayı Problemleri', order: 1 },
        { name: 'Kesir Problemleri', order: 2 },
        { name: 'Yaş Problemleri', order: 3 },
        { name: 'Hareket Hız Problemleri', order: 4 },
        { name: 'İşçi Emek Problemleri', order: 5 },
        { name: 'Yüzde Problemleri', order: 6 },
        { name: 'Kar Zarar Problemleri', order: 7 },
        { name: 'Karışım Problemleri', order: 8 },
        { name: 'Grafik Problemleri', order: 9 },
        { name: 'Rutin Olmayan Problemleri', order: 10 },
      ],
    },
    {
      name: 'Kümeler – Kartezyen Çarpım',
      order: 14,
      children: [],
    },
    {
      name: 'Mantık',
      order: 15,
      children: [],
    },
    {
      name: 'Fonksiyonlar',
      order: 16,
      children: [],
    },
    {
      name: 'Polinomlar',
      order: 17,
      children: [],
    },
    {
      name: '2. Dereceden Denklemler',
      order: 18,
      children: [],
    },
    {
      name: 'Permütasyon ve Kombinasyon',
      order: 19,
      children: [],
    },
    {
      name: 'Olasılık',
      order: 20,
      children: [],
    },
    {
      name: 'Veri – İstatistik',
      order: 21,
      children: [],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    const parentTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: matematikSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu eklendi: ${konu.name}`);

    // Alt konuları ekle
    for (const child of konu.children) {
      await prisma.topic.create({
        data: {
          name: child.name,
          subjectId: matematikSubject.id,
          parentTopicId: parentTopic.id,
          order: child.order,
        },
      });
      console.log(`    Alt konu eklendi: ${child.name}`);
    }
  }

  console.log('\nTYT Matematik konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

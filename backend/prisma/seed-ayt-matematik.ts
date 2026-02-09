// AYT Matematik Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AYT Matematik dersi ve konuları ekleniyor...');

  // AYT Matematik Dersini oluştur veya güncelle
  let matematikSubject = await prisma.subject.findFirst({
    where: { name: 'Matematik', examType: ExamType.AYT },
  });

  if (!matematikSubject) {
    matematikSubject = await prisma.subject.create({
      data: {
        name: 'Matematik',
        examType: ExamType.AYT,
        gradeLevels: [9, 10, 11, 12],
        order: 1,
        isActive: true,
      },
    });
    console.log(`AYT Matematik dersi oluşturuldu: ${matematikSubject.id}`);
  } else {
    console.log(`AYT Matematik dersi zaten mevcut: ${matematikSubject.id}`);
  }

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
    {
      name: 'Karmaşık Sayılar',
      order: 22,
      children: [],
    },
    {
      name: 'Polinomlar (İleri Düzey)',
      order: 23,
      children: [],
    },
    {
      name: '2. Dereceden Denklem Sistemleri',
      order: 24,
      children: [],
    },
    {
      name: 'Fonksiyonlar (İleri Düzey)',
      order: 25,
      children: [],
    },
    {
      name: 'Limit ve Süreklilik',
      order: 26,
      children: [],
    },
    {
      name: 'Türev',
      order: 27,
      children: [],
    },
    {
      name: 'İntegral',
      order: 28,
      children: [],
    },
    {
      name: 'Üçgenler',
      order: 29,
      children: [],
    },
    {
      name: 'Üçgende Açılar',
      order: 30,
      children: [],
    },
    {
      name: 'Üçgende Alanlar',
      order: 31,
      children: [],
    },
    {
      name: 'Üçgende Açıortay ve Kenarortay',
      order: 32,
      children: [],
    },
    {
      name: 'Dik Üçgende Trigonometrik Bağıntılar',
      order: 33,
      children: [],
    },
    {
      name: 'İkizkenar ve Eşkenar Üçgen',
      order: 34,
      children: [],
    },
    {
      name: 'Üçgende Eşlik ve Benzerlik',
      order: 35,
      children: [],
    },
    {
      name: 'Üçgende Açı-Kenar Bağıntıları',
      order: 36,
      children: [],
    },
    {
      name: 'Çokgenler',
      order: 37,
      children: [],
    },
    {
      name: 'Dörtgenler',
      order: 38,
      children: [],
    },
    {
      name: 'Yamuk',
      order: 39,
      children: [],
    },
    {
      name: 'Paralelkenar',
      order: 40,
      children: [],
    },
    {
      name: 'Dikdörtgen',
      order: 41,
      children: [],
    },
    {
      name: 'Eşkenar Dörtgen ve Kare',
      order: 42,
      children: [],
    },
    {
      name: 'Çemberde Açılar',
      order: 43,
      children: [],
    },
    {
      name: 'Çemberde Uzunluk',
      order: 44,
      children: [],
    },
    {
      name: 'Daire',
      order: 45,
      children: [],
    },
    {
      name: 'Analitik Geometri - Nokta ve Doğru',
      order: 46,
      children: [],
    },
    {
      name: 'Doğrunun Analitik İncelenmesi',
      order: 47,
      children: [],
    },
    {
      name: 'Çemberin Analitik İncelenmesi',
      order: 48,
      children: [],
    },
    {
      name: 'Koordinat Dönüşümleri',
      order: 49,
      children: [],
    },
    {
      name: 'Uzay Geometri',
      order: 50,
      children: [],
    },
    {
      name: 'Katı Cisimler',
      order: 51,
      children: [],
    },
    {
      name: 'Prizma',
      order: 52,
      children: [],
    },
    {
      name: 'Piramit',
      order: 53,
      children: [],
    },
    {
      name: 'Küre',
      order: 54,
      children: [],
    },
    {
      name: 'Koni ve Silindir',
      order: 55,
      children: [],
    },
    {
      name: 'Vektörler',
      order: 56,
      children: [],
    },
    {
      name: 'Vektörlerde Çarpma İşlemleri',
      order: 57,
      children: [],
    },
    {
      name: 'Doğru ve Düzlemin Analitik İncelenmesi',
      order: 58,
      children: [],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    let parentTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: matematikSubject.id, parentTopicId: null },
    });

    if (!parentTopic) {
      parentTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: matematikSubject.id,
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
        where: { name: child.name, subjectId: matematikSubject.id, parentTopicId: parentTopic.id },
      });

      if (!existingChild) {
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
  }

  console.log('\nAYT Matematik konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

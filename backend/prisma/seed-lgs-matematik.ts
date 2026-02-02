// LGS Matematik Dersi ve Konuları Seed Dosyası (8. Sınıf)
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('LGS Matematik dersi ve konuları ekleniyor...');

  // LGS Matematik Dersini oluştur
  const matematikSubject = await prisma.subject.create({
    data: {
      name: 'Matematik',
      examType: ExamType.LGS,
      gradeLevels: [8],
      order: 2,
      isActive: true,
    },
  });

  console.log(`LGS Matematik dersi oluşturuldu: ${matematikSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Sayılar',
      order: 1,
      children: [
        { name: 'Çarpanlar ve Katlar', order: 1 },
        { name: 'EBOB - EKOK', order: 2 },
        { name: 'Üslü Sayılar', order: 3 },
        { name: 'Kareköklü Sayılar', order: 4 },
      ],
    },
    {
      name: 'Birinci Dereceden Denklemler ve Eşitsizlikler',
      order: 2,
      children: [
        { name: 'Birinci Dereceden Bir Bilinmeyenli Denklemler', order: 1 },
        { name: 'Birinci Dereceden İki Bilinmeyenli Denklem Sistemleri', order: 2 },
        { name: 'Birinci Dereceden Eşitsizlikler', order: 3 },
      ],
    },
    {
      name: 'Üçgenler',
      order: 3,
      children: [
        { name: 'Üçgende Açılar', order: 1 },
        { name: 'Üçgende Kenarlar', order: 2 },
        { name: 'Üçgende Eşlik ve Benzerlik', order: 3 },
        { name: 'Dik Üçgende Trigonometrik Oranlar', order: 4 },
        { name: 'Üçgenin Alanı', order: 5 },
      ],
    },
    {
      name: 'Veri Analizi',
      order: 4,
      children: [
        { name: 'Merkezi Eğilim ve Yayılım Ölçüleri', order: 1 },
        { name: 'Aritmetik Ortalama', order: 2 },
        { name: 'Medyan ve Mod', order: 3 },
        { name: 'Açıklık ve Çeyrekler Açıklığı', order: 4 },
      ],
    },
    {
      name: 'Cebirsel İfadeler ve Özdeşlikler',
      order: 5,
      children: [
        { name: 'Cebirsel İfadeler', order: 1 },
        { name: 'Özdeşlikler', order: 2 },
        { name: 'Çarpanlara Ayırma', order: 3 },
      ],
    },
    {
      name: 'Geometrik Cisimler',
      order: 6,
      children: [
        { name: 'Prizmalar', order: 1 },
        { name: 'Piramitler', order: 2 },
        { name: 'Küre', order: 3 },
        { name: 'Geometrik Cisimlerin Yüzey Alanı', order: 4 },
        { name: 'Geometrik Cisimlerin Hacmi', order: 5 },
      ],
    },
    {
      name: 'Dönüşüm Geometrisi',
      order: 7,
      children: [
        { name: 'Öteleme', order: 1 },
        { name: 'Yansıma', order: 2 },
        { name: 'Döndürme', order: 3 },
        { name: 'Simetri', order: 4 },
      ],
    },
    {
      name: 'Oran ve Orantı',
      order: 8,
      children: [
        { name: 'Oran', order: 1 },
        { name: 'Orantı', order: 2 },
        { name: 'Aritmetik ve Geometrik Ortalama', order: 3 },
      ],
    },
    {
      name: 'Yüzdeler',
      order: 9,
      children: [
        { name: 'Yüzde Problemleri', order: 1 },
        { name: 'Kar-Zarar Problemleri', order: 2 },
        { name: 'Faiz Hesaplamaları', order: 3 },
      ],
    },
    {
      name: 'Çokgenler',
      order: 10,
      children: [
        { name: 'Çokgenlerin Temel Özellikleri', order: 1 },
        { name: 'Düzgün Çokgenler', order: 2 },
        { name: 'Çokgenlerin İç ve Dış Açıları', order: 3 },
        { name: 'Çokgenlerin Alanı', order: 4 },
      ],
    },
    {
      name: 'Dörtgenler',
      order: 11,
      children: [
        { name: 'Dörtgenlerin Özellikleri', order: 1 },
        { name: 'Paralelkenar', order: 2 },
        { name: 'Dikdörtgen', order: 3 },
        { name: 'Kare', order: 4 },
        { name: 'Eşkenar Dörtgen', order: 5 },
        { name: 'Yamuk', order: 6 },
        { name: 'Deltoid', order: 7 },
      ],
    },
    {
      name: 'Çember ve Daire',
      order: 12,
      children: [
        { name: 'Çemberin Temel Elemanları', order: 1 },
        { name: 'Çemberde Açılar', order: 2 },
        { name: 'Çemberde Uzunluk', order: 3 },
        { name: 'Dairenin Alanı', order: 4 },
        { name: 'Çemberin Çevresi', order: 5 },
        { name: 'Daire Dilimi ve Daire Parçası', order: 6 },
      ],
    },
    {
      name: 'Olasılık',
      order: 13,
      children: [
        { name: 'Basit Olayların Olasılığı', order: 1 },
        { name: 'Olasılık Hesaplama', order: 2 },
      ],
    },
    {
      name: 'Sayı Problemleri',
      order: 14,
      children: [
        { name: 'Yaş Problemleri', order: 1 },
        { name: 'İşçi Problemleri', order: 2 },
        { name: 'Hareket Problemleri', order: 3 },
        { name: 'Yüzde ve Oran Problemleri', order: 4 },
        { name: 'Karışım Problemleri', order: 5 },
      ],
    },
    {
      name: 'Koordinat Sistemi',
      order: 15,
      children: [
        { name: 'Noktanın Koordinatları', order: 1 },
        { name: 'Doğrunun Eğimi', order: 2 },
        { name: 'Doğrunun Denklemi', order: 3 },
      ],
    },
  ];

  // Konuları oluştur
  for (const konu of konular) {
    const mainTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: matematikSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu oluşturuldu: ${konu.name}`);

    // Alt konuları oluştur
    if (konu.children && konu.children.length > 0) {
      for (const child of konu.children) {
        await prisma.topic.create({
          data: {
            name: child.name,
            subjectId: matematikSubject.id,
            parentTopicId: mainTopic.id,
            order: child.order,
          },
        });
        console.log(`    Alt konu: ${child.name}`);
      }
    }
  }

  console.log('LGS Matematik konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

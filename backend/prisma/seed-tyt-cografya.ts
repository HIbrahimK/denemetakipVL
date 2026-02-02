// TYT Coğrafya Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('TYT Coğrafya dersi ve konuları ekleniyor...');

  // TYT Coğrafya Dersini oluştur
  const cografyaSubject = await prisma.subject.create({
    data: {
      name: 'Coğrafya',
      examType: ExamType.TYT,
      gradeLevels: [9, 10, 11, 12],
      order: 8,
      isActive: true,
    },
  });

  console.log(`Coğrafya dersi oluşturuldu: ${cografyaSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Doğa ve İnsan',
      order: 1,
      children: [
        { name: 'Coğrafyanın Konusu ve Bölümleri', order: 1 },
        { name: 'Coğrafyanın Tarihçesi', order: 2 },
        { name: 'Coğrafyada Araştırma Yöntemleri', order: 3 },
        { name: 'Coğrafya ve Çevre', order: 4 },
      ],
    },
    {
      name: 'Dünya\'nin Şekli ve Hareketleri',
      order: 2,
      children: [
        { name: 'Dünya\'nin Şekli ve Boyutları', order: 1 },
        { name: 'Dünya\'nin Hareketleri', order: 2 },
        { name: 'Zaman ve Saat', order: 3 },
        { name: 'Mevsimler ve İklim', order: 4 },
      ],
    },
    {
      name: 'Harita Bilgisi',
      order: 3,
      children: [
        { name: 'Harita Türleri', order: 1 },
        { name: 'Harita Öğeleri', order: 2 },
        { name: 'Ölçek ve Hesaplamalar', order: 3 },
        { name: 'Koordinat Sistemleri', order: 4 },
        { name: 'Yükselti ve İzohips', order: 5 },
      ],
    },
    {
      name: 'İklim Bilgisi',
      order: 4,
      children: [
        { name: 'İklimin Oluşumu ve Unsurları', order: 1 },
        { name: 'Sıcaklık ve Dağılışı', order: 2 },
        { name: 'Basınç ve Rüzgarlar', order: 3 },
        { name: 'Nem ve Yağış', order: 4 },
        { name: 'İklim Tipleri', order: 5 },
        { name: 'Bitki Örtüsü', order: 6 },
      ],
    },
    {
      name: 'Doğal Afetler',
      order: 5,
      children: [
        { name: 'Afet Kavramı ve Sınıflandırma', order: 1 },
        { name: 'Yer Şekillenmesi ve Afetler', order: 2 },
        { name: 'İklim ve Afetler', order: 3 },
        { name: 'Deprem ve Volkanizma', order: 4 },
        { name: 'Heyelan ve Taşkın', order: 5 },
        { name: 'Afet Yönetimi', order: 6 },
      ],
    },
    {
      name: 'Nüfus ve Yerleşme',
      order: 6,
      children: [
        { name: 'Nüfus ve Özellikleri', order: 1 },
        { name: 'Nüfus Hareketleri', order: 2 },
        { name: 'Nüfus Politikaları', order: 3 },
        { name: 'Yerleşme ve Türleri', order: 4 },
        { name: 'Kentsel Yerleşme', order: 5 },
        { name: 'Türkiye\'de Nüfus ve Yerleşme', order: 6 },
      ],
    },
    {
      name: 'Türkiye Coğrafyası',
      order: 7,
      children: [
        { name: 'Türkiye\'nin Konumu ve Önemi', order: 1 },
        { name: 'Türkiye\'nin İklimi', order: 2 },
        { name: 'Türkiye\'nin Bitki Örtüsü', order: 3 },
        { name: 'Türkiye\'nin Toprakları', order: 4 },
        { name: 'Türkiye\'nin Su Varlıkları', order: 5 },
        { name: 'Türkiye\'nin Madenleri', order: 6 },
      ],
    },
    {
      name: 'Bölgeler ve Ülkeler',
      order: 8,
      children: [
        { name: 'Bölge ve Ülke Kavramı', order: 1 },
        { name: 'Dünya\'de Bölge ve Ülkeler', order: 2 },
        { name: 'Ekonomik Faaliyetler', order: 3 },
        { name: 'Ulaşım ve Ticaret', order: 4 },
        { name: 'Turizm ve Çevre', order: 5 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    const parentTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: cografyaSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu eklendi: ${konu.name}`);

    // Alt konuları ekle
    for (const child of konu.children) {
      await prisma.topic.create({
        data: {
          name: child.name,
          subjectId: cografyaSubject.id,
          parentTopicId: parentTopic.id,
          order: child.order,
        },
      });
      console.log(`    Alt konu eklendi: ${child.name}`);
    }
  }

  console.log('\nTYT Coğrafya konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

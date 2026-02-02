// AYT Coğrafya-1 Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AYT Coğrafya-1 dersi ve konuları ekleniyor...');

  // AYT Coğrafya-1 Dersini oluştur
  const cografyaSubject = await prisma.subject.create({
    data: {
      name: 'Coğrafya-1',
      examType: ExamType.AYT,
      gradeLevels: [9, 10, 11, 12],
      order: 5,
      isActive: true,
    },
  });

  console.log(`AYT Coğrafya-1 dersi oluşturuldu: ${cografyaSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Doğal Sistemler - İklim ve Hava Olayları',
      order: 1,
      children: [
        { name: 'İklimin Oluşumu ve Faktörleri', order: 1 },
        { name: 'Sıcaklık ve Basınç', order: 2 },
        { name: 'Rüzgarlar', order: 3 },
        { name: 'Nem ve Yağış', order: 4 },
        { name: 'İklim Tipleri', order: 5 },
        { name: 'Türkiye İklimi', order: 6 },
      ],
    },
    {
      name: 'Doğal Sistemler - Yerin Şekillenmesi',
      order: 2,
      children: [
        { name: 'İç ve Dış Kuvvetler', order: 1 },
        { name: 'Volkanik ve Tektonik Hareketler', order: 2 },
        { name: 'Depremler', order: 3 },
        { name: 'Aşınım ve Biriktirme', order: 4 },
        { name: 'Yer Şekilleri', order: 5 },
      ],
    },
    {
      name: 'Doğal Sistemler - Su ve Toprak',
      order: 3,
      children: [
        { name: 'Su Döngüsü', order: 1 },
        { name: 'Yeraltı ve Yerüstü Suları', order: 2 },
        { name: 'Akarsular ve Göller', order: 3 },
        { name: 'Toprak Oluşumu ve Tipleri', order: 4 },
        { name: 'Doğal Bitki Örtüsü', order: 5 },
      ],
    },
    {
      name: 'Beşeri Sistemler - Nüfus',
      order: 4,
      children: [
        { name: 'Nüfusun Gelişimi ve Dağılışı', order: 1 },
        { name: 'Nüfus Hareketleri', order: 2 },
        { name: 'Nüfus Politikaları', order: 3 },
        { name: 'Türkiye Nüfusu', order: 4 },
        { name: 'Dünya Nüfusu', order: 5 },
      ],
    },
    {
      name: 'Beşeri Sistemler - Yerleşme',
      order: 5,
      children: [
        { name: 'Yerleşme Tipleri', order: 1 },
        { name: 'Kırsal Yerleşmeler', order: 2 },
        { name: 'Kentsel Yerleşmeler', order: 3 },
        { name: 'Türkiye Yerleşme', order: 4 },
        { name: 'Dünya Yerleşmesi', order: 5 },
      ],
    },
    {
      name: 'Beşeri Sistemler - Ekonomik Faaliyetler',
      order: 6,
      children: [
        { name: 'Birincil Faaliyetler', order: 1 },
        { name: 'Tarım', order: 2 },
        { name: 'Hayvancılık', order: 3 },
        { name: 'Ormancılık ve Balıkçılık', order: 4 },
        { name: 'Madencilik', order: 5 },
        { name: 'İkincil Faaliyetler', order: 6 },
        { name: 'Sanayi', order: 7 },
        { name: 'Üçüncül Faaliyetler', order: 8 },
        { name: 'Ticaret ve Ulaşım', order: 9 },
        { name: 'Turizm', order: 10 },
      ],
    },
    {
      name: 'Türkiye Coğrafyası - Fiziki Coğrafya',
      order: 7,
      children: [
        { name: 'Türkiyenin Konumu ve Önemi', order: 1 },
        { name: 'Türkiyenin İklimi', order: 2 },
        { name: 'Türkiye Bitki Örtüsü', order: 3 },
        { name: 'Türkiye Toprakları', order: 4 },
        { name: 'Türkiye Suları', order: 5 },
      ],
    },
    {
      name: 'Türkiye Coğrafyası - Beşeri ve Ekonomik Coğrafya',
      order: 8,
      children: [
        { name: 'Türkiye Nüfusu ve Yerleşme', order: 1 },
        { name: 'Türkiye Ekonomisi', order: 2 },
        { name: 'Türkiye Tarımı', order: 3 },
        { name: 'Türkiye Sanayisi', order: 4 },
        { name: 'Türkiye Ulaşımı', order: 5 },
        { name: 'Türkiye Turizmi', order: 6 },
      ],
    },
    {
      name: 'Türkiye Coğrafyası - Bölgeler',
      order: 9,
      children: [
        { name: 'Marmara Bölgesi', order: 1 },
        { name: 'Ege Bölgesi', order: 2 },
        { name: 'Akdeniz Bölgesi', order: 3 },
        { name: 'İç Anadolu Bölgesi', order: 4 },
        { name: 'Karadeniz Bölgesi', order: 5 },
        { name: 'Doğu Anadolu Bölgesi', order: 6 },
        { name: 'Güneydoğu Anadolu Bölgesi', order: 7 },
      ],
    },
    {
      name: 'Dünya Coğrafyası - Kıtalar',
      order: 10,
      children: [
        { name: 'Avrupa', order: 1 },
        { name: 'Asya', order: 2 },
        { name: 'Afrika', order: 3 },
        { name: 'Amerika', order: 4 },
        { name: 'Avustralya ve Okyanusya', order: 5 },
        { name: 'Kutup Bölgeleri', order: 6 },
      ],
    },
    {
      name: 'Dünya Coğrafyası - Ülkeler ve Bölgeler',
      order: 11,
      children: [
        { name: 'Gelişmiş Ülkeler', order: 1 },
        { name: 'Gelişmekte Olan Ülkeler', order: 2 },
        { name: 'Az Gelişmiş Ülkeler', order: 3 },
        { name: 'Petrol Üreten Ülkeler', order: 4 },
        { name: 'Sanayi Ülkeleri', order: 5 },
      ],
    },
    {
      name: 'Çevre ve Toplum',
      order: 12,
      children: [
        { name: 'Doal Afetler', order: 1 },
        { name: 'İklim Değişikliği', order: 2 },
        { name: 'Çevre Sorunları', order: 3 },
        { name: 'Sürdürülebilir Kalkınma', order: 4 },
        { name: 'Doal Kaynakların Korunması', order: 5 },
      ],
    },
    {
      name: 'Harita Bilgisi',
      order: 13,
      children: [
        { name: 'Harita Türleri', order: 1 },
        { name: 'Harita Öğeleri', order: 2 },
        { name: 'Ölçek ve Hesaplamalar', order: 3 },
        { name: 'Koordinat Sistemleri', order: 4 },
        { name: 'Projeksiyonlar', order: 5 },
      ],
    },
    {
      name: 'Coğrafi Konum ve Hareketler',
      order: 14,
      children: [
        { name: 'Dünyanın Şekli ve Boyutları', order: 1 },
        { name: 'Dünyanın Hareketleri', order: 2 },
        { name: 'Zaman Hesaplamaları', order: 3 },
        { name: 'Coğrafi Konumun Önemi', order: 4 },
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

  console.log('\nAYT Coğrafya-1 konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

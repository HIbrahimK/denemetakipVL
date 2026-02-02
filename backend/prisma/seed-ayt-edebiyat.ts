// AYT Türk Dili ve Edebiyatı Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AYT Türk Dili ve Edebiyatı dersi ve konuları ekleniyor...');

  // AYT Türk Dili ve Edebiyatı Dersini oluştur
  const edebiyatSubject = await prisma.subject.create({
    data: {
      name: 'Türk Dili ve Edebiyatı',
      examType: ExamType.AYT,
      gradeLevels: [9, 10, 11, 12],
      order: 3,
      isActive: true,
    },
  });

  console.log(`AYT Türk Dili ve Edebiyatı dersi oluşturuldu: ${edebiyatSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Türkçenin Tarihi Gelişimi',
      order: 1,
      children: [
        { name: 'Türkçenin Dönemleri', order: 1 },
        { name: 'Eski Türkçe', order: 2 },
        { name: 'Orta Türkçe', order: 3 },
        { name: 'Yeni Türkçe', order: 4 },
      ],
    },
    {
      name: 'Ses Bilgisi (Seslerin Özellikleri)',
      order: 2,
      children: [
        { name: 'Ünlüler', order: 1 },
        { name: 'Ünsüzler', order: 2 },
        { name: 'Ses Değişmeleri', order: 3 },
      ],
    },
    {
      name: 'Şekil Bilgisi (Kelime Türleri)',
      order: 3,
      children: [
        { name: 'Adlar (İsimler)', order: 1 },
        { name: 'Fiiller', order: 2 },
        { name: 'Sıfatlar', order: 3 },
        { name: 'Zarflar', order: 4 },
        { name: 'Edatlar', order: 5 },
        { name: 'Bağlaçlar', order: 6 },
        { name: 'Ünlemler', order: 7 },
        { name: 'Zamirler', order: 8 },
      ],
    },
    {
      name: 'Yapı Bilgisi',
      order: 4,
      children: [
        { name: 'Yapı Türleri', order: 1 },
        { name: 'Kökenli Kelimeler', order: 2 },
        { name: 'Türemiş Kelimeler', order: 3 },
        { name: 'Birleşik Kelimeler', order: 4 },
      ],
    },
    {
      name: 'Cümle Bilgisi',
      order: 5,
      children: [
        { name: 'Cümlenin Öğeleri', order: 1 },
        { name: 'Cümle Türleri', order: 2 },
        { name: 'Basit Cümle', order: 3 },
        { name: 'Birleşik Cümle', order: 4 },
        { name: 'Sıralı Cümle', order: 5 },
      ],
    },
    {
      name: 'Anlatım (Nazım) Bilgisi',
      order: 6,
      children: [
        { name: 'Şiir Bilgisi', order: 1 },
        { name: 'Nazım Birimleri', order: 2 },
        { name: 'Nazım Türleri', order: 3 },
        { name: 'Şiir Sanatları', order: 4 },
      ],
    },
    {
      name: 'Anlam Bilgisi',
      order: 7,
      children: [
        { name: 'Sözlük Anlamı', order: 1 },
        { name: 'Terim Anlamı', order: 2 },
        { name: 'Mecaz Anlam', order: 3 },
        { name: 'Deyim ve Atasözleri', order: 4 },
        { name: 'Anlam İlişkileri', order: 5 },
      ],
    },
    {
      name: 'Yazım ve Noktalama İşaretleri',
      order: 8,
      children: [
        { name: 'Yazım Kuralları', order: 1 },
        { name: 'Noktalama İşaretleri', order: 2 },
      ],
    },
    {
      name: 'Sözcükte ve Cümlede Anlam',
      order: 9,
      children: [
        { name: 'Sözcükte Anlam', order: 1 },
        { name: 'Cümlede Anlam', order: 2 },
        { name: 'Paragrafta Anlam', order: 3 },
      ],
    },
    {
      name: 'Türk Edebiyatı Tarihi - İslamiyet Öncesi',
      order: 10,
      children: [
        { name: 'Göktürk Yazıtları', order: 1 },
        { name: 'Uygur Edebiyatı', order: 2 },
        { name: 'Dede Korkut Hikayeleri', order: 3 },
      ],
    },
    {
      name: 'Türk Edebiyatı Tarihi - İslamiyet Sonrası',
      order: 11,
      children: [
        { name: 'Kutadgu Bilig', order: 1 },
        { name: 'Divan-ı Lügat-it Türk', order: 2 },
        { name: 'Atabetü\'l-Hakayık', order: 3 },
      ],
    },
    {
      name: 'Divan Edebiyatı',
      order: 12,
      children: [
        { name: 'Divan Edebiyatı Genel Özellikleri', order: 1 },
        { name: 'Divan Şiiri Nazım Türleri', order: 2 },
        { name: 'Fuzuli', order: 3 },
        { name: 'Baki', order: 4 },
        { name: 'Nedim', order: 5 },
        { name: 'Şeyh Gâlib', order: 6 },
      ],
    },
    {
      name: 'Tanzimat Edebiyatı',
      order: 13,
      children: [
        { name: 'Tanzimat Dönemi Genel Özellikleri', order: 1 },
        { name: 'Şinasi', order: 2 },
        { name: 'Namık Kemal', order: 3 },
        { name: 'Recaizade Mahmut Ekrem', order: 4 },
        { name: 'Abdülhak Hâmit Tarhan', order: 5 },
        { name: 'Tevfik Fikret', order: 6 },
      ],
    },
    {
      name: 'Servet-i Fünun Edebiyatı',
      order: 14,
      children: [
        { name: 'Servet-i Fünun Dönemi Genel Özellikleri', order: 1 },
        { name: 'Tevfik Fikret', order: 2 },
        { name: 'Cenap Şahabettin', order: 3 },
        { name: 'Halit Ziya Uşaklıgil', order: 4 },
        { name: 'Mehmet Rauf', order: 5 },
      ],
    },
    {
      name: 'Fecr-i Ati Edebiyatı',
      order: 15,
      children: [
        { name: 'Fecr-i Ati Dönemi Genel Özellikleri', order: 1 },
        { name: 'Ahmet Haşim', order: 2 },
        { name: 'Yahya Kemal Beyatlı', order: 3 },
      ],
    },
    {
      name: 'Milli Edebiyat',
      order: 16,
      children: [
        { name: 'Milli Edebiyat Dönemi Genel Özellikleri', order: 1 },
        { name: 'Mehmet Emin Yurdakul', order: 2 },
        { name: 'Ziya Gökalp', order: 3 },
        { name: 'Ömer Seyfettin', order: 4 },
        { name: 'Ali Canip Yöntem', order: 5 },
      ],
    },
    {
      name: 'Cumhuriyet Dönemi Edebiyatı - Şiir',
      order: 17,
      children: [
        { name: 'Cumhuriyet Dönemi Şiiri Genel Özellikleri', order: 1 },
        { name: 'Garip Akımı', order: 2 },
        { name: 'Orhan Veli Kanık', order: 3 },
        { name: 'Oktay Rifat', order: 4 },
        { name: 'Melih Cevdet Anday', order: 5 },
        { name: 'İkinci Yeni Akımı', order: 6 },
        { name: 'Behçet Necatigil', order: 7 },
        { name: 'Cemal Süreya', order: 8 },
        { name: 'Edip Cansever', order: 9 },
        { name: 'Sezai Karakoç', order: 10 },
        { name: 'Ümit Yaşar Oğuzcan', order: 11 },
        { name: 'Nazım Hikmet', order: 12 },
        { name: 'Necip Fazıl Kısakürek', order: 13 },
      ],
    },
    {
      name: 'Cumhuriyet Dönemi Edebiyatı - Hikaye ve Roman',
      order: 18,
      children: [
        { name: 'Cumhuriyet Dönemi Hikayesi', order: 1 },
        { name: 'Cumhuriyet Dönemi Romanı', order: 2 },
        { name: 'Refik Halit Karay', order: 3 },
        { name: 'Yakup Kadri Karaosmanoğlu', order: 4 },
        { name: 'Resat Nuri Güntekin', order: 5 },
        { name: 'Halide Edip Adıvar', order: 6 },
        { name: 'Sabahattin Ali', order: 7 },
        { name: 'Sait Faik Abasıyanık', order: 8 },
        { name: 'Orhan Kemal', order: 9 },
        { name: 'Yaşar Kemal', order: 10 },
        { name: 'Kemal Tahir', order: 11 },
        { name: 'Orhan Pamuk', order: 12 },
      ],
    },
    {
      name: 'Cumhuriyet Dönemi Edebiyatı - Tiyatro',
      order: 19,
      children: [
        { name: 'Cumhuriyet Dönemi Tiyatrosu', order: 1 },
        { name: 'Haldun Taner', order: 2 },
        { name: 'Turgut Özakman', order: 3 },
        { name: 'Güngör Dilmen', order: 4 },
      ],
    },
    {
      name: 'Cumhuriyet Dönemi Edebiyatı - Deneme ve Makale',
      order: 20,
      children: [
        { name: 'Cumhuriyet Dönemi Denemesi', order: 1 },
        { name: 'Cumhuriyet Dönemi Makalesi', order: 2 },
        { name: 'Peyami Safa', order: 3 },
        { name: 'Cemil Meriç', order: 4 },
        { name: 'Dinçer Sümer', order: 5 },
      ],
    },
    {
      name: 'Halk Edebiyatı',
      order: 21,
      children: [
        { name: 'Halk Edebiyatı Genel Özellikleri', order: 1 },
        { name: 'Koşma', order: 2 },
        { name: 'Mani', order: 3 },
        { name: 'Türkü', order: 4 },
        { name: 'Destan', order: 5 },
        { name: 'Halk Hikayeleri', order: 6 },
        { name: 'Atasözleri ve Deyimler', order: 7 },
        { name: 'Bilmeceler', order: 8 },
        { name: 'Ninni ve Tekerlemeler', order: 9 },
      ],
    },
    {
      name: 'Edebi Sanatlar ve Figürler',
      order: 22,
      children: [
        { name: 'Tesbih', order: 1 },
        { name: 'İstiare (Mecaz-ı Mürsel)', order: 2 },
        { name: 'Teşbih', order: 3 },
        { name: 'Kinaye', order: 4 },
        { name: 'Mecaz-ı Mürsel', order: 5 },
        { name: 'İroni', order: 6 },
        { name: 'Hüzün', order: 7 },
        { name: 'Tenkit', order: 8 },
      ],
    },
    {
      name: 'Anlatım Teknikleri',
      order: 23,
      children: [
        { name: 'Betimleme', order: 1 },
        { name: 'Öyküleme', order: 2 },
        { name: 'Tartışma', order: 3 },
        { name: 'Açıklama', order: 4 },
        { name: 'Özetleme', order: 5 },
      ],
    },
    {
      name: 'Paragraf ve Metin Türleri',
      order: 24,
      children: [
        { name: 'Paragrafın Özellikleri', order: 1 },
        { name: 'Metin Türleri', order: 2 },
        { name: 'Şiir', order: 3 },
        { name: 'Hikaye', order: 4 },
        { name: 'Roman', order: 5 },
        { name: 'Deneme', order: 6 },
        { name: 'Makale', order: 7 },
        { name: 'Fıkra', order: 8 },
        { name: 'Hatıra', order: 9 },
        { name: 'Gezi Yazısı', order: 10 },
        { name: 'Biyografi ve Otobiyografi', order: 11 },
        { name: 'Günlük', order: 12 },
        { name: 'Mektup', order: 13 },
        { name: 'Tiyatro', order: 14 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    const parentTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: edebiyatSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu eklendi: ${konu.name}`);

    // Alt konuları ekle
    for (const child of konu.children) {
      await prisma.topic.create({
        data: {
          name: child.name,
          subjectId: edebiyatSubject.id,
          parentTopicId: parentTopic.id,
          order: child.order,
        },
      });
      console.log(`    Alt konu eklendi: ${child.name}`);
    }
  }

  console.log('\nAYT Türk Dili ve Edebiyatı konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

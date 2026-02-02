// LGS Türkçe Dersi ve Konuları Seed Dosyası (8. Sınıf)
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('LGS Türkçe dersi ve konuları ekleniyor...');

  // LGS Türkçe Dersini oluştur
  const turkceSubject = await prisma.subject.create({
    data: {
      name: 'Türkçe',
      examType: ExamType.LGS,
      gradeLevels: [8],
      order: 1,
      isActive: true,
    },
  });

  console.log(`LGS Türkçe dersi oluşturuldu: ${turkceSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Sözcükte Anlam',
      order: 1,
      children: [
        { name: 'Sözün Gerçek ve Mecaz Anlamı', order: 1 },
        { name: 'Sözün Dış ve İç Anlamı', order: 2 },
        { name: 'Terim Anlamı', order: 3 },
        { name: 'Deyim ve Atasözü', order: 4 },
        { name: 'Söz Yorumu', order: 5 },
      ],
    },
    {
      name: 'Cümlede Anlam',
      order: 2,
      children: [
        { name: 'Cümlenin Ögeleri', order: 1 },
        { name: 'Cümle Türleri', order: 2 },
        { name: 'Cümlede Anlam İlişkileri', order: 3 },
      ],
    },
    {
      name: 'Paragraf',
      order: 3,
      children: [
        { name: 'Paragrafta Konu ve Ana Düşünce', order: 1 },
        { name: 'Paragrafta Yardımcı Düşünce', order: 2 },
        { name: 'Paragrafta Düşünceyi Geliştirme Yolları', order: 3 },
        { name: 'Paragrafta Anlatım Teknikleri', order: 4 },
        { name: 'Paragrafta Yapı', order: 5 },
      ],
    },
    {
      name: 'Ses Bilgisi',
      order: 4,
      children: [
        { name: 'Ses Olayları', order: 1 },
        { name: 'Ünlülerle İlgili Olaylar', order: 2 },
        { name: 'Ünsüzlerle İlgili Olaylar', order: 3 },
      ],
    },
    {
      name: 'Yazım Kuralları',
      order: 5,
      children: [
        { name: 'Büyük Harflerin Kullanımı', order: 1 },
        { name: 'Ünlülerin Yazımı', order: 2 },
        { name: 'Ünsüzlerin Yazımı', order: 3 },
        { name: 'Kısaltmaların Yazımı', order: 4 },
        { name: 'Sayıların Yazımı', order: 5 },
        { name: 'Yabancı Kelimelerin Yazımı', order: 6 },
      ],
    },
    {
      name: 'Noktalama İşaretleri',
      order: 6,
      children: [
        { name: 'Nokta, Virgül, Noktalı Virgül', order: 1 },
        { name: 'İki Nokta, Üç Nokta, Tırnak', order: 2 },
        { name: 'Soru ve Ünlem İşareti', order: 3 },
        { name: 'Tire, Açık Parantez, Eğik Çizgi', order: 4 },
        { name: 'Kesme İşareti', order: 5 },
      ],
    },
    {
      name: 'Sözcükte Yapı',
      order: 7,
      children: [
        { name: 'Kök ve Ek', order: 1 },
        { name: 'Yapım Ekleri', order: 2 },
        { name: 'Çekim Ekleri', order: 3 },
      ],
    },
    {
      name: 'Sözcük Türleri',
      order: 8,
      children: [
        { name: 'İsimler', order: 1 },
        { name: 'Zamirler', order: 2 },
        { name: 'Sıfatlar', order: 3 },
        { name: 'Zarflar', order: 4 },
        { name: 'Edatlar', order: 5 },
        { name: 'Bağlaçlar', order: 6 },
        { name: 'Ünlemler', order: 7 },
        { name: 'Fiiller', order: 8 },
        { name: 'Ek Fiil', order: 9 },
      ],
    },
    {
      name: 'Fiiller',
      order: 9,
      children: [
        { name: 'Fiilde Anlam', order: 1 },
        { name: 'Fiilde Çatı', order: 2 },
        { name: 'Fiilde Kip', order: 3 },
        { name: 'Fiilde Zaman', order: 4 },
        { name: 'Fiilde Şahıs', order: 5 },
        { name: 'Fiilde Olumsuzluk ve Soru', order: 6 },
      ],
    },
    {
      name: 'Cümle Bilgisi',
      order: 10,
      children: [
        { name: 'Cümle Türleri', order: 1 },
        { name: 'Cümle Ögeleri', order: 2 },
        { name: 'Cümle Analizi', order: 3 },
      ],
    },
    {
      name: 'Anlatım Bozuklukları',
      order: 11,
      children: [
        { name: 'Sözcük ve Anlam Bozuklukları', order: 1 },
        { name: 'Dil Bilgisi Bozuklukları', order: 2 },
        { name: 'Söz Dizimi Bozuklukları', order: 3 },
      ],
    },
    {
      name: 'Yazı Türleri',
      order: 12,
      children: [
        { name: 'Öykü (Hikaye)', order: 1 },
        { name: 'Roman', order: 2 },
        { name: 'Şiir', order: 3 },
        { name: 'Tiyatro', order: 4 },
        { name: 'Deneme', order: 5 },
        { name: 'Fıkra', order: 6 },
        { name: 'Makale', order: 7 },
        { name: 'Sohbet (Mektup)', order: 8 },
        { name: 'Hatıra', order: 9 },
        { name: 'Gezi Yazısı', order: 10 },
        { name: 'Biyografi ve Otobiyografi', order: 11 },
      ],
    },
    {
      name: 'Görsel ve Sözel Metin',
      order: 13,
      children: [
        { name: 'Grafik ve Tablo Yorumlama', order: 1 },
        { name: 'Karikatür Yorumlama', order: 2 },
        { name: 'Paragraf Tamamlama', order: 3 },
        { name: 'Cümle Tamamlama', order: 4 },
        { name: 'Metin Tamamlama', order: 5 },
      ],
    },
  ];

  // Konuları oluştur
  for (const konu of konular) {
    const mainTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: turkceSubject.id,
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
            subjectId: turkceSubject.id,
            parentTopicId: mainTopic.id,
            order: child.order,
          },
        });
        console.log(`    Alt konu: ${child.name}`);
      }
    }
  }

  console.log('LGS Türkçe konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

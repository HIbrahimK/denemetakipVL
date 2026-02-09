// LGS Fen Bilimleri Dersi ve Konuları Seed Dosyası (8. Sınıf)
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('LGS Fen Bilimleri dersi ve konuları ekleniyor...');

  // LGS Fen Bilimleri Dersini kontrol et veya oluştur
  let fenSubject = await prisma.subject.findFirst({
    where: { name: 'Fen Bilimleri', examType: ExamType.LGS },
  });

  if (!fenSubject) {
    fenSubject = await prisma.subject.create({
      data: {
        name: 'Fen Bilimleri',
        examType: ExamType.LGS,
        gradeLevels: [8],
        order: 3,
        isActive: true,
      },
    });
    console.log(`LGS Fen Bilimleri dersi oluşturuldu: ${fenSubject.id}`);
  } else {
    console.log(`LGS Fen Bilimleri dersi zaten mevcut: ${fenSubject.id}`);
  }

  // Ana konular ve alt konular (Fizik, Kimya, Biyoloji birleşik)
  const konular = [
    {
      name: 'Fizik - Mevsimler ve İklim',
      order: 1,
      children: [
        { name: 'Mevsimlerin Oluşumu', order: 1 },
        { name: 'İklim ve Hava Durumu', order: 2 },
        { name: 'Yeryüzünde Isınma ve Soğuma', order: 3 },
      ],
    },
    {
      name: 'Fizik - DNA ve Genetik Kod',
      order: 2,
      children: [
        { name: 'Kalıtım ve Genetik', order: 1 },
        { name: 'DNA ve Genetik Kod', order: 2 },
        { name: 'Genetik Çeşitlilik', order: 3 },
      ],
    },
    {
      name: 'Fizik - Güneş Sistemi ve Ötesi',
      order: 3,
      children: [
        { name: 'Güneş Sistemi', order: 1 },
        { name: 'Gezegenler ve Uydular', order: 2 },
        { name: 'Yıldızlar ve Galaksiler', order: 3 },
        { name: 'Uzay Araştırmaları', order: 4 },
      ],
    },
    {
      name: 'Fizik - Kuvvet ve Hareket',
      order: 4,
      children: [
        { name: 'Kuvvet Kavramı', order: 1 },
        { name: 'Kuvvetin Etkileri', order: 2 },
        { name: 'Hareket ve Sürtünme', order: 3 },
        { name: 'Newton Yasaları', order: 4 },
        { name: 'Dengelenmiş ve Dengelenmemiş Kuvvetler', order: 5 },
      ],
    },
    {
      name: 'Fizik - Basınç',
      order: 5,
      children: [
        { name: 'Basınç Kavramı', order: 1 },
        { name: 'Katıların Basıncı', order: 2 },
        { name: 'Sıvıların Basıncı', order: 3 },
        { name: 'Gazların Basıncı', order: 4 },
        { name: 'Atmosfer Basıncı', order: 5 },
        { name: 'Yükseltme Kuvveti', order: 6 },
      ],
    },
    {
      name: 'Fizik - Madde ve Isı',
      order: 6,
      children: [
        { name: 'Isı ve Sıcaklık', order: 1 },
        { name: 'Isı Transferi', order: 2 },
        { name: 'Genleşme ve Büzülme', order: 3 },
        { name: 'Isı Yalıtımı', order: 4 },
      ],
    },
    {
      name: 'Fizik - Elektrostatik',
      order: 7,
      children: [
        { name: 'Elektrik Yükleri', order: 1 },
        { name: 'Yüklü Cisimler', order: 2 },
        { name: 'Elektroskop', order: 3 },
        { name: 'Yükleme Türleri', order: 4 },
      ],
    },
    {
      name: 'Fizik - Elektrik Devreleri',
      order: 8,
      children: [
        { name: 'Elektrik Akımı', order: 1 },
        { name: 'Elektrik Potansiyeli', order: 2 },
        { name: 'Direnç', order: 3 },
        { name: 'Ohm Kanunu', order: 4 },
        { name: 'Seri ve Paralel Devreler', order: 5 },
      ],
    },
    {
      name: 'Fizik - Manyetizma',
      order: 9,
      children: [
        { name: 'Mıknatıslar', order: 1 },
        { name: 'Manyetik Alan', order: 2 },
        { name: 'Elektromıknatıs', order: 3 },
        { name: 'Dünya\'nın Manyetik Alanı', order: 4 },
      ],
    },
    {
      name: 'Fizik - Işık ve Görme',
      order: 10,
      children: [
        { name: 'Işığın Yayılması', order: 1 },
        { name: 'Işığın Yansıması', order: 2 },
        { name: 'Işığın Kırılması', order: 3 },
        { name: 'Renkler', order: 4 },
        { name: 'Göz ve Görme', order: 5 },
      ],
    },
    {
      name: 'Kimya - Atom ve Periyodik Sistem',
      order: 11,
      children: [
        { name: 'Atomun Yapısı', order: 1 },
        { name: 'Atom Numarası ve Kütle Numarası', order: 2 },
        { name: 'Periyodik Sistem', order: 3 },
        { name: 'Elementlerin Periyodik Özellikleri', order: 4 },
      ],
    },
    {
      name: 'Kimya - Bileşikler',
      order: 12,
      children: [
        { name: 'Bileşikler ve Formüller', order: 1 },
        { name: 'İyonik Bileşikler', order: 2 },
        { name: 'Kovalent Bileşikler', order: 3 },
        { name: 'Bileşiklerin Adlandırılması', order: 4 },
      ],
    },
    {
      name: 'Kimya - Fiziksel ve Kimyasal Değişimler',
      order: 13,
      children: [
        { name: 'Fiziksel Değişimler', order: 1 },
        { name: 'Kimyasal Değişimler', order: 2 },
        { name: 'Kimyasal Tepkimeler', order: 3 },
        { name: 'Tepkime Türleri', order: 4 },
      ],
    },
    {
      name: 'Kimya - Karışımlar',
      order: 14,
      children: [
        { name: 'Homojen ve Heterojen Karışımlar', order: 1 },
        { name: 'Çözeltiler', order: 2 },
        { name: 'Koloidler ve Süspansiyonlar', order: 3 },
        { name: 'Karışımları Ayırma Yöntemleri', order: 4 },
      ],
    },
    {
      name: 'Kimya - Asit, Baz ve Tuz',
      order: 15,
      children: [
        { name: 'Asitler', order: 1 },
        { name: 'Bazlar', order: 2 },
        { name: 'Asit ve Bazların Özellikleri', order: 3 },
        { name: 'pH Kavramı', order: 4 },
        { name: 'Tuzlar', order: 5 },
        { name: 'Nötralleşme Tepkimeleri', order: 6 },
      ],
    },
    {
      name: 'Biyoloji - Hücre ve Organeller',
      order: 16,
      children: [
        { name: 'Hücrenin Keşfi', order: 1 },
        { name: 'Hücrenin Yapısı', order: 2 },
        { name: 'Hücre Zarı', order: 3 },
        { name: 'Sitoplazma', order: 4 },
        { name: 'Çekirdek', order: 5 },
        { name: 'Mitokondri', order: 6 },
        { name: 'Kloroplast', order: 7 },
        { name: 'Ribozom ve Endoplazmik Retikulum', order: 8 },
        { name: 'Golgi Cisimciği', order: 9 },
        { name: 'Lizozom ve Vakuol', order: 10 },
      ],
    },
    {
      name: 'Biyoloji - Hücre Bölünmesi',
      order: 17,
      children: [
        { name: 'Mitoz Bölünme', order: 1 },
        { name: 'Mayoz Bölünme', order: 2 },
        { name: 'Eşeyli ve Eşeysiz Üreme', order: 3 },
      ],
    },
    {
      name: 'Biyoloji - Ekosistem ve Çevre',
      order: 18,
      children: [
        { name: 'Ekosistem Kavramı', order: 1 },
        { name: 'Besin Zinciri ve Besin Ağı', order: 2 },
        { name: 'Materyal Döngüleri', order: 3 },
        { name: 'Enerji Akışı', order: 4 },
        { name: 'Çevre Kirliliği', order: 5 },
        { name: 'Biyoçeşitlilik', order: 6 },
      ],
    },
    {
      name: 'Biyoloji - İnsan ve Çevre',
      order: 19,
      children: [
        { name: 'İnsan ve Doğa İlişkisi', order: 1 },
        { name: 'Sürdürülebilirlik', order: 2 },
        { name: 'Doğal Kaynakların Korunması', order: 3 },
        { name: 'Atık Yönetimi', order: 4 },
      ],
    },
    {
      name: 'Biyoloji - Canlılar ve Yaşam',
      order: 20,
      children: [
        { name: 'Canlıların Ortak Özellikleri', order: 1 },
        { name: 'Canlıların Sınıflandırılması', order: 2 },
        { name: 'Monera, Protista ve Mantarlar', order: 3 },
        { name: 'Bitkiler', order: 4 },
        { name: 'Hayvanlar', order: 5 },
      ],
    },
  ];

  // Konuları oluştur
  for (const konu of konular) {
    let mainTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: fenSubject.id, parentTopicId: null },
    });

    if (!mainTopic) {
      mainTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: fenSubject.id,
          order: konu.order,
        },
      });
      console.log(`  Ana konu oluşturuldu: ${konu.name}`);
    } else {
      console.log(`  Ana konu zaten mevcut: ${konu.name}`);
    }

    // Alt konuları oluştur
    if (konu.children && konu.children.length > 0) {
      for (const child of konu.children) {
        const existingChild = await prisma.topic.findFirst({
          where: { name: child.name, subjectId: fenSubject.id, parentTopicId: mainTopic.id },
        });

        if (!existingChild) {
          await prisma.topic.create({
            data: {
              name: child.name,
              subjectId: fenSubject.id,
              parentTopicId: mainTopic.id,
              order: child.order,
            },
          });
          console.log(`    Alt konu: ${child.name}`);
        }
      }
    }
  }

  console.log('LGS Fen Bilimleri konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

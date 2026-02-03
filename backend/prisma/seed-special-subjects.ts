// Özel Ders Tipleri ve Aktiviteler Seed Dosyası
// Branş Denemeleri, Konu Tekrarları ve Özel Denemeler
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Özel ders tipleri ve aktiviteler ekleniyor...');

  // TYT Branş Denemeleri
  const tytBransDenemeler = [
    { name: 'Matematik Branş Denemesi', examType: 'TYT', order: 100 },
    { name: 'Türkçe Branş Denemesi', examType: 'TYT', order: 101 },
    { name: 'Fizik Branş Denemesi', examType: 'TYT', order: 102 },
    { name: 'Kimya Branş Denemesi', examType: 'TYT', order: 103 },
    { name: 'Biyoloji Branş Denemesi', examType: 'TYT', order: 104 },
    { name: 'Tarih Branş Denemesi', examType: 'TYT', order: 105 },
    { name: 'Coğrafya Branş Denemesi', examType: 'TYT', order: 106 },
    { name: 'Felsefe Branş Denemesi', examType: 'TYT', order: 107 },
    { name: 'Din Kültürü Branş Denemesi', examType: 'TYT', order: 108 },
    { name: 'Geometri Branş Denemesi', examType: 'TYT', order: 109 },
  ];

  // AYT Branş Denemeleri
  const aytBransDenemeler = [
    { name: 'Matematik Branş Denemesi', examType: 'AYT', order: 200 },
    { name: 'Fizik Branş Denemesi', examType: 'AYT', order: 201 },
    { name: 'Kimya Branş Denemesi', examType: 'AYT', order: 202 },
    { name: 'Biyoloji Branş Denemesi', examType: 'AYT', order: 203 },
    { name: 'Edebiyat Branş Denemesi', examType: 'AYT', order: 204 },
    { name: 'Tarih Branş Denemesi', examType: 'AYT', order: 205 },
    { name: 'Coğrafya Branş Denemesi', examType: 'AYT', order: 206 },
    { name: 'Felsefe Branş Denemesi', examType: 'AYT', order: 207 },
    { name: 'Din Kültürü Branş Denemesi', examType: 'AYT', order: 208 },
    { name: 'Geometri Branş Denemesi', examType: 'AYT', order: 209 },
  ];

  // LGS Branş Denemeleri
  const lgsBransDenemeler = [
    { name: 'Matematik Branş Denemesi', examType: 'LGS', order: 300 },
    { name: 'Türkçe Branş Denemesi', examType: 'LGS', order: 301 },
    { name: 'Fen Bilimleri Branş Denemesi', examType: 'LGS', order: 302 },
    { name: 'İngilizce Branş Denemesi', examType: 'LGS', order: 303 },
    { name: 'İnkılap Tarihi Branş Denemesi', examType: 'LGS', order: 304 },
    { name: 'Din Kültürü Branş Denemesi', examType: 'LGS', order: 305 },
  ];

  // YDT Branş Denemeleri
  const ydtBransDenemeler = [
    { name: 'İngilizce Branş Denemesi', examType: 'YDT', order: 400 },
  ];

  // TYT Konu Tekrarları
  const tytKonuTekrarlari = [
    { name: 'Matematik Konu Tekrarı', examType: 'TYT', order: 500 },
    { name: 'Türkçe Konu Tekrarı', examType: 'TYT', order: 501 },
    { name: 'Fizik Konu Tekrarı', examType: 'TYT', order: 502 },
    { name: 'Kimya Konu Tekrarı', examType: 'TYT', order: 503 },
    { name: 'Biyoloji Konu Tekrarı', examType: 'TYT', order: 504 },
    { name: 'Tarih Konu Tekrarı', examType: 'TYT', order: 505 },
    { name: 'Coğrafya Konu Tekrarı', examType: 'TYT', order: 506 },
    { name: 'Felsefe Konu Tekrarı', examType: 'TYT', order: 507 },
    { name: 'Din Kültürü Konu Tekrarı', examType: 'TYT', order: 508 },
    { name: 'Geometri Konu Tekrarı', examType: 'TYT', order: 509 },
  ];

  // AYT Konu Tekrarları
  const aytKonuTekrarlari = [
    { name: 'Matematik Konu Tekrarı', examType: 'AYT', order: 600 },
    { name: 'Fizik Konu Tekrarı', examType: 'AYT', order: 601 },
    { name: 'Kimya Konu Tekrarı', examType: 'AYT', order: 602 },
    { name: 'Biyoloji Konu Tekrarı', examType: 'AYT', order: 603 },
    { name: 'Edebiyat Konu Tekrarı', examType: 'AYT', order: 604 },
    { name: 'Tarih Konu Tekrarı', examType: 'AYT', order: 605 },
    { name: 'Coğrafya Konu Tekrarı', examType: 'AYT', order: 606 },
    { name: 'Felsefe Konu Tekrarı', examType: 'AYT', order: 607 },
    { name: 'Din Kültürü Konu Tekrarı', examType: 'AYT', order: 608 },
    { name: 'Geometri Konu Tekrarı', examType: 'AYT', order: 609 },
  ];

  // LGS Konu Tekrarları
  const lgsKonuTekrarlari = [
    { name: 'Matematik Konu Tekrarı', examType: 'LGS', order: 700 },
    { name: 'Türkçe Konu Tekrarı', examType: 'LGS', order: 701 },
    { name: 'Fen Bilimleri Konu Tekrarı', examType: 'LGS', order: 702 },
    { name: 'İngilizce Konu Tekrarı', examType: 'LGS', order: 703 },
    { name: 'İnkılap Tarihi Konu Tekrarı', examType: 'LGS', order: 704 },
    { name: 'Din Kültürü Konu Tekrarı', examType: 'LGS', order: 705 },
  ];

  // Tüm branş denemelerini ekle
  console.log('Branş denemeleri ekleniyor...');
  const allBransDenemeler = [
    ...tytBransDenemeler,
    ...aytBransDenemeler,
    ...lgsBransDenemeler,
    ...ydtBransDenemeler,
  ];

  for (const deneme of allBransDenemeler) {
    const existing = await prisma.subject.findFirst({
      where: {
        name: deneme.name,
        examType: deneme.examType,
        type: 'BRANŞ_DENEMESI',
      },
    });

    if (!existing) {
      await prisma.subject.create({
        data: {
          name: deneme.name,
          examType: deneme.examType,
          gradeLevels: deneme.examType === 'LGS' ? [8] : [9, 10, 11, 12],
          order: deneme.order,
          type: 'BRANŞ_DENEMESI',
          isActive: true,
        },
      });
      console.log(`✓ ${deneme.name} (${deneme.examType}) eklendi`);
    } else {
      console.log(`- ${deneme.name} (${deneme.examType}) zaten mevcut`);
    }
  }

  // Tüm konu tekrarlarını ekle
  console.log('\nKonu tekrarları ekleniyor...');
  const allKonuTekrarlari = [
    ...tytKonuTekrarlari,
    ...aytKonuTekrarlari,
    ...lgsKonuTekrarlari,
  ];

  for (const tekrar of allKonuTekrarlari) {
    const existing = await prisma.subject.findFirst({
      where: {
        name: tekrar.name,
        examType: tekrar.examType,
        type: 'KONU_TEKRARI',
      },
    });

    if (!existing) {
      await prisma.subject.create({
        data: {
          name: tekrar.name,
          examType: tekrar.examType,
          gradeLevels: tekrar.examType === 'LGS' ? [8] : [9, 10, 11, 12],
          order: tekrar.order,
          type: 'KONU_TEKRARI',
          isActive: true,
        },
      });
      console.log(`✓ ${tekrar.name} (${tekrar.examType}) eklendi`);
    } else {
      console.log(`- ${tekrar.name} (${tekrar.examType}) zaten mevcut`);
    }
  }

  // Özel deneme aktivitelerini ekle (Topic olarak, subject'e bağlı değil)
  console.log('\nÖzel deneme aktiviteleri ekleniyor...');
  const ozelDenemeler = [
    { name: 'MEBİ Denemesi', order: 1000 },
    { name: 'TYT Denemesi', order: 1001 },
    { name: 'AYT Denemesi', order: 1002 },
    { name: 'MSÜ Denemesi', order: 1003 },
    { name: 'YKS Denemesi', order: 1004 },
    { name: 'LGS Denemesi', order: 1005 },
  ];

  for (const deneme of ozelDenemeler) {
    const existing = await prisma.topic.findFirst({
      where: {
        name: deneme.name,
        isSpecialActivity: true,
        subjectId: null,
      },
    });

    if (!existing) {
      await prisma.topic.create({
        data: {
          name: deneme.name,
          order: deneme.order,
          isSpecialActivity: true,
          subjectId: null,
        },
      });
      console.log(`✓ ${deneme.name} aktivitesi eklendi`);
    } else {
      console.log(`- ${deneme.name} aktivitesi zaten mevcut`);
    }
  }

  console.log('\n✅ Özel ders tipleri ve aktiviteler başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

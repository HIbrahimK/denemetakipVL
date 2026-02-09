// LGS İngilizce Dersi ve Konuları Seed Dosyası (8. Sınıf)
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('LGS İngilizce dersi ve konuları ekleniyor...');

  // LGS İngilizce Dersini kontrol et veya oluştur
  let ingilizceSubject = await prisma.subject.findFirst({
    where: { name: 'İngilizce', examType: ExamType.LGS },
  });

  if (!ingilizceSubject) {
    ingilizceSubject = await prisma.subject.create({
      data: {
        name: 'İngilizce',
        examType: ExamType.LGS,
        gradeLevels: [8],
        order: 6,
        isActive: true,
      },
    });
    console.log(`LGS İngilizce dersi oluşturuldu: ${ingilizceSubject.id}`);
  } else {
    console.log(`LGS İngilizce dersi zaten mevcut: ${ingilizceSubject.id}`);
  }

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Kelime Bilgisi (Vocabulary)',
      order: 1,
      children: [
        { name: 'Günlük Hayat Kelimeleri', order: 1 },
        { name: 'Aile ve Akrabalar', order: 2 },
        { name: 'Okul ve Eğitim', order: 3 },
        { name: 'Meslekler', order: 4 },
        { name: 'Yiyecek ve İçecekler', order: 5 },
        { name: 'Giyim ve Moda', order: 6 },
        { name: 'Ev ve Mobilya', order: 7 },
        { name: 'Şehir ve Ulaşım', order: 8 },
        { name: 'Doğa ve Çevre', order: 9 },
        { name: 'Spor ve Eğlence', order: 10 },
        { name: 'Sağlık ve Hastalık', order: 11 },
        { name: 'Seyahat ve Tatil', order: 12 },
        { name: 'Teknoloji ve İnternet', order: 13 },
        { name: 'Duygular ve Hisler', order: 14 },
        { name: 'Zaman ve Hava Durumu', order: 15 },
      ],
    },
    {
      name: 'Fiiller (Verbs)',
      order: 2,
      children: [
        { name: 'Be Fiili', order: 1 },
        { name: 'Have Fiili', order: 2 },
        { name: 'Do Fiili', order: 3 },
        { name: 'Düzenli ve Düzensiz Fiiller', order: 4 },
        { name: 'Phrasal Verbs (Edatlı Fiiller)', order: 5 },
        { name: 'Modals (Can, Could, May, Might)', order: 6 },
        { name: 'Must, Have to, Should', order: 7 },
        { name: 'Would Like, Want', order: 8 },
        { name: 'Used to', order: 9 },
        { name: 'Causative Verbs (Ettirgen Fiiller)', order: 10 },
      ],
    },
    {
      name: 'Zamanlar (Tenses)',
      order: 3,
      children: [
        { name: 'Present Simple (Geniş Zaman)', order: 1 },
        { name: 'Present Continuous (Şimdiki Zaman)', order: 2 },
        { name: 'Past Simple (Geçmiş Zaman)', order: 3 },
        { name: 'Past Continuous (Geçmişte Şimdiki Zaman)', order: 4 },
        { name: 'Future Simple (Gelecek Zaman)', order: 5 },
        { name: 'Be Going To (Gelecek Plan)', order: 6 },
        { name: 'Present Perfect (Şimdiki Zamanın Hikayesi)', order: 7 },
        { name: 'Past Perfect (Geçmiş Zamanın Hikayesi)', order: 8 },
        { name: 'Used to / Would', order: 9 },
      ],
    },
    {
      name: 'İsimler (Nouns)',
      order: 4,
      children: [
        { name: 'Sayılabilen ve Sayılamayan İsimler', order: 1 },
        { name: 'Tekil ve Çoğul İsimler', order: 2 },
        { name: 'Özel İsimler', order: 3 },
        { name: 'Somut ve Soyut İsimler', order: 4 },
      ],
    },
    {
      name: 'Sıfatlar (Adjectives)',
      order: 5,
      children: [
        { name: 'Sıfatların Kullanımı', order: 1 },
        { name: 'Karşılaştırma Dereceleri (Comparative)', order: 2 },
        { name: 'Üstünlük Derecesi (Superlative)', order: 3 },
        { name: 'Possessive Adjectives (İyelik Sıfatları)', order: 4 },
        { name: 'Demonstrative Adjectives (İşaret Sıfatları)', order: 5 },
        { name: 'Quantifiers (Miktar Belirteçleri)', order: 6 },
      ],
    },
    {
      name: 'Zarflar (Adverbs)',
      order: 6,
      children: [
        { name: 'Zaman Zarfları', order: 1 },
        { name: 'Yer-Yön Zarfları', order: 2 },
        { name: 'Bicim Zarfları', order: 3 },
        { name: 'Sıklık Zarfları', order: 4 },
        { name: 'Derece Zarfları', order: 5 },
      ],
    },
    {
      name: 'Zamirler (Pronouns)',
      order: 7,
      children: [
        { name: 'Kişi Zamirleri (I, You, He, She, It, We, They)', order: 1 },
        { name: 'İyelik Zamirleri (Mine, Yours, His, Hers)', order: 2 },
        { name: 'İşaret Zamirleri (This, That, These, Those)', order: 3 },
        { name: 'Soru Zamirleri (Who, What, Which, Whose)', order: 4 },
        { name: 'Bağlamsal Zamirler (Reflexive Pronouns)', order: 5 },
        { name: 'Belgisiz Zamirler (Some, Any, No, Every)', order: 6 },
      ],
    },
    {
      name: 'Edatlar (Prepositions)',
      order: 8,
      children: [
        { name: 'Yer ve Yön Edatları (in, on, at, under, behind)', order: 1 },
        { name: 'Zaman Edatları (in, on, at, before, after)', order: 2 },
        { name: 'Hareket Edatları (to, into, through, across)', order: 3 },
        { name: 'Diğer Edatlar (with, without, by, for)', order: 4 },
      ],
    },
    {
      name: 'Bağlaçlar (Conjunctions)',
      order: 9,
      children: [
        { name: 'Basit Bağlaçlar (and, but, or, so)', order: 1 },
        { name: 'Zıtlık Bağlaçları (although, though, but)', order: 2 },
        { name: 'Sebep-Sonuç Bağlaçları (because, since, as)', order: 3 },
        { name: 'Koşul Bağlaçları (if, unless)', order: 4 },
        { name: 'Zaman Bağlaçları (when, while, before, after)', order: 5 },
      ],
    },
    {
      name: 'Articles (Belirteçler)',
      order: 10,
      children: [
        { name: 'A / An Kullanımı', order: 1 },
        { name: 'The Kullanımı', order: 2 },
        { name: 'Articles Kullanılmayan Durumlar', order: 3 },
      ],
    },
    {
      name: 'There is / There are',
      order: 11,
      children: [
        { name: 'There is / There are Yapısı', order: 1 },
        { name: 'Soru ve Olumsuz Cümleler', order: 2 },
        { name: 'Some / Any ile Kullanımı', order: 3 },
      ],
    },
    {
      name: 'Have Got / Has Got',
      order: 12,
      children: [
        { name: 'Have Got / Has Got Yapısı', order: 1 },
        { name: 'Soru ve Olumsuz Cümleler', order: 2 },
      ],
    },
    {
      name: 'Question Tags (Ek Sorular)',
      order: 13,
      children: [
        { name: 'Question Tags Kuralı', order: 1 },
        { name: 'Olumlu ve Olumsuz Kullanım', order: 2 },
      ],
    },
    {
      name: 'Reported Speech (Dolaylı Anlatım)',
      order: 14,
      children: [
        { name: 'Dolaylı Anlatımda Tense Değişimi', order: 1 },
        { name: 'Dolaylı Anlatımda Zamir Değişimi', order: 2 },
        { name: 'Dolaylı Anlatımda Zaman Zarfları', order: 3 },
        { name: 'Say / Tell / Ask Kullanımı', order: 4 },
      ],
    },
    {
      name: 'Passive Voice (Edilgen Yapı)',
      order: 15,
      children: [
        { name: 'Passive Voice Yapısı', order: 1 },
        { name: 'Tense\'lere Göre Passive', order: 2 },
        { name: 'By İfadesi', order: 3 },
      ],
    },
    {
      name: 'Conditionals (Koşul Cümleleri)',
      order: 16,
      children: [
        { name: 'Zero Conditional', order: 1 },
        { name: 'First Conditional', order: 2 },
        { name: 'Second Conditional', order: 3 },
        { name: 'Unless Kullanımı', order: 4 },
      ],
    },
    {
      name: 'Wish Clauses (Dilek Cümleleri)',
      order: 17,
      children: [
        { name: 'Wish + Past Simple', order: 1 },
        { name: 'Wish + Past Perfect', order: 2 },
        { name: 'Wish + Would', order: 3 },
      ],
    },
    {
      name: 'Relative Clauses (İlgi Cümleleri)',
      order: 18,
      children: [
        { name: 'Who / Which / That', order: 1 },
        { name: 'Whose / Where / When', order: 2 },
        { name: 'Defining Relative Clauses', order: 3 },
        { name: 'Non-Defining Relative Clauses', order: 4 },
      ],
    },
    {
      name: 'Reading Comprehension (Okuma Anlama)',
      order: 19,
      children: [
        { name: 'Paragraf Anlama', order: 1 },
        { name: 'Ana Fikir ve Yardımcı Fikir', order: 2 },
        { name: 'Çıkarım Yapma', order: 3 },
        { name: 'Kelime Anlamı Çıkarma', order: 4 },
        { name: 'Referans Soruları', order: 5 },
      ],
    },
    {
      name: 'Dialogue Completion (Konuşma Tamamlama)',
      order: 20,
      children: [
        { name: 'Selamlaşma ve Tanışma', order: 1 },
        { name: 'Günlük Konuşmalar', order: 2 },
        { name: 'Telefon Konuşmaları', order: 3 },
        { name: 'Restoranda Sipariş Verme', order: 4 },
        { name: 'Alışveriş', order: 5 },
        { name: 'Yol Tarifi Alma', order: 6 },
      ],
    },
    {
      name: 'Sentence Completion (Cümle Tamamlama)',
      order: 21,
      children: [
        { name: 'Uygun Kelime Seçimi', order: 1 },
        { name: 'Uygrama Kuralları', order: 2 },
        { name: 'Bağlaç Seçimi', order: 3 },
      ],
    },
    {
      name: 'Word Formation (Kelime Türetme)',
      order: 22,
      children: [
        { name: 'Sıfat Yapım Ekleri', order: 1 },
        { name: 'İsim Yapım Ekleri', order: 2 },
        { name: 'Zarf Yapım Ekleri', order: 3 },
        { name: 'Olumsuzluk Ekleri', order: 4 },
      ],
    },
    {
      name: ' Cloze Test (Boşluk Doldurma)',
      order: 23,
      children: [
        { name: 'Paragraf İçi Boşluk Doldurma', order: 1 },
        { name: 'Kelime Anlamına Göre Boşluk Doldurma', order: 2 },
        { name: 'Gramere Göre Boşluk Doldurma', order: 3 },
      ],
    },
  ];

  // Konuları oluştur
  for (const konu of konular) {
    let mainTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: ingilizceSubject.id, parentTopicId: null },
    });

    if (!mainTopic) {
      mainTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: ingilizceSubject.id,
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
          where: { name: child.name, subjectId: ingilizceSubject.id, parentTopicId: mainTopic.id },
        });

        if (!existingChild) {
          await prisma.topic.create({
            data: {
              name: child.name,
              subjectId: ingilizceSubject.id,
              parentTopicId: mainTopic.id,
              order: child.order,
            },
          });
          console.log(`    Alt konu: ${child.name}`);
        }
      }
    }
  }

  console.log('LGS İngilizce konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

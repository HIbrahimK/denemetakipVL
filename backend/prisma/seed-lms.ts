import { PrismaClient, ExamType, TopicDifficulty, ResourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSubjectsAndTopics() {
  console.log('🌳 Seeding subjects and topics...');

  const subjectsData = [
    // TYT Subjects
    { name: 'Matematik', examType: ExamType.TYT, gradeLevels: [9, 10, 11, 12] },
    { name: 'Türkçe', examType: ExamType.TYT, gradeLevels: [9, 10, 11, 12] },
    { name: 'Fizik', examType: ExamType.TYT, gradeLevels: [9, 10, 11, 12] },
    { name: 'Kimya', examType: ExamType.TYT, gradeLevels: [9, 10, 11, 12] },
    { name: 'Biyoloji', examType: ExamType.TYT, gradeLevels: [9, 10, 11, 12] },
    { name: 'Tarih', examType: ExamType.TYT, gradeLevels: [9, 10, 11, 12] },
    { name: 'Coğrafya', examType: ExamType.TYT, gradeLevels: [9, 10, 11, 12] },
    { name: 'Felsefe', examType: ExamType.TYT, gradeLevels: [9, 10, 11, 12] },
    { name: 'Din Kültürü', examType: ExamType.TYT, gradeLevels: [9, 10, 11, 12] },
    
    // AYT Subjects
    { name: 'Matematik', examType: ExamType.AYT, gradeLevels: [11, 12] },
    { name: 'Fizik', examType: ExamType.AYT, gradeLevels: [11, 12] },
    { name: 'Kimya', examType: ExamType.AYT, gradeLevels: [11, 12] },
    { name: 'Biyoloji', examType: ExamType.AYT, gradeLevels: [11, 12] },
    { name: 'Edebiyat', examType: ExamType.AYT, gradeLevels: [11, 12] },
    { name: 'Tarih', examType: ExamType.AYT, gradeLevels: [11, 12] },
    { name: 'Coğrafya', examType: ExamType.AYT, gradeLevels: [11, 12] },
    
    // LGS Subjects
    { name: 'Matematik', examType: ExamType.LGS, gradeLevels: [5, 6, 7, 8] },
    { name: 'Türkçe', examType: ExamType.LGS, gradeLevels: [5, 6, 7, 8] },
    { name: 'Fen Bilimleri', examType: ExamType.LGS, gradeLevels: [5, 6, 7, 8] },
    { name: 'Sosyal Bilgiler', examType: ExamType.LGS, gradeLevels: [5, 6, 7, 8] },
    { name: 'İngilizce', examType: ExamType.LGS, gradeLevels: [5, 6, 7, 8] },
    { name: 'Din Kültürü', examType: ExamType.LGS, gradeLevels: [5, 6, 7, 8] },
  ];

  // Create subjects
  const createdSubjects: { [key: string]: string } = {};
  for (const subjectData of subjectsData) {
    const key = `${subjectData.examType}-${subjectData.name}`;
    const subject = await prisma.subject.upsert({
      where: {
        // Use a composite unique identifier
        id: createdSubjects[key] || '',
      },
      update: {},
      create: {
        name: subjectData.name,
        examType: subjectData.examType,
        gradeLevels: subjectData.gradeLevels,
      },
    });
    createdSubjects[key] = subject.id;
  }

  const topics = [
    // TYT Matematik
    { name: 'Temel Kavramlar', examType: ExamType.TYT, subjectName: 'Matematik', parent: null, order: 1, children: [
      { name: 'Çarpanlara Ayırma', difficulty: 'MEDIUM', order: 1 },
      { name: 'Üslü Sayılar', difficulty: 'EASY', order: 2 },
      { name: 'Köklü Sayılar', difficulty: 'MEDIUM', order: 3 },
      { name: 'Çarpanlar ve Katlar', difficulty: 'EASY', order: 4 },
    ]},
    { name: 'Denklemler', examType: ExamType.TYT, subjectName: 'Matematik', parent: null, order: 2, children: [
      { name: 'Birinci Derece Denklem', difficulty: 'EASY', order: 1 },
      { name: 'İkinci Derece Denklem', difficulty: 'MEDIUM', order: 2 },
      { name: 'Üslü ve Köklü Denklemler', difficulty: 'HARD', order: 3 },
    ]},
    { name: 'Fonksiyonlar', examType: ExamType.TYT, subjectName: 'Matematik', parent: null, order: 3, children: [
      { name: 'Fonksiyon Kavramı', difficulty: 'MEDIUM', order: 1 },
      { name: 'İkinci Derece Fonksiyon', difficulty: 'HARD', order: 2 },
      { name: 'Fonksiyon İşlemleri', difficulty: 'HARD', order: 3 },
    ]},
    { name: 'Polinomlar', examType: ExamType.TYT, subjectName: 'Matematik', parent: null, order: 4, children: [
      { name: 'Polinom Kavramı', difficulty: 'MEDIUM', order: 1 },
      { name: 'Polinomlarda İşlemler', difficulty: 'MEDIUM', order: 2 },
    ]},
    { name: 'Geometri', examType: ExamType.TYT, subjectName: 'Matematik', parent: null, order: 5, children: [
      { name: 'Üçgenler', difficulty: 'MEDIUM', order: 1 },
      { name: 'Dörtgenler', difficulty: 'MEDIUM', order: 2 },
      { name: 'Çember ve Daire', difficulty: 'HARD', order: 3 },
      { name: 'Analitik Geometri', difficulty: 'HARD', order: 4 },
    ]},

    // TYT Türkçe
    { name: 'Sözcük', examType: ExamType.TYT, subjectName: 'Türkçe', parent: null, order: 1, children: [
      { name: 'Sözcükte Anlam', difficulty: 'EASY', order: 1 },
      { name: 'Sözcük Türleri', difficulty: 'MEDIUM', order: 2 },
      { name: 'Deyimler ve Atasözleri', difficulty: 'EASY', order: 3 },
    ]},
    { name: 'Cümle', examType: ExamType.TYT, subjectName: 'Türkçe', parent: null, order: 2, children: [
      { name: 'Cümle Türleri', difficulty: 'MEDIUM', order: 1 },
      { name: 'Cümle Öğeleri', difficulty: 'HARD', order: 2 },
      { name: 'Anlatım Bozuklukları', difficulty: 'MEDIUM', order: 3 },
    ]},
    { name: 'Paragraf', examType: ExamType.TYT, subjectName: 'Türkçe', parent: null, order: 3, children: [
      { name: 'Ana Düşünce', difficulty: 'EASY', order: 1 },
      { name: 'Paragrafta Anlam', difficulty: 'MEDIUM', order: 2 },
      { name: 'Paragrafta Yorum', difficulty: 'HARD', order: 3 },
    ]},

    // TYT Fizik
    { name: 'Hareket', examType: ExamType.TYT, subjectName: 'Fizik', parent: null, order: 1, children: [
      { name: 'Düzgün Hareket', difficulty: 'EASY', order: 1 },
      { name: 'Düzgün Değişen Hareket', difficulty: 'MEDIUM', order: 2 },
      { name: 'Serbest Düşme', difficulty: 'MEDIUM', order: 3 },
    ]},
    { name: 'Kuvvet ve Hareket', examType: ExamType.TYT, subjectName: 'Fizik', parent: null, order: 2, children: [
      { name: 'Newton Kanunları', difficulty: 'HARD', order: 1 },
      { name: 'Sürtünme Kuvveti', difficulty: 'MEDIUM', order: 2 },
    ]},

    // TYT Kimya
    { name: 'Atom', examType: ExamType.TYT, subjectName: 'Kimya', parent: null, order: 1, children: [
      { name: 'Atom Modelleri', difficulty: 'EASY', order: 1 },
      { name: 'Periyodik Sistem', difficulty: 'MEDIUM', order: 2 },
      { name: 'Kimyasal Bağlar', difficulty: 'HARD', order: 3 },
    ]},

    // TYT Biyoloji
    { name: 'Hücre', examType: ExamType.TYT, subjectName: 'Biyoloji', parent: null, order: 1, children: [
      { name: 'Hücre Yapısı', difficulty: 'EASY', order: 1 },
      { name: 'Hücre Bölünmesi', difficulty: 'MEDIUM', order: 2 },
    ]},

    // TYT Tarih
    { name: 'İlk Çağ', examType: ExamType.TYT, subjectName: 'Tarih', parent: null, order: 1, children: [
      { name: 'İlk Uygarlıklar', difficulty: 'EASY', order: 1 },
      { name: 'Eski Türk Tarihi', difficulty: 'MEDIUM', order: 2 },
    ]},

    // TYT Coğrafya
    { name: 'Doğa', examType: ExamType.TYT, subjectName: 'Coğrafya', parent: null, order: 1, children: [
      { name: 'Yer Şekilleri', difficulty: 'EASY', order: 1 },
      { name: 'İklim', difficulty: 'MEDIUM', order: 2 },
    ]},

    // AYT Matematik
    { name: 'Limit', examType: ExamType.AYT, subjectName: 'Matematik', parent: null, order: 1, children: [
      { name: 'Limit Kavramı', difficulty: 'MEDIUM', order: 1 },
      { name: 'Limit Teoremleri', difficulty: 'HARD', order: 2 },
    ]},
    { name: 'Türev', examType: ExamType.AYT, subjectName: 'Matematik', parent: null, order: 2, children: [
      { name: 'Türev Kavramı', difficulty: 'HARD', order: 1 },
      { name: 'Türev Uygulamaları', difficulty: 'HARD', order: 2 },
    ]},
    { name: 'İntegral', examType: ExamType.AYT, subjectName: 'Matematik', parent: null, order: 3, children: [
      { name: 'Belirsiz İntegral', difficulty: 'HARD', order: 1 },
      { name: 'Belirli İntegral', difficulty: 'HARD', order: 2 },
    ]},

    // LGS Matematik
    { name: 'Sayılar', examType: ExamType.LGS, subjectName: 'Matematik', parent: null, order: 1, children: [
      { name: 'Doğal Sayılar', difficulty: 'EASY', order: 1 },
      { name: 'Tam Sayılar', difficulty: 'EASY', order: 2 },
      { name: 'Rasyonel Sayılar', difficulty: 'MEDIUM', order: 3 },
    ]},
    { name: 'Cebirsel İfadeler', examType: ExamType.LGS, subjectName: 'Matematik', parent: null, order: 2, children: [
      { name: 'Özdeşlikler', difficulty: 'MEDIUM', order: 1 },
      { name: 'Denklemler', difficulty: 'MEDIUM', order: 2 },
    ]},

    // LGS Türkçe
    { name: 'Okuma', examType: ExamType.LGS, subjectName: 'Türkçe', parent: null, order: 1, children: [
      { name: 'Okuduğunu Anlama', difficulty: 'EASY', order: 1 },
      { name: 'Çıkarım Yapma', difficulty: 'MEDIUM', order: 2 },
    ]},

    // LGS Fen Bilimleri
    { name: 'Canlılar', examType: ExamType.LGS, subjectName: 'Fen Bilimleri', parent: null, order: 1, children: [
      { name: 'Hücre', difficulty: 'EASY', order: 1 },
      { name: 'Sistemler', difficulty: 'MEDIUM', order: 2 },
    ]},

    // LGS Sosyal Bilgiler
    { name: 'Tarih', examType: ExamType.LGS, subjectName: 'Sosyal Bilgiler', parent: null, order: 1, children: [
      { name: 'Türk Tarihi', difficulty: 'EASY', order: 1 },
      { name: 'Osmanlı Tarihi', difficulty: 'MEDIUM', order: 2 },
    ]},
  ];

  for (const topicGroup of topics) {
    const subjectKey = `${topicGroup.examType}-${topicGroup.subjectName}`;
    const subjectId = createdSubjects[subjectKey];

    if (!subjectId) {
      console.warn(`Subject not found for ${subjectKey}`);
      continue;
    }

    // Check if parent topic exists
    let parent = await prisma.topic.findFirst({
      where: {
        subjectId: subjectId,
        name: topicGroup.name,
        parentTopicId: null,
      },
    });

    // Create parent topic if it doesn't exist
    if (!parent) {
      parent = await prisma.topic.create({
        data: {
          name: topicGroup.name,
          subjectId: subjectId,
          order: topicGroup.order,
        },
      });
    }

    if (topicGroup.children) {
      for (const child of topicGroup.children) {
        // Check if child topic exists
        const existingChild = await prisma.topic.findFirst({
          where: {
            subjectId: subjectId,
            name: child.name,
            parentTopicId: parent.id,
          },
        });

        // Create child topic if it doesn't exist
        if (!existingChild) {
          await prisma.topic.create({
            data: {
              name: child.name,
              subjectId: subjectId,
              parentTopicId: parent.id,
              order: child.order,
            },
          });
        }
      }
    }
  }

  console.log('✅ Subjects and topics seeded');
}

async function seedResources() {
  console.log('📚 Seeding resources...');

  const resources = [
    // Popular book series
    { name: 'Paraf Matematik', type: 'BOOK', publisher: 'Paraf Yayınları', examType: 'TYT', subject: 'Matematik', popular: true },
    { name: 'Paraf Türkçe', type: 'BOOK', publisher: 'Paraf Yayınları', examType: 'TYT', subject: 'Türkçe', popular: true },
    { name: 'Paraf Fizik', type: 'BOOK', publisher: 'Paraf Yayınları', examType: 'TYT', subject: 'Fizik', popular: true },
    
    { name: 'Limit Matematik', type: 'BOOK', publisher: 'Limit Yayınları', examType: 'AYT', subject: 'Matematik', popular: true },
    { name: 'Limit Fizik', type: 'BOOK', publisher: 'Limit Yayınları', examType: 'AYT', subject: 'Fizik', popular: true },
    { name: 'Limit Kimya', type: 'BOOK', publisher: 'Limit Yayınları', examType: 'AYT', subject: 'Kimya', popular: true },
    
    { name: 'Bilfen Matematik', type: 'BOOK', publisher: 'Bilfen Yayınları', examType: 'TYT', subject: 'Matematik', popular: true },
    { name: 'Bilfen Türkçe', type: 'BOOK', publisher: 'Bilfen Yayınları', examType: 'TYT', subject: 'Türkçe', popular: true },
    
    { name: 'Endemik Matematik', type: 'BOOK', publisher: 'Endemik Yayınları', examType: 'AYT', subject: 'Matematik', popular: true },
    { name: 'Endemik Fizik', type: 'BOOK', publisher: 'Endemik Yayınları', examType: 'AYT', subject: 'Fizik', popular: true },
    
    { name: 'Hız ve Renk Matematik', type: 'BOOK', publisher: 'Hız ve Renk Yayınları', examType: 'LGS', subject: 'Matematik', popular: true },
    { name: 'Hız ve Renk Türkçe', type: 'BOOK', publisher: 'Hız ve Renk Yayınları', examType: 'LGS', subject: 'Türkçe', popular: true },
    { name: 'Hız ve Renk Fen Bilimleri', type: 'BOOK', publisher: 'Hız ve Renk Yayınları', examType: 'LGS', subject: 'Fen Bilimleri', popular: true },
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: {
        examType_subjectName_name: {
          examType: resource.examType as ExamType,
          subjectName: resource.subject,
          name: resource.name,
        },
      },
      update: {},
      create: {
        name: resource.name,
        type: resource.type as ResourceType,
        publisherOrAuthor: resource.publisher,
        examType: resource.examType as ExamType,
        subjectName: resource.subject,
        isPopular: resource.popular,
      },
    });
  }

  console.log('✅ Resources seeded');
}

async function main() {
  console.log('🌱 Seeding Learning Management System data...\n');

  await seedSubjectsAndTopics();
  await seedResources();

  console.log('\n✅ Learning Management System seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


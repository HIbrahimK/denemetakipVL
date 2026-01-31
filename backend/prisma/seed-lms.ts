import { PrismaClient, ExamType, TopicDifficulty, ResourceType, AchievementCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTopics() {
  console.log('🌳 Seeding topics...');

  const topics = [
    // TYT Matematik
    { name: 'Temel Kavramlar', examType: 'TYT', subjectName: 'Matematik', parent: null, order: 1, children: [
      { name: 'Çarpanlara Ayırma', difficulty: 'MEDIUM', order: 1 },
      { name: 'Üslü Sayılar', difficulty: 'EASY', order: 2 },
      { name: 'Köklü Sayılar', difficulty: 'MEDIUM', order: 3 },
      { name: 'Çarpanlar ve Katlar', difficulty: 'EASY', order: 4 },
    ]},
    { name: 'Denklemler', examType: 'TYT', subjectName: 'Matematik', parent: null, order: 2, children: [
      { name: 'Birinci Derece Denklem', difficulty: 'EASY', order: 1 },
      { name: 'İkinci Derece Denklem', difficulty: 'MEDIUM', order: 2 },
      { name: 'Üslü ve Köklü Denklemler', difficulty: 'HARD', order: 3 },
    ]},
    { name: 'Fonksiyonlar', examType: 'TYT', subjectName: 'Matematik', parent: null, order: 3, children: [
      { name: 'Fonksiyon Kavramı', difficulty: 'MEDIUM', order: 1 },
      { name: 'İkinci Derece Fonksiyon', difficulty: 'HARD', order: 2 },
      { name: 'Fonksiyon İşlemleri', difficulty: 'HARD', order: 3 },
    ]},
    { name: 'Polinomlar', examType: 'TYT', subjectName: 'Matematik', parent: null, order: 4, children: [
      { name: 'Polinom Kavramı', difficulty: 'MEDIUM', order: 1 },
      { name: 'Polinomlarda İşlemler', difficulty: 'MEDIUM', order: 2 },
    ]},
    { name: 'Geometri', examType: 'TYT', subjectName: 'Matematik', parent: null, order: 5, children: [
      { name: 'Üçgenler', difficulty: 'MEDIUM', order: 1 },
      { name: 'Dörtgenler', difficulty: 'MEDIUM', order: 2 },
      { name: 'Çember ve Daire', difficulty: 'HARD', order: 3 },
      { name: 'Analitik Geometri', difficulty: 'HARD', order: 4 },
    ]},

    // TYT Türkçe
    { name: 'Sözcük', examType: 'TYT', subjectName: 'Türkçe', parent: null, order: 1, children: [
      { name: 'Sözcükte Anlam', difficulty: 'EASY', order: 1 },
      { name: 'Sözcük Türleri', difficulty: 'MEDIUM', order: 2 },
      { name: 'Deyimler ve Atasözleri', difficulty: 'EASY', order: 3 },
    ]},
    { name: 'Cümle', examType: 'TYT', subjectName: 'Türkçe', parent: null, order: 2, children: [
      { name: 'Cümle Türleri', difficulty: 'MEDIUM', order: 1 },
      { name: 'Cümle Öğeleri', difficulty: 'HARD', order: 2 },
      { name: 'Anlatım Bozuklukları', difficulty: 'MEDIUM', order: 3 },
    ]},
    { name: 'Paragraf', examType: 'TYT', subjectName: 'Türkçe', parent: null, order: 3, children: [
      { name: 'Ana Düşünce', difficulty: 'EASY', order: 1 },
      { name: 'Paragrafta Anlam', difficulty: 'MEDIUM', order: 2 },
      { name: 'Paragrafta Yorum', difficulty: 'HARD', order: 3 },
    ]},

    // TYT Fizik
    { name: 'Hareket', examType: 'TYT', subjectName: 'Fizik', parent: null, order: 1, children: [
      { name: 'Düzgün Hareket', difficulty: 'EASY', order: 1 },
      { name: 'Düzgün Değişen Hareket', difficulty: 'MEDIUM', order: 2 },
      { name: 'Serbest Düşme', difficulty: 'MEDIUM', order: 3 },
    ]},
    { name: 'Kuvvet ve Hareket', examType: 'TYT', subjectName: 'Fizik', parent: null, order: 2, children: [
      { name: 'Newton Kanunları', difficulty: 'HARD', order: 1 },
      { name: 'Sürtünme Kuvveti', difficulty: 'MEDIUM', order: 2 },
    ]},

    // TYT Kimya
    { name: 'Atom', examType: 'TYT', subjectName: 'Kimya', parent: null, order: 1, children: [
      { name: 'Atom Modelleri', difficulty: 'EASY', order: 1 },
      { name: 'Periyodik Sistem', difficulty: 'MEDIUM', order: 2 },
      { name: 'Kimyasal Bağlar', difficulty: 'HARD', order: 3 },
    ]},

    // TYT Biyoloji
    { name: 'Hücre', examType: 'TYT', subjectName: 'Biyoloji', parent: null, order: 1, children: [
      { name: 'Hücre Yapısı', difficulty: 'EASY', order: 1 },
      { name: 'Hücre Bölünmesi', difficulty: 'MEDIUM', order: 2 },
    ]},

    // TYT Tarih
    { name: 'İlk Çağ', examType: 'TYT', subjectName: 'Tarih', parent: null, order: 1, children: [
      { name: 'İlk Uygarlıklar', difficulty: 'EASY', order: 1 },
      { name: 'Eski Türk Tarihi', difficulty: 'MEDIUM', order: 2 },
    ]},

    // TYT Coğrafya
    { name: 'Doğa', examType: 'TYT', subjectName: 'Coğrafya', parent: null, order: 1, children: [
      { name: 'Yer Şekilleri', difficulty: 'EASY', order: 1 },
      { name: 'İklim', difficulty: 'MEDIUM', order: 2 },
    ]},

    // AYT Matematik
    { name: 'Limit', examType: 'AYT', subjectName: 'Matematik', parent: null, order: 1, children: [
      { name: 'Limit Kavramı', difficulty: 'MEDIUM', order: 1 },
      { name: 'Limit Teoremleri', difficulty: 'HARD', order: 2 },
    ]},
    { name: 'Türev', examType: 'AYT', subjectName: 'Matematik', parent: null, order: 2, children: [
      { name: 'Türev Kavramı', difficulty: 'HARD', order: 1 },
      { name: 'Türev Uygulamaları', difficulty: 'HARD', order: 2 },
    ]},
    { name: 'İntegral', examType: 'AYT', subjectName: 'Matematik', parent: null, order: 3, children: [
      { name: 'Belirsiz İntegral', difficulty: 'HARD', order: 1 },
      { name: 'Belirli İntegral', difficulty: 'HARD', order: 2 },
    ]},

    // LGS Matematik
    { name: 'Sayılar', examType: 'LGS', subjectName: 'Matematik', parent: null, order: 1, children: [
      { name: 'Doğal Sayılar', difficulty: 'EASY', order: 1 },
      { name: 'Tam Sayılar', difficulty: 'EASY', order: 2 },
      { name: 'Rasyonel Sayılar', difficulty: 'MEDIUM', order: 3 },
    ]},
    { name: 'Cebirsel İfadeler', examType: 'LGS', subjectName: 'Matematik', parent: null, order: 2, children: [
      { name: 'Özdeşlikler', difficulty: 'MEDIUM', order: 1 },
      { name: 'Denklemler', difficulty: 'MEDIUM', order: 2 },
    ]},

    // LGS Türkçe
    { name: 'Okuma', examType: 'LGS', subjectName: 'Türkçe', parent: null, order: 1, children: [
      { name: 'Okuduğunu Anlama', difficulty: 'EASY', order: 1 },
      { name: 'Çıkarım Yapma', difficulty: 'MEDIUM', order: 2 },
    ]},

    // LGS Fen Bilimleri
    { name: 'Canlılar', examType: 'LGS', subjectName: 'Fen Bilimleri', parent: null, order: 1, children: [
      { name: 'Hücre', difficulty: 'EASY', order: 1 },
      { name: 'Sistemler', difficulty: 'MEDIUM', order: 2 },
    ]},

    // LGS Sosyal Bilgiler
    { name: 'Tarih', examType: 'LGS', subjectName: 'Sosyal Bilgiler', parent: null, order: 1, children: [
      { name: 'Türk Tarihi', difficulty: 'EASY', order: 1 },
      { name: 'Osmanlı Tarihi', difficulty: 'MEDIUM', order: 2 },
    ]},
  ];

  for (const topicGroup of topics) {
    // Check if parent topic exists
    let parent = await prisma.topic.findFirst({
      where: {
        examType: topicGroup.examType as ExamType,
        subjectName: topicGroup.subjectName,
        name: topicGroup.name,
        parentTopicId: null,
      },
    });

    // Create parent topic if it doesn't exist
    if (!parent) {
      parent = await prisma.topic.create({
        data: {
          name: topicGroup.name,
          examType: topicGroup.examType as ExamType,
          subjectName: topicGroup.subjectName,
          order: topicGroup.order,
          difficulty: 'MEDIUM' as TopicDifficulty,
        },
      });
    }

    if (topicGroup.children) {
      for (const child of topicGroup.children) {
        // Check if child topic exists
        const existingChild = await prisma.topic.findFirst({
          where: {
            examType: topicGroup.examType as ExamType,
            subjectName: topicGroup.subjectName,
            name: child.name,
            parentTopicId: parent.id,
          },
        });

        // Create child topic if it doesn't exist
        if (!existingChild) {
          await prisma.topic.create({
            data: {
              name: child.name,
              examType: topicGroup.examType as ExamType,
              subjectName: topicGroup.subjectName,
              parentTopicId: parent.id,
              order: child.order,
              difficulty: child.difficulty as TopicDifficulty,
            },
          });
        }
      }
    }
  }

  console.log('✅ Topics seeded');
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

async function seedAchievements() {
  console.log('🏆 Seeding achievements...');

  const achievements = [
    // Streak achievements
    {
      code: 'STREAK_7',
      name: '7 Günlük Ateş',
      description: '7 gün üst üste çalışma yap',
      category: 'STREAK',
      criteria: { days: 7 },
    },
    {
      code: 'STREAK_30',
      name: 'Aylık Kararlılık',
      description: '30 gün üst üste çalışma yap',
      category: 'STREAK',
      criteria: { days: 30 },
    },
    {
      code: 'STREAK_100',
      name: '100 Gün Maratonu',
      description: '100 gün üst üste çalışma yap',
      category: 'STREAK',
      criteria: { days: 100 },
    },

    // Milestone achievements
    {
      code: 'QUESTIONS_100',
      name: 'İlk 100',
      description: '100 soru çöz',
      category: 'MILESTONE',
      criteria: { count: 100 },
    },
    {
      code: 'QUESTIONS_500',
      name: 'Beş Yüzlük',
      description: '500 soru çöz',
      category: 'MILESTONE',
      criteria: { count: 500 },
    },
    {
      code: 'QUESTIONS_1000',
      name: 'Binlik',
      description: '1000 soru çöz',
      category: 'MILESTONE',
      criteria: { count: 1000 },
    },
    {
      code: 'QUESTIONS_5000',
      name: '5000 Soru Savaşçısı',
      description: '5000 soru çöz',
      category: 'MILESTONE',
      criteria: { count: 5000 },
    },

    // Improvement achievements
    {
      code: 'WEAK_TURNAROUND',
      name: 'Zayıf Noktayı Yendim',
      description: 'Zayıf bir derste %20+ gelişme sağla',
      category: 'IMPROVEMENT',
      criteria: { improvementPercent: 20 },
    },
    {
      code: 'NET_BOOST',
      name: 'Net Canavarı',
      description: 'Bir denemede toplam netini 15+ artır',
      category: 'IMPROVEMENT',
      criteria: { netIncrease: 15 },
    },
    {
      code: 'PERFECT_SUBJECT',
      name: 'Mükemmellik',
      description: 'Bir dersten %100 başarı',
      category: 'IMPROVEMENT',
      criteria: { successRate: 100 },
    },

    // Consistency achievements
    {
      code: 'WEEKLY_WARRIOR',
      name: 'Haftalık Savaşçı',
      description: '4 hafta boyunca haftada 5+ gün çalış',
      category: 'CONSISTENCY',
      criteria: { daysPerWeek: 5, weeks: 4 },
    },
    {
      code: 'MORNING_PERSON',
      name: 'Sabah Kuşu',
      description: '10 gün sabah 8\'den önce çalış',
      category: 'CONSISTENCY',
      criteria: { beforeHour: 8, days: 10 },
    },
    {
      code: 'NIGHT_OWL',
      name: 'Gece Baykuşu',
      description: '10 gün akşam 10\'dan sonra çalış',
      category: 'CONSISTENCY',
      criteria: { afterHour: 22, days: 10 },
    },

    // Group achievements
    {
      code: 'GROUP_UNITY',
      name: 'Birlik Beraberlik',
      description: 'Tüm grup üyeleri haftalık planı tamamlasın',
      category: 'GROUP',
      criteria: { completionRate: 100 },
    },
    {
      code: 'GROUP_MILESTONE',
      name: 'Takım Başarısı',
      description: 'Grup toplu olarak 10,000 soru çözsün',
      category: 'GROUP',
      criteria: { totalQuestions: 10000 },
    },
  ];

  for (const achievement of achievements) {
    // Get first school for seeding
    const school = await prisma.school.findFirst();
    if (!school) {
      console.warn('No school found, skipping achievement seed');
      continue;
    }

    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: {},
      create: {
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category as AchievementCategory,
        criteria: achievement.criteria,
        schoolId: school.id,
      },
    });
  }

  console.log('✅ Achievements seeded');
}

async function main() {
  console.log('🌱 Seeding Learning Management System data...\n');

  await seedTopics();
  await seedResources();
  await seedAchievements();

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

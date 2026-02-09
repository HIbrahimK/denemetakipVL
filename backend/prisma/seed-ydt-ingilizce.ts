// YDT İngilizce Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('YDT İngilizce dersi ve konuları ekleniyor...');

  // YDT İngilizce Dersini kontrol et veya oluştur
  let ingilizceSubject = await prisma.subject.findFirst({
    where: { name: 'İngilizce', examType: ExamType.AYT },
  });

  if (!ingilizceSubject) {
    ingilizceSubject = await prisma.subject.create({
      data: {
        name: 'İngilizce',
        examType: ExamType.AYT,
        gradeLevels: [9, 10, 11, 12],
        order: 11,
        isActive: true,
      },
    });
    console.log(`YDT İngilizce dersi oluşturuldu: ${ingilizceSubject.id}`);
  } else {
    console.log(`YDT İngilizce dersi zaten mevcut: ${ingilizceSubject.id}`);
  }

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Kelime Bilgisi',
      order: 1,
      children: [
        { name: 'Günlük Hayat Kelimeleri', order: 1 },
        { name: 'İş ve Meslek Kelimeleri', order: 2 },
        { name: 'Eğitim ve Akademik Kelimeler', order: 3 },
        { name: 'Sağlık ve Tıp Kelimeleri', order: 4 },
        { name: 'Teknoloji ve Bilim Kelimeleri', order: 5 },
        { name: 'Seyahat ve Turizm Kelimeleri', order: 6 },
        { name: 'Spor ve Eğlence Kelimeleri', order: 7 },
        { name: 'Sanat ve Kültür Kelimeleri', order: 8 },
        { name: 'Doğa ve Çevre Kelimeleri', order: 9 },
        { name: 'Ekonomi ve Ticaret Kelimeleri', order: 10 },
        { name: 'Sosyal İlişkiler Kelimeleri', order: 11 },
        { name: 'Duygu ve Düşünce Kelimeleri', order: 12 },
      ],
    },
    {
      name: 'Dilbilgisi - Fiiller (Verbs)',
      order: 2,
      children: [
        { name: 'Be Fiili', order: 1 },
        { name: 'Have Fiili', order: 2 },
        { name: 'Do Fiili', order: 3 },
        { name: 'Modals (Can, Could, May, Might)', order: 4 },
        { name: 'Must, Have to, Should', order: 5 },
        { name: 'Used to, Would', order: 6 },
        { name: 'Phrasal Verbs', order: 7 },
        { name: 'Causative Verbs', order: 8 },
        { name: 'Stative Verbs', order: 9 },
        { name: 'Irregular Verbs', order: 10 },
      ],
    },
    {
      name: 'Dilbilgisi - Zamanlar (Tenses)',
      order: 3,
      children: [
        { name: 'Present Simple', order: 1 },
        { name: 'Present Continuous', order: 2 },
        { name: 'Present Perfect', order: 3 },
        { name: 'Present Perfect Continuous', order: 4 },
        { name: 'Past Simple', order: 5 },
        { name: 'Past Continuous', order: 6 },
        { name: 'Past Perfect', order: 7 },
        { name: 'Past Perfect Continuous', order: 8 },
        { name: 'Future Simple', order: 9 },
        { name: 'Future Continuous', order: 10 },
        { name: 'Future Perfect', order: 11 },
        { name: 'Future Perfect Continuous', order: 12 },
        { name: 'Going to Future', order: 13 },
        { name: 'Mixed Tenses', order: 14 },
      ],
    },
    {
      name: 'Dilbilgisi - Edatlar (Prepositions)',
      order: 4,
      children: [
        { name: 'Prepositions of Time', order: 1 },
        { name: 'Prepositions of Place', order: 2 },
        { name: 'Prepositions of Movement', order: 3 },
        { name: 'Prepositional Phrases', order: 4 },
        { name: 'Dependent Prepositions', order: 5 },
      ],
    },
    {
      name: 'Dilbilgisi - Bağlaçlar (Conjunctions)',
      order: 5,
      children: [
        { name: 'Coordinating Conjunctions', order: 1 },
        { name: 'Subordinating Conjunctions', order: 2 },
        { name: 'Correlative Conjunctions', order: 3 },
        { name: 'Linking Words', order: 4 },
      ],
    },
    {
      name: 'Dilbilgisi - Sıfatlar ve Zarflar',
      order: 6,
      children: [
        { name: 'Adjectives', order: 1 },
        { name: 'Adverbs', order: 2 },
        { name: 'Comparative and Superlative', order: 3 },
        { name: 'Adjective Order', order: 4 },
        { name: 'Adverbs of Frequency', order: 5 },
        { name: 'Adverbs of Manner', order: 6 },
        { name: 'Adverbs of Time and Place', order: 7 },
      ],
    },
    {
      name: 'Dilbilgisi - İsimler ve Zamirler',
      order: 7,
      children: [
        { name: 'Countable and Uncountable Nouns', order: 1 },
        { name: 'Articles (A, An, The)', order: 2 },
        { name: 'Personal Pronouns', order: 3 },
        { name: 'Possessive Pronouns', order: 4 },
        { name: 'Reflexive Pronouns', order: 5 },
        { name: 'Demonstrative Pronouns', order: 6 },
        { name: 'Indefinite Pronouns', order: 7 },
        { name: 'Relative Pronouns', order: 8 },
      ],
    },
    {
      name: 'Dilbilgisi - Aktif ve Pasif Yapı',
      order: 8,
      children: [
        { name: 'Active Voice', order: 1 },
        { name: 'Passive Voice', order: 2 },
        { name: 'Passive with Modals', order: 3 },
        { name: 'Causative Form', order: 4 },
      ],
    },
    {
      name: 'Dilbilgisi - Reported Speech',
      order: 9,
      children: [
        { name: 'Direct Speech', order: 1 },
        { name: 'Indirect Speech', order: 2 },
        { name: 'Reported Questions', order: 3 },
        { name: 'Reported Commands', order: 4 },
      ],
    },
    {
      name: 'Dilbilgisi - Conditionals',
      order: 10,
      children: [
        { name: 'Zero Conditional', order: 1 },
        { name: 'First Conditional', order: 2 },
        { name: 'Second Conditional', order: 3 },
        { name: 'Third Conditional', order: 4 },
        { name: 'Mixed Conditionals', order: 5 },
        { name: 'Unless, Provided that, As long as', order: 6 },
        { name: 'Wish, If only', order: 7 },
      ],
    },
    {
      name: 'Dilbilgisi - Relative Clauses',
      order: 11,
      children: [
        { name: 'Defining Relative Clauses', order: 1 },
        { name: 'Non-defining Relative Clauses', order: 2 },
        { name: 'Reduced Relative Clauses', order: 3 },
      ],
    },
    {
      name: 'Dilbilgisi - Noun Clauses',
      order: 12,
      children: [
        { name: 'That Clauses', order: 1 },
        { name: 'Wh- Clauses', order: 2 },
        { name: 'If/Whether Clauses', order: 3 },
      ],
    },
    {
      name: 'Dilbilgisi - Gerund and Infinitive',
      order: 13,
      children: [
        { name: 'Gerunds', order: 1 },
        { name: 'Infinitives', order: 2 },
        { name: 'Gerund or Infinitive', order: 3 },
        { name: 'Bare Infinitive', order: 4 },
      ],
    },
    {
      name: 'Dilbilgisi - Inversion and Emphasis',
      order: 14,
      children: [
        { name: 'Inversion after Negative Adverbs', order: 1 },
        { name: 'Inversion in Conditionals', order: 2 },
        { name: 'Cleft Sentences', order: 3 },
        { name: 'Emphatic Do', order: 4 },
      ],
    },
    {
      name: 'Okuma Parçaları ve Anlama',
      order: 15,
      children: [
        { name: 'Main Idea', order: 1 },
        { name: 'Supporting Details', order: 2 },
        { name: 'Inference Questions', order: 3 },
        { name: 'Reference Questions', order: 4 },
        { name: 'Vocabulary in Context', order: 5 },
        { name: 'Purpose and Tone', order: 6 },
        { name: 'Paragraph Organization', order: 7 },
      ],
    },
    {
      name: 'Diyalog ve Cümle Tamamlama',
      order: 16,
      children: [
        { name: 'Situational Dialogues', order: 1 },
        { name: 'Functional Language', order: 2 },
        { name: 'Sentence Completion', order: 3 },
        { name: 'Paragraph Completion', order: 4 },
      ],
    },
    {
      name: 'Kelime Türleri ve Kullanımı',
      order: 17,
      children: [
        { name: 'Collocations', order: 1 },
        { name: 'Idioms and Expressions', order: 2 },
        { name: 'Phrasal Verbs in Context', order: 3 },
        { name: 'Word Formation', order: 4 },
        { name: 'Confusing Words', order: 5 },
        { name: 'Synonyms and Antonyms', order: 6 },
      ],
    },
    {
      name: 'Yazı Türleri ve Metin Analizi',
      order: 18,
      children: [
        { name: 'Narrative Texts', order: 1 },
        { name: 'Descriptive Texts', order: 2 },
        { name: 'Expository Texts', order: 3 },
        { name: 'Argumentative Texts', order: 4 },
        { name: 'Academic Texts', order: 5 },
        { name: 'Newspaper Articles', order: 6 },
        { name: 'Scientific Texts', order: 7 },
      ],
    },
    {
      name: 'Dilbilgisi - Quantifiers',
      order: 19,
      children: [
        { name: 'Some, Any, No', order: 1 },
        { name: 'Much, Many, A lot of', order: 2 },
        { name: 'Few, A few, Little, A little', order: 3 },
        { name: 'All, Both, Either, Neither', order: 4 },
        { name: 'Each, Every, All', order: 5 },
      ],
    },
    {
      name: 'Dilbilgisi - Determiners',
      order: 20,
      children: [
        { name: 'Articles', order: 1 },
        { name: 'Demonstratives', order: 2 },
        { name: 'Possessives', order: 3 },
        { name: 'Numbers and Quantifiers', order: 4 },
        { name: 'Distributives', order: 5 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    let parentTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: ingilizceSubject.id, parentTopicId: null },
    });

    if (!parentTopic) {
      parentTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: ingilizceSubject.id,
          order: konu.order,
        },
      });
      console.log(`  Ana konu eklendi: ${konu.name}`);
    } else {
      console.log(`  Ana konu zaten mevcut: ${konu.name}`);
    }

    // Alt konuları ekle
    for (const child of konu.children) {
      const existingChild = await prisma.topic.findFirst({
        where: { name: child.name, subjectId: ingilizceSubject.id, parentTopicId: parentTopic.id },
      });

      if (!existingChild) {
        await prisma.topic.create({
          data: {
            name: child.name,
            subjectId: ingilizceSubject.id,
            parentTopicId: parentTopic.id,
            order: child.order,
          },
        });
        console.log(`    Alt konu eklendi: ${child.name}`);
      }
    }
  }

  console.log('\nYDT İngilizce konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

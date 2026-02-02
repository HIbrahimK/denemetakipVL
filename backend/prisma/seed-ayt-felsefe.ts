// AYT Felsefe Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AYT Felsefe dersi ve konuları ekleniyor...');

  // AYT Felsefe Dersini oluştur
  const felsefeSubject = await prisma.subject.create({
    data: {
      name: 'Felsefe',
      examType: ExamType.AYT,
      gradeLevels: [10, 11, 12],
      order: 6,
      isActive: true,
    },
  });

  console.log(`AYT Felsefe dersi oluşturuldu: ${felsefeSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Felsefenin Konusu ve Alt Dalları',
      order: 1,
      children: [
        { name: 'Felsefe Nedir?', order: 1 },
        { name: 'Felsefenin Doğuşu ve Gelişimi', order: 2 },
        { name: 'Felsefe ve Bilim İlişkisi', order: 3 },
        { name: 'Felsefenin Alt Dalları', order: 4 },
        { name: 'Metafizik', order: 5 },
        { name: 'Epistemoloji', order: 6 },
        { name: 'Ahlak Felsefesi', order: 7 },
        { name: 'Siyaset Felsefesi', order: 8 },
        { name: 'Sanat Felsefesi', order: 9 },
        { name: 'Din Felsefesi', order: 10 },
        { name: 'Bilim Felsefesi', order: 11 },
        { name: 'Varlık Felsefesi', order: 12 },
      ],
    },
    {
      name: 'Bilgi Felsefesi',
      order: 2,
      children: [
        { name: 'Bilginin Tanımı ve Kaynakları', order: 1 },
        { name: 'Doğustacılık', order: 2 },
        { name: 'Deneycilik', order: 3 },
        { name: 'Rasyonalizm', order: 4 },
        { name: 'Empirizm', order: 5 },
        { name: 'Kritisizm', order: 6 },
        { name: 'Şüphecilik', order: 7 },
        { name: 'Agnostisizm', order: 8 },
        { name: 'Gnostisizm', order: 9 },
        { name: 'Doğruluk ve Gerçeklik', order: 10 },
        { name: 'Bilginin Sınırları', order: 11 },
      ],
    },
    {
      name: 'Varlık Felsefesi (Ontoloji)',
      order: 3,
      children: [
        { name: 'Varlık Nedir?', order: 1 },
        { name: 'Varoluşçuluk', order: 2 },
        { name: 'Materyalizm', order: 3 },
        { name: 'İdealizm', order: 4 },
        { name: 'Realizm', order: 5 },
        { name: 'Nominalizm', order: 6 },
        { name: 'Tekil ve Tümel', order: 7 },
        { name: 'Zihin-Beden İlişkisi', order: 8 },
        { name: 'Belirlenimcilik ve Özgür İrade', order: 9 },
      ],
    },
    {
      name: 'Ahlak Felsefesi',
      order: 4,
      children: [
        { name: 'Ahlak ve Erdem', order: 1 },
        { name: 'İyi ve Kötü', order: 2 },
        { name: 'Faydacılık', order: 3 },
        { name: 'Hazcılık', order: 4 },
        { name: 'Ödev Ahlakı', order: 5 },
        { name: 'Yararcılık', order: 6 },
        { name: 'Eudaimonia', order: 7 },
        { name: 'Ahlaki Yargı', order: 8 },
        { name: 'Sorumluluk ve Özgürlük', order: 9 },
      ],
    },
    {
      name: 'Siyaset Felsefesi',
      order: 5,
      children: [
        { name: 'Devlet ve Toplum', order: 1 },
        { name: 'İktidar ve Meşruiyet', order: 2 },
        { name: 'Hak ve Özgürlükler', order: 3 },
        { name: 'Adalet', order: 4 },
        { name: 'Demokrasi', order: 5 },
        { name: 'Totalitarizm', order: 6 },
        { name: 'Anarşizm', order: 7 },
        { name: 'Sosyalizm', order: 8 },
        { name: 'Liberalizm', order: 9 },
        { name: 'Platonun Devleti', order: 10 },
        { name: 'Aristotelesin Politikası', order: 11 },
      ],
    },
    {
      name: 'Sanat Felsefesi',
      order: 6,
      children: [
        { name: 'Sanatın Tanımı ve İşlevi', order: 1 },
        { name: 'Güzellik ve Estetik', order: 2 },
        { name: 'Sanat ve Toplum', order: 3 },
        { name: 'Sanat ve Doğa', order: 4 },
        { name: 'Sanat Eserinin Değeri', order: 5 },
        { name: 'Sanat Akımları', order: 6 },
      ],
    },
    {
      name: 'Din Felsefesi',
      order: 7,
      children: [
        { name: 'Din ve İnanç', order: 1 },
        { name: 'Tanrının Varlığı', order: 2 },
        { name: 'Kötülük Problemi', order: 3 },
        { name: 'Din ve Ahlak', order: 4 },
        { name: 'Din ve Bilim', order: 5 },
        { name: 'Teizm', order: 6 },
        { name: 'Deizm', order: 7 },
        { name: 'Ateizm', order: 8 },
        { name: 'Agnostisizm', order: 9 },
      ],
    },
    {
      name: 'Mantık',
      order: 8,
      children: [
        { name: 'Mantığın Tanımı ve Önemi', order: 1 },
        { name: 'Kavram ve Tanım', order: 2 },
        { name: 'Önerme ve Türleri', order: 3 },
        { name: 'Klasik Mantık', order: 4 },
        { name: 'Modern Mantık', order: 5 },
        { name: 'Tümdengelim', order: 6 },
        { name: 'Tümevarım', order: 7 },
        { name: 'Analogi', order: 8 },
        { name: 'Sembolik Mantık', order: 9 },
        { name: 'Mantık Kuralları', order: 10 },
        { name: 'Doğru ve Yanlış Çıkarım', order: 11 },
      ],
    },
    {
      name: 'Psikoloji',
      order: 9,
      children: [
        { name: 'Psikolojinin Tanımı ve Konusu', order: 1 },
        { name: 'Duyu ve Algı', order: 2 },
        { name: 'Dikkat ve Bellek', order: 3 },
        { name: 'Öğrenme', order: 4 },
        { name: 'Motivasyon ve Duygu', order: 5 },
        { name: 'Kişilik', order: 6 },
        { name: 'Zeka ve Yaratıcılık', order: 7 },
        { name: 'Rüya ve Bilinç', order: 8 },
        { name: 'Stres ve Başa Çıkma', order: 9 },
        { name: 'Sosyal Psikoloji', order: 10 },
        { name: 'Gelişim Psikolojisi', order: 11 },
      ],
    },
    {
      name: 'Sosyoloji',
      order: 10,
      children: [
        { name: 'Sosyolojinin Tanımı ve Konusu', order: 1 },
        { name: 'Toplum ve Kültür', order: 2 },
        { name: 'Sosyalleşme', order: 3 },
        { name: 'Sosyal Kurumlar', order: 4 },
        { name: 'Aile', order: 5 },
        { name: 'Eğitim', order: 6 },
        { name: 'Din', order: 7 },
        { name: 'Ekonomi', order: 8 },
        { name: 'Siyaset', order: 9 },
        { name: 'Sosyal Değişme', order: 10 },
        { name: 'Sosyal Hareketlilik', order: 11 },
        { name: 'Şehirleşme ve Sanayileşme', order: 12 },
        { name: 'Modernleşme', order: 13 },
      ],
    },
    {
      name: 'Antik Yunan Felsefesi',
      order: 11,
      children: [
        { name: 'Doğa Filozofları', order: 1 },
        { name: 'Thales', order: 2 },
        { name: 'Anaksimandros', order: 3 },
        { name: 'Anaksimenes', order: 4 },
        { name: 'Herakleitos', order: 5 },
        { name: 'Parmenides', order: 6 },
        { name: 'Empedokles', order: 7 },
        { name: 'Demokritos', order: 8 },
        { name: 'Sokrates', order: 9 },
        { name: 'Platon', order: 10 },
        { name: 'Aristoteles', order: 11 },
        { name: 'Helenistik Felsefe', order: 12 },
        { name: 'Stoa', order: 13 },
        { name: 'Epikurosçuluk', order: 14 },
        { name: 'Skeptisizm', order: 15 },
      ],
    },
    {
      name: 'Orta Çağ ve Rönesans Felsefesi',
      order: 12,
      children: [
        { name: 'Skolastik Felsefe', order: 1 },
        { name: 'Aziz Augustinus', order: 2 },
        { name: 'Thomas Aquinas', order: 3 },
        { name: 'Rönesans Felsefesi', order: 4 },
        { name: 'Humanizm', order: 5 },
        { name: 'Machiavelli', order: 6 },
        { name: 'Erasmus', order: 7 },
      ],
    },
    {
      name: 'Yeni Çağ Felsefesi',
      order: 13,
      children: [
        { name: 'Francis Bacon', order: 1 },
        { name: 'Descartes', order: 2 },
        { name: 'Spinoza', order: 3 },
        { name: 'Leibniz', order: 4 },
        { name: 'Locke', order: 5 },
        { name: 'Berkeley', order: 6 },
        { name: 'Hume', order: 7 },
        { name: 'Hobbes', order: 8 },
      ],
    },
    {
      name: 'Aydınlanma Çağı Felsefesi',
      order: 14,
      children: [
        { name: 'Aydınlanmanın Özellikleri', order: 1 },
        { name: 'Voltaire', order: 2 },
        { name: 'Rousseau', order: 3 },
        { name: 'Montesquieu', order: 4 },
        { name: 'Diderot', order: 5 },
        { name: 'Kant', order: 6 },
      ],
    },
    {
      name: '19. Yüzyıl Felsefesi',
      order: 15,
      children: [
        { name: 'Hegel', order: 1 },
        { name: 'Schopenhauer', order: 2 },
        { name: 'Nietzsche', order: 3 },
        { name: 'Marx', order: 4 },
        { name: 'Mill', order: 5 },
        { name: 'Comte', order: 6 },
        { name: 'Kierkegaard', order: 7 },
      ],
    },
    {
      name: '20. Yüzyıl Felsefesi',
      order: 16,
      children: [
        { name: 'Varoluşçuluk', order: 1 },
        { name: 'Heidegger', order: 2 },
        { name: 'Sartre', order: 3 },
        { name: 'Camus', order: 4 },
        { name: 'Fenomenoloji', order: 5 },
        { name: 'Husserl', order: 6 },
        { name: 'Pragmatizm', order: 7 },
        { name: 'William James', order: 8 },
        { name: 'Dewey', order: 9 },
        { name: 'Analitik Felsefe', order: 10 },
        { name: 'Wittgenstein', order: 11 },
        { name: 'Russell', order: 12 },
        { name: 'Yapısalcılık', order: 13 },
        { name: 'Postyapısalcılık', order: 14 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    const parentTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: felsefeSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu eklendi: ${konu.name}`);

    // Alt konuları ekle
    for (const child of konu.children) {
      await prisma.topic.create({
        data: {
          name: child.name,
          subjectId: felsefeSubject.id,
          parentTopicId: parentTopic.id,
          order: child.order,
        },
      });
      console.log(`    Alt konu eklendi: ${child.name}`);
    }
  }

  console.log('\nAYT Felsefe konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

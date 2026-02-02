// AYT Biyoloji Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AYT Biyoloji dersi ve konuları ekleniyor...');

  // AYT Biyoloji Dersini oluştur
  const biyolojiSubject = await prisma.subject.create({
    data: {
      name: 'Biyoloji',
      examType: ExamType.AYT,
      gradeLevels: [9, 10, 11, 12],
      order: 10,
      isActive: true,
    },
  });

  console.log(`AYT Biyoloji dersi oluşturuldu: ${biyolojiSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Biyoloji Bilimi ve Temel Kavramlar',
      order: 1,
      children: [
        { name: 'Biyolojinin Tanımı ve Kapsamı', order: 1 },
        { name: 'Canlıların Ortak Özellikleri', order: 2 },
        { name: 'Biyolojinin Alt Dalları', order: 3 },
        { name: 'Bilimsel Araştırma Yöntemleri', order: 4 },
        { name: 'Biyolojide Ölçüm ve Hesaplama', order: 5 },
      ],
    },
    {
      name: 'Hücrenin Yapısı ve İşlevleri',
      order: 2,
      children: [
        { name: 'Hücre Teorisi', order: 1 },
        { name: 'Prokaryot ve Ökaryot Hücre', order: 2 },
        { name: 'Hücre Duvarı ve Zarı', order: 3 },
        { name: 'Sitoplazma', order: 4 },
        { name: 'Çekirdek', order: 5 },
        { name: 'Mitokondri', order: 6 },
        { name: 'Ribozom', order: 7 },
        { name: 'Endoplazmik Retikulum', order: 8 },
        { name: 'Golgi Cisimciği', order: 9 },
        { name: 'Lizozom', order: 10 },
        { name: 'Kloroplast', order: 11 },
        { name: 'Sentriyol', order: 12 },
        { name: 'Vakuol', order: 13 },
      ],
    },
    {
      name: 'Hücrenin Maddesel Yapısı',
      order: 3,
      children: [
        { name: 'Karbon ve Canlılık', order: 1 },
        { name: 'Karbohidratlar', order: 2 },
        { name: 'Lipitler', order: 3 },
        { name: 'Proteinler', order: 4 },
        { name: 'Nükleik Asitler', order: 5 },
        { name: 'ATP', order: 6 },
        { name: 'Su ve Mineraller', order: 7 },
        { name: 'Vitaminler', order: 8 },
      ],
    },
    {
      name: 'Hücre Zarından Madde Geçişi',
      order: 4,
      children: [
        { name: 'Seçici Geçirgenlik', order: 1 },
        { name: 'Pasif Taşıma', order: 2 },
        { name: 'Aktif Taşıma', order: 3 },
        { name: 'Osmoz', order: 4 },
        { name: 'Endositoz ve Egzositoz', order: 5 },
        { name: 'Taşıma Proteini', order: 6 },
      ],
    },
    {
      name: 'Canlıların Sınıflandırılması',
      order: 5,
      children: [
        { name: 'Sınıflandırma Sistemleri', order: 1 },
        { name: 'Alem Monera', order: 2 },
        { name: 'Alem Protista', order: 3 },
        { name: 'Alem Fungi', order: 4 },
        { name: 'Alem Plantae', order: 5 },
        { name: 'Alem Animalia', order: 6 },
        { name: 'Virüsler', order: 7 },
      ],
    },
    {
      name: 'Hücre Bölünmesi',
      order: 6,
      children: [
        { name: 'Hücre Döngüsü', order: 1 },
        { name: 'Mitoz Bölünme', order: 2 },
        { name: 'Mayoz Bölünme', order: 3 },
        { name: 'Eşeyli ve Eşeysiz Üreme', order: 4 },
        { name: 'Kromozom Yapısı', order: 5 },
        { name: 'Karyotip Analizi', order: 6 },
      ],
    },
    {
      name: 'Kalıtımın Genel İlkeleri',
      order: 7,
      children: [
        { name: 'Mendel Genetiği', order: 1 },
        { name: 'Baskın ve Çekinik', order: 2 },
        { name: 'Monohibrit ve Dihibrit Çaprazlama', order: 3 },
        { name: 'Kan Grupları Kalıtımı', order: 4 },
        { name: 'Cinsiyete Bağlı Kalıtım', order: 5 },
        { name: 'Kan Grupları ve Rh Faktörü', order: 6 },
      ],
    },
    {
      name: 'Moleküler Genetik',
      order: 8,
      children: [
        { name: 'DNA Yapısı', order: 1 },
        { name: 'RNA Yapısı ve Türleri', order: 2 },
        { name: 'DNA Replikasyonu', order: 3 },
        { name: 'Protein Sentezi', order: 4 },
        { name: 'Transkripsiyon', order: 5 },
        { name: 'Translasyon', order: 6 },
        { name: 'Genetik Kod', order: 7 },
        { name: 'Mutasyon', order: 8 },
      ],
    },
    {
      name: 'Ekosistem Ekolojisi',
      order: 9,
      children: [
        { name: 'Ekosistem Kavramı', order: 1 },
        { name: 'Biyotik ve Abiyotik Faktörler', order: 2 },
        { name: 'Besin Zinciri ve Ağı', order: 3 },
        { name: 'Enerji Akışı', order: 4 },
        { name: 'Madde Döngüleri', order: 5 },
        { name: 'Popülasyon Dinamiği', order: 6 },
        { name: 'Biyolojik Çeşitlilik', order: 7 },
      ],
    },
    {
      name: 'İnsan Fizyolojisi - Sindirim Sistemi',
      order: 10,
      children: [
        { name: 'Sindirim Sistemi Organları', order: 1 },
        { name: 'Ağız ve Yutak', order: 2 },
        { name: 'Yemek Borusu ve Mide', order: 3 },
        { name: 'İnce ve Kalın Bağırsak', order: 4 },
        { name: 'Karaciğer ve Pankreas', order: 5 },
        { name: 'Sindirim Enzimleri', order: 6 },
      ],
    },
    {
      name: 'İnsan Fizyolojisi - Solunum Sistemi',
      order: 11,
      children: [
        { name: 'Solunum Sistemi Organları', order: 1 },
        { name: 'Burun ve Farinks', order: 2 },
        { name: 'Gırtlak ve Trakea', order: 3 },
        { name: 'Bronş ve Akciğerler', order: 4 },
        { name: 'Gaz Alışverişi', order: 5 },
        { name: 'Solunum Mekaniği', order: 6 },
      ],
    },
    {
      name: 'İnsan Fizyolojisi - Dolaşım Sistemi',
      order: 12,
      children: [
        { name: 'Kalp Yapısı ve Çalışması', order: 1 },
        { name: 'Kan Damarları', order: 2 },
        { name: 'Kanın Yapısı', order: 3 },
        { name: 'Kan Grupları', order: 4 },
        { name: 'Büyük ve Küçük Kan Dolaşımı', order: 5 },
        { name: 'Lenf Dolaşımı', order: 6 },
      ],
    },
    {
      name: 'İnsan Fizyolojisi - Boşaltım Sistemi',
      order: 13,
      children: [
        { name: 'Böbrek Yapısı ve İşlevi', order: 1 },
        { name: 'İdrar Oluşumu', order: 2 },
        { name: 'Üreter ve İdrar Kesesi', order: 3 },
        { name: 'Üretra', order: 4 },
        { name: 'Ter Bezleri', order: 5 },
        { name: 'Karaciğer ve Boşaltım', order: 6 },
      ],
    },
    {
      name: 'İnsan Fizyolojisi - Sinir Sistemi',
      order: 14,
      children: [
        { name: 'Sinir Hücresi', order: 1 },
        { name: 'Merkezi Sinir Sistemi', order: 2 },
        { name: 'Beyin ve Omurilik', order: 3 },
        { name: 'Çevresel Sinir Sistemi', order: 4 },
        { name: 'Otonom Sinir Sistemi', order: 5 },
        { name: 'Duyu Organları', order: 6 },
        { name: 'Sinirsel İleti', order: 7 },
      ],
    },
    {
      name: 'İnsan Fizyolojisi - Endokrin Sistem',
      order: 15,
      children: [
        { name: 'Hormonların Özellikleri', order: 1 },
        { name: 'Hipofiz Bezi', order: 2 },
        { name: 'Tiroid ve Paratiroid', order: 3 },
        { name: 'Pankreas ve İnsülin', order: 4 },
        { name: 'Böbrek Üstü Bezleri', order: 5 },
        { name: 'Cinsiyet Hormonları', order: 6 },
      ],
    },
    {
      name: 'İnsan Fizyolojisi - Üreme Sistemi',
      order: 16,
      children: [
        { name: 'Erkek Üreme Sistemi', order: 1 },
        { name: 'Kadın Üreme Sistemi', order: 2 },
        { name: 'Menstrüel Döngü', order: 3 },
        { name: 'Gebelik ve Doğum', order: 4 },
        { name: 'Üreme Sağlığı', order: 5 },
      ],
    },
    {
      name: 'İnsan Fizyolojisi - Hareket Sistemi',
      order: 17,
      children: [
        { name: 'İskelet Sistemi', order: 1 },
        { name: 'Kemik Yapısı', order: 2 },
        { name: 'Kas Sistemi', order: 3 },
        { name: 'Kas Çeşitleri', order: 4 },
        { name: 'Kas İlişkileri', order: 5 },
        { name: 'Kas Kasılması', order: 6 },
      ],
    },
    {
      name: 'İnsan Fizyolojisi - Duyu Organları',
      order: 18,
      children: [
        { name: 'Göz ve Görme', order: 1 },
        { name: 'Kulak ve İşitme', order: 2 },
        { name: 'Burun ve Koku', order: 3 },
        { name: 'Dil ve Tat', order: 4 },
        { name: 'Deri ve Dokunma', order: 5 },
        { name: 'Denge Organı', order: 6 },
      ],
    },
    {
      name: 'İnsan Fizyolojisi - Bağışıklık Sistemi',
      order: 19,
      children: [
        { name: 'Bağışıklık Sistemi Organları', order: 1 },
        { name: 'Doğuştan Bağışıklık', order: 2 },
        { name: 'Kazanılmış Bağışıklık', order: 3 },
        { name: 'Antikorlar', order: 4 },
        { name: 'Aşılar', order: 5 },
        { name: 'Alerji ve Otoimmün Hastalıklar', order: 6 },
      ],
    },
    {
      name: 'Bitki Biyolojisi',
      order: 20,
      children: [
        { name: 'Bitki Hücresi', order: 1 },
        { name: 'Bitki Dokuları', order: 2 },
        { name: 'Kök Yapısı ve İşlevi', order: 3 },
        { name: 'Gövde Yapısı ve İşlevi', order: 4 },
        { name: 'Yaprak Yapısı ve İşlevi', order: 5 },
        { name: 'Fotosentez', order: 6 },
        { name: 'Solunum', order: 7 },
        { name: 'Terleme', order: 8 },
        { name: 'Bitki Büyüme ve Gelişme', order: 9 },
        { name: 'Bitki Hormonları', order: 10 },
      ],
    },
    {
      name: 'Biyoteknoloji',
      order: 21,
      children: [
        { name: 'Biyoteknolojinin Tanımı', order: 1 },
        { name: 'Genetik Mühendisliği', order: 2 },
        { name: 'Klonlama', order: 3 },
        { name: 'DNA Parmak İzi', order: 4 },
        { name: 'Gen Tedavisi', order: 5 },
        { name: 'GDO ve Tarım', order: 6 },
        { name: 'Biyogüvenlik', order: 7 },
      ],
    },
    {
      name: 'Evrim',
      order: 22,
      children: [
        { name: 'Evrim Teorisi', order: 1 },
        { name: 'Doğal Seçilim', order: 2 },
        { name: 'Türleşme', order: 3 },
        { name: 'Adaptasyon', order: 4 },
        { name: 'Fosil Kayıtları', order: 5 },
        { name: 'İnsan Evrimi', order: 6 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    const parentTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: biyolojiSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu eklendi: ${konu.name}`);

    // Alt konuları ekle
    for (const child of konu.children) {
      await prisma.topic.create({
        data: {
          name: child.name,
          subjectId: biyolojiSubject.id,
          parentTopicId: parentTopic.id,
          order: child.order,
        },
      });
      console.log(`    Alt konu eklendi: ${child.name}`);
    }
  }

  console.log('\nAYT Biyoloji konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

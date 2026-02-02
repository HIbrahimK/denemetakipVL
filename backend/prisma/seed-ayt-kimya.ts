// AYT Kimya Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AYT Kimya dersi ve konuları ekleniyor...');

  // AYT Kimya Dersini oluştur
  const kimyaSubject = await prisma.subject.create({
    data: {
      name: 'Kimya',
      examType: ExamType.AYT,
      gradeLevels: [9, 10, 11, 12],
      order: 9,
      isActive: true,
    },
  });

  console.log(`AYT Kimya dersi oluşturuldu: ${kimyaSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Kimya Bilimi ve Temel Kavramlar',
      order: 1,
      children: [
        { name: 'Kimyanın Tanımı ve Kapsamı', order: 1 },
        { name: 'Maddenin Halleri', order: 2 },
        { name: 'Fiziksel ve Kimyasal Değişim', order: 3 },
        { name: 'Element ve Bileşik', order: 4 },
        { name: 'Karışımlar ve Ayrıştırma', order: 5 },
        { name: 'Atom ve Molekül', order: 6 },
        { name: 'Mol Kavramı', order: 7 },
      ],
    },
    {
      name: 'Atom ve Periyodik Sistem',
      order: 2,
      children: [
        { name: 'Atomun Yapısı', order: 1 },
        { name: 'Atom Modelleri', order: 2 },
        { name: 'Atom Numarası ve Kütle Numarası', order: 3 },
        { name: 'İzotop, İzoton, İzobar', order: 4 },
        { name: 'Elektron Dizilimi', order: 5 },
        { name: 'Periyodik Sistem', order: 6 },
        { name: 'Periyodik Özellikler', order: 7 },
      ],
    },
    {
      name: 'Kimyasal Bağlar',
      order: 3,
      children: [
        { name: 'Bağ Türleri', order: 1 },
        { name: 'İyonik Bağ', order: 2 },
        { name: 'Kovalent Bağ', order: 3 },
        { name: 'Metalik Bağ', order: 4 },
        { name: 'Molekül Geometrisi', order: 5 },
        { name: 'Polarite', order: 6 },
        { name: 'Hidrojen Bağı', order: 7 },
        { name: 'Van der Waals Kuvvetleri', order: 8 },
      ],
    },
    {
      name: 'Maddenin Halleri',
      order: 4,
      children: [
        { name: 'Katılar', order: 1 },
        { name: 'Sıvılar', order: 2 },
        { name: 'Gazlar', order: 3 },
        { name: 'Plazma', order: 4 },
        { name: 'Hal Değişimleri', order: 5 },
        { name: 'Buhar Basıncı', order: 6 },
        { name: 'Grafikler ve Çözümler', order: 7 },
      ],
    },
    {
      name: 'Çözeltiler',
      order: 5,
      children: [
        { name: 'Çözücü ve Çözünen', order: 1 },
        { name: 'Çözünürlük', order: 2 },
        { name: 'Derişim Birimleri', order: 3 },
        { name: 'Konsantrasyon Hesaplamaları', order: 4 },
        { name: 'Asit-Baz Titrasyonu', order: 5 },
        { name: 'Koligatif Özellikler', order: 6 },
      ],
    },
    {
      name: 'Kimyasal Tepkimeler',
      order: 6,
      children: [
        { name: 'Tepkime Türleri', order: 1 },
        { name: 'Tepkime Denklemleri', order: 2 },
        { name: 'Tepkime Hesaplamaları', order: 3 },
        { name: 'Sınırlayıcı ve Fazlalık', order: 4 },
        { name: 'Verim ve Saflık', order: 5 },
        { name: 'Yüzde Hesaplamaları', order: 6 },
      ],
    },
    {
      name: 'Asitler ve Bazlar',
      order: 7,
      children: [
        { name: 'Asit ve Baz Tanımları', order: 1 },
        { name: 'Arrhenius Teorisi', order: 2 },
        { name: 'Brønsted-Lowry Teorisi', order: 3 },
        { name: 'Lewis Teorisi', order: 4 },
        { name: 'pH ve pOH', order: 5 },
        { name: 'Asit-Baz Güçleri', order: 6 },
        { name: 'Tampon Çözeltiler', order: 7 },
        { name: 'Hidroliz', order: 8 },
      ],
    },
    {
      name: 'Kimyasal Denge',
      order: 8,
      children: [
        { name: 'Dinamik Denge', order: 1 },
        { name: 'Denge Sabiti', order: 2 },
        { name: 'Le Chatelier İlkesi', order: 3 },
        { name: 'Denge Hesaplamaları', order: 4 },
        { name: 'Homojen ve Heterojen Denge', order: 5 },
      ],
    },
    {
      name: 'Elektrokimya',
      order: 9,
      children: [
        { name: 'Redoks Tepkimeleri', order: 1 },
        { name: 'Yükseltgenme ve İndirgenme', order: 2 },
        { name: 'Elektroliz', order: 3 },
        { name: 'Faraday Yasaları', order: 4 },
        { name: 'Pil ve Aküler', order: 5 },
        { name: 'Standart İndirgenme Potansiyelleri', order: 6 },
        { name: 'Korozyon', order: 7 },
      ],
    },
    {
      name: 'Termokimya',
      order: 10,
      children: [
        { name: 'Egzotermik ve Endotermik Tepkimeler', order: 1 },
        { name: 'Entalpi', order: 2 },
        { name: 'Oluşum Entalpisi', order: 3 },
        { name: 'Yakma Entalpisi', order: 4 },
        { name: 'Hess Kanunu', order: 5 },
        { name: 'Bağ Enerjisi', order: 6 },
      ],
    },
    {
      name: 'Organik Kimya - Temel Kavramlar',
      order: 11,
      children: [
        { name: 'Organik Bileşiklerin Özellikleri', order: 1 },
        { name: 'Karbonun Özellikleri', order: 2 },
        { name: 'Yapı Formülleri', order: 3 },
        { name: 'İzomerlik', order: 4 },
        { name: 'Fonksiyonel Gruplar', order: 5 },
        { name: 'IUPAC İsimlendirme', order: 6 },
      ],
    },
    {
      name: 'Organik Kimya - Hidrokarbonlar',
      order: 12,
      children: [
        { name: 'Alkanlar', order: 1 },
        { name: 'Alkenler', order: 2 },
        { name: 'Alkinler', order: 3 },
        { name: 'Aromatik Bileşikler', order: 4 },
        { name: 'Hidrokarbonların Reaksiyonları', order: 5 },
        { name: 'Petrol ve Doğalgaz', order: 6 },
      ],
    },
    {
      name: 'Organik Kimya - Alkoller ve Eterler',
      order: 13,
      children: [
        { name: 'Alkollerin Yapısı ve Sınıflandırılması', order: 1 },
        { name: 'Alkollerin Fiziksel Özellikleri', order: 2 },
        { name: 'Alkollerin Reaksiyonları', order: 3 },
        { name: 'Fenol', order: 4 },
        { name: 'Eterler', order: 5 },
        { name: 'Alkollerin Kullanım Alanları', order: 6 },
      ],
    },
    {
      name: 'Organik Kimya - Aldehitler ve Ketonlar',
      order: 14,
      children: [
        { name: 'Karbonil Bileşikleri', order: 1 },
        { name: 'Aldehitlerin Özellikleri', order: 2 },
        { name: 'Ketonların Özellikleri', order: 3 },
        { name: 'Redoks Reaksiyonları', order: 4 },
        { name: 'Aldol Kondenzasyonu', order: 5 },
      ],
    },
    {
      name: 'Organik Kimya - Karboksilik Asitler ve Türevleri',
      order: 15,
      children: [
        { name: 'Karboksilik Asitler', order: 1 },
        { name: 'Esterler', order: 2 },
        { name: 'Yağlar ve Sabunlar', order: 3 },
        { name: 'Amino Asitler', order: 4 },
        { name: 'Proteinler', order: 5 },
        { name: 'Karbohidratlar', order: 6 },
      ],
    },
    {
      name: 'Organik Kimya - Amonyak ve Aminler',
      order: 16,
      children: [
        { name: 'Amonyak ve Türevleri', order: 1 },
        { name: 'Aminler', order: 2 },
        { name: 'Aminlerin Bazikliği', order: 3 },
        { name: 'Nitro Bileşikleri', order: 4 },
      ],
    },
    {
      name: 'Polimerler',
      order: 17,
      children: [
        { name: 'Polimerleşme Tepkimeleri', order: 1 },
        { name: 'Doğal Polimerler', order: 2 },
        { name: 'Sentetik Polimerler', order: 3 },
        { name: 'Plastikler', order: 4 },
        { name: 'Kauçuk', order: 5 },
        { name: 'Lifler', order: 6 },
      ],
    },
    {
      name: 'Kimya ve Enerji',
      order: 18,
      children: [
        { name: 'Yakıtlar', order: 1 },
        { name: 'Yenilenebilir Enerji Kaynakları', order: 2 },
        { name: 'Nükleer Enerji', order: 3 },
        { name: 'Enerji Verimliliği', order: 4 },
      ],
    },
    {
      name: 'Kimya ve Çevre',
      order: 19,
      children: [
        { name: 'Su Kirliliği', order: 1 },
        { name: 'Hava Kirliliği', order: 2 },
        { name: 'Toprak Kirliliği', order: 3 },
        { name: 'Atık Yönetimi', order: 4 },
        { name: 'Sürdürülebilir Kimya', order: 5 },
      ],
    },
    {
      name: 'Kimya ve Biyoteknoloji',
      order: 20,
      children: [
        { name: 'Enzimler', order: 1 },
        { name: 'DNA ve RNA', order: 2 },
        { name: 'Genetik Mühendisliği', order: 3 },
        { name: 'Biyoteknolojik Ürünler', order: 4 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    const parentTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: kimyaSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu eklendi: ${konu.name}`);

    // Alt konuları ekle
    for (const child of konu.children) {
      await prisma.topic.create({
        data: {
          name: child.name,
          subjectId: kimyaSubject.id,
          parentTopicId: parentTopic.id,
          order: child.order,
        },
      });
      console.log(`    Alt konu eklendi: ${child.name}`);
    }
  }

  console.log('\nAYT Kimya konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

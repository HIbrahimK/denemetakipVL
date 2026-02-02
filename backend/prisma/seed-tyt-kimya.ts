// TYT Kimya Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('TYT Kimya dersi ve konuları ekleniyor...');

  // TYT Kimya Dersini oluştur
  const kimyaSubject = await prisma.subject.create({
    data: {
      name: 'Kimya',
      examType: ExamType.TYT,
      gradeLevels: [9, 10, 11, 12],
      order: 5,
      isActive: true,
    },
  });

  console.log(`Kimya dersi oluşturuldu: ${kimyaSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Kimya Bilimi',
      order: 1,
      children: [
        { name: 'Kimya Biliminin Doğuşu ve Kapsamı', order: 1 },
        { name: 'Kimyanın Temel Kanunları', order: 2 },
        { name: 'Kimyasal Türler ve Formüller', order: 3 },
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
        { name: 'Periyodik Sistem ve Özellikleri', order: 5 },
        { name: 'Elektron Dizilimi', order: 6 },
      ],
    },
    {
      name: 'Modern Atom Teorisi',
      order: 3,
      children: [
        { name: 'Atomun Kuantum Modeli', order: 1 },
        { name: 'Orbital ve Kuantal Sayılar', order: 2 },
        { name: 'Elektron Konfigürasyonu', order: 3 },
        { name: 'Periyodik Özellikler', order: 4 },
      ],
    },
    {
      name: 'Kimyasal Bağlar',
      order: 4,
      children: [
        { name: 'İyonik Bağlar', order: 1 },
        { name: 'Kovalent Bağlar', order: 2 },
        { name: 'Metalik Bağlar', order: 3 },
        { name: 'Molekül Geometrisi', order: 4 },
        { name: 'Polarite', order: 5 },
      ],
    },
    {
      name: 'Maddenin Halleri',
      order: 5,
      children: [
        { name: 'Katı Sıvı Gaz Halleri', order: 1 },
        { name: 'Gaz Yasaları', order: 2 },
        { name: 'Sıvı Çözeltiler', order: 3 },
        { name: 'Çözünürlük', order: 4 },
        { name: 'Koligatif Özellikler', order: 5 },
      ],
    },
    {
      name: 'Kimyasal Tepkimelerde Hesaplamalar',
      order: 6,
      children: [
        { name: 'Mol Kavramı', order: 1 },
        { name: 'Kimyasal Formüller', order: 2 },
        { name: 'Tepkime Denklemleri', order: 3 },
        { name: 'Stokiyometri', order: 4 },
        { name: 'Sınırlayıcı Reaktif', order: 5 },
        { name: 'Verim ve Saflık Hesaplamaları', order: 6 },
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

  console.log('\nTYT Kimya konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

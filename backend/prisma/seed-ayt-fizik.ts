// AYT Fizik Dersi ve Konuları Seed Dosyası
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('AYT Fizik dersi ve konuları ekleniyor...');

  // AYT Fizik Dersini oluştur
  const fizikSubject = await prisma.subject.create({
    data: {
      name: 'Fizik',
      examType: ExamType.AYT,
      gradeLevels: [9, 10, 11, 12],
      order: 8,
      isActive: true,
    },
  });

  console.log(`AYT Fizik dersi oluşturuldu: ${fizikSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Fizik Bilimine Giriş',
      order: 1,
      children: [
        { name: 'Fizik ve Doğa', order: 1 },
        { name: 'Fiziksel Nicelikler ve Birimler', order: 2 },
        { name: 'Vektörler', order: 3 },
        { name: 'Skaler ve Vektörel Nicelikler', order: 4 },
      ],
    },
    {
      name: 'Kuvvet ve Hareket',
      order: 2,
      children: [
        { name: 'Konum ve Yer Değiştirme', order: 1 },
        { name: 'Hız ve Sürat', order: 2 },
        { name: 'İvme', order: 3 },
        { name: 'Tek Boyutta Hareket', order: 4 },
        { name: 'İki Boyutta Hareket', order: 5 },
        { name: 'Nem ve Yağış', order: 6 },
      ],
    },
    {
      name: 'Newtonun Hareket Yasaları',
      order: 3,
      children: [
        { name: 'Eylemsizlik İlkesi', order: 1 },
        { name: 'Kuvvet ve İvme İlişkisi', order: 2 },
        { name: 'Etki-Tepki İlkesi', order: 3 },
        { name: 'Sürtünme Kuvveti', order: 4 },
        { name: 'Eğik Düzlemde Hareket', order: 5 },
        { name: 'Atwood Makinesi', order: 6 },
      ],
    },
    {
      name: 'Enerji ve Hareket',
      order: 4,
      children: [
        { name: 'İş ve Enerji', order: 1 },
        { name: 'Kinetik Enerji', order: 2 },
        { name: 'Potansiyel Enerji', order: 3 },
        { name: 'Enerjinin Korunumu', order: 4 },
        { name: 'Güç ve Verim', order: 5 },
        { name: 'Elastik Potansiyel Enerji', order: 6 },
      ],
    },
    {
      name: 'Impuls ve Momentum',
      order: 5,
      children: [
        { name: 'Momentum ve İmpuls', order: 1 },
        { name: 'Momentumun Korunumu', order: 2 },
        { name: 'Çarpışmalar', order: 3 },
        { name: 'Roket Denklemi', order: 4 },
        { name: 'Açısal Momentum', order: 5 },
      ],
    },
    {
      name: 'Basit Makineler',
      order: 6,
      children: [
        { name: 'Kaldıraç', order: 1 },
        { name: 'Palanga Sistemleri', order: 2 },
        { name: 'Çıkrık', order: 3 },
        { name: 'Vida ve Eğik Düzlem', order: 4 },
        { name: 'Dişli Çarklar', order: 5 },
        { name: 'Mekanik Avantaj', order: 6 },
      ],
    },
    {
      name: 'Isı ve Sıcaklık',
      order: 7,
      children: [
        { name: 'Sıcaklık ve Isı', order: 1 },
        { name: 'Genleşme', order: 2 },
        { name: 'Isı Transferi', order: 3 },
        { name: 'Hal Değişimleri', order: 4 },
        { name: 'Isı ve Sıcaklık Ölçümü', order: 5 },
      ],
    },
    {
      name: 'Elektrostatik',
      order: 8,
      children: [
        { name: 'Elektrik Yükü', order: 1 },
        { name: 'Coulomb Yasası', order: 2 },
        { name: 'Elektrik Alanı', order: 3 },
        { name: 'Elektrik Potansiyel', order: 4 },
        { name: 'Yüklü Parçacıkların Hareketi', order: 5 },
        { name: 'Kapasitörler', order: 6 },
      ],
    },
    {
      name: 'Elektrik Akımı ve Devreler',
      order: 9,
      children: [
        { name: 'Elektrik Akımı', order: 1 },
        { name: 'Ohm Yasası', order: 2 },
        { name: 'Direnç ve İletkenlik', order: 3 },
        { name: 'Seri ve Paralel Devreler', order: 4 },
        { name: 'Kirchhoff Kuralları', order: 5 },
        { name: 'Elektrik Gücü ve Enerji', order: 6 },
      ],
    },
    {
      name: 'Mıknatıslar ve Manyetizma',
      order: 10,
      children: [
        { name: 'Mıknatıs ve Manyetik Alan', order: 1 },
        { name: 'Manyetik Kuvvet', order: 2 },
        { name: 'Elektromıknatıs', order: 3 },
        { name: 'Dünya Manyetik Alanı', order: 4 },
        { name: 'Manyetik Akı', order: 5 },
      ],
    },
    {
      name: 'Elektromanyetik İndüksiyon',
      order: 11,
      children: [
        { name: 'Faraday Yasası', order: 1 },
        { name: 'Lenz Kuralı', order: 2 },
        { name: 'Alternatif Akım', order: 3 },
        { name: 'Transformatörler', order: 4 },
        { name: 'Alternatör ve Dinamo', order: 5 },
      ],
    },
    {
      name: 'Dalgalar',
      order: 12,
      children: [
        { name: 'Dalga Hareketi', order: 1 },
        { name: 'Dalgaların Özellikleri', order: 2 },
        { name: 'Yay Dalgaları', order: 3 },
        { name: 'Su Dalgaları', order: 4 },
        { name: 'Ses Dalgaları', order: 5 },
        { name: 'Deprem Dalgaları', order: 6 },
        { name: 'Doppler Olayı', order: 7 },
      ],
    },
    {
      name: 'Optik',
      order: 13,
      children: [
        { name: 'Işık ve Yayıılması', order: 1 },
        { name: 'Yansıma', order: 2 },
        { name: 'Kırılma', order: 3 },
        { name: 'Aynalar', order: 4 },
        { name: 'Mercekler', order: 5 },
        { name: 'Göz ve Görme', order: 6 },
        { name: 'Optik Aletler', order: 7 },
      ],
    },
    {
      name: 'Modern Fizik - Atom Fiziği',
      order: 14,
      children: [
        { name: 'Atom Modelleri', order: 1 },
        { name: 'Bohr Atom Modeli', order: 2 },
        { name: 'Fotoelektrik Olay', order: 3 },
        { name: 'Compton Olayı', order: 4 },
        { name: 'De Broglie Dalgaları', order: 5 },
        { name: 'Heisenberg Belirsizlik İlkesi', order: 6 },
      ],
    },
    {
      name: 'Modern Fizik - Çekirdek Fiziği',
      order: 15,
      children: [
        { name: 'Atom Çekirdeği', order: 1 },
        { name: 'Radyoaktivite', order: 2 },
        { name: 'Alfa, Beta, Gama Işınları', order: 3 },
        { name: 'Yarı Ömür', order: 4 },
        { name: 'Kütle-Enerji Eşdeğerliği', order: 5 },
        { name: 'Fisyon ve Füzyon', order: 6 },
        { name: 'Parçacık Hızlandırıcıları', order: 7 },
      ],
    },
    {
      name: 'Modern Fizik - Özel Görelilik',
      order: 16,
      children: [
        { name: 'Einsteinın Görelilik Teorisi', order: 1 },
        { name: 'Zaman Genişlemesi', order: 2 },
        { name: 'Uzunluk Kısalması', order: 3 },
        { name: 'E=mc² Formülü', order: 4 },
      ],
    },
    {
      name: 'Basınç ve Kaldırma Kuvveti',
      order: 17,
      children: [
        { name: 'Basınç', order: 1 },
        { name: 'Sıvı Basıncı', order: 2 },
        { name: 'Paskal İlkesi', order: 3 },
        { name: 'Arşimet Prensibi', order: 4 },
        { name: 'Kaldırma Kuvveti', order: 5 },
        { name: 'Atmosfer Basıncı', order: 6 },
      ],
    },
    {
      name: 'Dönme Hareketi',
      order: 18,
      children: [
        { name: 'Açısal Hız ve İvme', order: 1 },
        { name: 'Merkezcil Kuvvet', order: 2 },
        { name: 'Dönme Kinetik Enerjisi', order: 3 },
        { name: 'Açısal Momentum', order: 4 },
        { name: 'Yuvarlanma Hareketi', order: 5 },
      ],
    },
    {
      name: 'Periyodik Hareket',
      order: 19,
      children: [
        { name: 'Basit Harmonik Hareket', order: 1 },
        { name: 'Sarkacın Periyodu', order: 2 },
        { name: 'Yayda Periyodik Hareket', order: 3 },
        { name: 'Dairesel Hareket ve Periyot', order: 4 },
      ],
    },
    {
      name: 'Gazlar ve Termodinamik',
      order: 20,
      children: [
        { name: 'Gazların Kinetik Teorisi', order: 1 },
        { name: 'Boyle-Mariotte Yasası', order: 2 },
        { name: 'Charles ve Gay-Lussac Yasaları', order: 3 },
        { name: 'İdeal Gaz Yasası', order: 4 },
        { name: 'Termodinamiğin 1. Yasası', order: 5 },
        { name: 'Termodinamiğin 2. Yasası', order: 6 },
        { name: 'Entropi', order: 7 },
      ],
    },
  ];

  // Konuları ekle
  for (const konu of konular) {
    const parentTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: fizikSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu eklendi: ${konu.name}`);

    // Alt konuları ekle
    for (const child of konu.children) {
      await prisma.topic.create({
        data: {
          name: child.name,
          subjectId: fizikSubject.id,
          parentTopicId: parentTopic.id,
          order: child.order,
        },
      });
      console.log(`    Alt konu eklendi: ${child.name}`);
    }
  }

  console.log('\nAYT Fizik konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

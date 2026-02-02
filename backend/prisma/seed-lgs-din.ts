// LGS Din Kültürü ve Ahlak Bilgisi Dersi ve Konuları Seed Dosyası (8. Sınıf)
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('LGS Din Kültürü ve Ahlak Bilgisi dersi ve konuları ekleniyor...');

  // LGS Din Kültürü Dersini oluştur
  const dinSubject = await prisma.subject.create({
    data: {
      name: 'Din Kültürü ve Ahlak Bilgisi',
      examType: ExamType.LGS,
      gradeLevels: [8],
      order: 4,
      isActive: true,
    },
  });

  console.log(`LGS Din Kültürü dersi oluşturuldu: ${dinSubject.id}`);

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Kuran-ı Kerim ve Özellikleri',
      order: 1,
      children: [
        { name: 'Kuran-ı Kerim\'in İndirilişi', order: 1 },
        { name: 'Kuran-ı Kerim\'in Koruması', order: 2 },
        { name: 'Kuran-ı Kerim\'in Üslubu', order: 3 },
        { name: 'Kuran-ı Kerim\'in Temel Konuları', order: 4 },
      ],
    },
    {
      name: 'Kuran-ı Kerim\'de İnanç Esasları',
      order: 2,
      children: [
        { name: 'Allah\'a İman', order: 1 },
        { name: 'Meleklere İman', order: 2 },
        { name: 'Kitaplara İman', order: 3 },
        { name: 'Peygamberlere İman', order: 4 },
        { name: 'Ahirete İman', order: 5 },
        { name: 'Kadere İman', order: 6 },
      ],
    },
    {
      name: 'İslam\'da İbadet',
      order: 3,
      children: [
        { name: 'İbadet Kavramı', order: 1 },
        { name: 'Namaz', order: 2 },
        { name: 'Oruç', order: 3 },
        { name: 'Hac', order: 4 },
        { name: 'Zekat', order: 5 },
      ],
    },
    {
      name: 'Hz. Muhammed\'in Hayatı',
      order: 4,
      children: [
        { name: 'Hz. Muhammed\'in Doğumu ve Çocukluğu', order: 1 },
        { name: 'Hz. Muhammed\'in Gençliği', order: 2 },
        { name: 'Peygamberlik Görevi', order: 3 },
        { name: 'Mekke Dönemi', order: 4 },
        { name: 'Medine Dönemi', order: 5 },
        { name: 'Veda Haccı ve Veda Hutbesi', order: 6 },
      ],
    },
    {
      name: 'İslam ve Bilim',
      order: 5,
      children: [
        { name: 'İslam\'ın Bilime Bakışı', order: 1 },
        { name: 'İslam Bilim Tarihi', order: 2 },
        { name: 'İslam Dünyasından Bilim İnsanları', order: 3 },
      ],
    },
    {
      name: 'İslam ve Sanat',
      order: 6,
      children: [
        { name: 'İslam Sanatının Özellikleri', order: 1 },
        { name: 'İslam Mimarisinde Camiler', order: 2 },
        { name: 'Hat Sanatı', order: 3 },
        { name: 'Tezhip ve Minyatür', order: 4 },
        { name: 'Ebru Sanatı', order: 5 },
      ],
    },
    {
      name: 'Ahlak ve Değerler',
      order: 7,
      children: [
        { name: 'Ahlak Kavramı', order: 1 },
        { name: 'İslam Ahlakının Temelleri', order: 2 },
        { name: 'Güzel Ahlak Özellikleri', order: 3 },
        { name: 'Kötü Ahlak ve Sakınılması Gerekenler', order: 4 },
      ],
    },
    {
      name: 'Hz. Muhammed\'in Ahlakı',
      order: 8,
      children: [
        { name: 'Hz. Muhammed\'in Özlü Sözleri', order: 1 },
        { name: 'Hz. Muhammed\'in Davranışları', order: 2 },
        { name: 'Aile Hayatı', order: 3 },
        { name: 'Toplum Hayatı', order: 4 },
      ],
    },
    {
      name: 'Dürüstlük ve Güvenilirlik',
      order: 9,
      children: [
        { name: 'Dürüstlük Kavramı', order: 1 },
        { name: 'Dürüstlüğün Önemi', order: 2 },
        { name: 'Güvenilirlik', order: 3 },
        { name: 'Sözünde Durmak', order: 4 },
      ],
    },
    {
      name: 'Hoşgörü ve Barış',
      order: 10,
      children: [
        { name: 'Hoşgörü Kavramı', order: 1 },
        { name: 'İslam\'da Hoşgörü', order: 2 },
        { name: 'Barış ve Huzur', order: 3 },
        { name: 'Farklılıklara Saygı', order: 4 },
      ],
    },
    {
      name: 'Adalet ve Hakkaniyet',
      order: 11,
      children: [
        { name: 'Adalet Kavramı', order: 1 },
        { name: 'İslam\'da Adalet', order: 2 },
        { name: 'Haksızlık ve Zulüm', order: 3 },
        { name: 'Hak ve Hakkaniyet', order: 4 },
      ],
    },
    {
      name: 'Yardımlaşma ve Dayanışma',
      order: 12,
      children: [
        { name: 'Yardımlaşma Kavramı', order: 1 },
        { name: 'İslam\'da Yardımlaşma', order: 2 },
        { name: 'Dayanışma ve İş Birliği', order: 3 },
        { name: 'Kardeşlik Bilinci', order: 4 },
      ],
    },
    {
      name: 'Sabır ve Şükür',
      order: 13,
      children: [
        { name: 'Sabır Kavramı', order: 1 },
        { name: 'Sabır Çeşitleri', order: 2 },
        { name: 'Şükür Kavramı', order: 3 },
        { name: 'Şükrün Göstergeleri', order: 4 },
      ],
    },
    {
      name: 'Af ve Tevazu',
      order: 14,
      children: [
        { name: 'Affetme Kavramı', order: 1 },
        { name: 'İslam\'da Af ve Hoşgörü', order: 2 },
        { name: 'Tevazu ve Alçakgönüllülük', order: 3 },
        { name: 'Kibir ve Gösterişten Kaçınma', order: 4 },
      ],
    },
    {
      name: 'İslam\'da Aile',
      order: 15,
      children: [
        { name: 'Ailenin Önemi', order: 1 },
        { name: 'Eşler Arası İlişkiler', order: 2 },
        { name: 'Ana-Baba Hakkı', order: 3 },
        { name: 'Çocuk Hakkı', order: 4 },
      ],
    },
    {
      name: 'İslam\'da Komşuluk Hakkı',
      order: 16,
      children: [
        { name: 'Komşuluk İlişkileri', order: 1 },
        { name: 'Komşu Hakları', order: 2 },
        { name: 'İyi Komşuluk', order: 3 },
      ],
    },
    {
      name: 'Çevre ve Hayvan Sevgisi',
      order: 17,
      children: [
        { name: 'İslam\'da Çevre Bilinci', order: 1 },
        { name: 'Doğayı Koruma', order: 2 },
        { name: 'Hayvanlara Merhamet', order: 3 },
        { name: 'Bitkilere ve Canlılara Saygı', order: 4 },
      ],
    },
    {
      name: 'Kuran-ı Kerim\'den Sure ve Ayetler',
      order: 18,
      children: [
        { name: 'Fatiha Suresi', order: 1 },
        { name: 'Kevser Suresi', order: 2 },
        { name: 'Fil Suresi', order: 3 },
        { name: 'Kureyş Suresi', order: 4 },
        { name: 'Maun Suresi', order: 5 },
        { name: 'Kafirun Suresi', order: 6 },
        { name: 'Nasr Suresi', order: 7 },
        { name: 'Tebbet Suresi', order: 8 },
        { name: 'İhlas Suresi', order: 9 },
        { name: 'Felak Suresi', order: 10 },
        { name: 'Nas Suresi', order: 11 },
      ],
    },
    {
      name: 'Dua ve Zikir',
      order: 19,
      children: [
        { name: 'Dua Kavramı', order: 1 },
        { name: 'Dua Çeşitleri', order: 2 },
        { name: 'Dua Etme Adabı', order: 3 },
        { name: 'Zikir ve Teşbih', order: 4 },
        { name: 'Günlük Dualar', order: 5 },
      ],
    },
    {
      name: 'Dini Gün ve Geceler',
      order: 20,
      children: [
        { name: 'Kandil Geceleri', order: 1 },
        { name: 'Regaip Kandili', order: 2 },
        { name: 'Miraç Kandili', order: 3 },
        { name: 'Berat Kandili', order: 4 },
        { name: 'Kadir Gecesi', order: 5 },
        { name: 'Aşure Günü', order: 6 },
        { name: 'Mevlid Kandili', order: 7 },
      ],
    },
  ];

  // Konuları oluştur
  for (const konu of konular) {
    const mainTopic = await prisma.topic.create({
      data: {
        name: konu.name,
        subjectId: dinSubject.id,
        order: konu.order,
      },
    });

    console.log(`  Ana konu oluşturuldu: ${konu.name}`);

    // Alt konuları oluştur
    if (konu.children && konu.children.length > 0) {
      for (const child of konu.children) {
        await prisma.topic.create({
          data: {
            name: child.name,
            subjectId: dinSubject.id,
            parentTopicId: mainTopic.id,
            order: child.order,
          },
        });
        console.log(`    Alt konu: ${child.name}`);
      }
    }
  }

  console.log('LGS Din Kültürü ve Ahlak Bilgisi konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

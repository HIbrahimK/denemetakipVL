// LGS T.C. İnkılap Tarihi ve Atatürkçülük Dersi ve Konuları Seed Dosyası (8. Sınıf)
import { PrismaClient, ExamType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('LGS T.C. İnkılap Tarihi ve Atatürkçülük dersi ve konuları ekleniyor...');

  // LGS İnkılap Tarihi Dersini kontrol et veya oluştur
  let inkilapSubject = await prisma.subject.findFirst({
    where: { name: 'T.C. İnkılap Tarihi ve Atatürkçülük', examType: ExamType.LGS },
  });

  if (!inkilapSubject) {
    inkilapSubject = await prisma.subject.create({
      data: {
        name: 'T.C. İnkılap Tarihi ve Atatürkçülük',
        examType: ExamType.LGS,
        gradeLevels: [8],
        order: 5,
        isActive: true,
      },
    });
    console.log(`LGS İnkılap Tarihi dersi oluşturuldu: ${inkilapSubject.id}`);
  } else {
    console.log(`LGS İnkılap Tarihi dersi zaten mevcut: ${inkilapSubject.id}`);
  }

  // Ana konular ve alt konular
  const konular = [
    {
      name: 'Tarih Bilimi',
      order: 1,
      children: [
        { name: 'Tarihin Tanımı ve Konusu', order: 1 },
        { name: 'Tarihin Önemi', order: 2 },
        { name: 'Tarih Kaynakları', order: 3 },
        { name: 'Tarihte Zaman Kavramı', order: 4 },
        { name: 'Tarihte Yöntem', order: 5 },
      ],
    },
    {
      name: 'Osmanlı Devleti\'nin Yıkılış Süreci',
      order: 2,
      children: [
        { name: 'Osmanlı Devleti\'nin Duraklama Dönemi', order: 1 },
        { name: 'Osmanlı Devleti\'nin Gerileme Dönemi', order: 2 },
        { name: 'Islahat Hareketleri', order: 3 },
        { name: 'Tanzimat Fermanı', order: 4 },
        { name: 'Islahat Fermanı', order: 5 },
        { name: 'I. Meşrutiyet', order: 6 },
        { name: 'II. Meşrutiyet', order: 7 },
      ],
    },
    {
      name: 'I. Dünya Savaşı ve Sonuçları',
      order: 3,
      children: [
        { name: 'I. Dünya Savaşı\'nın Sebepleri', order: 1 },
        { name: 'I. Dünya Savaşı\'na Girme Nedenlerimiz', order: 2 },
        { name: 'I. Dünya Savaşı\'nda Cepheler', order: 3 },
        { name: 'Çanakkale Savaşları', order: 4 },
        { name: 'Mondros Ateşkes Anlaşması', order: 5 },
        { name: 'I. Dünya Savaşı\'nın Sonuçları', order: 6 },
      ],
    },
    {
      name: 'Kurtuluş Savaşı Hazırlık Dönemi',
      order: 4,
      children: [
        { name: 'İşgaller ve Halkın Tepkisi', order: 1 },
        { name: 'Mustafa Kemal\'in Samsun\'a Çıkışı', order: 2 },
        { name: 'Amasya Genelgesi', order: 3 },
        { name: 'Erzurum Kongresi', order: 4 },
        { name: 'Sivas Kongresi', order: 5 },
        { name: 'Misak-ı Milli', order: 6 },
        { name: 'Son Osmanlı Mebusan Meclisi', order: 7 },
        { name: 'Meclisin Açılması ve İstanbul\'un İşgali', order: 8 },
      ],
    },
    {
      name: 'I. TBMM Dönemi ve Kurtuluş Savaşı',
      order: 5,
      children: [
        { name: 'I. TBMM\'nin Açılması', order: 1 },
        { name: 'TBMM Hükümeti\'nin Kuruluşu', order: 2 },
        { name: 'Anayasa\'nın Kabulü', order: 3 },
        { name: 'Meclis Grubu ve Cemiyetler', order: 4 },
        { name: 'Hıyanet-i Vataniye Kanunu', order: 5 },
        { name: 'Kuvva-i Milliye ve Düzenli Ordu', order: 6 },
      ],
    },
    {
      name: 'Kurtuluş Savaşı Muharebeleri',
      order: 6,
      children: [
        { name: 'I. İnönü Savaşı', order: 1 },
        { name: 'II. İnönü Savaşı', order: 2 },
        { name: 'Kütahya-Eskişehir Savaşları', order: 3 },
        { name: 'Sakarya Meydan Muharebesi', order: 4 },
        { name: 'Büyük Taarruz ve Başkomutan Meydan Muharebesi', order: 5 },
        { name: 'Mudanya Ateşkes Anlaşması', order: 6 },
        { name: 'Lozan Barış Konferansı', order: 7 },
        { name: 'Lozan Antlaşması', order: 8 },
      ],
    },
    {
      name: 'Türk İnkılabı ve Atatürkçülük',
      order: 7,
      children: [
        { name: 'İnkılap Kavramı', order: 1 },
        { name: 'Atatürk İlkeleri', order: 2 },
        { name: 'Atatürkçülük ve Kemalizm', order: 3 },
        { name: 'Atatürkçü Düşünce Sistemi', order: 4 },
      ],
    },
    {
      name: 'Hukukta ve Eğitimde İnkılaplar',
      order: 8,
      children: [
        { name: 'Saltanatın Kaldırılması', order: 1 },
        { name: 'Cumhuriyetin İlanı', order: 2 },
        { name: 'Halifeliğin Kaldırılması', order: 3 },
        { name: 'Anayasa Hareketleri', order: 4 },
        { name: '1924 Anayasası', order: 5 },
        { name: 'Tevhid-i Tedrisat Kanunu', order: 6 },
        { name: 'Medeni Kanun', order: 7 },
        { name: 'Harf İnkılabı', order: 8 },
        { name: 'Türk Tarih ve Dil Kurumları', order: 9 },
        { name: 'Üniversite Reformu', order: 10 },
        { name: 'Ölçülerde Değişiklik', order: 11 },
      ],
    },
    {
      name: 'Toplumsal Hayatta İnkılaplar',
      order: 9,
      children: [
        { name: 'Şapka ve Kıyafet İnkılabı', order: 1 },
        { name: 'Tekke ve Zaviyelerin Kapatılması', order: 2 },
        { name: 'Takvim Saat ve Soyadı Kanunu', order: 3 },
        { name: 'Kadınların Statüsü ve Seçme-Seçilme Hakkı', order: 4 },
        { name: 'Milletlerarası Mektuplaşmada Türkçe', order: 5 },
      ],
    },
    {
      name: 'Ekonomide İnkılaplar',
      order: 10,
      children: [
        { name: 'Türkiye\'nin Ekonomik Durumu', order: 1 },
        { name: 'Tarımda İnkılaplar', order: 2 },
        { name: 'Sanayide İnkılaplar', order: 3 },
        { name: 'Köy Enstitüleri', order: 4 },
        { name: 'Devletçilik İlkesi', order: 5 },
        { name: 'I. ve II. Beş Yıllık Sanayi Planları', order: 6 },
        { name: 'Devletleştirme Hareketleri', order: 7 },
      ],
    },
    {
      name: 'Atatürk İlkeleri',
      order: 11,
      children: [
        { name: 'Cumhuriyetçilik', order: 1 },
        { name: 'Milliyetçilik', order: 2 },
        { name: 'Halkçılık', order: 3 },
        { name: 'Devletçilik', order: 4 },
        { name: 'Laiklik', order: 5 },
        { name: 'İnkılapçılık', order: 6 },
      ],
    },
    {
      name: 'Türk Dış Politikası (1923-1938)',
      order: 12,
      children: [
        { name: 'Yurtta Sulh Cihanda Sulh', order: 1 },
        { name: 'Musul Meselesi', order: 2 },
        { name: 'Boğazlar Meselesi', order: 3 },
        { name: 'Montreux Boğazlar Sözleşmesi', order: 4 },
        { name: 'Balkan Antantı', order: 5 },
        { name: 'Sadabat Paktı', order: 6 },
        { name: 'Hatay\'ın Anavatana Katılması', order: 7 },
      ],
    },
    {
      name: 'Atatürk Dönemi Kültür ve Medeniyet',
      order: 13,
      children: [
        { name: 'Kültür ve Medeniyet Anlayışı', order: 1 },
        { name: 'Türk Tarih Tezi', order: 2 },
        { name: 'Güneş Dil Teorisi', order: 3 },
        { name: 'Türk Dil Kurumu', order: 4 },
        { name: 'Türk Tarih Kurumu', order: 5 },
        { name: 'Folklor Çalışmaları', order: 6 },
        { name: 'Güzel Sanatlarda Gelişmeler', order: 7 },
        { name: 'Mimaride Gelişmeler', order: 8 },
      ],
    },
    {
      name: 'Atatürk\'ün Hayatı ve Kişiliği',
      order: 14,
      children: [
        { name: 'Atatürk\'ün Çocukluk ve Gençlik Yılları', order: 1 },
        { name: 'Askeri Hayatı', order: 2 },
        { name: 'Kurtuluş Savaşı Liderliği', order: 3 },
        { name: 'Cumhurbaşkanlığı Dönemi', order: 4 },
        { name: 'Atatürk\'ün Ölümü', order: 5 },
        { name: 'Atatürk\'ün Kişisel Özellikleri', order: 6 },
        { name: 'Atatürk\'ün Eserleri', order: 7 },
      ],
    },
    {
      name: 'II. Dünya Savaşı ve Türkiye',
      order: 15,
      children: [
        { name: 'II. Dünya Savaşı\'nın Sebepleri', order: 1 },
        { name: 'Savaşın Başlaması ve Gelişimi', order: 2 },
        { name: 'Türkiye\'nin Tarafsızlık Politikası', order: 3 },
        { name: 'Türkiye\'nin Savaşa Girmesi', order: 4 },
        { name: 'II. Dünya Savaşı\'nın Sonuçları', order: 5 },
      ],
    },
    {
      name: 'Çok Partili Hayata Geçiş',
      order: 16,
      children: [
        { name: 'Tek Parti Dönemi', order: 1 },
        { name: 'Terakkiperver Cumhuriyet Fırkası', order: 2 },
        { name: 'Serbest Cumhuriyet Fırkası', order: 3 },
        { name: 'Demokrat Parti\'nin Kuruluşu', order: 4 },
        { name: '1950 Seçimleri', order: 5 },
      ],
    },
    {
      name: 'Türkiye\'de Siyasi ve Sosyal Gelişmeler',
      order: 17,
      children: [
        { name: 'Demokrat Parti Dönemi', order: 1 },
        { name: '27 Mayıs Darbesi', order: 2 },
        { name: 'Anayasa Mahkemesi', order: 3 },
        { name: '1961 Anayasası', order: 4 },
        { name: '12 Mart Muhtırası', order: 5 },
        { name: '12 Eylül Darbesi', order: 6 },
        { name: '1982 Anayasası', order: 7 },
      ],
    },
    {
      name: 'Çağdaş Türk ve Dünya Tarihi',
      order: 18,
      children: [
        { name: 'Soğuk Savaş Dönemi', order: 1 },
        { name: 'NATO ve Türkiye', order: 2 },
        { name: 'Kore Savaşı', order: 3 },
        { name: 'Kıbrıs Sorunu', order: 4 },
        { name: 'Avrupa Birliği ve Türkiye', order: 5 },
        { name: 'Küreselleşme ve Türkiye', order: 6 },
      ],
    },
  ];

  // Konuları oluştur
  for (const konu of konular) {
    let mainTopic = await prisma.topic.findFirst({
      where: { name: konu.name, subjectId: inkilapSubject.id, parentTopicId: null },
    });

    if (!mainTopic) {
      mainTopic = await prisma.topic.create({
        data: {
          name: konu.name,
          subjectId: inkilapSubject.id,
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
          where: { name: child.name, subjectId: inkilapSubject.id, parentTopicId: mainTopic.id },
        });

        if (!existingChild) {
          await prisma.topic.create({
            data: {
              name: child.name,
              subjectId: inkilapSubject.id,
              parentTopicId: mainTopic.id,
              order: child.order,
            },
          });
          console.log(`    Alt konu: ${child.name}`);
        }
      }
    }
  }

  console.log('LGS T.C. İnkılap Tarihi ve Atatürkçülük konuları başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sabit aktivite alanları - Tüm sınav türlerinde görünecek
const commonActivities = [
  // Deneme Sınavları
  { name: 'Deneme Sınavı', order: 1, category: 'exam' },
  { name: 'TYT Deneme Sınavı', order: 2, category: 'exam' },
  { name: 'AYT Deneme Sınavı', order: 3, category: 'exam' },
  { name: 'LGS Deneme Sınavı', order: 4, category: 'exam' },
  { name: 'YDT Deneme Sınavı', order: 5, category: 'exam' },
  { name: 'Branş Denemesi', order: 6, category: 'exam' },
  
  // Soru Çözümü
  { name: 'Paragraf Çözümü', order: 10, category: 'practice' },
  { name: 'Test Çözümü', order: 11, category: 'practice' },
  { name: 'Soru Bankası Çözümü', order: 12, category: 'practice' },
  { name: 'Konu Testi', order: 13, category: 'practice' },
  { name: 'Genel Tekrar', order: 14, category: 'practice' },
  { name: 'Eksik Konu Tekrarı', order: 15, category: 'practice' },
  { name: 'Yanlış Soru Tekrarı', order: 16, category: 'practice' },
  
  // Okuma ve Video
  { name: 'Konu Anlatımı İzleme', order: 20, category: 'learning' },
  { name: 'Video Ders', order: 21, category: 'learning' },
  { name: 'Kitap Okuma', order: 22, category: 'learning' },
  { name: 'Ders Notu Çıkarma', order: 23, category: 'learning' },
  { name: 'Özet Çıkarma', order: 24, category: 'learning' },
  
  // Mola ve Dinlenme
  { name: 'Dinlenme', order: 30, category: 'break' },
  { name: 'Mola', order: 31, category: 'break' },
  { name: 'Yemek Molası', order: 32, category: 'break' },
  { name: 'Kahvaltı', order: 33, category: 'break' },
  { name: 'Öğle Yemeği', order: 34, category: 'break' },
  { name: 'Akşam Yemeği', order: 35, category: 'break' },
  
  // Sosyal Aktiviteler
  { name: 'Oyun', order: 40, category: 'social' },
  { name: 'Spor', order: 41, category: 'social' },
  { name: 'Yürüyüş', order: 42, category: 'social' },
  { name: 'Arkadaşlarla Vakit Geçirme', order: 43, category: 'social' },
  { name: 'Aile ile Vakit Geçirme', order: 44, category: 'social' },
  { name: 'Hobi', order: 45, category: 'social' },
  { name: 'Müzik Dinleme', order: 46, category: 'social' },
  { name: 'Film/Dizi İzleme', order: 47, category: 'social' },
  
  // Tatil ve Özel Günler
  { name: 'Tatil', order: 50, category: 'holiday' },
  { name: 'Resmi Tatil', order: 51, category: 'holiday' },
  { name: 'Hafta Sonu Tatili', order: 52, category: 'holiday' },
  { name: 'Yarıyıl Tatili', order: 53, category: 'holiday' },
  { name: 'Yaz Tatili', order: 54, category: 'holiday' },
  { name: 'Bayram', order: 55, category: 'holiday' },
  
  // Okul ve Kurs
  { name: 'Okul', order: 60, category: 'school' },
  { name: 'Dershane', order: 61, category: 'school' },
  { name: 'Özel Ders', order: 62, category: 'school' },
  { name: 'Etüt', order: 63, category: 'school' },
  { name: 'Kütüphane Çalışması', order: 64, category: 'school' },
  { name: 'Grup Çalışması', order: 65, category: 'school' },
  
  // Kişisel Gelişim
  { name: 'Motivasyon', order: 70, category: 'personal' },
  { name: 'Hedef Belirleme', order: 71, category: 'personal' },
  { name: 'Planlama', order: 72, category: 'personal' },
  { name: 'Değerlendirme', order: 73, category: 'personal' },
  { name: 'Ödül', order: 74, category: 'personal' },
  
  // Uyku
  { name: 'Uyku', order: 80, category: 'sleep' },
  { name: 'Şekerleme', order: 81, category: 'sleep' },
  { name: 'Erken Yatma', order: 82, category: 'sleep' },
  
  // Sağlık
  { name: 'Sağlık Kontrolü', order: 90, category: 'health' },
  { name: 'Doktor Randevusu', order: 91, category: 'health' },
  { name: 'Hasta', order: 92, category: 'health' },
];

// Tüm sınıf seviyeleri (5-12)
const allGradeLevels = [5, 6, 7, 8, 9, 10, 11, 12];

async function seedCommonActivities() {
  console.log('🚀 Sabit aktivite alanları seed başlıyor...');
  
  for (const activity of commonActivities) {
    // Her aktiviteyi COMMON examType ile oluştur
    const existing = await prisma.subject.findFirst({
      where: {
        name: activity.name,
        examType: 'COMMON',
      },
    });
    
    if (!existing) {
      await prisma.subject.create({
        data: {
          name: activity.name,
          examType: 'COMMON',
          gradeLevels: allGradeLevels,
          order: activity.order,
          isActive: true,
        },
      });
      console.log(`✅ Eklendi: ${activity.name}`);
    } else {
      console.log(`⏭️ Zaten mevcut: ${activity.name}`);
    }
  }
  
  console.log('✨ Sabit aktivite alanları seed tamamlandı!');
}

async function main() {
  try {
    await seedCommonActivities();
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

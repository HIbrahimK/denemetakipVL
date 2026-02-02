# Çalışma Planı Sistemi Yeniden Tasarım Planı

## 1. Genel Bakış

Mevcut çalışma planı sistemi karmaşık ve esnek değil. Yeni sistem Excel benzeri tablo yapısı ile daha basit ve kullanıcı dostu olacak.

## 2. Kullanıcı İhtiyaçları

### 2.1 Öğretmen İhtiyaçları
- Haftalık ve aylık plan oluşturabilmeli
- Her hücrede isteğe bağlı alanlar: ders, konu, soru sayısı, kaynak kitap, sayfa aralığı
- Planı bireysel öğrenciye, gruba veya sınıfa atayabilmeli
- Öğrencilerin tamamladığı görevleri görüp onaylayabilmeli

### 2.2 Öğrenci İhtiyaçları
- Kendisine atanan planı görüntüleyebilmeli
- Günlük çözdüğü soru sayısını, doğru/yanlış sayısını, kullandığı kaynağı girebilmeli

### 2.3 Veli İhtiyaçları
- Çocuğunun çalışma planını görüntüleyebilmeli
- Tamamlanan görevleri ayrı ayrı onaylayabilmeli

## 3. Database Şema Değişiklikleri

### 3.1 Yeni Enum'lar

```prisma
enum PlanType {
  DAILY      // Günlük plan
  WEEKLY     // Haftalık plan
  MONTHLY    // Aylık plan
}

enum PlanStatus {
  DRAFT      // Taslak
  ACTIVE     // Aktif
  COMPLETED  // Tamamlandı
  CANCELLED  // İptal edildi
}
```

### 3.2 StudyPlan Modeli Güncellemesi

```prisma
model StudyPlan {
  id          String   @id @default(cuid())
  teacherId   String
  teacher     User     @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])

  name        String
  description String?  @db.Text
  
  // Yeni Alanlar
  planType    PlanType         // DAILY, WEEKLY, MONTHLY
  planStatus  PlanStatus       @default(DRAFT)
  
  // Plan yapısı JSON olarak saklanacak (esnek tablo yapısı için)
  // Örnek: { rows: [{subject: "Matematik", cells: [{...}, {...}] }] }
  planData    Json
  
  // Zaman aralığı
  startDate   DateTime
  endDate     DateTime
  
  // Hedef tipi ve ID
  targetType  StudyPlanTargetType  // INDIVIDUAL, GROUP, CLASS
  targetId    String?              // Student, Group, or Class ID

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tasks       StudyTask[]
  groupPlans  GroupStudyPlan[]

  @@index([teacherId, schoolId])
  @@index([targetType, targetId])
  @@index([planStatus])
}
```

### 3.3 StudyTask Modeli Güncellemesi

```prisma
model StudyTask {
  id        String     @id @default(cuid())
  planId    String?
  plan      StudyPlan? @relation(fields: [planId], references: [id], onDelete: SetNull)
  studentId String
  student   Student    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  schoolId  String
  school    School     @relation(fields: [schoolId], references: [id])

  // Plan hücre referansı (planData içindeki konumu)
  rowIndex      Int           // Satır indeksi
  columnIndex   Int           // Sütun indeksi
  
  // Öğretmen tarafından atanan bilgiler
  subjectName   String        // Ders adı
  topicName     String?       // Konu adı (opsiyonel)
  questionCount Int?          // Hedef soru sayısı (opsiyonel)
  resourceName  String?       // Kaynak kitap adı (opsiyonel)
  pageRange     String?       // Sayfa aralığı (opsiyonel) - "Paraf Yayınları Paragraf 55-75"
  notes         String?       @db.Text // Ek notlar

  // Öğrenci tarafından doldurulan bilgiler
  completedQuestions  Int     @default(0)
  correctAnswers      Int     @default(0)
  wrongAnswers        Int     @default(0)
  blankAnswers        Int     @default(0)
  actualResource      String? // Kullanılan kaynak
  studentNotes        String? @db.Text

  status              StudyTaskStatus @default(PENDING)
  
  // Onay durumları
  teacherApproved     Boolean   @default(false)
  teacherComment      String?   @db.Text
  teacherApprovedAt   DateTime?
  teacherApprovedById String?
  teacherApprovedBy   User?     @relation("TaskTeacherApprover", fields: [teacherApprovedById], references: [id])
  
  parentApproved      Boolean   @default(false)
  parentComment       String?   @db.Text
  parentApprovedAt    DateTime?
  parentId            String?   // Onaylayan veli ID

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([studentId, planId])
  @@index([status])
  @@index([schoolId])
  @@unique([planId, studentId, rowIndex, columnIndex]) // Bir hücre için bir görev
}
```

## 4. JSON Plan Data Yapısı

### 4.1 Aylık Plan Örneği

```json
{
  "planType": "MONTHLY",
  "columns": [
    { "id": "week1", "label": "1.HAFTA", "weekNumber": 1 },
    { "id": "week2", "label": "2.HAFTA", "weekNumber": 2 },
    { "id": "week3", "label": "3.HAFTA", "weekNumber": 3 },
    { "id": "week4", "label": "4.HAFTA", "weekNumber": 4 }
  ],
  "rows": [
    {
      "id": "row1",
      "subject": "TÜRKÇE",
      "cells": [
        { "topic": "Sözcük Türleri", "questionCount": 20, "resource": "Paraf Yayınları", "pageRange": "55-75" },
        { "topic": "Sözcük Türü Soru Çözümü", "questionCount": 30 },
        { "topic": "Fiil fiilimsi Soru Çözümü", "questionCount": 25 },
        { "topic": "Ekler Sözcük Yapısı", "questionCount": 20 }
      ]
    },
    {
      "id": "row2",
      "subject": "MATEMATİK",
      "cells": [
        { "topic": "Temel Kavramlar", "questionCount": 40 },
        { "topic": "Rasyonel Sayılar", "questionCount": 35 },
        { "topic": "Köklü Sayılar", "questionCount": 30 },
        { "topic": "Bölme Bölünebilme", "questionCount": 35 }
      ]
    }
  ],
  "notes": "Her gün en az 20 paragraf sorusu çözün"
}
```

### 4.2 Haftalık/Günlük Plan Örneği

```json
{
  "planType": "WEEKLY",
  "columns": [
    { "id": "mon", "label": "PAZARTESİ", "day": 1 },
    { "id": "tue", "label": "SALI", "day": 2 },
    { "id": "wed", "label": "ÇARŞAMBA", "day": 3 },
    { "id": "thu", "label": "PERŞEMBE", "day": 4 },
    { "id": "fri", "label": "CUMA", "day": 5 },
    { "id": "sat", "label": "CUMARTESİ", "day": 6 },
    { "id": "sun", "label": "PAZAR", "day": 7 }
  ],
  "rows": [
    {
      "id": "session1",
      "timeSlot": "Sabah",
      "cells": [
        { "subject": "TYT Deneme", "questionCount": null },
        { "subject": "AYT Edebiyat", "topic": "Sos Bölüm Denemesi" },
        { "subject": "TYT Deneme" },
        { "subject": "AYT Edebiyat", "topic": "Sos Bölüm Denemesi" },
        { "subject": "TYT Deneme" },
        { "subject": "AYT Edebiyat-Sos Bölüm Denemesi" },
        { "subject": "TYT Deneme" }
      ]
    },
    {
      "id": "session2",
      "timeSlot": "Öğleden Sonra",
      "cells": [
        { "subject": "AYT Mat", "topic": "Konu/Soru", "questionCount": 20 },
        { "subject": "AYT Mat", "topic": "Konu/Soru", "questionCount": 20 },
        { "subject": "AYT Mat", "topic": "Konu/Soru", "questionCount": 20 },
        { "subject": "AYT Mat", "topic": "Konu/Soru", "questionCount": 20 },
        { "subject": "GEO", "topic": "Konu/Soru", "questionCount": 15 },
        { "subject": "GEO", "topic": "Konu/Soru", "questionCount": 15 },
        { "label": "Tatil" }
      ]
    }
  ]
}
```

## 5. API Endpoint'leri

### 5.1 Study Plan Endpoints

```typescript
// Plan oluşturma (tablo yapısı ile)
POST /study/plans
Body: {
  name: string;
  description?: string;
  planType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  startDate: string;
  endDate: string;
  targetType: 'INDIVIDUAL' | 'GROUP' | 'CLASS';
  targetId?: string;
  planData: PlanData; // JSON tablo yapısı
}

// Plan güncelleme
PATCH /study/plans/:id
Body: Partial<CreatePlanDto>

// Planları listele
GET /study/plans
Query: { status?, targetType?, studentId? }

// Plan detayı
GET /study/plans/:id

// Plan silme
DELETE /study/plans/:id

// Planı yayınla (taslak -> aktif)
POST /study/plans/:id/publish

// Planı öğrencilere ata (planData'dan task'lar oluştur)
POST /study/plans/:id/assign
Body: {
  studentIds?: string[];
  groupIds?: string[];
  classIds?: string[];
}
```

### 5.2 Study Task Endpoints

```typescript
// Öğrenci görevi tamamla
POST /study/tasks/:id/complete
Body: {
  completedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  blankAnswers: number;
  actualResource?: string;
  studentNotes?: string;
}

// Öğretmen onay
POST /study/tasks/:id/teacher-approve
Body: {
  approved: boolean;
  comment?: string;
}

// Veli onay
POST /study/tasks/:id/parent-approve
Body: {
  approved: boolean;
  comment?: string;
}

// Öğrencinin görevlerini listele
GET /study/tasks/student/:studentId
Query: { planId?, status?, startDate?, endDate? }

// Planın tüm görevlerini listele (öğretmen için)
GET /study/tasks/plan/:planId
```

## 6. Frontend Sayfaları

### 6.1 Plan Listesi (/dashboard/study-plans)
- Mevcut sayfa güncellenecek
- Plan tipi (günlük/haftalık/aylık) filtresi eklenecek
- Durum filtresi (taslak/aktif/tamamlandı) eklenecek

### 6.2 Yeni Plan Oluşturma (/dashboard/study-plans/new)
- Tablo/grid tabanlı arayüz
- Plan tipi seçimi (günlük/haftalık/aylık)
- Sütunları otomatik oluşturma (günler/haftalar)
- Satır ekleme/silme (dersler/zaman dilimleri)
- Hücre düzenleme modalı (ders, konu, soru sayısı, kaynak, sayfa)
- Öğrenci/grup/sınıf seçimi

### 6.3 Plan Görüntüleme/Düzenleme (/dashboard/study-plans/[id])
- Tablo görünümü (salt okunur veya düzenlenebilir)
- Öğrenci ilerleme durumu görünümü
- Onay durumları

### 6.4 Öğrenci Görev Sayfası (/dashboard/study-tasks)
- Günlük görev listesi
- Görev tamamlama formu
- Tamamlanan görevlerin durumu

### 6.5 Öğretmen Onay Sayfası (/dashboard/study-tasks/approvals)
- Onay bekleyen görevler listesi
- Toplu onay işlemleri
- Öğrenci performans özeti

### 6.6 Veli Onay Sayfası (/dashboard/parent/approvals)
- Çocuğun tamamladığı görevler
- Onay/red işlemleri

## 7. Bileşenler (Components)

### 7.1 PlanTable
- Esnek tablo/grid yapısı
- Sütun başlıkları (günler/haftalar)
- Satır başlıkları (dersler/zaman dilimleri)
- Hücre içerikleri

### 7.2 PlanCellEditor
- Modal dialog
- Form alanları: ders, konu, soru sayısı, kaynak, sayfa aralığı, notlar
- İsteğe bağlı alan işaretleyicileri

### 7.3 TaskCompletionForm
- Çözülen soru sayısı
- Doğru/yanlış/boş sayıları
- Kullanılan kaynak
- Öğrenci notu

### 7.4 ApprovalPanel
- Öğretmen onay kartı
- Veli onay kartı
- Yorum alanları

## 8. İş Akışları

### 8.1 Plan Oluşturma Akışı
```
Öğretmen -> Yeni Plan -> Tip Seç (Günlük/Haftalık/Aylık) 
-> Tarih Aralığı -> Tablo Yapılandır 
-> Hücreleri Doldur -> Hedef Seç (Öğrenci/Grup/Sınıf) 
-> Kaydet (Taslak) -> Yayınla -> Task'lar Oluşturulur
```

### 8.2 Görev Tamamlama Akışı
```
Öğrenci -> Görev Listesi -> Görev Seç 
-> Bilgileri Gir (Soru sayısı, doğru/yanlış, kaynak) 
-> Kaydet -> Öğretmen Bildirimi
```

### 8.3 Onay Akışı
```
Öğrenci Tamamladı -> Öğretmen Onayladı -> Veli Onayladı
     ↓                      ↓                    ↓
  BEKLEMEDE            ÖĞRETMEN_ONAYLI      TAMAMLANMIŞ
```

## 9. Veritabanı Migration Planı

### 9.1 Yeni Alanlar Ekleme
```sql
-- StudyPlan tablosuna yeni alanlar
ALTER TABLE "StudyPlan" ADD COLUMN "planType" TEXT;
ALTER TABLE "StudyPlan" ADD COLUMN "planStatus" TEXT DEFAULT 'DRAFT';
ALTER TABLE "StudyPlan" ADD COLUMN "planData" JSONB;

-- StudyTask tablosuna yeni alanlar
ALTER TABLE "StudyTask" ADD COLUMN "rowIndex" INTEGER;
ALTER TABLE "StudyTask" ADD COLUMN "columnIndex" INTEGER;
ALTER TABLE "StudyTask" ADD COLUMN "topicName" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "resourceName" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "pageRange" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "notes" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "actualResource" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "studentNotes" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "teacherApproved" BOOLEAN DEFAULT false;
ALTER TABLE "StudyTask" ADD COLUMN "teacherComment" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "teacherApprovedAt" TIMESTAMP;
ALTER TABLE "StudyTask" ADD COLUMN "teacherApprovedById" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "parentApproved" BOOLEAN DEFAULT false;
ALTER TABLE "StudyTask" ADD COLUMN "parentComment" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "parentApprovedAt" TIMESTAMP;
ALTER TABLE "StudyTask" ADD COLUMN "parentId" TEXT;
```

### 9.2 Mevcut Verileri Taşıma
- Eski planları yeni formata dönüştürme scripti
- Mevcut task'ları yeni yapıya uyarlama

## 10. Güvenlik ve Yetkilendirme

### 10.1 Rol Bazlı Erişim
- **Öğretmen**: Plan CRUD, tüm task'ları görme, onaylama
- **Öğrenci**: Sadece kendi task'larını görme, tamamlama
- **Veli**: Sadece çocuğunun task'larını görme, onaylama

### 10.2 Validasyonlar
- Öğretmen sadece kendi okulunun verilerini görebilir
- Öğrenci sadece kendisine atanan task'ları tamamlayabilir
- Veli sadece çocuğunun velisi ise onaylayabilir

## 11. Sonuç

Bu plan ile:
1. Excel benzeri esnek tablo yapısı
2. Günlük/haftalık/aylık plan desteği
3. İsteğe bağlı alanlar (zorunlu değil)
4. Öğretmen ve veli ayrı ayrı onay
5. Bireysel ve grup planlaması

özellikleri sağlanmış olacak.

# Çalışma Planı Sistemi v2 - Detaylı Plan

## 1. Genel Bakış

Yeni çalışma planı sistemi, haftalık tablo yapısı üzerine kurulu, esnek ve kullanıcı dostu bir yapı sunacak.

## 2. Özellikler

### 2.1 Temel Özellikler
- **Haftalık Tablo Yapısı**: Sütunlarda haftanın günleri (Pzt, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar)
- **Dinamik Satırlar**: Öğretmen yeni satır ekleyebilir, silebilir
- **Hücre Yapısı**: Her hücrede alt alta textboxlar:
  - Çalışılacak Ders (autocomplete dropdown)
  - Konu (autocomplete dropdown)
  - Hedeflenen Soru Sayısı
  - Hedeflenen Süre (dakika)
  - Kaynak Kitap
- **Tüm alanlar isteğe bağlı (boş bırakılabilir)**

### 2.2 Ders ve Konu Yönetimi (Admin)
- Admin TYT, AYT, LGS derslerini ve konularını tanımlar
- Dersler: Matematik, Türkçe, Fizik, vb.
- Özel ders seçenekleri: "TYT Denemesi", "AYT Denemesi", "LGS Denemesi"
- Her dersin altında konular hiyerarşik olarak tanımlanır

### 2.3 Plan Şablonları (Admin)
- Admin hazır çalışma planı şablonları oluşturur
- Örnek: "Ocak 2. Hafta TYT Çalışma Planı", "Şubat 1. Hafta LGS Planı"
- Öğretmenler bu şablonları kullanabilir, düzenleyebilir

### 2.4 Hedef Kitle Seçimi
- Plan oluştururken önce hedef seçilir:
  - Sınıf seviyesi: 5-6-7-8 (LGS) veya 9-10-11-12 (TYT/AYT)
  - Sınav tipi: TYT, AYT, LGS
  - Öğrenci veya Grup seçimi

### 2.5 Öğrenci Tamamlama
- Her hücre için:
  - Çözülen soru sayısı
  - Çalışılan süre (dakika)
  - Doğru/Yanlış/Boş sayısı

### 2.6 Onay Sistemi
- Veli onayı (isteğe bağlı)
- Öğretmen onayı (zorunlu)

## 3. Database Şeması

### 3.1 Subject (Ders) Modeli
```prisma
model Subject {
  id          String   @id @default(cuid())
  name        String   // Matematik, Türkçe, Fizik, TYT Denemesi, vb.
  examType    ExamType // TYT, AYT, LGS, ALL
  gradeLevels Int[]    // [9, 10, 11, 12] veya [5, 6, 7, 8]
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  topics      Topic[]
  
  @@index([examType])
  @@index([isActive])
}
```

### 3.2 Topic (Konu) Modeli - Güncellenmiş
```prisma
model Topic {
  id            String   @id @default(cuid())
  name          String
  subjectId     String
  subject       Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  parentTopicId String?
  parentTopic   Topic?   @relation("TopicHierarchy", fields: [parentTopicId], references: [id])
  childTopics   Topic[]  @relation("TopicHierarchy")
  order         Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([subjectId])
  @@index([parentTopicId])
}
```

### 3.3 StudyPlan Modeli - Güncellenmiş
```prisma
model StudyPlan {
  id            String   @id @default(cuid())
  teacherId     String
  teacher       User     @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  schoolId      String
  school        School   @relation(fields: [schoolId], references: [id])
  
  // Plan Bilgileri
  name          String
  description   String?
  
  // Hedef Kitle
  examType      ExamType         // TYT, AYT, LGS
  gradeLevels   Int[]            // [9, 10, 11, 12] veya [5, 6, 7, 8]
  targetType    StudyPlanTargetType // INDIVIDUAL, GROUP
  targetId      String?          // Student veya Group ID
  
  // Plan Yapısı (JSON)
  // {
  //   days: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
  //   rows: [
  //     {
  //       id: 'row-1',
  //       cells: [
  //         { subject: 'Matematik', topic: 'Rasyonel Sayılar', questionCount: 20, duration: 45, resource: 'Paraf Yayınları' },
  //         { subject: 'TYT Denemesi', questionCount: null, duration: 120 },
  //         ...
  //       ]
  //     }
  //   ]
  // }
  planData      Json
  
  // Tarih
  weekStartDate DateTime         // Haftanın başlangıç tarihi (Pazartesi)
  
  // Durum
  status        StudyPlanStatus  @default(DRAFT)
  
  // Şablon Bilgisi
  isTemplate    Boolean          @default(false)
  templateName  String?          // "Ocak 2. Hafta TYT Planı"
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  tasks         StudyTask[]
  
  @@index([teacherId, schoolId])
  @@index([examType, gradeLevels])
  @@index([status])
  @@index([isTemplate])
}
```

### 3.4 StudyTask Modeli - Güncellenmiş
```prisma
model StudyTask {
  id            String   @id @default(cuid())
  planId        String
  plan          StudyPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  studentId     String
  student       Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  schoolId      String
  school        School   @relation(fields: [schoolId], references: [id])
  
  // Hücre Konumu
  rowIndex      Int
  dayIndex      Int      // 0=Pzt, 1=Sal, ..., 6=Paz
  
  // Öğretmen Ataması
  subjectName   String?
  topicName     String?
  targetQuestionCount Int?
  targetDuration      Int?     // dakika
  targetResource      String?
  
  // Öğrenci Tamamlama
  completedQuestionCount Int   @default(0)
  actualDuration         Int   @default(0)  // dakika
  correctCount           Int   @default(0)
  wrongCount             Int   @default(0)
  blankCount             Int   @default(0)
  actualResource         String?
  studentNotes           String?
  
  // Durum
  status          StudyTaskStatus @default(PENDING)
  completedAt     DateTime?
  
  // Onaylar
  parentApproved  Boolean   @default(false)
  parentComment   String?
  parentApprovedAt DateTime?
  parentId        String?
  
  teacherApproved Boolean   @default(false)
  teacherComment  String?
  teacherApprovedAt DateTime?
  teacherApprovedById String?
  teacherApprovedBy   User? @relation("TaskTeacherApprover", fields: [teacherApprovedById], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([planId, studentId, rowIndex, dayIndex])
  @@index([studentId, status])
  @@index([planId])
}
```

### 3.5 Yeni Enum'lar
```prisma
enum StudyPlanStatus {
  DRAFT      // Taslak
  ASSIGNED   // Atandı (task'lar oluşturuldu)
  ACTIVE     // Aktif
  COMPLETED  // Tamamlandı
  CANCELLED  // İptal
}
```

## 4. JSON Plan Data Yapısı

```json
{
  "days": ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
  "rows": [
    {
      "id": "row-1",
      "cells": [
        {
          "subject": "Matematik",
          "topic": "Rasyonel Sayılar",
          "questionCount": 25,
          "duration": 45,
          "resource": "Paraf Yayınları"
        },
        {
          "subject": "TYT Denemesi",
          "topic": null,
          "questionCount": null,
          "duration": 120,
          "resource": null
        },
        {
          "subject": "Türkçe",
          "topic": "Paragraf",
          "questionCount": 20,
          "duration": 30,
          "resource": "Karekök Yayınları"
        },
        null,
        {
          "subject": "Fizik",
          "topic": "Kuvvet",
          "questionCount": 15,
          "duration": 40,
          "resource": "Palme Yayınları"
        },
        null,
        null
      ]
    },
    {
      "id": "row-2",
      "cells": [null, null, null, null, null, null, null]
    }
  ]
}
```

## 5. API Endpoints

### 5.1 Subject/Ders Yönetimi (Admin)
```typescript
// Dersleri listele
GET /subjects?examType=TYT&gradeLevel=11

// Ders oluştur
POST /subjects
Body: { name: string, examType: ExamType, gradeLevels: number[] }

// Ders güncelle
PATCH /subjects/:id

// Ders sil
DELETE /subjects/:id
```

### 5.2 Topic/Konu Yönetimi (Admin)
```typescript
// Konuları listele
GET /topics?subjectId=xxx&parentId=xxx

// Konu oluştur
POST /topics
Body: { name: string, subjectId: string, parentTopicId?: string, order: number }

// Konu güncelle
PATCH /topics/:id

// Konu sil
DELETE /topics/:id
```

### 5.3 Study Plan
```typescript
// Plan oluştur
POST /study/plans
Body: {
  name: string;
  description?: string;
  examType: ExamType;
  gradeLevels: number[];
  targetType: 'INDIVIDUAL' | 'GROUP';
  targetId: string;
  weekStartDate: string; // ISO date
  planData: PlanData;
  isTemplate?: boolean;
  templateName?: string;
}

// Şablonları listele (öğretmen için)
GET /study/plans/templates?examType=TYT&gradeLevel=11

// Planı şablondan oluştur
POST /study/plans/from-template
Body: { templateId: string, targetId: string, weekStartDate: string }

// Planları listele
GET /study/plans?status=&examType=&studentId=

// Plan detayı
GET /study/plans/:id

// Plan güncelle
PATCH /study/plans/:id

// Planı ata (task'ları oluştur)
POST /study/plans/:id/assign

// Plan sil
DELETE /study/plans/:id
```

### 5.4 Study Task
```typescript
// Öğrenci görevlerini listele
GET /study/tasks/student/:studentId?weekStartDate=

// Görev tamamla
POST /study/tasks/:id/complete
Body: {
  completedQuestionCount: number;
  actualDuration: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  actualResource?: string;
  studentNotes?: string;
}

// Veli onay
POST /study/tasks/:id/parent-approve
Body: { approved: boolean, comment?: string }

// Öğretmen onay
POST /study/tasks/:id/teacher-approve
Body: { approved: boolean, comment?: string }

// Planın tüm görevlerini listele (öğretmen için)
GET /study/tasks/plan/:planId
```

## 6. Frontend Sayfaları

### 6.1 Admin - Ders/Konu Yönetimi
- `/admin/subjects` - Ders listesi
- `/admin/subjects/new` - Yeni ders
- `/admin/subjects/[id]/topics` - Konu yönetimi (hiyerarşik)

### 6.2 Admin - Plan Şablonları
- `/admin/study-plan-templates` - Şablon listesi
- `/admin/study-plan-templates/new` - Yeni şablon oluştur

### 6.3 Öğretmen - Çalışma Planları
- `/dashboard/study-plans` - Plan listesi
- `/dashboard/study-plans/new` - Yeni plan oluştur
  - Adım 1: Hedef seç (Sınav tipi, Sınıf, Öğrenci/Grup)
  - Adım 2: Tablo düzenle (Şablondan veya boş)
- `/dashboard/study-plans/[id]` - Plan detayı ve öğrenci ilerlemesi
- `/dashboard/study-plans/[id]/edit` - Plan düzenle

### 6.4 Öğrenci - Görevlerim
- `/dashboard/my-tasks` - Haftalık görev listesi (tablo görünümü)
- Her hücre tıklanabilir, tamamlama formu açılır

### 6.5 Veli - Onaylar
- `/dashboard/parent/approvals` - Çocuğun tamamladığı görevler
- Onay/red butonları

## 7. Bileşenler (Components)

### 7.1 PlanTable
```typescript
interface PlanTableProps {
  planData: PlanData;
  editable: boolean;
  onCellChange: (rowIndex: number, dayIndex: number, cell: CellData) => void;
  onAddRow: () => void;
  onRemoveRow: (rowIndex: number) => void;
  subjects: Subject[]; // Autocomplete için
}
```

### 7.2 PlanCellEditor
```typescript
interface CellData {
  subject?: string;
  topic?: string;
  questionCount?: number;
  duration?: number;
  resource?: string;
}

// Modal içinde 5 textbox:
// 1. Ders (autocomplete dropdown)
// 2. Konu (autocomplete dropdown - derse göre filtreli)
// 3. Hedef Soru Sayısı (number input)
// 4. Hedef Süre (dakika, number input)
// 5. Kaynak Kitap (text input)
```

### 7.3 TaskCompletionForm
```typescript
interface TaskCompletionData {
  completedQuestionCount: number;
  actualDuration: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  actualResource?: string;
  studentNotes?: string;
}
```

### 7.4 SubjectTopicSelector
- Ders dropdown (autocomplete)
- Konu dropdown (derse göre filtreli, hiyerarşik)

## 8. İş Akışları

### 8.1 Admin - Ders/Konu Tanımlama
```
Admin -> Dersler -> Yeni Ders (TYT Matematik) 
-> Konular -> Ana Konu (Sayılar) -> Alt Konu (Rasyonel Sayılar)
```

### 8.2 Admin - Şablon Oluşturma
```
Admin -> Şablonlar -> Yeni Şablon 
-> Sınav Tipi (TYT) + Sınıf (11) 
-> Tablo Düzenle -> Kaydet
```

### 8.3 Öğretmen - Plan Oluşturma
```
Öğretmen -> Yeni Plan 
-> Hedef Seç (TYT, 11. Sınıf, Öğrenci: Ahmet)
-> Şablon Seç (veya Boş Başla)
-> Tabloyu Düzenle (Satır ekle, hücreleri doldur)
-> Kaydet ve Ata
```

### 8.4 Öğrenci - Görev Tamamlama
```
Öğrenci -> Görevlerim (Haftalık Tablo)
-> Hücreye Tıkla -> Form Doldur (Soru sayısı, süre, D/Y/B)
-> Kaydet -> Öğretmen Bildirimi
```

### 8.5 Onay Akışı
```
Öğrenci Tamamladı 
-> Veli Gördü (Onayladı/Reddetti) [Opsiyonel]
-> Öğretmen Onayladı -> Tamamlandı
```

## 9. Migration Planı

### 9.1 Yeni Tablolar
```sql
-- Subject tablosu
CREATE TABLE "Subject" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "examType" TEXT NOT NULL,
  "gradeLevels" INTEGER[],
  "order" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topic tablosunu güncelle (subjectId ekle)
ALTER TABLE "Topic" ADD COLUMN "subjectId" TEXT;
ALTER TABLE "Topic" ADD FOREIGN KEY ("subjectId") REFERENCES "Subject"("id");

-- StudyPlan tablosunu güncelle
ALTER TABLE "StudyPlan" ADD COLUMN "examType" TEXT;
ALTER TABLE "StudyPlan" ADD COLUMN "gradeLevels" INTEGER[];
ALTER TABLE "StudyPlan" ADD COLUMN "weekStartDate" TIMESTAMP;
ALTER TABLE "StudyPlan" ADD COLUMN "status" TEXT DEFAULT 'DRAFT';
ALTER TABLE "StudyPlan" ADD COLUMN "isTemplate" BOOLEAN DEFAULT false;
ALTER TABLE "StudyPlan" ADD COLUMN "templateName" TEXT;

-- StudyTask tablosunu güncelle
ALTER TABLE "StudyTask" ADD COLUMN "rowIndex" INTEGER;
ALTER TABLE "StudyPlan" ADD COLUMN "dayIndex" INTEGER;
ALTER TABLE "StudyTask" ADD COLUMN "targetQuestionCount" INTEGER;
ALTER TABLE "StudyTask" ADD COLUMN "targetDuration" INTEGER;
ALTER TABLE "StudyTask" ADD COLUMN "targetResource" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "completedQuestionCount" INTEGER DEFAULT 0;
ALTER TABLE "StudyTask" ADD COLUMN "actualDuration" INTEGER DEFAULT 0;
ALTER TABLE "StudyTask" ADD COLUMN "correctCount" INTEGER DEFAULT 0;
ALTER TABLE "StudyTask" ADD COLUMN "wrongCount" INTEGER DEFAULT 0;
ALTER TABLE "StudyTask" ADD COLUMN "blankCount" INTEGER DEFAULT 0;
ALTER TABLE "StudyTask" ADD COLUMN "actualResource" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "parentApproved" BOOLEAN DEFAULT false;
ALTER TABLE "StudyTask" ADD COLUMN "parentComment" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN "parentApprovedAt" TIMESTAMP;
ALTER TABLE "StudyTask" ADD COLUMN "parentId" TEXT;
```

## 10. Özet

Bu v2 planı ile:
1. ✅ Haftalık tablo yapısı (Pzt-Paz sütunları)
2. ✅ Dinamik satır ekleme/silme
3. ✅ Her hücrede 5 alt textbox (ders, konu, soru, süre, kaynak)
4. ✅ Autocomplete dropdown'lar (ders ve konu)
5. ✅ Tüm alanlar isteğe bağlı
6. ✅ Admin tarafından ders/konu yönetimi
7. ✅ Admin tarafından şablon oluşturma
8. ✅ Öğretmen şablon kullanımı ve düzenleme
9. ✅ Öğrenci tamamlama (soru, süre, D/Y/B)
10. ✅ Veli ve öğretmen onayı
11. ✅ Sınav tipi ve sınıf seviyesine göre filtreleme

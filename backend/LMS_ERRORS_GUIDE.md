# LMS Backend Hatalar - Hızlı Çözüm Kılavuzu

Backend'de çıkan TypeScript hatalarının hızlı çözümü için değiştirilmesi gereken dosyalar ve alanlar:

## Schema Güncellemeleri (✅ Tamamlandı)
- Topic'e topicResources eklendi
- Resource'a topicResources eklendi  
- TopicResource pivot table eklendi
- MentorGroup'da gradeIds Json @default("[]") yapıldı

## Kalan Service Güncellemeleri

### 1. study-session.service.ts
- ❌ Line 35-46: `taskId`, `durationMinutes`, `notes` kaldırılmalı, sadece duration kullanılmalı
- ❌ Line 60: `task` include kaldırılmalı (StudySession'da task relation yok)  
- ❌ Line 164: `session.student` yerine student lookup yapılmalı

### 2. study-task.service.ts  
- ❌ Line 196: `completedAt` kaldırılmalı (schema'da yok)
- ❌ Line 197-202: correctCount, wrongCount, emptyCount, durationMinutes → schema'daki field isimlerine düzeltilmeli
- ❌ Line 242: `isVerified` → `verified` olarak değiştirilmeli (DTO'dan)
- ❌ Line 245: `verificationNotes` field'ı yok
- ❌ Line 139, 261: `verifiedBy` include kaldırılmalı (relation yok)

### 3. goals.service.ts
- ❌ Line 25: topic.schoolId kontrolü kaldırılmalı
- ❌ Line 33: targetDate alanı yok (zaten schema'da var ama generate edilmemiş?)
- ❌ Tüm `student` include'ları kaldırılmalı (StudyGoal'da student relation yok)
- ❌ `goal.targetValue` → `goal.targetData` kullanımı

### 4. achievements.service.ts
- ❌ Line 17: requiredPoints orderBy kaldırılmalı
- ❌ Line 34, 62: schoolId where kaldırılmalı  
- ❌ Line 39: earnedAt orderBy → unlockedAt  
- ❌ Line 85: studentId where kullanımı (schema'da yok ama studentId field var)

### 5. groups.service.ts
- ❌ Line 12: gradeIds eklenmeli (zorunlu)
- ❌ Line 33, 243: schoolId kaldırılmalı
- ❌ Line 79, 117: groupPlans kaldırılmalı (relation yok)
- ❌ Line 313: schoolId kaldırılmalı
- ❌ Line 366: g.isCompleted kaldırılmalı (GroupGoal'da yok)

### 6. study-recommendation.service.ts
- ❌ Line 28: examResult model yok
- ❌ Line 48: completedAt orderBy kaldırılmalı
- ❌ Line 136-138: topic schoolId ve resources kaldırılmalı
- ❌ Line 171: `type` → `recommendationType`
- ❌ Line 217: `resource` include yok
- ❌ Line 246: `isApplied` field yok

## Çözüm Stratejisi

Şu an schema büyük ölçüde doğru ama service'ler eski field isimlerini kullanıyor. İki seçenek:

**Seçenek 1: Service'leri schema'ya uyarla (ÖNERİLEN)**
- Tüm service dosyalarını schema'daki field isimleriyle güncellemek
- İlişkileri kaldırmak veya eklentiler için migration yapmak

**Seçenek 2: Schema'yı service'lere uyarla** 
- Eksik field'ları schema'ya eklemek
- Migration oluşturup uygulamak

→ Seçenek 1 daha hızlı çünkü mevcut schema zaten büyük ölçüde doğru!

## Sonraki Adım

Service dosyalarını toplu halde düzeltmek için bir script çalıştırabiliriz.

# Deneme Takip Sistemi - Geliştirme Planı

## Genel Bakış
Bu belge, sistemdeki hataların ve eksikliklerin düzeltilmesi için kapsamlı bir plan içermektedir.

---

## 1. KONU 2: Ders Konu Yönetimi - Branş Denemeleri ve Aktiviteler

### Mevcut Durum
- Subject modeli var ve type alanı mevcut (NORMAL, EXAM, PRACTICE, REVIEW)
- Seed dosyaları mevcut ancak branş denemeleri ve konu tekrarları eksik
- Aktivite türleri (MEBİ, TYT, AYT, MSÜ denemeleri) eksik

### Yapılacaklar

#### 1.1 Veritabanı Değişiklikleri
- ✅ Subject modelinde `type` alanı zaten mevcut
- ✅ Topic modelinde `isSpecialActivity` alanı mevcut
- Yeni subject türleri eklenecek:
  - `BRANCH_EXAM` (Branş Denemesi)
  - `TOPIC_REVIEW` (Konu Tekrarı)
  - `ACTIVITY` (Aktivite)

#### 1.2 Backend Değişiklikleri

**Dosya: `backend/prisma/seed-branch-exams.ts`** (YENİ)
```typescript
// Her ders için branş denemesi ekle
- Matematik Branş Denemesi (LGS, TYT, AYT)
- Türkçe Branş Denemesi (LGS, TYT, AYT)
- Fen Bilimleri Branş Denemesi (LGS)
- Fizik Branş Denemesi (TYT, AYT)
- Kimya Branş Denemesi (TYT, AYT)
- Biyoloji Branş Denemesi (TYT, AYT)
- Tarih Branş Denemesi (TYT, AYT)
- Coğrafya Branş Denemesi (TYT, AYT)
- Felsefe Branş Denemesi (TYT, AYT)
- Din Kültürü Branş Denemesi (LGS, TYT, AYT)
- İngilizce Branş Denemesi (LGS, YDT)
- Edebiyat Branş Denemesi (AYT)
- Geometri Branş Denemesi (TYT, AYT)
```

**Dosya: `backend/prisma/seed-topic-reviews.ts`** (YENİ)
```typescript
// Her ders için konu tekrarı ekle
- Matematik Konu Tekrarı
- Türkçe Konu Tekrarı
- Fen Bilimleri Konu Tekrarı
- vb...
```

**Dosya: `backend/prisma/seed-activities.ts`** (YENİ)
```typescript
// Genel aktiviteler
- MEBİ DENEMESİ (LGS için)
- TYT DENEMESİ
- AYT DENEMESİ
- MSÜ DENEMESİ
- YDT DENEMESİ
```

**Dosya: `backend/prisma/seed.ts`** (GÜNCELLE)
```typescript
// Yeni seed dosyalarını import et ve çalıştır
```

#### 1.3 Frontend Değişiklikleri

**Dosya: `frontend/src/app/dashboard/admin/subjects/page.tsx`** (GÜNCELLE)
- Subject listesinde yeni türleri göster
- Filtreleme seçenekleri ekle (Normal, Branş Denemesi, Konu Tekrarı, Aktivite)
- Türe göre renk kodlaması ekle

**Dosya: `frontend/src/components/study-plan/SubjectSelector.tsx`** (GÜNCELLE veya YENİ)
- Ders seçiminde türlere göre gruplama
- Branş denemeleri ve aktiviteleri ayrı bölümlerde göster

---

## 2. KONU 3: Plan Atama Modülü - Hiyerarşik Seçim

### Mevcut Durum
- Plan atama mevcut ancak kullanıcı deneyimi zayıf
- Sınıf seviyesi ve şube seçimi karışık
- Toplu atama özellikleri eksik

### Yapılacaklar

#### 2.1 Backend Değişiklikleri

**Dosya: `backend/src/study/study-plan.controller.ts`** (GÜNCELLE)
```typescript
// Yeni endpoint'ler ekle:
@Get('assignment/grades')
getGradesForAssignment() // Sınıf seviyelerini listele

@Get('assignment/grades/:gradeId/classes')
getClassesByGrade() // Sınıf seviyesine göre şubeleri listele

@Get('assignment/classes/:classId/students')
getStudentsByClass() // Şubeye göre öğrencileri listele

@Post('assignment/bulk')
bulkAssign() // Toplu atama (sınıf seviyesi, şube, grup)
```

**Dosya: `backend/src/study/study-plan.service.ts`** (GÜNCELLE)
```typescript
// Yeni metodlar:
async getGradesForAssignment(schoolId: string)
async getClassesByGrade(gradeId: string, schoolId: string)
async getStudentsByClass(classId: string, schoolId: string)
async bulkAssignToGrade(planId, gradeId, teacherId, schoolId)
async bulkAssignToClass(planId, classId, teacherId, schoolId)
async bulkAssignToGroup(planId, groupId, teacherId, schoolId)
```

#### 2.2 Frontend Değişiklikleri

**Dosya: `frontend/src/app/dashboard/study-plans/assign/page.tsx`** (YENİ veya GÜNCELLE)
```typescript
// Yeni hiyerarşik atama arayüzü:
1. Plan Seçimi
2. Atama Türü Seçimi:
   - Sınıf Seviyesine Toplu Atama
   - Şubeye Toplu Atama
   - Mentörlük Grubuna Atama
   - Bireysel Öğrenci Atama
3. Hedef Seçimi (hiyerarşik):
   - Sınıf Seviyesi → Şube → Öğrenci
4. Onay ve Atama
```

**Dosya: `frontend/src/components/study-plan/AssignmentWizard.tsx`** (YENİ)
```typescript
// Adım adım atama sihirbazı
- Step 1: Plan seçimi
- Step 2: Atama türü
- Step 3: Hedef seçimi (hiyerarşik)
- Step 4: Tarih ve ayarlar
- Step 5: Önizleme ve onay
```

---

## 3. KONU 4: Görev Onaylama - Öğretmen Onayı

### Mevcut Durum
- StudyTask modelinde `teacherApproved` ve `teacherApprovedById` alanları mevcut
- Ancak frontend'de onaylama butonu yok
- Öğretmen onayı mantığı eksik

### Yapılacaklar

#### 3.1 Backend Değişiklikleri

**Dosya: `backend/src/study/study-task.controller.ts`** (YENİ veya GÜNCELLE)
```typescript
@Post('tasks/:taskId/approve')
@Roles('TEACHER', 'SCHOOL_ADMIN')
async approveTask(@Param('taskId') taskId: string, @Request() req) {
  return this.studyTaskService.approveTask(taskId, req.user.id, req.user.schoolId);
}

@Post('tasks/:taskId/reject')
@Roles('TEACHER', 'SCHOOL_ADMIN')
async rejectTask(@Param('taskId') taskId: string, @Body() dto: RejectTaskDto, @Request() req) {
  return this.studyTaskService.rejectTask(taskId, dto.comment, req.user.id, req.user.schoolId);
}
```

**Dosya: `backend/src/study/study-task.service.ts`** (YENİ veya GÜNCELLE)
```typescript
async approveTask(taskId: string, teacherId: string, schoolId: string) {
  // Görevi kontrol et
  // Öğretmen yetkisini kontrol et
  // Görevi onayla ve COMPLETED yap
  // teacherApproved = true
  // teacherApprovedById = teacherId
  // teacherApprovedAt = now()
  // status = COMPLETED
}

async rejectTask(taskId: string, comment: string, teacherId: string, schoolId: string) {
  // Görevi kontrol et
  // Öğretmen yetkisini kontrol et
  // Görevi reddet ve PENDING yap
  // teacherComment = comment
  // status = PENDING
}
```

**Dosya: `backend/src/study/dto/reject-task.dto.ts`** (YENİ)
```typescript
export class RejectTaskDto {
  @IsString()
  @IsNotEmpty()
  comment: string;
}
```

#### 3.2 Frontend Değişiklikleri

**Dosya: `frontend/src/app/dashboard/tasks/page.tsx`** (GÜNCELLE)
```typescript
// Öğretmen görünümünde:
- Onay bekleyen görevler listesi
- Her görev için "Onayla" ve "Reddet" butonları
- Reddetme durumunda yorum alanı
- Onaylanan görevler için yeşil işaret
```

**Dosya: `frontend/src/components/tasks/TaskApprovalCard.tsx`** (YENİ)
```typescript
// Görev onaylama kartı
- Öğrenci bilgisi
- Görev detayları
- Tamamlama bilgileri (soru sayısı, süre, doğru/yanlış)
- Öğrenci notları
- Onaylama butonları
```

---

## 4. KONU 6: Haftalık Plan - Hedef Bilgileri

### Mevcut Durum
- StudyTask modelinde hedef alanları mevcut:
  - `targetQuestionCount`
  - `targetDuration`
  - `targetResource`
- Frontend'de gösterilmiyor

### Yapılacaklar

#### 4.1 Frontend Değişiklikleri

**Dosya: `frontend/src/components/study-plan/WeeklyPlanView.tsx`** (GÜNCELLE)
```typescript
// Her görev için hedef bilgilerini göster:
{task.targetQuestionCount && (
  <div>Hedef Soru: {task.targetQuestionCount}</div>
)}
{task.targetDuration && (
  <div>Hedef Süre: {task.targetDuration} dk</div>
)}
{task.targetResource && (
  <div>Kaynak: {task.targetResource}</div>
)}
```

**Dosya: `frontend/src/app/dashboard/study-plans/[id]/week/page.tsx`** (GÜNCELLE)
```typescript
// Haftalık plan görünümünde hedef bilgilerini göster
// Tamamlanan görevlerde hedef vs gerçekleşen karşılaştırması
```

---

## 5. KONU 8: Şablon ve Plan Düzenleme

### Mevcut Durum
- Şablonlar düzenlenemiyor
- Atanmış planlar düzenlenemiyor
- Sınıf seviyesi seçimi gereksiz

### Yapılacaklar

#### 5.1 Backend Değişiklikleri

**Dosya: `backend/src/study/study-plan.controller.ts`** (GÜNCELLE)
```typescript
@Patch(':id')
@Roles('TEACHER', 'SCHOOL_ADMIN')
async updatePlan(@Param('id') id: string, @Body() dto: UpdateStudyPlanDto, @Request() req) {
  return this.studyPlanService.update(id, dto, req.user.id, req.user.schoolId);
}

@Patch('assignments/:assignmentId')
@Roles('TEACHER', 'SCHOOL_ADMIN')
async updateAssignment(@Param('assignmentId') id: string, @Body() dto: UpdateAssignmentDto, @Request() req) {
  return this.studyPlanService.updateAssignment(id, dto, req.user.id, req.user.schoolId);
}
```

**Dosya: `backend/src/study/study-plan.service.ts`** (GÜNCELLE)
```typescript
async update(planId: string, dto: UpdateStudyPlanDto, teacherId: string, schoolId: string) {
  // Plan sahibi kontrolü
  // Planı güncelle
  // İlişkili atamaları güncelle (opsiyonel)
}

async updateAssignment(assignmentId: string, dto: UpdateAssignmentDto, teacherId: string, schoolId: string) {
  // Atama sahibi kontrolü
  // Atamayı güncelle
  // customPlanData alanını güncelle
  // İlgili task'ları güncelle
}
```

#### 5.2 Frontend Değişiklikleri

**Dosya: `frontend/src/app/dashboard/study-plans/[id]/edit/page.tsx`** (YENİ)
```typescript
// Plan düzenleme sayfası
- Şablon düzenleme
- Atanmış plan düzenleme
- Sınıf seviyesi seçimi kaldırıldı (gradeLevels array'den otomatik)
```

**Dosya: `frontend/src/app/dashboard/study-plans/assignments/[id]/edit/page.tsx`** (YENİ)
```typescript
// Atama düzenleme sayfası
- Atanmış planın özel verilerini düzenle
- Görevleri düzenle
- Tarihleri güncelle
```

---

## 6. KONU 10: Öğrenci Plan Görünümü - Hedef Gösterimi

### Mevcut Durum
- Öğrenci görevleri görebiliyor
- Ancak öğretmen tarafından belirlenen hedefleri göremiyor

### Yapılacaklar

#### 6.1 Frontend Değişiklikleri

**Dosya: `frontend/src/app/dashboard/student/tasks/page.tsx`** (GÜNCELLE)
```typescript
// Öğrenci görev görünümünde hedefleri göster:
<TaskCard task={task}>
  <div className="targets">
    <h4>Hedefler</h4>
    {task.targetQuestionCount && (
      <div>📝 {task.targetQuestionCount} soru</div>
    )}
    {task.targetDuration && (
      <div>⏱️ {task.targetDuration} dakika</div>
    )}
    {task.targetResource && (
      <div>📚 {task.targetResource}</div>
    )}
  </div>
  
  {task.status === 'COMPLETED' && (
    <div className="comparison">
      <h4>Gerçekleşen</h4>
      <div>✅ {task.completedQuestionCount} soru</div>
      <div>⏱️ {task.actualDuration} dakika</div>
      {task.actualResource && (
        <div>📚 {task.actualResource}</div>
      )}
    </div>
  )}
</TaskCard>
```

---

## 7. KONU 12: Hiyerarşik Konu Seçimi

### Mevcut Durum
- Topic modelinde `parentTopicId` mevcut
- Ancak frontend'de düz liste olarak gösteriliyor
- Alt konular hiyerarşik değil

### Yapılacaklar

#### 7.1 Backend Değişiklikleri

**Dosya: `backend/src/subjects/subjects.controller.ts`** (GÜNCELLE)
```typescript
@Get(':subjectId/topics/hierarchical')
async getHierarchicalTopics(@Param('subjectId') subjectId: string) {
  return this.subjectsService.getHierarchicalTopics(subjectId);
}
```

**Dosya: `backend/src/subjects/subjects.service.ts`** (GÜNCELLE)
```typescript
async getHierarchicalTopics(subjectId: string) {
  // Ana konuları al (parentTopicId = null)
  const mainTopics = await this.prisma.topic.findMany({
    where: { subjectId, parentTopicId: null },
    include: {
      childTopics: {
        include: {
          childTopics: true, // 3 seviye derinlik
        },
      },
    },
    orderBy: { order: 'asc' },
  });
  
  return mainTopics;
}
```

#### 7.2 Frontend Değişiklikleri

**Dosya: `frontend/src/components/study-plan/HierarchicalTopicSelector.tsx`** (YENİ)
```typescript
// Hiyerarşik konu seçici
interface TopicOption {
  value: string;
  label: string;
  level: number; // 0, 1, 2 (ana, alt, alt-alt)
  parentId?: string;
}

// Select içinde:
<option value={topic.id}>
  {'\u00A0'.repeat(topic.level * 4)}{topic.name}
</option>

// Örnek:
// Sayılar
//     Rasyonel Sayılar
//         Kesirler
//         Ondalık Sayılar
//     Tam Sayılar
```

**Dosya: `frontend/src/app/dashboard/study-plans/create/page.tsx`** (GÜNCELLE)
```typescript
// Plan oluşturma sayfasında hiyerarşik konu seçiciyi kullan
// Metin girişi seçeneği ekle (konu seçmeden)
```

---

## 8. KONU 13: Mentör Grup Üye Ekleme

### Mevcut Durum
- Üye ekleme endpoint'i mevcut
- Ancak frontend'de çalışmıyor
- Sınıf-şube seçimi eksik

### Yapılacaklar

#### 8.1 Backend Değişiklikleri

**Dosya: `backend/src/groups/groups.controller.ts`** (GÜNCELLE)
```typescript
@Get(':id/available-students')
@Roles('TEACHER', 'SCHOOL_ADMIN')
async getAvailableStudents(
  @Param('id') groupId: string,
  @Query('gradeId') gradeId?: string,
  @Query('classId') classId?: string,
  @Request() req
) {
  return this.groupsService.getAvailableStudents(groupId, req.user.schoolId, gradeId, classId);
}
```

**Dosya: `backend/src/groups/groups.service.ts`** (GÜNCELLE)
```typescript
async getAvailableStudents(groupId: string, schoolId: string, gradeId?: string, classId?: string) {
  // Grup üyesi olmayan öğrencileri listele
  const existingMemberIds = await this.prisma.groupMembership.findMany({
    where: { groupId, leftAt: null },
    select: { studentId: true },
  });
  
  const where: any = {
    schoolId,
    id: { notIn: existingMemberIds.map(m => m.studentId) },
  };
  
  if (classId) {
    where.classId = classId;
  } else if (gradeId) {
    where.class = { gradeId };
  }
  
  return this.prisma.student.findMany({
    where,
    include: {
      user: { select: { firstName: true, lastName: true } },
      class: { select: { name: true, grade: { select: { name: true } } } },
    },
  });
}
```

#### 8.2 Frontend Değişiklikleri

**Dosya: `frontend/src/app/dashboard/groups/[id]/page.tsx`** (GÜNCELLE)
```typescript
// Üye ekleme modalı:
<AddMemberModal groupId={groupId}>
  <Step1: Sınıf Seviyesi Seçimi />
  <Step2: Şube Seçimi />
  <Step3: Öğrenci Seçimi (çoklu) />
  <Step4: Onay />
</AddMemberModal>
```

---

## 9. KONU 14: Mentör Grup Düzenleme ve Hedef Belirleme

### Mevcut Durum
- GroupGoal modeli mevcut
- Ancak frontend'de düzenleme ve hedef belirleme eksik

### Yapılacaklar

#### 9.1 Veritabanı İncelemesi
```sql
-- GroupGoal tablosu:
- id
- groupId
- schoolId
- goalType (STUDY_TIME, TASK_COMPLETION, EXAM_SCORE, TOPIC_MASTERY)
- targetData (JSON)
- deadline
- progress
- isActive
- createdAt
- updatedAt
```

#### 9.2 Backend Değişiklikleri

**Dosya: `backend/src/groups/groups.controller.ts`** (GÜNCELLE)
```typescript
@Get(':id/goals')
@Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
async getGroupGoals(@Param('id') groupId: string, @Request() req) {
  return this.groupsService.getGroupGoals(groupId, req.user.schoolId);
}

@Patch(':id/goals/:goalId')
@Roles('TEACHER', 'SCHOOL_ADMIN')
async updateGroupGoal(
  @Param('id') groupId: string,
  @Param('goalId') goalId: string,
  @Body() dto: UpdateGroupGoalDto,
  @Request() req
) {
  return this.groupsService.updateGroupGoal(groupId, goalId, dto, req.user.id, req.user.schoolId);
}

@Delete(':id/goals/:goalId')
@Roles('TEACHER', 'SCHOOL_ADMIN')
async deleteGroupGoal(
  @Param('id') groupId: string,
  @Param('goalId') goalId: string,
  @Request() req
) {
  return this.groupsService.deleteGroupGoal(groupId, goalId, req.user.id, req.user.schoolId);
}
```

**Dosya: `backend/src/groups/dto/update-group-goal.dto.ts`** (YENİ)
```typescript
export class UpdateGroupGoalDto {
  @IsOptional()
  @IsEnum(GroupGoalType)
  goalType?: GroupGoalType;

  @IsOptional()
  @IsObject()
  targetData?: any;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

#### 9.3 Frontend Değişiklikleri

**Dosya: `frontend/src/app/dashboard/groups/[id]/page.tsx`** (GÜNCELLE)
```typescript
// Grup detay sayfası yeniden tasarlanacak:

<GroupDetailPage>
  <GroupHeader>
    <GroupInfo />
    <EditButton /> {/* Çalışır hale getirilecek */}
  </GroupHeader>
  
  <Tabs>
    <Tab label="Üyeler">
      <MemberList />
      <AddMemberButton /> {/* Çalışır hale getirilecek */}
    </Tab>
    
    <Tab label="Hedefler">
      <GoalList />
      <AddGoalButton />
      <GoalForm>
        <GoalTypeSelector />
        <TargetDataInput />
        <DeadlineInput />
      </GoalForm>
    </Tab>
    
    <Tab label="İstatistikler">
      <GroupStats />
    </Tab>
    
    <Tab label="Planlar">
      <AssignedPlans />
    </Tab>
  </Tabs>
</GroupDetailPage>
```

**Dosya: `frontend/src/components/groups/GoalManager.tsx`** (YENİ)
```typescript
// Hedef yönetimi bileşeni
interface GroupGoal {
  id: string;
  goalType: 'STUDY_TIME' | 'TASK_COMPLETION' | 'EXAM_SCORE' | 'TOPIC_MASTERY';
  targetData: {
    target: number;
    unit: string;
    subject?: string;
    topic?: string;
  };
  deadline: Date;
  progress: number;
  isActive: boolean;
}

// Hedef türlerine göre form alanları:
- STUDY_TIME: Hedef süre (saat), Başlangıç-Bitiş tarihi
- TASK_COMPLETION: Hedef görev sayısı, Ders, Başlangıç-Bitiş tarihi
- EXAM_SCORE: Hedef puan, Sınav türü, Ders
- TOPIC_MASTERY: Konu, Hedef başarı oranı
```

---

## Öncelik Sırası

### Yüksek Öncelik (Hemen Yapılacak)
1. ✅ **Konu 4**: Görev Onaylama - Öğretmen onayı kritik
2. ✅ **Konu 13**: Mentör Grup Üye Ekleme - Çalışmıyor
3. ✅ **Konu 14**: Mentör Grup Düzenleme - Çalışmıyor

### Orta Öncelik (Bu Hafta)
4. ✅ **Konu 3**: Plan Atama - UX iyileştirmesi
5. ✅ **Konu 8**: Şablon Düzenleme - Önemli özellik
6. ✅ **Konu 12**: Hiyerarşik Konu Seçimi - UX iyileştirmesi

### Düşük Öncelik (Gelecek Hafta)
7. ✅ **Konu 2**: Branş Denemeleri - İçerik ekleme
8. ✅ **Konu 6**: Haftalık Plan Hedefleri - Görsel iyileştirme
9. ✅ **Konu 10**: Öğrenci Hedef Görünümü - Görsel iyileştirme

---

## Teknik Notlar

### Veritabanı Değişiklikleri
- Yeni migration gerekmeyebilir (çoğu alan mevcut)
- Sadece seed dosyaları eklenecek

### API Değişiklikleri
- Yeni endpoint'ler eklenecek
- Mevcut endpoint'ler güncellenecek
- Geriye dönük uyumluluk korunacak

### Frontend Değişiklikleri
- Yeni bileşenler oluşturulacak
- Mevcut bileşenler güncellenecek
- Responsive tasarım korunacak

### Test Stratejisi
1. Her özellik için unit test
2. Integration test'ler
3. E2E test'ler (kritik akışlar için)
4. Manuel test (UI/UX)

---

## Zaman Tahmini

| Konu | Tahmini Süre | Zorluk |
|------|--------------|--------|
| Konu 2 | 4 saat | Kolay |
| Konu 3 | 8 saat | Orta |
| Konu 4 | 6 saat | Orta |
| Konu 6 | 2 saat | Kolay |
| Konu 8 | 6 saat | Orta |
| Konu 10 | 2 saat | Kolay |
| Konu 12 | 6 saat | Orta |
| Konu 13 | 4 saat | Orta |
| Konu 14 | 8 saat | Zor |

**Toplam Tahmini Süre**: ~46 saat (6 iş günü)

---

## Sonraki Adımlar

1. ✅ Bu planı gözden geçir ve onayla
2. ⏳ Yüksek öncelikli konulardan başla
3. ⏳ Her konu için branch oluştur
4. ⏳ Test et ve merge et
5. ⏳ Dokümantasyonu güncelle

---

## Notlar

- Her değişiklik için commit mesajları açıklayıcı olmalı
- Breaking change'ler için migration guide hazırlanmalı
- API değişiklikleri için changelog güncellenmeliş
- Frontend değişiklikleri için screenshot'lar alınmalı

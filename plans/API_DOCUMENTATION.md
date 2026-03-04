# Deneme Takip Sistemi - API Dokümantasyonu

## Genel Bilgiler

| Özellik | Değer |
|---------|-------|
| **Proje Adı** | Deneme Takip Sistemi (Exam Tracking System) |
| **Backend** | NestJS |
| **Veritabanı** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT (JSON Web Token) |
| **Dokümantasyon** | Swagger/OpenAPI entegrasyonu mevcut |

### Teknoloji Stack
- **Framework**: NestJS 11.x
- **Veritabanı**: PostgreSQL
- **ORM**: Prisma 6.x
- **Authentication**: Passport JWT
- **Queue**: BullMQ (Redis)
- **Task Scheduling**: @nestjs/schedule
- **Rate Limiting**: @nestjs/throttler
- **Push Notifications**: Web Push
- **Excel/PDF**: ExcelJS, PDFKit

---

## Base URL

```
Development:  http://localhost:3001/api
Production:   https://api.example.com/api
```

---

## Authentication

Sistem JWT tabanlı kimlik doğrulama kullanır. Token, `HttpOnly` cookie olarak veya Authorization header'da gönderilebilir.

### Cookie Tabanlı Auth (Varsayılan)
- Token `token` adlı cookie'de saklanır
- `httpOnly: true`, `secure: production`, `sameSite: 'lax'`

### Header Tabanlı Auth
```
Authorization: Bearer <token>
```

### Login Endpoint'leri

#### 1. Okul Yöneticisi/Öğretmen Girişi
```http
POST /auth/login-school
Content-Type: application/json

{
  "email": "admin@okul.edu.tr",
  "password": "sifre123",
  "rememberMe": true
}
```

#### 2. Öğrenci Girişi
```http
POST /auth/login-student
Content-Type: application/json

{
  "identifier": "12345",      // Öğrenci numarası veya TC No
  "password": "sifre123",
  "schoolCode": "OKUL001"
}
```

#### 3. Veli Girişi
```http
POST /auth/login-parent
Content-Type: application/json

{
  "identifier": "12345",      // Öğrenci numarası veya TC No
  "password": "sifre123",
  "schoolCode": "OKUL001"
}
```

### Kimlik Doğrulama Yanıtı
```json
{
  "user": {
    "id": "uuid",
    "email": "user@okul.edu.tr",
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "role": "STUDENT",
    "schoolId": "uuid",
    "avatarSeed": "seed123"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Rol ve Yetkilendirme (Authorization)

### Rol Hiyerarşisi

| Rol | Kod | Açıklama |
|-----|-----|----------|
| Süper Admin | `SUPER_ADMIN` | Sistem yöneticisi, tüm okullara erişim |
| Okul Yöneticisi | `SCHOOL_ADMIN` | Okul yöneticisi, kendi okulunda tam yetki |
| Öğretmen | `TEACHER` | Öğretmen, kendi sınıflarına/gruplarına erişim |
| Öğrenci | `STUDENT` | Öğrenci, kendi verilerine erişim |
| Veli | `PARENT` | Veli, çocuğunun verilerine erişim |

### Rol Matrisi

| Endpoint | SUPER_ADMIN | SCHOOL_ADMIN | TEACHER | STUDENT | PARENT |
|----------|:-----------:|:------------:|:-------:|:-------:|:------:|
| **Auth** |
| POST /auth/login-* | ✓ | ✓ | ✓ | ✓ | ✓ |
| POST /auth/register | ✓ | ✓ | - | - | - |
| POST /auth/forgot-password | ✓ | ✓ | ✓ | ✓ | ✓ |
| POST /auth/reset-password | ✓ | ✓ | ✓ | ✓ | ✓ |
| GET /auth/me | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Schools** |
| GET /schools | ✓ | ✓ | ✓ | ✓ | ✓ |
| PATCH /schools/:id | - | ✓ | - | - | - |
| GET /schools/:id/grades | ✓ | ✓ | ✓ | ✓ | ✓ |
| GET /schools/:id/classes | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Exams** |
| POST /exams | - | ✓ | ✓ | - | - |
| GET /exams | ✓ | ✓ | ✓ | ✓ | ✓ |
| GET /exams/:id | ✓ | ✓ | ✓ | ✓ | ✓ |
| DELETE /exams/:id | - | ✓ | - | - | - |
| **Students** |
| GET /students | ✓ | ✓ | ✓ | - | - |
| GET /students/:id | ✓ | ✓ | ✓ | ✓ | ✓ |
| POST /students | ✓ | ✓ | - | - | - |
| **Messages** |
| POST /messages | - | ✓ | ✓ | - | - |
| GET /messages/inbox | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Study** |
| POST /study/plans | - | ✓ | ✓ | - | - |
| GET /study/plans | ✓ | ✓ | ✓ | ✓ | - |
| **Groups** |
| POST /groups | ✓ | ✓ | ✓ | - | - |
| GET /groups | ✓ | ✓ | ✓ | ✓ | - |

---

## API Endpoint'leri

### 1. AUTHENTICATION MODULE (`/auth`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| POST | `/auth/login-school` | Okul personeli girişi | Public |
| POST | `/auth/login-student` | Öğrenci girişi | Public |
| POST | `/auth/login-parent` | Veli girişi | Public |
| POST | `/auth/register` | Yeni kullanıcı kaydı | SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/auth/forgot-password` | Şifre sıfırlama isteği | Public |
| POST | `/auth/reset-password` | Şifre sıfırlama | Public |
| GET | `/auth/validate-reset-token/:token` | Token doğrulama | Public |
| GET | `/auth/me` | Mevcut kullanıcı bilgisi | Authenticated |
| POST | `/auth/change-password` | Şifre değiştirme | Authenticated |
| PUT | `/auth/update-avatar` | Avatar güncelleme | Authenticated |
| POST | `/auth/test-email` | Email servis testi | SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/auth/logout` | Çıkış yapma | Authenticated |

#### Request/Response Örnekleri

**Login Request:**
```json
{
  "email": "admin@okul.edu.tr",
  "password": "sifre123",
  "rememberMe": true
}
```

**Login Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@okul.edu.tr",
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "role": "SCHOOL_ADMIN",
    "schoolId": "550e8400-e29b-41d4-a716-446655440001",
    "avatarSeed": "avatar123"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 2. SCHOOLS MODULE (`/schools`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/schools` | Varsayılan okul bilgisi | Public |
| GET | `/schools/:id` | Okul detayı | Authenticated |
| PATCH | `/schools/:id` | Okul güncelleme | SCHOOL_ADMIN |
| GET | `/schools/:id/promote/preview` | Sınıf geçiş önizleme | SCHOOL_ADMIN |
| POST | `/schools/:id/promote` | Sınıf geçiş işlemi | SCHOOL_ADMIN |
| GET | `/schools/:id/grades` | Tüm sınıf seviyeleri | Authenticated |
| GET | `/schools/:id/grades/:gradeId/classes` | Sınıf şubeleri | Authenticated |
| GET | `/schools/:id/classes` | Tüm sınıflar | Authenticated |
| POST | `/schools/:id/classes` | Yeni sınıf ekleme | SCHOOL_ADMIN |
| PUT | `/schools/:id/classes/:classId` | Sınıf güncelleme | SCHOOL_ADMIN |
| DELETE | `/schools/:id/classes/:classId` | Sınıf silme | SCHOOL_ADMIN |
| POST | `/schools/:id/classes/merge` | Sınıf birleştirme | SCHOOL_ADMIN |
| POST | `/schools/:id/classes/:classId/transfer-students` | Öğrenci transferi | SCHOOL_ADMIN |
| POST | `/schools/:id/backup` | Yedek alma | SCHOOL_ADMIN, SUPER_ADMIN |
| GET | `/schools/:id/backups` | Yedek listesi | SCHOOL_ADMIN, SUPER_ADMIN |
| GET | `/schools/:id/backups/:backupId/download` | Yedek indirme | SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/schools/:id/restore` | Geri yükleme | SCHOOL_ADMIN, SUPER_ADMIN |

**Update School Request:**
```json
{
  "name": "Anadolu Lisesi",
  "appShortName": "ALS",
  "phone": "0212 123 45 67",
  "address": "İstanbul, Türkiye",
  "website": "https://okul.edu.tr",
  "studentLoginType": "studentNumber",
  "isParentLoginActive": true,
  "pushEnabled": true,
  "pushNewMessageEnabled": true,
  "pushExamReminderEnabled": true,
  "pushGroupPostEnabled": true,
  "pushAchievementEnabled": true,
  "pushStudyPlanEnabled": true,
  "autoCleanupEnabled": true,
  "cleanupMonthsToKeep": 3
}
```

---

### 3. EXAMS MODULE (`/exams`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| POST | `/exams` | Yeni sınav oluşturma | SCHOOL_ADMIN, TEACHER |
| GET | `/exams` | Tüm sınavları listeleme | SCHOOL_ADMIN, TEACHER |
| GET | `/exams/:id` | Sınav detayı | Authenticated |
| PATCH | `/exams/:id` | Sınav güncelleme | SCHOOL_ADMIN |
| DELETE | `/exams/:id` | Sınav silme | SCHOOL_ADMIN |
| DELETE | `/exams/:id/results` | Sınav sonuçlarını temizleme | SCHOOL_ADMIN |
| POST | `/exams/:id/update-counts` | Katılımcı sayısı güncelleme | SCHOOL_ADMIN |
| GET | `/exams/:id/statistics` | Sınav istatistikleri | All Roles |
| POST | `/exams/:id/upload-answer-key` | Cevap anahtarı yükleme | SCHOOL_ADMIN |
| GET | `/exams/:id/answer-key` | Cevap anahtarı görüntüleme | All Roles |
| GET | `/exams/:id/export/excel` | Excel export | SCHOOL_ADMIN, TEACHER |
| GET | `/exams/:id/export/pdf` | PDF export | SCHOOL_ADMIN, TEACHER |
| GET | `/exams/calendar/view` | Takvim görünümü | SCHOOL_ADMIN, TEACHER, STUDENT |
| GET | `/exams/calendar/upcoming` | Yaklaşan sınavlar | SCHOOL_ADMIN, TEACHER, STUDENT |
| POST | `/exams/:id/duplicate` | Sınav kopyalama | SCHOOL_ADMIN |
| PATCH | `/exams/:id/toggle-archive` | Arşivleme | SCHOOL_ADMIN |
| PATCH | `/exams/:id/toggle-publisher-visibility` | Yayınevi görünürlüğü | SCHOOL_ADMIN |
| PATCH | `/exams/:id/toggle-answer-key-public` | Cevap anahtarı herkese açık | SCHOOL_ADMIN |

**Create Exam Request:**
```json
{
  "title": "TYT Deneme Sınavı - 1",
  "type": "TYT",
  "date": "2024-03-15T09:00:00Z",
  "gradeLevel": 12,
  "schoolId": "uuid",
  "publisher": "ÖSYM",
  "city": "İstanbul",
  "district": "Kadıköy",
  "fee": 50.00,
  "isPaid": true,
  "applicationDateTime": "2024-03-10T17:00:00Z",
  "scheduledDateTime": "2024-03-15T09:00:00Z",
  "generalInfo": "Sınav hakkında genel bilgiler...",
  "isAnswerKeyPublic": false,
  "isPublisherVisible": true
}
```

---

### 4. STUDENTS MODULE (`/students`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/students/filters` | Filtre seçenekleri | SCHOOL_ADMIN, TEACHER, SUPER_ADMIN |
| GET | `/students` | Tüm öğrenciler | SCHOOL_ADMIN, TEACHER, SUPER_ADMIN |
| GET | `/students/:id` | Öğrenci detayı | All Roles |
| POST | `/students` | Yeni öğrenci ekleme | SCHOOL_ADMIN, SUPER_ADMIN |
| PUT | `/students/:id` | Öğrenci güncelleme | SCHOOL_ADMIN, SUPER_ADMIN |
| DELETE | `/students/:id` | Öğrenci silme | SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/students/bulk-delete` | Toplu silme | SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/students/bulk-transfer` | Toplu sınıf değiştirme | SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/students/:id/change-password` | Şifre değiştirme | SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/students/:id/change-parent-password` | Veli şifresi değiştirme | SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/students/import` | Excel'den içe aktarma | SCHOOL_ADMIN, SUPER_ADMIN |
| GET | `/students/me/exams` | Kendi sınav sonuçlarım | STUDENT |
| GET | `/students/:id/exams` | Öğrenci sınav geçmişi | All Roles |

**Create Student Request:**
```json
{
  "firstName": "Mehmet",
  "lastName": "Demir",
  "email": "mehmet@email.com",
  "studentNumber": "12345",
  "tcNo": "12345678901",
  "password": "ogrenci123",
  "classId": "uuid",
  "gradeId": "uuid"
}
```

---

### 5. USERS MODULE (`/users`, `/profile`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/users` | Tüm kullanıcılar | SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/users` | Yeni kullanıcı ekleme | SCHOOL_ADMIN, SUPER_ADMIN |
| PUT | `/users/:id` | Kullanıcı güncelleme | SCHOOL_ADMIN, SUPER_ADMIN |
| DELETE | `/users/:id` | Kullanıcı silme | SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/users/:id/change-password` | Şifre değiştirme | SCHOOL_ADMIN, SUPER_ADMIN |
| PUT | `/profile/update` | Kendi profilini güncelleme | Authenticated |

---

### 6. MESSAGES MODULE (`/messages`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| POST | `/messages/upload` | Dosya yükleme | SCHOOL_ADMIN, TEACHER |
| POST | `/messages` | Mesaj gönderme | SCHOOL_ADMIN, TEACHER |
| GET | `/messages/inbox` | Gelen kutusu | All Roles |
| GET | `/messages/sent` | Gönderilenler | SCHOOL_ADMIN, TEACHER |
| GET | `/messages/unread-count` | Okunmamış sayısı | All Roles |
| SSE | `/messages/stream` | Gerçek zamanlı mesaj akışı | Authenticated |
| GET | `/messages/drafts` | Taslaklar | SCHOOL_ADMIN, TEACHER |
| POST | `/messages/drafts` | Taslak kaydetme | SCHOOL_ADMIN, TEACHER |
| DELETE | `/messages/drafts/:id` | Taslak silme | SCHOOL_ADMIN, TEACHER |
| GET | `/messages/templates` | Şablonlar | SCHOOL_ADMIN, TEACHER |
| POST | `/messages/templates` | Şablon oluşturma | SCHOOL_ADMIN |
| DELETE | `/messages/templates/:id` | Şablon silme | SCHOOL_ADMIN |
| GET | `/messages/settings` | Mesaj ayarları | SCHOOL_ADMIN |
| PATCH | `/messages/settings` | Ayar güncelleme | SCHOOL_ADMIN |
| GET | `/messages/:id` | Mesaj detayı | All Roles |
| PATCH | `/messages/:id` | Mesaj güncelleme | SCHOOL_ADMIN |
| DELETE | `/messages/:id` | Mesaj silme | All Roles |
| PATCH | `/messages/:id/read` | Okundu olarak işaretleme | All Roles |
| PATCH | `/messages/:id/favorite` | Favorilere ekleme/çıkarma | All Roles |
| POST | `/messages/:id/replies` | Yanıt gönderme | All Roles |
| POST | `/messages/:id/approve` | Mesaj onaylama | SCHOOL_ADMIN |

**Create Message Request:**
```json
{
  "subject": "Sınav Duyurusu",
  "body": "TYT deneme sınavı 15 Mart'ta yapılacaktır.",
  "type": "BROADCAST",
  "category": "EXAM",
  "targetRoles": ["STUDENT", "PARENT"],
  "targetGradeId": "uuid",
  "targetClassId": "uuid",
  "scheduledFor": "2024-03-10T10:00:00Z",
  "requiresApproval": false,
  "allowReplies": true
}
```

---

### 7. STUDY MODULE (`/study`)

#### Study Plans

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| POST | `/study/plans` | Çalışma planı oluşturma | TEACHER, SCHOOL_ADMIN |
| GET | `/study/plans` | Tüm planları listeleme | TEACHER, SCHOOL_ADMIN, STUDENT |
| GET | `/study/plans/templates` | Şablonları listeleme | TEACHER, SCHOOL_ADMIN |
| GET | `/study/plans/:id` | Plan detayı | TEACHER, SCHOOL_ADMIN, STUDENT |
| PATCH | `/study/plans/:id` | Plan güncelleme | TEACHER, SCHOOL_ADMIN |
| DELETE | `/study/plans/:id` | Plan silme | TEACHER, SCHOOL_ADMIN |
| POST | `/study/plans/:id/assign` | Plan atama | TEACHER, SCHOOL_ADMIN |
| GET | `/study/plans/:id/assignment-summary` | Atama özetı | TEACHER, SCHOOL_ADMIN, STUDENT |
| POST | `/study/plans/:id/duplicate` | Plan kopyalama | TEACHER, SCHOOL_ADMIN |
| POST | `/study/plans/:id/archive` | Plan arşivleme | TEACHER, SCHOOL_ADMIN |
| POST | `/study/plans/:id/share` | Plan paylaşma | TEACHER, SCHOOL_ADMIN |
| GET | `/study/plans/:id/assignments` | Atamaları listeleme | TEACHER, SCHOOL_ADMIN |
| POST | `/study/plans/assignments/:assignmentId/cancel` | Atama iptali | TEACHER, SCHOOL_ADMIN |

#### Study Tasks

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| POST | `/study/tasks` | Görev oluşturma | TEACHER, SCHOOL_ADMIN |
| GET | `/study/tasks` | Görevleri listeleme | TEACHER, SCHOOL_ADMIN, STUDENT |
| GET | `/study/tasks/:id` | Görev detayı | TEACHER, SCHOOL_ADMIN, STUDENT |
| POST | `/study/tasks/:id/complete` | Görev tamamlama | STUDENT |
| POST | `/study/tasks/:id/verify` | Görev doğrulama | TEACHER, SCHOOL_ADMIN, PARENT |
| PATCH | `/study/tasks/:id` | Görev güncelleme | TEACHER, SCHOOL_ADMIN |
| DELETE | `/study/tasks/:id` | Görev silme | TEACHER, SCHOOL_ADMIN |

#### Study Sessions

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| POST | `/study/sessions` | Çalışma oturumu başlatma | STUDENT |
| GET | `/study/sessions` | Oturum geçmişi | STUDENT |
| POST | `/study/sessions/:id/end` | Oturumu sonlandırma | STUDENT |

**Create Study Plan Request:**
```json
{
  "name": "TYT Matematik Çalışma Planı",
  "description": "4 haftalık kapsamlı matematik programı",
  "examType": "TYT",
  "gradeLevels": [11, 12],
  "planData": {
    "weeks": [
      {
        "weekNumber": 1,
        "topics": ["Sayı Basamakları", "Bölme ve Bölünebilme"],
        "dailyTasks": [
          {
            "day": 1,
            "subject": "Matematik",
            "topicName": "Sayı Basamakları",
            "targetQuestionCount": 20,
            "targetDuration": 45,
            "targetResource": "TYT Matematik Soru Bankası"
          }
        ]
      }
    ]
  },
  "isTemplate": true,
  "isPublic": false
}
```

---

### 8. GROUPS MODULE (`/groups`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| POST | `/groups` | Grup oluşturma | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN |
| GET | `/groups` | Tüm grupları listeleme | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN, STUDENT |
| GET | `/groups/:id` | Grup detayı | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN, STUDENT |
| PATCH | `/groups/:id` | Grup güncelleme | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN |
| DELETE | `/groups/:id` | Grup silme | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/groups/:id/members` | Üye ekleme | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/groups/:id/members/bulk` | Toplu üye ekleme | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/groups/:id/transfer` | Üye transferi | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN |
| DELETE | `/groups/:id/members/:studentId` | Üye çıkarma | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN |
| GET | `/groups/:id/teachers` | Grup öğretmenleri | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN |
| POST | `/groups/:id/teachers` | Öğretmen ekleme | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN |
| DELETE | `/groups/:id/teachers/:teacherId` | Öğretmen çıkarma | TEACHER, SCHOOL_ADMIN, SUPER_ADMIN |

#### Group Posts

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/groups/:id/posts` | Gönderileri listeleme | Grup Üyeleri |
| POST | `/groups/:id/posts` | Gönderi oluşturma | Grup Öğretmenleri |
| PATCH | `/groups/:id/posts/:postId` | Gönderi güncelleme | Grup Öğretmenleri |
| DELETE | `/groups/:id/posts/:postId` | Gönderi silme | Grup Öğretmenleri |
| POST | `/groups/:id/posts/:postId/pin` | Gönderiyi sabitleme | Grup Öğretmenleri |
| POST | `/groups/:id/posts/:postId/unpin` | Sabitlemeyi kaldırma | Grup Öğretmenleri |
| POST | `/groups/:id/posts/:postId/replies` | Yorum ekleme | Grup Üyeleri |
| PATCH | `/groups/:id/posts/:postId/replies/:replyId` | Yorum güncelleme | Yorum Sahibi |
| DELETE | `/groups/:id/posts/:postId/replies/:replyId` | Yorum silme | Yorum Sahibi, Öğretmen |
| POST | `/groups/:id/posts/:postId/responses` | Anket yanıtı | Grup Üyeleri |

#### Group Goals

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/groups/:id/goals` | Hedefleri listeleme | Grup Üyeleri |
| POST | `/groups/:id/goals` | Hedef oluşturma | Grup Öğretmenleri |
| PATCH | `/groups/:id/goals/:goalId` | Hedef güncelleme | Grup Öğretmenleri |
| DELETE | `/groups/:id/goals/:goalId` | Hedef silme | Grup Öğretmenleri |
| POST | `/groups/:id/goals/:goalId/publish` | Hedef yayınlama | Grup Öğretmenleri |
| POST | `/groups/:id/goals/:goalId/complete` | Hedef tamamlama | Grup Öğretmenleri |

**Create Group Request:**
```json
{
  "name": "12-A TYT Hazırlık Grubu",
  "description": "TYT sınavına hazırlık için mentorluk grubu",
  "gradeIds": ["grade-uuid-1", "grade-uuid-2"],
  "maxStudents": 25,
  "groupType": "MENTOR",
  "gradeId": "grade-uuid",
  "classId": "class-uuid"
}
```

---

### 9. IMPORT MODULE (`/import`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| POST | `/import/validate` | Excel dosyası doğrulama | SCHOOL_ADMIN |
| POST | `/import/confirm` | İçe aktarma onaylama | SCHOOL_ADMIN |
| POST | `/import/upload` | Dosya yükleme ve işleme | SCHOOL_ADMIN |

**Import Request:**
```json
{
  "file": "<multipart/form-data>",
  "examId": "uuid",
  "examType": "TYT"
}
```

---

### 10. REPORTS MODULE (`/reports`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/reports/exams/summary` | Sınav özet raporu | TEACHER, SCHOOL_ADMIN |
| GET | `/reports/exams/detailed` | Detaylı sınav raporu | TEACHER, SCHOOL_ADMIN |
| GET | `/reports/subject` | Ders bazlı rapor | TEACHER, SCHOOL_ADMIN |
| GET | `/reports/exam/:id` | Tekil sınav raporu | TEACHER, SCHOOL_ADMIN |
| GET | `/reports/exams/summary/excel` | Excel export | TEACHER, SCHOOL_ADMIN |
| GET | `/reports/exams/detailed/excel` | Detaylı Excel export | TEACHER, SCHOOL_ADMIN |
| GET | `/reports/subject/excel` | Ders raporu Excel | TEACHER, SCHOOL_ADMIN |
| GET | `/reports/dashboard/summary` | Dashboard özeti | TEACHER, SCHOOL_ADMIN |

**Report Query Parameters:**
```
GET /reports/exams/summary?examType=TYT&gradeLevel=12
```

---

### 11. ACHIEVEMENTS MODULE (`/achievements`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/achievements` | Tüm başarımları listeleme | Authenticated |
| GET | `/achievements/student/:studentId` | Öğrenci başarımları | Authenticated |
| GET | `/achievements/:id` | Başarım detayı | Authenticated |
| POST | `/achievements` | Başarım oluşturma | Authenticated |
| PUT | `/achievements/:id` | Başarım güncelleme | Authenticated |
| DELETE | `/achievements/:id` | Başarım silme | Authenticated |
| POST | `/achievements/:id/toggle` | Aktif/Pasif toggle | Authenticated |
| POST | `/achievements/seed` | Varsayılan başarımları ekleme | Authenticated |
| POST | `/achievements/seed-bundle` | Paket ekleme | Authenticated |
| DELETE | `/achievements/seed-bundle/:bundle` | Paket silme | Authenticated |
| POST | `/achievements/check-unlock` | Başarım kilidi kontrolü | Authenticated |

**Create Achievement Request:**
```json
{
  "name": "1 Haftalık Seri",
  "description": "7 gün üst üste çalışma görevi tamamla",
  "category": "STREAK",
  "type": "STREAK_1W",
  "requirement": { "weeks": 1 },
  "iconName": "flame",
  "colorScheme": "orange",
  "points": 100,
  "examType": "TYT"
}
```

---

### 12. NOTIFICATIONS MODULE (`/notifications`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/notifications/public-key` | Push public key | Public |
| POST | `/notifications/subscribe` | Push aboneliği | Authenticated |
| POST | `/notifications/unsubscribe` | Abonelik iptali | Authenticated |
| GET | `/notifications/my-settings` | Kullanıcı bildirim ayarları | Authenticated |
| PATCH | `/notifications/my-settings` | Ayar güncelleme | Authenticated |
| GET | `/notifications/my-deliveries` | Teslimat geçmişi | Authenticated |
| GET | `/notifications/campaigns` | Kampanya listesi | SCHOOL_ADMIN, SUPER_ADMIN, TEACHER |
| POST | `/notifications/campaigns` | Kampanya oluşturma | SCHOOL_ADMIN, SUPER_ADMIN, TEACHER |
| PATCH | `/notifications/campaigns/:id` | Kampanya güncelleme | SCHOOL_ADMIN, SUPER_ADMIN, TEACHER |
| POST | `/notifications/campaigns/:id/send-now` | Hemen gönder | SCHOOL_ADMIN, SUPER_ADMIN, TEACHER |
| POST | `/notifications/campaigns/:id/cancel` | Kampanya iptali | SCHOOL_ADMIN, SUPER_ADMIN, TEACHER |
| DELETE | `/notifications/campaigns/:id` | Kampanya silme | SCHOOL_ADMIN, SUPER_ADMIN, TEACHER |
| GET | `/notifications/campaigns/:id/deliveries` | Kampanya teslimatları | SCHOOL_ADMIN, SUPER_ADMIN, TEACHER |

**Subscribe Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "p256dh": "BIPUL12...",
  "auth": "R2Hk3L...",
  "userAgent": "Mozilla/5.0..."
}
```

**Create Campaign Request:**
```json
{
  "type": "CUSTOM",
  "targetType": "ALL",
  "targetRoles": ["STUDENT", "PARENT"],
  "targetIds": [],
  "title": "Yeni Duyuru",
  "body": "Sistem bakımı yapılacaktır.",
  "deeplink": "/exams",
  "scheduledFor": "2024-03-10T10:00:00Z"
}
```

---

### 13. SEARCH MODULE (`/search`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/search` | Global arama | SCHOOL_ADMIN, TEACHER |
| GET | `/search/autocomplete` | Otomatik tamamlama | SCHOOL_ADMIN, TEACHER |

**Search Parameters:**
```
GET /search?q=Ahmet&schoolId=uuid
GET /search/autocomplete?q=Ah
```

---

### 14. HEALTH CHECK (`/health`)

| Method | Endpoint | Açıklama | Erişim |
|--------|----------|----------|--------|
| GET | `/health` | Sağlık kontrolü | Public |
| GET | `/health/db` | Veritabanı kontrolü | Public |
| GET | `/health/detailed` | Detaylı sağlık raporu | Public |

---

## Veri Modelleri (Prisma Schema)

### Temel Enum'lar

```typescript
// Kullanıcı Rolleri
enum Role {
  SUPER_ADMIN
  SCHOOL_ADMIN
  TEACHER
  STUDENT
  PARENT
}

// Sınav Tipleri
enum ExamType {
  TYT
  AYT
  LGS
  OZEL
}

// Mesaj Tipleri
enum MessageType {
  DIRECT
  BROADCAST
  SCHEDULED
}

// Mesaj Durumları
enum MessageStatus {
  DRAFT
  SCHEDULED
  SENT
  DELETED
}

// Çalışma Görev Durumları
enum StudyTaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  MISSED
  LATE
}

// Grup Üye Rolleri
enum GroupMemberRole {
  MEMBER
  CO_LEADER
}

// Grup Post Tipleri
enum GroupPostType {
  ANNOUNCEMENT
  FILE
  GOAL
  PLAN
  POLL
  VIDEO
  QUESTION
}
```

### Temel Modeller

#### User (Kullanıcı)
```typescript
{
  id: string           // UUID
  email: string?       // Opsiyonel email
  password: string     // Hashlenmiş şifre
  role: Role           // Kullanıcı rolü
  firstName: string
  lastName: string
  schoolId: string
  isActive: boolean
  archivedAt: DateTime?
  avatarSeed: string?
  branch: string?      // Öğretmen branşı
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Student (Öğrenci)
```typescript
{
  id: string
  studentNumber: string?
  userId: string       // User ilişkisi
  classId: string
  schoolId: string
  parentId: string?
  tcNo: string?        // TC Kimlik No
  rewardPoints: int
  user: User
  class: Class
  school: School
  parent: Parent?
}
```

#### Exam (Sınav)
```typescript
{
  id: string
  title: string
  type: ExamType
  date: DateTime
  schoolId: string
  gradeLevel: int
  publisher: string?
  city: string?
  district: string?
  participantCount: int?
  schoolParticipantCount: int?
  cityParticipantCount: int?
  districtParticipantCount: int?
  answerKeyUrl: string?
  isAnswerKeyPublic: boolean
  isArchived: boolean
  isPublished: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Message (Mesaj)
```typescript
{
  id: string
  senderId: string
  subject: string
  body: string
  type: MessageType
  category: MessageCategory
  status: MessageStatus
  targetRoles: JSON?
  targetGradeId: string?
  targetClassId: string?
  scheduledFor: DateTime?
  sentAt: DateTime?
  requiresApproval: boolean
  approvedBy: string?
  allowReplies: boolean
  schoolId: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### StudyPlan (Çalışma Planı)
```typescript
{
  id: string
  teacherId: string
  schoolId: string
  name: string
  description: string?
  examType: string?
  gradeLevels: int[]
  planData: JSON        // Plan yapısı
  isTemplate: boolean
  isShared: boolean
  isPublic: boolean
  status: StudyPlanStatus
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime?
}
```

#### MentorGroup (Mentor Grubu)
```typescript
{
  id: string
  teacherId: string?
  schoolId: string
  name: string
  description: string?
  gradeIds: JSON
  maxStudents: int
  isActive: boolean
  coverImage: string?
  groupType: GroupType
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Hata Kodları ve HTTP Status

| HTTP Code | Açıklama | Kullanım Senaryosu |
|-----------|----------|-------------------|
| 200 | OK | Başarılı GET, PUT, PATCH istekleri |
| 201 | Created | Başarılı POST istekleri |
| 204 | No Content | Başarılı DELETE istekleri |
| 400 | Bad Request | Geçersiz istek verisi |
| 401 | Unauthorized | Kimlik doğrulama hatası |
| 403 | Forbidden | Yetkisiz erişim |
| 404 | Not Found | Kaynak bulunamadı |
| 409 | Conflict | Çakışma (örn: duplicate) |
| 422 | Unprocessable Entity | Doğrulama hatası |
| 429 | Too Many Requests | Rate limit aşıldı |
| 500 | Internal Server Error | Sunucu hatası |

### Standart Hata Yanıtı
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## Rate Limiting (Hız Sınırlama)

Sistem, `@nestjs/throttler` kullanarak rate limiting uygular:

```
TTL: 60 saniye
Limit: 100 istek/dakika
```

Rate limit aşıldığında:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## Dosya Yükleme Limitleri

| Dosya Tipi | Max Boyut | İzin Verilen Türler |
|------------|-----------|---------------------|
| Excel Import | 10 MB | .xlsx, .xls |
| Cevap Anahtarı | 10 MB | .pdf, .jpg, .jpeg, .png, .xlsx, .xls |
| Mesaj Eki | 10 MB | .pdf, .jpg, .jpeg, .png |
| Grup Kapak | 5 MB | .jpg, .jpeg, .png |
| Grup Dosya | 50 MB | Herhangi bir dosya |

---

## WebSocket / SSE (Server-Sent Events)

### Mesaj Akışı
```
GET /messages/stream
Authorization: Bearer <token>
```

SSE bağlantısı, okunmamış mesaj sayısını 3 saniyede bir gönderir:
```json
event: message
data: {"count": 5}
```

---

## Push Notifications (Web Push)

### Abonelik Akışı

1. **Public Key Al**:
```
GET /notifications/public-key
```

2. **Abone Ol**:
```
POST /notifications/subscribe
{
  "endpoint": "...",
  "p256dh": "...",
  "auth": "...",
  "userAgent": "..."
}
```

3. **Bildirim Tipleri**:
   - `NEW_MESSAGE` - Yeni mesaj
   - `EXAM_REMINDER` - Sınav hatırlatması
   - `GROUP_POST` - Grup gönderisi
   - `ACHIEVEMENT_UNLOCKED` - Başarım kazanımı
   - `STUDY_PLAN_ASSIGNED` - Çalışma planı ataması
   - `CUSTOM` - Özel bildirim

---

## Query Parameters ve Filtreleme

### Pagination (Sayfalama)

Çoğu liste endpoint'i pagination destekler:

```
GET /students?page=1&limit=20
GET /exams?page=1&limit=50
```

### Sıralama

```
GET /study/plans?sortBy=createdAt:desc
GET /exams?sortBy=date:asc
```

### Filtreleme

```
GET /students?gradeId=uuid&classId=uuid
GET /exams?type=TYT&gradeLevel=12
GET /study/plans?isTemplate=true&examType=TYT
```

### Arama

```
GET /students?search=Ahmet
GET /search?q=Ahmet
```

---

## Environment Variables (Çevre Değişkenleri)

| Değişken | Açıklama | Örnek |
|----------|----------|-------|
| `DATABASE_URL` | PostgreSQL bağlantı URL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | JWT imza anahtarı | `super-secret-key` |
| `JWT_EXPIRATION` | Token süresi | `7d` |
| `REDIS_URL` | Redis bağlantı URL | `redis://localhost:6379` |
| `VAPID_PUBLIC_KEY` | Web Push public key | `BIPUL12...` |
| `VAPID_PRIVATE_KEY` | Web Push private key | `R2Hk3L...` |
| `SMTP_HOST` | Email sunucu | `smtp.gmail.com` |
| `SMTP_PORT` | Email port | `587` |
| `SMTP_USER` | Email kullanıcı | `noreply@okul.edu.tr` |
| `SMTP_PASS` | Email şifre | `app-password` |
| `UPLOAD_DIR` | Dosya yükleme dizini | `./uploads` |
| `NODE_ENV` | Ortam | `development` / `production` |

---

## Önemli Notlar

1. **Soft Delete**: Bazı modeller soft delete kullanır (`deletedAt` alanı)
2. **Audit Trail**: Tüm değişiklikler `createdAt` ve `updatedAt` ile izlenir
3. **Multi-tenancy**: Her kayıt `schoolId` ile okul bazlı izole edilmiştir
4. **Role-based Access Control**: Tüm endpoint'ler rol bazlı korunmaktadır
5. **Data Validation**: Class-validator kullanılarak input validasyonu yapılır

---

## Swagger/OpenAPI Entegrasyonu

API dokümantasyonu Swagger UI üzerinden erişilebilir:

```
Development: http://localhost:3001/api/docs
```

Swagger, tüm endpoint'leri, DTO'ları ve şemaları otomatik olarak dökümante eder.

---

## Versiyonlama

API versiyonlama URL path kullanılarak yapılmaktadır:

```
/api/v1/...
```

Şu anda v1 aktif versiyondur.

---

## İletişim ve Destek

- **Proje**: Deneme Takip Sistemi
- **Son Güncelleme**: Mart 2026
- **Versiyon**: 1.0.0

---

*Bu dokümantasyon otomatik olarak oluşturulmuştur. Son güncelleme: 2026-03-03*

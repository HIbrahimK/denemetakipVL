# Multi-Tenancy (Çok Kiracılı) Mimari Rehberi

## Mevcut Yapı Analizi

Uygulamanız zaten **tek veritabanı + çoklu okul (single database, multi-tenant)** mimarisiyle tasarlanmış. Her okul aynı veritabanını paylaşır ancak veriler mantıksal olarak izole edilmiştir.

### Nasıl Çalışıyor?

```
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Veritabanı                    │
├─────────────────────────────────────────────────────────────┤
│  Okul A (schoolId: "uuid-a")                                │
│  ├─ Users                                                  │
│  ├─ Students                                               │
│  ├─ Exams                                                  │
│  └─ ...                                                    │
├─────────────────────────────────────────────────────────────┤
│  Okul B (schoolId: "uuid-b")                                │
│  ├─ Users                                                  │
│  ├─ Students                                               │
│  ├─ Exams                                                  │
│  └─ ...                                                    │
├─────────────────────────────────────────────────────────────┤
│  Okul C (schoolId: "uuid-c")                                │
│  ├─ Users                                                  │
│  ├─ Students                                               │
│  ├─ Exams                                                  │
│  └─ ...                                                    │
└─────────────────────────────────────────────────────────────┘
```

### Şema Yapısı

Her kritik modelde `schoolId` alanı bulunur:

```prisma
model User {
  id       String @id @default(uuid())
  email    String @unique
  schoolId String
  school   School @relation(fields: [schoolId], references: [id])
  // ...
}

model Student {
  id       String @id @default(uuid())
  schoolId String
  school   School @relation(fields: [schoolId], references: [id])
  // ...
}

model Exam {
  id       String @id @default(uuid())
  schoolId String
  school   School @relation(fields: [schoolId], references: [id])
  // ...
}
```

---

## Mevcut Çözüm: Tek Veritabanı + schoolId Filtreleme

### Avantajları ✅

| Avantaj | Açıklama |
|---------|----------|
| **Düşük Maliyet** | Tek veritabanı sunucusu, tek yedekleme stratejisi |
| **Kolay Bakım** | Şema güncellemesi bir kez yapılır, tüm okullar etkilenir |
| **Paylaşılabilir Veri** | Ortak kütüphane, kaynaklar tüm okullar tarafından kullanılabilir |
| **Merkezi Yönetim** | Super Admin tüm okulları tek panelden yönetebilir |
| **Ölçeklenebilirlik** | Yeni okul eklemek = sadece bir School kaydı oluşturma |

### Dezavantajları ⚠️

| Dezavantaj | Açıklama |
|------------|----------|
| **Veri Güvenliği Riski** | SQL injection ile başka okulun verisine erişim riski (uygulama katmanında önlemli) |
| **Performans** | Büyük veri hacminde tüm okullar etkilenebilir |
| **Yedekleme** | Tek okulun verisini geri yüklemek zor (tüm DB'yi geri yüklemek gerekir) |
| **Özelleştirme** | Okul bazlı şema değişikliği yapılamaz |

---

## Diğer Mimari Seçenekler

### 1. Veritabanı Başına Okul (Database-per-Tenant)

```
┌─────────────────────────────────────────────────┐
│  PostgreSQL Sunucusu                            │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  okul_a_db  │ │  okul_b_db  │ │ okul_c_db │ │
│  │  (Schema)   │ │  (Schema)   │ │  (Schema) │ │
│  └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────┘
```

**Prisma ile:**
```typescript
// Dinamik database URL
const databaseUrl = `postgresql://user:pass@localhost:5432/okul_${schoolId}`;
```

| Avantaj | Dezavantaj |
|---------|------------|
| Tam veri izolasyonu | Yüksek maliyet (birden fazla DB) |
| Okul bazlı yedekleme | Şema migrasyonu her DB için ayrı |
| Özelleştirilebilir şema | Karmaşık yönetim |

---

### 2. Schema Başına Okul (Schema-per-Tenant)

```
┌─────────────────────────────────────────────────┐
│  PostgreSQL Veritabanı: "deneme_takip"          │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ schema_a.*  │ │ schema_b.*  │ │ schema_c.*│ │
│  │   Tables    │ │   Tables    │ │  Tables   │ │
│  └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────┘
```

**Prisma ile:**
```prisma
// Her okul için ayrı schema
// schema_a.User, schema_b.User, ...
```

| Avantaj | Dezavantaj |
|---------|------------|
| Mantıksal izolasyon | Prisma'da zor destek |
| Tek veritabanı | Karmaşık schema yönetimi |
| Okul bazlı yedekleme | Sorgular daha kompleks |

---

### 3. Mevcut Çözüm: Satır Bazı İzolasyon (Row-Level Security)

Mevcut yapınız bu kategoridedir. Her kayıtta `schoolId` ile filtreleme yapılır.

**Prisma Middleware ile Otomatik Filtreleme:**
```typescript
// prisma.middleware.ts
prisma.$use(async (params, next) => {
  if (params.model && params.args) {
    // Otomatik olarak schoolId filtresi ekle
    const userSchoolId = getCurrentUserSchoolId();
    
    if (params.args.where) {
      params.args.where.schoolId = userSchoolId;
    } else {
      params.args.where = { schoolId: userSchoolId };
    }
  }
  return next(params);
});
```

---

## Mevcut Uygulamanızda Yeni Okul Ekleme

### 1. API ile Yeni Okul Oluşturma

```http
POST /schools
Content-Type: application/json
Authorization: Bearer <super-admin-token>

{
  "name": "Yeni Anadolu Lisesi",
  "code": "YAL2024",
  "appShortName": "YAL",
  "subdomainAlias": "yal",
  "domain": "yal.denemetakip.com",
  "address": "İstanbul, Türkiye",
  "phone": "0212 123 45 67"
}
```

### 2. Yeni Okul için Admin Kullanıcısı Oluşturma

```http
POST /auth/register
Content-Type: application/json
Authorization: Bearer <super-admin-token>

{
  "email": "admin@yal.edu.tr",
  "password": "securePass123",
  "firstName": "Mehmet",
  "lastName": "Yılmaz",
  "role": "SCHOOL_ADMIN",
  "schoolId": "yeni-okul-uuid"
}
```

### 3. Öğrencileri İçe Aktarma

```http
POST /students/import
Content-Type: multipart/form-data
Authorization: Bearer <school-admin-token>

file: <ogrenciler.xlsx>
```

---

## Güvenlik Önlemleri (Mevcut Yapı İçin)

### 1. Service Katmanında Filtreleme

```typescript
// Tüm servislerde schoolId kontrolü
async findAll(schoolId: string) {
  return this.prisma.exam.findMany({
    where: { schoolId }  // Zorunlu filtre
  });
}
```

### 2. Controller'da Doğrulama

```typescript
@Get(':id')
async findOne(@Param('id') id: string, @Request() req) {
  // Kullanıcının sadece kendi okulunun verisine erişimi
  return this.service.findOne(id, req.user.schoolId);
}
```

### 3. Prisma Row Level Security (PostgreSQL 9.5+)

```sql
-- Veritabanı seviyesinde güvenlik politikası
CREATE POLICY school_isolation ON "Exam"
  USING ("schoolId" = current_setting('app.current_school')::uuid);
```

---

## Öneriler

### Şu Anki Yapınız İçin (10-100 Okul)
✅ **Mevcut yapıyı koruyun** - Tek veritabanı + schoolId filtresi yeterlidir.

### Büyük Ölçek İçin (1000+ Okul)
🔄 **Hibrit yaklaşım:**
- Küçük okullar: Paylaşılan veritabanı
- Büyük okullar: Ayrı veritabanı (database-per-tenant)
- Super Admin: Cross-database sorgular için replica/read-only DB

### Veri Yedekleme Stratejisi

```bash
# Tüm veritabanını yedekle
docker exec postgres pg_dump -U user denemetakip > full_backup.sql

# Belirli bir okulun verisini yedekle (mantıksal)
docker exec postgres pg_dump -U user --where="schoolId='uuid'" denemetakip > school_backup.sql
```

---

## Karşılaştırma Tablosu

| Özellik | Tek DB + schoolId | DB Başına Okul | Schema Başına Okul |
|---------|-------------------|----------------|--------------------|
| **Veri İzolasyonu** | Mantıksal | Fiziksel | Mantıksal |
| **Maliyet** | $ | $$$ | $ |
| **Bakım Kolaylığı** | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| **Yedekleme** | Zor | Kolay | Orta |
| **Şema Güncelleme** | Tek sefer | Her DB | Her Schema |
| **Cross-Okul Sorgu** | Kolay | Zor | Orta |
| **Ölçeklenebilirlik** | 10k+ okul | Sınırsız | 100+ okul |

---

## Sonuç

**Mevcut uygulamanız zaten doğru mimariyle tasarlanmış!**

Tek yapmanız gereken:
1. Yeni okul için `POST /schools` ile kayıt oluşturma
2. O okul için admin kullanıcısı ekleme
3. Tüm diğer işlemler otomatik olarak `schoolId` ile izole edilir

Herhangi bir veritabanı değişikliğine gerek yok. 🎉

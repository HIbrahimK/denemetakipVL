# LANDING PAGE + SaaS MULTI-TENANT UYGULAMA PLANI

**Tarih:** 2026-03-04  
**Test Domain:** `2eh.net` (production: `denemetakip.net`)  
**Yerel Test:** `localhost:3000` (frontend), `localhost:3001` (backend), `localhost:3002` (landing)  
**Mimari Karar:** Tek Frontend + Middleware (subdomain tenant çözümleme), Tek Backend (schoolId izolasyonu)

---

## MEVCUT DURUM ÖZETİ

### Çalışan (✅)
- Backend API: 14+ modül, 100+ endpoint, Swagger docs
- Frontend SPA: 22+ dashboard route, PWA manifest dinamik (okul bazlı)
- Prisma schema: 35 model, `School.subdomainAlias` + `School.domain` unique alanları mevcut
- JWT'de `schoolId` taşınıyor, cookie-based auth
- PWA ikon üretimi (Sharp) backend'de mevcut
- Docker: PostgreSQL + Redis container'ları

### Eksik (❌)
- Subdomain/domain çözümleme (middleware yok)
- Backend `POST /schools` + `GET /schools/resolve` endpoint'leri
- Lisans sistemi (DB modeli + API + UI)
- Super admin backend entegrasyonu (tüm sayfalar mock data)
- Super admin kimlik doğrulama
- Landing page eksik sayfalar (/hakkimizda, /yardim, /gizlilik, /kosullar, /kvkk)
- Demo/örnek okul seed verileri
- Docker app container'ları + Nginx reverse proxy
- Form submission (iletişim, demo)

### Kritik Hatalar (🔴)
- Super admin panele kimse authentication olmadan erişebilir
- Super admin mobilde tamamen kırık (sidebar responsive değil)
- PWA tamamen bozuk (ikonlar yok, SW kayıtlı değil, cache.addAll fail)
- 11+ ölü link (footer, blog, giriş sayfası)
- Tüm formlar non-functional (demo, iletişim, okul oluşturma)
- 2 sayfa Navbar/Footer eksik (fiyatlandırma, özellikler)
- Fiyatlandırma verileri tutarsız (ana sayfa vs /fiyatlandirma)
- Next.js 15 params breaking change (blog düzenle sayfası)

---

## FAZ 1 — Backend Multi-Tenant Altyapı
**Süre:** ~3 gün | **Öncelik:** Kritik

### 1.1 Prisma Schema: Lisans Modelleri
**Dosya:** `backend/prisma/schema.prisma`

Yeni modeller:
```
enum LicenseStatus { ACTIVE, GRACE, EXPIRED, SUSPENDED }

model LicensePlan {
  id            String   @id @default(uuid())
  name          String   @unique  // "Başlangıç", "Profesyonel", "Kurumsal"
  maxStudents   Int      // -1 = sınırsız
  maxUsers      Int      // -1 = sınırsız
  maxStorage    Int      // MB cinsinden, -1 = sınırsız
  monthlyPrice  Float
  yearlyPrice   Float
  features      Json     // ek özellik flag'leri
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  licenses      SchoolLicense[]
}

model SchoolLicense {
  id          String        @id @default(uuid())
  schoolId    String
  school      School        @relation(fields: [schoolId], references: [id])
  planId      String
  plan        LicensePlan   @relation(fields: [planId], references: [id])
  status      LicenseStatus @default(ACTIVE)
  startDate   DateTime
  endDate     DateTime
  autoRenew   Boolean       @default(false)
  customPrice Float?        // Kurumsal özel fiyat
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  @@index([schoolId])
  @@index([status])
}
```

School modeline ekle:
```
model School {
  ...mevcut alanlar...
  licenses    SchoolLicense[]
}
```

Migration: `npx prisma migrate dev --name add-license-system`

---

### 1.2 Backend: Okul Çözümleme Endpoint'i (Public)
**Dosya:** `backend/src/schools/schools.controller.ts`
**Dosya:** `backend/src/schools/schools.service.ts`

Yeni endpoint:
- `GET /schools/resolve?host=scal.2eh.net` → Public, auth gerektirmez
  - Hostname'den subdomain çıkar: `scal`
  - Önce `subdomainAlias === 'scal'` ile ara
  - Bulamazsa `domain === 'scal.2eh.net'` ile ara (custom domain desteği)
  - Response: `{ id, name, appShortName, code, logoUrl, subdomainAlias, domain, primaryColor?, secondaryColor? }`
  - Bulunamazsa: `404 School not found`

Yeni DTO: `ResolveSchoolDto` (response tipi)

---

### 1.3 Backend: Okul CRUD (Super Admin)
**Dosya:** `backend/src/schools/schools.controller.ts`

Yeni endpoint'ler (SUPER_ADMIN rolü gerekli):
- `POST /schools` → Yeni okul oluştur
  - Body: `{ name, code, subdomainAlias, domain?, adminEmail, adminFirstName, adminLastName, adminPassword, logoFile?, primaryColor?, secondaryColor?, licensePlanId, licenseEndDate }`
  - İşlem: School + Admin User + SchoolLicense tek transaction
  - Logo varsa: PWA ikonları üret (mevcut Sharp altyapısı)
- `GET /schools/all` → Tüm okullar + lisans + istatistik
  - Response: `{ schools: [{ ...school, studentCount, userCount, examCount, license }] }`
- `GET /schools/:id/stats` → Detaylı okul istatistikleri
- `PATCH /schools/:id` → Okul güncelle (mevcut, genişlet)
- `DELETE /schools/:id` → Soft delete
- `PATCH /schools/:id/license` → Lisans güncelle/uzat

---

### 1.4 Backend: Login Okul Kapsamına Alma
**Dosya:** `backend/src/auth/auth.service.ts`
**Dosya:** `backend/src/auth/auth.controller.ts`

Değişiklik:
- Login endpoint'lerine opsiyonel `schoolId` veya `X-School-Id` header desteği ekle
- `loginSchool(email, password, schoolId?)`: schoolId varsa kullanıcının o okula ait olduğunu doğrula
- SUPER_ADMIN: schoolId kontrolü bypass
- Cookie domain: `.2eh.net` (env'den konfigüre edilebilir, prod'da `.denemetakip.net`)

---

### 1.5 Backend: Lisans Middleware
**Dosya:** `backend/src/common/guards/license.guard.ts` (yeni)

NestJS Guard:
- Her authenticated request'te JWT'den schoolId al
- SchoolLicense tablosundan aktif lisans kontrol et
- ACTIVE → geç
- GRACE → `X-License-Warning: grace` header ekle
- EXPIRED → POST/PATCH/DELETE engelle, GET izin ver (read-only mod)
- SUSPENDED → tüm istekleri engelle
- SUPER_ADMIN exempt

---

### 1.6 Backend: Lisans Plan Seed
**Dosya:** `backend/prisma/seed-license-plans.ts` (yeni)

3 varsayılan plan:
- Başlangıç: 100 öğrenci, 10 kullanıcı, 1GB, ₺499/ay, ₺4.790/yıl
- Profesyonel: 500 öğrenci, 50 kullanıcı, 10GB, ₺999/ay, ₺9.590/yıl  
- Kurumsal: sınırsız, sınırsız, 100GB, ₺0 (özel teklif)

---

## FAZ 2 — Frontend Middleware + Tenant Çözümleme
**Süre:** ~2 gün | **Öncelik:** Kritik

### 2.1 Frontend: middleware.ts Oluştur
**Dosya:** `frontend/src/middleware.ts` (mevcut `proxy.ts`'yi değiştir)

İşlev:
1. Request `Host` header'ından hostname çıkar
2. Yerel test: `localhost:3000` → `DEFAULT_SCHOOL_ID` env'den al (veya ilk okul)
3. Subdomain: `scal.2eh.net` → subdomain = `scal`
4. Custom domain: `scaldenemetakip.net` → tam domain ile çözümle
5. Backend'e `GET /schools/resolve?host={hostname}` çağrısı (edge-compatible fetch)
6. Çözümlenen school bilgisini `X-School-Id` ve `X-School-Code` response header'larına set et
7. Ayrıca `x-school-data` cookie'ye JSON olarak yaz (client-side erişim için)
8. Okul bulunamazsa → `/not-found` sayfasına yönlendir
9. Middleware'de 30sn TTL'li in-memory cache (Map) — her request'te backend çağrısı yapma
10. Mevcut JWT/role kontrollerini koru (proxy.ts'deki mantık)

Matcher: Tüm route'lar (`/((?!_next|api|favicon|icons|pwa-icons).*)`)

---

### 2.2 SchoolContext Güncelle
**Dosya:** `frontend/src/contexts/school-context.tsx`

Değişiklik:
- Cookie'den `x-school-data` oku (middleware'den gelen)
- Login olmamış kullanıcılar: cookie'deki school bilgisini kullan
- Login olmuş kullanıcılar: JWT'deki schoolId (mevcut davranış)
- Fallback zinciri: cookie → JWT → localStorage → API çağrısı

---

### 2.3 Login Sayfalarını Okul-Aware Yap
**Dosyalar:** `frontend/src/app/login/school/page.tsx`, `login/student/page.tsx`, `login/parent/page.tsx`

Değişiklik:
- SchoolContext'ten okul adı ve logoyu al, login sayfasında göster
- Login isteğine `X-School-Id` header'ı ekle
- Yanlış okula ait kullanıcı girişinde anlamlı hata mesajı

---

### 2.4 PWA Manifest Pre-Login Desteği
**Dosya:** `frontend/src/app/manifest.webmanifest/route.ts`

Değişiklik:
- JWT yoksa → request header'larından veya cookie'den `X-School-Id` oku
- `start_url`: `https://scal.2eh.net/` (subdomain'e göre dinamik)
- `scope`: aynı domain

**Dosya:** `frontend/public/sw.js`  
- Dinamik ikon path'lerini destekle
- School-specific cache key

---

### 2.5 next.config.mjs Güncelle
**Dosya:** `frontend/next.config.mjs`

- `images.remotePatterns`: backend domain'i ekle
- Environment variables: `NEXT_PUBLIC_ROOT_DOMAIN=2eh.net`, `BACKEND_URL=https://2eh.net/api`

---

## FAZ 3 — Landing Page Kritik Hata Düzeltmeleri
**Süre:** ~3 gün | **Öncelik:** Yüksek

### 3.1 Super Admin Mobil Responsive (🔴 Kritik)
**Dosya:** `landing-page/app/super-admin/layout.tsx`

Sorun: Sidebar `fixed w-64` + content `ml-64` → mobilde tamamen kırık
Çözüm:
- Mobil hamburger menü ekle
- Sidebar: mobilde `translate-x` ile gizle, hamburger ile aç
- Overlay backdrop ekle
- Content: mobilde `ml-0`
- Breakpoint: `lg:ml-64 lg:block` deseni
- `useState` ile sidebar open/close state
- Dışa tıklama ile kapanma

---

### 3.2 Super Admin Authentication (🔴 Kritik)
**Dosya:** `landing-page/app/giris/page.tsx`

Sorun: `handleSubmit` credentials kontrol etmeden yönlendiriyor
Çözüm:
- Backend'e `POST /auth/login/school` çağrısı yap
- Sadece `SUPER_ADMIN` rolü kabul et
- JWT cookie'yi set et
- Hata durumunda mesaj göster
- Rate limiting UI (5 başarısız deneme sonrası bekleme)

**Dosya:** `landing-page/app/super-admin/layout.tsx`
- Auth guard: cookie'den JWT kontrol et
- Geçersiz/eksik token → `/giris`'e yönlendir
- Logout handler ekle (cookie sil + yönlendir)

**Dosya:** `landing-page/middleware.ts` (yeni)
- `/super-admin/*` route'larını koru
- JWT cookie yoksa → `/giris`'e redirect

---

### 3.3 PWA Düzeltmeleri (🔴 Kritik)
**Dosya:** `landing-page/public/manifest.json`
- Gerçek ikon dosyaları oluştur veya placeholder SVG→PNG dönüşümü yap
- `purpose: "maskable any"` ekle

**Dosya:** `landing-page/app/layout.tsx`
- `<link rel="manifest" href="/manifest.json">` ekle
- `<meta name="theme-color" content="#3b82f6">` ekle
- `<link rel="icon" href="/favicon.ico">` ekle

**Dosya:** `landing-page/public/sw.js`
- Var olmayan ikon referanslarını düzelt
- Cache boyut limiti ekle
- Admin sayfalarını cache'leme (güvenlik)

---

### 3.4 Ölü Linkleri Düzelt
Eksik sayfaları oluştur:

| Sayfa | Dosya | İçerik |
|-------|-------|--------|
| `/hakkimizda` | `app/hakkimizda/page.tsx` | Ekip tanıtımı, misyon/vizyon, iletişim |
| `/yardim` | `app/yardim/page.tsx` | Yardım merkezi, kategoriler, arama, popüler makaleler |
| `/gizlilik` | `app/gizlilik/page.tsx` | Gizlilik politikası metni |
| `/kosullar` | `app/kosullar/page.tsx` | Kullanım koşulları metni |
| `/kvkk` | `app/kvkk/page.tsx` | KVKK aydınlatma metni |
| `/kariyer` | `app/kariyer/page.tsx` | Kariyer sayfası (basit) |
| `/sifremi-unuttum` | `app/sifremi-unuttum/page.tsx` | Şifre sıfırlama formu |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Blog detay sayfası |

Ayrıca:
- `app/not-found.tsx` → Özel 404 sayfası
- `app/loading.tsx` → Genel loading skeleton
- `app/error.tsx` → Genel error boundary

---

### 3.5 Navbar/Footer Eksik Sayfalar
**Dosya:** `landing-page/app/fiyatlandirma/page.tsx`
- Navbar ve Footer component'lerini import et ve ekle

**Dosya:** `landing-page/app/ozellikler/page.tsx`
- Navbar ve Footer component'lerini import et ve ekle
- Gereksiz `"use client"` kaldır

---

### 3.6 Fiyatlandırma Tutarsızlığı
**Dosya:** `landing-page/components/sections/pricing.tsx` (ana sayfa pricing section)
**Dosya:** `landing-page/app/fiyatlandirma/page.tsx`

Sorun: Başlangıç planı ana sayfada "500 öğrenci, 10 sınav/ay", fiyatlandırma sayfasında "100 öğrenci"
Çözüm: Her iki yerde aynı veriyi kullan → `lib/constants.ts`'de plan verilerini merkezi tanımla

---

### 3.7 Copyright Yılı
**Dosya:** `landing-page/app/giris/page.tsx`
- Hardcoded "2024" → `new Date().getFullYear()` ile dinamik yap

---

## FAZ 4 — Landing Page Form Entegrasyonu + Eksik Sayfalar
**Süre:** ~2 gün | **Öncelik:** Yüksek

### 4.1 İletişim Formu
**Dosya:** `landing-page/app/iletisim/page.tsx`

- `"use client"` ekle
- `useState` ile form state
- `handleSubmit`: Backend'e `POST /contact` veya email servisi çağrısı
- CSRF: Next.js server action veya API route kullan
- Validation: Zod schema (ad, email, konu, mesaj zorunlu)
- Loading state + success/error feedback
- Label-input `htmlFor`/`id` bağlantıları düzelt
- Responsive grid: `grid-cols-1 sm:grid-cols-2`
- Harita placeholder'ı kaldır veya gerçek embed ekle

### 4.2 Demo Başvuru Formu
**Dosya:** `landing-page/app/demo/page.tsx`

- `"use client"` ekle
- Form handler: Backend'e `POST /demo-requests` veya email
- Validation: Zod schema
- Loading + success/error feedback
- Label/input erişilebilirlik düzelt
- Responsive grid düzelt: `grid-cols-1 sm:grid-cols-2`

### 4.3 Blog Sayfası İşlevsellik
**Dosya:** `landing-page/app/blog/page.tsx`

- `"use client"` ekle
- Arama, filtreleme, sayfalama state'leri
- İngilizce excerpt'leri Türkçe'ye çevir
- Blog detay sayfası (`/blog/[slug]`) oluştur

### 4.4 Okullar Sayfası İşlevsellik
**Dosya:** `landing-page/app/okullar/page.tsx`

- `"use client"` ekle
- Arama, filtreleme, sayfalama state'leri
- Backend'den okul listesi çek (`GET /schools/all` public versiyonu)

---

## FAZ 5 — Super Admin Backend Entegrasyonu
**Süre:** ~3 gün | **Öncelik:** Yüksek

### 5.1 Super Admin API Client
**Dosya:** `landing-page/lib/api.ts` (yeni)

- Merkezi fetch wrapper: base URL = `process.env.NEXT_PUBLIC_API_URL` (default: `https://2eh.net/api`)
- Cookie-based auth (credentials: 'include')
- Error handling + retry
- TypeScript tipler

### 5.2 Dashboard Backend Entegrasyonu
**Dosya:** `landing-page/app/super-admin/page.tsx`

- Mock data → API çağrıları:
  - `GET /schools/all` → toplam okul, öğrenci, deneme sayıları
  - Son eklenen okullar listesi
  - Sistem uyarıları (lisansı bitmek üzere olanlar)
- "Tümünü Gör" butonlarına href ekle

### 5.3 Okul Yönetimi Backend Entegrasyonu
**Dosya:** `landing-page/app/super-admin/okullar/page.tsx`

- Mock data → `GET /schools/all` API çağrısı
- Arama, filtreleme, sayfalama çalışır hale getir
- Edit butonu → `/super-admin/okullar/[id]` navigasyonu
- Delete butonu → onay dialog + `DELETE /schools/:id`
- Pagination → backend'den sayfalı veri

**Dosya:** `landing-page/app/super-admin/okullar/yeni/page.tsx`

- Wizard `handleSubmit` → `POST /schools` API çağrısı
- Form validation (her adımda zorunlu alan kontrolü)
- Logo upload: `<input type="file">` + preview
- Subdomain availability kontrolü (backend'e sorgu)
- Custom domain desteği (subdomain VEYA custom domain seçimi)
- Başarılı oluşturma → okul listesine yönlendir + toast

**Dosya:** `landing-page/app/super-admin/okullar/[id]/page.tsx`

- Okul detay → `GET /schools/:id/stats` API çağrısı
- Düzenleme → `PATCH /schools/:id`

### 5.4 Kullanıcı Yönetimi
**Dosya:** `landing-page/app/super-admin/kullanicilar/page.tsx`

- Mock data → backend API
- Modal focus trap + `role="dialog"` + `aria-modal="true"`
- Tablo: mobilde `overflow-x-auto` wrapper
- Şifre alanı: strength indicator

### 5.5 Ticket Yönetimi
**Dosya:** `landing-page/app/super-admin/ticketler/page.tsx`

- Mock data → backend API (Faz sonrası, ticket backend hazır olunca)
- Reply handler çalışır hale getir
- Kapat/Yeniden Aç butonları çalışır hale getir
- Mobilde back button ekle

### 5.6 Eksik Super Admin Sayfaları
Yeni sayfalar:
- `/super-admin/lisanslar/page.tsx` → Lisans yönetimi (plan CRUD, okul lisansları, süre uzatma)
- `/super-admin/raporlar/page.tsx` → Platform istatistikleri (grafik: okul/öğrenci büyüme, aktif kullanım)
- `/super-admin/ayarlar/page.tsx` → Platform ayarları (domain config, email şablonları, genel konfigürasyon)

---

## FAZ 6 — Demo + Örnek Okul Kurulumu
**Süre:** ~1 gün | **Öncelik:** Yüksek

### 6.1 Demo Okul Seed
**Dosya:** `backend/prisma/seed-demo-school.ts` (yeni)

İçerik:
- Okul: `name: "Demo Okul"`, `code: "demo"`, `subdomainAlias: "demo"`, logo (varsayılan), tema: mavi
- Admin: `email: "admin@demo.2eh.net"`, `password: "demo123"`, `role: SCHOOL_ADMIN`
- 3 öğretmen (Matematik, Fen, Türkçe)
- 3 sınıf (9-A, 10-A, 11-A), her birinde 10 öğrenci = 30 öğrenci
- 10 veli (her öğrenciye 1 veli, bazıları paylaşımlı)
- 5 deneme sınavı + rastgele sonuçlar
- Birkaç mesaj örneği
- 1-2 çalışma planı
- Lisans: Profesyonel plan, 1 yıl süreli

### 6.2 SCAL Okul Seed
**Dosya:** `backend/prisma/seed-scal-school.ts` (yeni)

İçerik:
- Okul: `name: "SCAL Eğitim Kurumu"`, `code: "scal"`, `subdomainAlias: "scal"`, farklı logo/renk
- Admin: `email: "admin@scal.2eh.net"`, `password: "scal123"`
- 2 öğretmen, 2 sınıf, 15 öğrenci, 5 veli
- 3 deneme sınavı + sonuçlar
- Lisans: Başlangıç plan, 6 ay süreli

### 6.3 package.json Script Güncellemesi
**Dosya:** `backend/package.json`

Yeni scriptler:
```json
"seed:license-plans": "ts-node prisma/seed-license-plans.ts",
"seed:demo-school": "ts-node prisma/seed-demo-school.ts",
"seed:scal-school": "ts-node prisma/seed-scal-school.ts",
"seed:all-schools": "npm run seed:license-plans && npm run seed:demo-school && npm run seed:scal-school"
```

---

## FAZ 7 — Docker + Nginx Reverse Proxy
**Süre:** ~2 gün | **Öncelik:** Orta

### 7.1 Backend Dockerfile
**Dosya:** `backend/Dockerfile` (yeni)

- Node 20 Alpine base
- `npm ci --omit=dev`
- `npx prisma generate`
- `npm run build`
- CMD: `node dist/main.js`
- Port: 3001

### 7.2 Frontend Dockerfile
**Dosya:** `frontend/Dockerfile` (yeni)

- Node 20 Alpine base
- `npm ci`
- `npm run build`
- CMD: `npm start`
- Port: 3000
- ENV: `NEXT_PUBLIC_ROOT_DOMAIN`, `BACKEND_URL`

### 7.3 Landing Page Dockerfile
**Dosya:** `landing-page/Dockerfile` (yeni)

- Node 20 Alpine base
- `npm ci`
- `npm run build`
- CMD: `npm start`
- Port: 3002

### 7.4 Nginx Konfigürasyonu
**Dosya:** `nginx/nginx.conf` (yeni)

```nginx
# Ana domain → Landing Page
server {
    listen 80;
    server_name 2eh.net www.2eh.net;
    
    location /api {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://landing:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Wildcard subdomain → Frontend
server {
    listen 80;
    server_name *.2eh.net;
    
    location /api {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 7.5 Docker Compose Güncelleme
**Dosya:** `docker-compose.yml`

Yeni service'ler:
- `backend`: build context `./backend`, port 3001, depends_on: postgres, redis
- `frontend`: build context `./frontend`, port 3000, depends_on: backend
- `landing`: build context `./landing-page`, port 3002, depends_on: backend
- `nginx`: nginx:alpine, port 80/443, depends_on: backend, frontend, landing
- Volume: `nginx/nginx.conf:/etc/nginx/conf.d/default.conf`

### 7.6 Yerel Geliştirme İçin hosts Dosyası
**Dosya:** `dosyalar/YEREL_TEST_KURULUM.md` (yeni, döküman)

Windows `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1   2eh.net
127.0.0.1   demo.2eh.net
127.0.0.1   scal.2eh.net
```

Veya Docker Compose + Nginx ile tüm subdomain'ler otomatik çalışır.

---

## FAZ 8 — Erişilebilirlik + Mobil Kalite İyileştirmeleri
**Süre:** ~2 gün | **Öncelik:** Orta

### 8.1 Form Erişilebilirlik (Tüm Sayfalar)
Tüm form'larda:
- `<label htmlFor="fieldId">` + `<input id="fieldId">` eşleştirmesi
- `aria-required="true"` zorunlu alanlarda
- `aria-describedby` ile hata mesajları bağlantısı
- `aria-invalid` geçersiz girişlerde

Etkilenen dosyalar:
- `app/demo/page.tsx`
- `app/iletisim/page.tsx`
- `app/giris/page.tsx`
- `app/super-admin/okullar/yeni/page.tsx`
- `app/super-admin/kullanicilar/page.tsx`

### 8.2 Modal Erişilebilirlik
**Dosya:** `app/super-admin/kullanicilar/page.tsx`

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- Focus trap (Tab ile modal dışına çıkamama)
- Escape tuşu ile kapatma
- Açılınca ilk input'a focus

### 8.3 Navbar Erişilebilirlik
**Dosya:** `components/layout/navbar.tsx`

- Mobil menü butonu: `aria-expanded={isOpen}`
- Mobil nav: `role="navigation"` + `aria-label="Ana menü"`
- Aktif sayfa göstergesi (current page highlighting)

### 8.4 Responsive Düzeltmeler

| Dosya | Sorun | Çözüm |
|-------|-------|-------|
| `app/demo/page.tsx` | `grid-cols-2` mobilde sıkışıyor | `grid-cols-1 sm:grid-cols-2` |
| `app/iletisim/page.tsx` | `grid-cols-2` mobilde sıkışıyor | `grid-cols-1 sm:grid-cols-2` |
| `app/fiyatlandirma/page.tsx` | `scale-105` taşma | `lg:scale-105` ve `overflow-hidden` |
| `super-admin/kullanicilar/page.tsx` | Tablo taşma | `overflow-x-auto` wrapper |
| `super-admin/okullar/yeni/page.tsx` | Stepper taşma | Mobilde dikey stepper |
| `super-admin/blog/yeni/page.tsx` | `grid-cols-3` taşma | `grid-cols-1 lg:grid-cols-3` |
| `super-admin/blog/duzenle/[id]/page.tsx` | `grid-cols-3` taşma | `grid-cols-1 lg:grid-cols-3` |
| `super-admin/ticketler/page.tsx` | Detail panel mobilde back yok | Back button ekle |

### 8.5 Güvenlik Header'ları
**Dosya:** `landing-page/next.config.ts`

```typescript
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
    ],
  }];
}
```

### 8.6 Next.js 15 Breaking Change Düzelt
**Dosya:** `landing-page/app/super-admin/blog/duzenle/[id]/page.tsx`

```typescript
// YANLIŞ (Next.js 15'te hata verir):
export default function EditBlogPost({ params }: { params: { id: string } }) {
  const postId = params.id;

// DOĞRU:
export default async function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
```

---

## FAZ 9 — Veri Merkezi + Kalite
**Süre:** ~1 gün | **Öncelik:** Düşük

### 9.1 Merkezi Sabitler
**Dosya:** `landing-page/lib/constants.ts` (yeni)

- Fiyatlandırma planları verisi (tek kaynak)
- Site metadata (denemetakip.net branding)
- Navigasyon linkleri
- Sosyal medya linkleri

### 9.2 Gereksiz "use client" Kaldırma
- `app/fiyatlandirma/page.tsx` → kaldır
- `app/ozellikler/page.tsx` → kaldır

### 9.3 Kullanılmayan Import'lar Temizle
- `super-admin/kullanicilar/page.tsx`: `Mail`, `Phone` kaldır
- `super-admin/ticketler/page.tsx`: `XCircle`, `Clock`, `AlertCircle` kaldır

### 9.4 next.config.ts Image Optimization
**Dosya:** `landing-page/next.config.ts`

- `images.unoptimized: true` kaldır (Next.js optimization aktifleştir)
- `images.domains` → `images.remotePatterns` geçişi

---

## DOMAIN YAPILANDIRMASI

### Test Ortamı (2eh.net)
```
2eh.net              → Landing Page (Nginx → landing:3002)
demo.2eh.net         → Frontend + Demo Okul (Nginx → frontend:3000)
scal.2eh.net         → Frontend + SCAL Okul (Nginx → frontend:3000)  
*.2eh.net            → Frontend + Dinamik Okul (Nginx → frontend:3000)
2eh.net/api/*        → Backend API (Nginx → backend:3001)
*.2eh.net/api/*      → Backend API (Nginx → backend:3001)
```

### Production (denemetakip.net) — gelecekte
```
denemetakip.net      → Landing Page
demo.denemetakip.net → Demo Okul
[kod].denemetakip.net → Okul Uygulaması
[custom-domain.com]  → Okul Uygulaması (custom domain)
*/api/*              → Backend API
```

### Yerel Geliştirme
```
localhost:3000       → Frontend (DEFAULT_SCHOOL_ID env ile)
localhost:3001       → Backend API
localhost:3002       → Landing Page
# veya hosts dosyası ile:
demo.2eh.net:3000    → Frontend + Demo Okul
scal.2eh.net:3000    → Frontend + SCAL Okul
2eh.net:3002         → Landing Page
```

---

## ENVIRONMENT VARIABLES

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5433/denemetakip
REDIS_URL=redis://localhost:6379
JWT_SECRET=...
CORS_ORIGINS=https://2eh.net,https://*.2eh.net
COOKIE_DOMAIN=.2eh.net
ROOT_DOMAIN=2eh.net
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://2eh.net/api
NEXT_PUBLIC_ROOT_DOMAIN=2eh.net
BACKEND_INTERNAL_URL=http://backend:3001   # Docker içi
DEFAULT_SCHOOL_ID=                          # Yerel dev için (opsiyonel)
```

### Landing Page (.env.local)
```
NEXT_PUBLIC_API_URL=https://2eh.net/api
NEXT_PUBLIC_SITE_NAME=Deneme Takip Sistemi
NEXT_PUBLIC_SITE_DOMAIN=denemetakip.net
```

---

## UYGULAMA SIRASI (ÖNCELİK)

| # | Faz | Tahmini Süre | Bağımlılık |
|---|-----|-------------|------------|
| 1 | Faz 1: Backend Multi-Tenant | 3 gün | - |
| 2 | Faz 3: Landing Page Kritik Hatalar | 3 gün | - |
| 3 | Faz 2: Frontend Middleware | 2 gün | Faz 1 |
| 4 | Faz 6: Demo + SCAL Okul Seed | 1 gün | Faz 1 |
| 5 | Faz 4: Form Entegrasyonu | 2 gün | Faz 1 |
| 6 | Faz 5: Super Admin Entegrasyon | 3 gün | Faz 1 |
| 7 | Faz 7: Docker + Nginx | 2 gün | Faz 1-6 |
| 8 | Faz 8: Erişilebilirlik + Mobil | 2 gün | Faz 3 |
| 9 | Faz 9: Kalite İyileştirmeleri | 1 gün | Faz 3 |
| **TOPLAM** | | **~19 gün** | |

---

## DOĞRULAMA / TEST

1. `demo.2eh.net` → Demo Okul login sayfası (logo + ad görünür)
2. `scal.2eh.net` → SCAL login sayfası (farklı logo + ad)
3. `2eh.net` → Landing page ("Deneme Takip Sistemi" branding)
4. PWA: `demo.2eh.net`'te "Ana Ekrana Ekle" → "Demo Okul" adı + logosu
5. PWA: `scal.2eh.net`'te "Ana Ekrana Ekle" → "SCAL Eğitim Kurumu" adı + logosu
6. Super admin: `2eh.net/giris` → gerçek kimlik doğrulama
7. Super admin: yeni okul oluştur → subdomain ata → subdomain'den erişim
8. Tenant izolasyonu: Demo Okul öğrencisi SCAL verilerine erişemez
9. Lisans: süresi bitmiş okul → yazma işlemi engellenir
10. Mobil: super admin sidebar responsive çalışır
11. Form: iletişim/demo formları submit edilir, feedback gösterilir
12. Tüm footer linkleri çalışır (gizlilik, KVKK, koşullar vs.)

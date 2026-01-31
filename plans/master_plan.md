# 🧭 DENEME TAKİP - MASTER PLAN

## 🧭 FAZ 0 – ÜRÜN & TEKNİK STRATEJİ (2–3 Hafta)

### 0.1 Ürün Tanımı (Netleştir)
**Ana Problem:**
- Okullar Excel’de boğuluyor
- Öğrenci sonuç görüyor ama ne çalışacağını bilmiyor

**Çözümün:**
- Excel kadar detaylı
- Ama otomatik analiz + öneri üreten sistem

### 0.2 Hedef Roller
- Super Admin (sen)
- Okul Admin
- Öğretmen
- Öğrenci
- Veli

### 0.3 Teknoloji Kararları (Son Hâl)
**Backend:**
- NestJS (TypeScript)
- Prisma ORM
- PostgreSQL 16
- Redis
- BullMQ (Excel import)

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- AG-Grid (büyük tablolar)
- Recharts

**DevOps:**
- Docker Compose
- Nginx
- PM2
- Sentry

**Export / Import:**
- ExcelJS
- pdf-make / Puppeteer

## ⚙️ FAZ 1 – VERİ MODELİ & BACKEND TEMELİ (5–6 Hafta)

### 1.1 Prisma Şeması (Senin Excel Gerçeğine Uygun)
- [x] Exam
- [x] ExamAttempt
- [x] ExamLessonResult
- [x] ExamScore
- [x] Lesson (examType bazlı)
👉 Bu aşamada tamamlandı.

### 1.2 Multi-Tenant Yapı
- Her okul = tenant
- `tenant_id` her tabloda
- RLS veya middleware bazlı izolasyon

### 1.3 Auth & Yetkilendirme
- JWT
- Role-based access
- Öğrenci sadece kendi sonuçlarını görür

## 📥 FAZ 2 – EXCEL IMPORT MOTORU (6–7 Hafta)
*Bu proje Excel Import kalitesiyle satılır.*

### 2.1 Excel Import Pipeline
1. **Upload** → 2. **Parse** → 3. **Validate** → 4. **Preview** → 5. **Confirm** → 6. **Queue** → 7. **Commit**

### 2.2 AYT / TYT / LGS Import Servisleri
- AYT: Sabit 13 ders
- TYT: Sabit dersler
- LGS: Sabit dersler
- CUSTOM: Sınavlar dinamik

### 2.3 Hata Yönetimi
- Satır bazlı hata
- Hücre bazlı hata
- “Excel hata raporu indir”

## 📊 FAZ 3 – RAPOR & DASHBOARD ALTYAPISI (7–8 Hafta)

### 3.1 Okul & Öğretmen Raporları
- Deneme bazlı tablo
- Sınıf karşılaştırması
- Ders bazlı ortalamalar
- AYT SAY / EA / SOZ ayrı

### 3.2 Büyük Tablolar (AG-Grid)
- 50+ kolon
- Virtualization
- Server-side filter
- Export backend job

### 3.3 PDF Raporlar
- Okul logosu
- Grafikler
- Öğrenciye özel çıktı

## 🧑‍🎓 FAZ 4 – ÖĞRENCİ ODAKLI MODÜLLER (EN ÖNEMLİ FAZ) (8–10 Hafta)
*Burası seni rakiplerden ayırır.*

### 🔌 Eklenti 1 – Akıllı Ders Analizi
- Öğrencinin son 5 denemesini inceler
- Zayıf dersleri çıkarır
- Net düşüş trendini gösterir
- **Grafik:** Ders bazlı net trend

### 🔌 Eklenti 2 – “Ne Çalışmalıyım?” Motoru
- Zayıf ders → konu önerisi
- Son deneme ağırlıklı öneri
- Haftalık çalışma listesi

### 🔌 Eklenti 3 – Günlük Çalışma Takibi
- Öğrenci: "Çalıştım ✔", "Bitirdim ✔"
- Öğretmen: Kim çalışyor kim çalışmıyor görür

### 🔌 Eklenti 4 – Motivasyon & Hedef Sistemi
- Hedef net / puan
- Hedef–gerçekleşen farkı
- Haftalık mesaj

### 🔌 Eklenti 3 – AI Destekli Yorum (Opsiyonel)
- “Matematik netlerin düşüyor çünkü …”
- “Bu hafta şu konulara odaklan”
- 📌 Veri anonim
- 📌 Kişisel veri gönderilmez

## 📱 FAZ 5 – MOBİL & BİLDİRİMLER (4–5 Hafta)

### 5.1 PWA
- Push bildirim
- Offline sonuç görüntüleme

### 5.2 Veli Bildirimleri
- Yeni deneme yüklendi
- Net değişimi

## 🔐 FAZ 6 – LİSANSLAMA & SATIŞ (3–4 Hafta)

### 6.1 Lisanslama
- Domain + tenant
- Öğrenci sayısı limiti
- Süreli lisans

### 6.2 Paketler
- **Basic:** Deneme + rapor
- **Pro:** Öğrenci modülleri
- **Premium:** AI + karşılaştırma

## 🚢 FAZ 7 – DEPLOYMENT & BAKIM (2–3 Hafta)
- Tek komut kurulum
- Backup
- Monitoring
- Loglama

## 🎯 PROJENİN GERÇEK GÜCÜ NEREDE?
- [x] Excel gerçeğini doğru okuman
- [x] AYT–TYT–LGS ayrımini doğru modellemen
- [ ] Öğrenciye “ne çalışacağını” söylemen
- [ ] Okula rapor, öğrenciye yol haritası sunman

---
**SON SÖZ (SAMİMİ)**
Bu proje basit bir deneme takip yazılımı değil, otomatik analiz ve öneri üreten bütünsel bir eğitim rehberidir.

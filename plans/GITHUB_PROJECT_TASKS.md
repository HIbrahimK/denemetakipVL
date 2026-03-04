# GitHub Projects İçin Görev Listesi

Bu dosya, MASTER_PLAN_V3_KAPSAMLI.md'deki tüm epic ve taskların GitHub Projects'a eklenmesi için hazırlanmıştır.

---

## Milestones (Kilometre Taşları) - Önce Bunları Oluşturun

| Başlık | Açıklama | Bitiş Tarihi |
|--------|----------|--------------|
| Faz 0 - Hazırlık | Backlog kilitleme, RFC, veri modeli onayı | 2026-03-01 |
| Faz 1 - Güvenlik + Stabilizasyon | H.1 tamamlanır, bug fix, regression test | 2026-03-22 |
| Faz 2 - SaaS Core + Landing Ayrımı | Epic A + C çekirdek, domain/subdomain beta | 2026-04-19 |
| Faz 3 - Installer + Öğrenci Üretkenlik | Epic B + D teslim, pomodoro/streak beta | 2026-05-17 |
| Faz 4 - Puan/Rehberlik | Epic E teslim, üniversite/LGS hedef modülü | 2026-06-14 |
| Faz 5 - Ticket + Üst Panel | Epic G teslim, kullanım istatistikleri | 2026-07-12 |
| Faz 6 - Rapor 2.0 + Performans | Epic F + I kritik, RC, yük testleri | 2026-08-02 |

---

## Labels (Etiketler) - Önce Bunları Oluşturun

### Epic Etiketleri:
- `epic:A-saas-core` - Lisanslama + Domain/Subdomain
- `epic:B-installer` - WordPress benzeri hazır kurulum
- `epic:C-landing` - Ana sayfa mimarisi ayrımı
- `epic:D-uretkenlik` - Pomodoro + Seri + Hedef
- `epic:E-rehberlik` - Puan hesaplama + Tercih rehberi
- `epic:F-rapor` - Rapor 2.0
- `epic:G-ticket` - Ticket sistemi + Üst panel
- `epic:H-guvenlik` - Güvenlik ve Üretim Sertleştirme
- `epic:I-kalite` - Kalite, Performans ve Teknik Borç

### Faz Etiketleri:
- `faz:0-hazirlik`
- `faz:1-guvenlik`
- `faz:2-saas-core`
- `faz:3-installer`
- `faz:4-rehberlik`
- `faz:5-ticket`
- `faz:6-rapor`

### Öncelik Etiketleri:
- `priority:P0` - Acil (kritik güvenlik/çalışma)
- `priority:P1` - Yüksek öncelik
- `priority:P2` - Normal

### Tip Etiketleri:
- `type:feature`
- `type:bug`
- `type:task`
- `type:documentation`

---

## Epic A - SaaS Core: Lisanslama + Domain/Subdomain + Tenant Onboarding

### A.1 Veri Modeli
**Başlık:** A.1 - Veri Modeli Oluşturma
**Açıklama:**
- LicensePlan modeli
- SchoolLicense modeli
- DomainMapping modeli (ROOT_DOMAIN, SUBDOMAIN, SSL_STATUS, DNS_STATUS)
- ProvisioningJob modeli (kurulum adım takibi)

**Etiketler:** epic:A-saas-core, faz:2-saas-core, priority:P1, type:feature
**Milestone:** Faz 2 - SaaS Core + Landing Ayrımı

### A.2 İş Kuralları - Lisans Kontrolü
**Başlık:** A.2 - Lisans İş Kuralları ve Limitler
**Açıklama:**
- Her okul: 1 aktif lisans + 1 ana domain/subdomain
- Lisans limiti: öğrenci sayısı, aktif kullanıcı, depolama, rapor/export limiti
- Lisans süresi dolunca: grace period, sonra yazma kilidi (read-only mod)

**Etiketler:** epic:A-saas-core, faz:2-saas-core, priority:P1, type:feature
**Milestone:** Faz 2 - SaaS Core + Landing Ayrımı

### A.3 Domain Doğrulama Endpointleri
**Başlık:** A.3 - Domain Doğrulama ve TXT/CNAME Kontrolü
**Açıklama:**
- Domain doğrulama endpointleri
- TXT/CNAME kontrol akışı
- SSL durumu takibi

**Etiketler:** epic:A-saas-core, faz:2-saas-core, priority:P1, type:feature
**Milestone:** Faz 2 - SaaS Core + Landing Ayrımı

### A.4 Lisans Middleware
**Başlık:** A.4 - Lisans Middleware (Request Bazlı Kontrol)
**Açıklama:**
- Request bazlı lisans kontrolü middleware'i
- Limit aşımı durumunda uyarı/engelleme

**Etiketler:** epic:A-saas-core, faz:2-saas-core, priority:P1, type:feature
**Milestone:** Faz 2 - SaaS Core + Landing Ayrımı

### A.5 Super Admin Paneli
**Başlık:** A.5 - Super Admin Paneli
**Açıklama:**
- Okul oluşturma arayüzü
- Domain bağlama
- Lisans atama ve yönetim

**Etiketler:** epic:A-saas-core, faz:2-saas-core, priority:P1, type:feature
**Milestone:** Faz 2 - SaaS Core + Landing Ayrımı

---

## Epic B - WordPress Benzeri Hazır Kurulum (Installer)

### B.1 Kurulum Scripti
**Başlık:** B.1 - Tek Komutlu Kurulum Scripti
**Açıklama:**
- Windows/Linux tek komutlu kurulum scripti
- Ortam doğrulama (Node, DB, Redis, env kontrolü)

**Etiketler:** epic:B-installer, faz:3-installer, priority:P1, type:feature
**Milestone:** Faz 3 - Installer + Öğrenci Üretkenlik

### B.2 Web Tabanlı Setup Wizard
**Başlık:** B.2 - Web Setup Wizard
**Açıklama:**
- Okul bilgisi girişi
- Admin hesabı oluşturma
- Domain/subdomain yapılandırma
- Temel logo/renk seçimi
- Demo veri yükleme seçeneği

**Etiketler:** epic:B-installer, faz:3-installer, priority:P1, type:feature
**Milestone:** Faz 3 - Installer + Öğrenci Üretkenlik

### B.3 Install Orchestrator
**Başlık:** B.3 - Install Orchestrator ve Rollback
**Açıklama:**
- DB migrate + seed + ilk okul oluşturma
- Kurulum logu
- Rollback adımları

**Etiketler:** epic:B-installer, faz:3-installer, priority:P1, type:feature
**Milestone:** Faz 3 - Installer + Öğrenci Üretkenlik

---

## Epic C - Ana Sayfa Mimarisi Ayrımı

### C.1 Landing Page Ayrımı
**Başlık:** C.1 - Landing Page Mimarisi
**Açıklama:**
- Ana domain (denemetakip.net): ürün tanıtım landing page
- Okul domain/subdomain: okul markalı login/home
- Mevcut frontend/src/app/page.tsx okul landing template olarak ayrılacak

**Etiketler:** epic:C-landing, faz:2-saas-core, priority:P1, type:feature
**Milestone:** Faz 2 - SaaS Core + Landing Ayrımı

### C.2 Genel Landing Page İçeriği
**Başlık:** C.2 - Genel Landing Page
**Açıklama:**
- Ürün anlatımı
- Paketler/lisans bilgisi
- İletişim + demo talep formu

**Etiketler:** epic:C-landing, faz:2-saas-core, priority:P1, type:feature
**Milestone:** Faz 2 - SaaS Core + Landing Ayrımı

### C.3 Hostname Tabanlı Render
**Başlık:** C.3 - Hostname Bazlı Render Yönlendirmesi
**Açıklama:**
- Hostname'e göre landing vs okul paneline yönlendirme
- Dinamik render mantığı

**Etiketler:** epic:C-landing, faz:2-saas-core, priority:P1, type:feature
**Milestone:** Faz 2 - SaaS Core + Landing Ayrımı

---

## Epic D - Öğrenci Üretkenlik Modülü (Pomodoro + Seri + Hedef)

### D.1 Pomodoro Entegrasyonu
**Başlık:** D.1 - Pomodoro Timer Dashboard Entegrasyonu
**Açıklama:**
- Mevcut PomodoroTimer bileşeni öğrenci ana ekranına entegre edilecek
- Session logları study/sessions üzerinden devam edecek
- Pomodoro ayarları: 25/5 varsayılan, okul/öğrenci bazlı özelleştirme

**Etiketler:** epic:D-uretkenlik, faz:3-installer, priority:P1, type:feature
**Milestone:** Faz 3 - Installer + Öğrenci Üretkenlik

### D.2 Çalışma Serisi (Streak)
**Başlık:** D.2 - Çalışma Serisi (Streak) Sistemi
**Açıklama:**
- Günlük çalışma var/yok hesabına göre ardışık gün sayısı
- Kural: min N dakika çalışma = gün aktif
- Seri kırılma, toparlanma, rozet tetikleme

**Etiketler:** epic:D-uretkenlik, faz:3-installer, priority:P1, type:feature
**Milestone:** Faz 3 - Installer + Öğrenci Üretkenlik

### D.3 StudentGoal Modeli
**Başlık:** D.3 - Öğrenci Hedef Modeli
**Açıklama:**
- StudentGoal modeli:
  - Hedef net
  - Hedef puan
  - Haftalık çalışma dakikası
  - Görev tamamlama yüzdesi
- Aktif hedef kartları + yüzde ilerleme + kalan fark hesapları

**Etiketler:** epic:D-uretkenlik, faz:3-installer, priority:P1, type:feature
**Milestone:** Faz 3 - Installer + Öğrenci Üretkenlik

### D.4 Veli Ekranı Hedef Özeti
**Başlık:** D.4 - Veli Ekranında Hedef Özeti
**Açıklama:**
- Veli ekranında aynı hedeflerin sade özeti
- İlerleme görünürlüğü

**Etiketler:** epic:D-uretkenlik, faz:3-installer, priority:P1, type:feature
**Milestone:** Faz 3 - Installer + Öğrenci Üretkenlik

---

## Epic E - Öğrenci/Veli Puan ve Rehberlik Motoru

### E.1 Puan Hesaplama Servisi
**Başlık:** E.1 - TYT/AYT/LGS Puan Hesaplama Servisi
**Açıklama:**
- TYT/AYT/LGS puan hesaplama servisi
- Sınav sonucu geldiğinde otomatik hesap ve trend
- Öğrenci + veli ekranında "hedefe kalan fark"

**Etiketler:** epic:E-rehberlik, faz:4-rehberlik, priority:P1, type:feature
**Milestone:** Faz 4 - Puan/Rehberlik

### E.2 Üniversite Tercih Rehberi
**Başlık:** E.2 - Üniversite Tercih Rehberi
**Açıklama:**
- Program ve üniversite tablosu (yıllık taban veriler)
- Öğrencinin hedef bölüm ve hedef üniversite seçimi
- Uygunluk skoru: mevcut puan, trend, hedefe uzaklık

**Etiketler:** epic:E-rehberlik, faz:4-rehberlik, priority:P1, type:feature
**Milestone:** Faz 4 - Puan/Rehberlik

### E.3 LGS Hedef Lise
**Başlık:** E.3 - LGS Hedef Lise Modülü
**Açıklama:**
- LGS için hedef lise seçimi
- İl/ilçe, yüzdelik, kontenjan bazlı uygunluk göstergesi
- Veli için sade "risk/uygunluk" paneli

**Etiketler:** epic:E-rehberlik, faz:4-rehberlik, priority:P1, type:feature
**Milestone:** Faz 4 - Puan/Rehberlik

---

## Epic F - Rapor 2.0

### F.1 Yeni Rapor API'leri
**Başlık:** F.1 - Yeni Rapor API Ailesi
**Açıklama:**
- Öğrenci gelişim raporu
- Sınıf performans raporu
- Okul geneli analiz raporu
- Karşılaştırmalı dönem raporu
- Veli özet raporu
- Öğretmen performans raporu

**Etiketler:** epic:F-rapor, faz:6-rapor, priority:P1, type:feature
**Milestone:** Faz 6 - Rapor 2.0 + Performans

### F.2 Operasyonel Raporlama
**Başlık:** F.2 - Zamanlanmış ve Markalı Raporlama
**Açıklama:**
- Zamanlanmış rapor gönderimi (email + in-app)
- Rapor şablon/branding sistemi
- Cache + invalidation + limit/pagination standardı

**Etiketler:** epic:F-rapor, faz:6-rapor, priority:P1, type:feature
**Milestone:** Faz 6 - Rapor 2.0 + Performans

### F.3 Performans İyileştirmeleri
**Başlık:** F.3 - Rapor Performans Optimizasyonu
**Açıklama:**
- Ağır raporlar queue tabanlı asenkron export
- N+1 kırılması (toplu yükleme)
- p95 cevap süresi hedefi: <1.5s

**Etiketler:** epic:F-rapor, faz:6-rapor, priority:P1, type:feature
**Milestone:** Faz 6 - Rapor 2.0 + Performans

---

## Epic G - Ticket Sistemi + Üst Kontrol Paneli

### G.1 Ticket Domaini
**Başlık:** G.1 - Ticket Domain Modelleri
**Açıklama:**
- SupportTicket modeli
- SupportTicketMessage modeli
- SupportAttachment modeli
- SupportSLAEvent modeli

**Etiketler:** epic:G-ticket, faz:5-ticket, priority:P1, type:feature
**Milestone:** Faz 5 - Ticket + Üst Panel

### G.2 Ticket Açma ve Yönetimi
**Başlık:** G.2 - Ticket Açma ve Cevaplama
**Açıklama:**
- Okul admin/öğretmen tarafında ticket açma
- Durum değiştirme
- Cevaplama
- Dosya ekleme

**Etiketler:** epic:G-ticket, faz:5-ticket, priority:P1, type:feature
**Milestone:** Faz 5 - Ticket + Üst Panel

### G.3 Üst Panel (Super Admin)
**Başlık:** G.3 - Üst Panel Ticket Yönetimi
**Açıklama:**
- Ticket listeleme
- SLA takibi
- Tenant health skor hesaplama

**Etiketler:** epic:G-ticket, faz:5-ticket, priority:P1, type:feature
**Milestone:** Faz 5 - Ticket + Üst Panel

### G.4 Kullanım İstatistikleri
**Başlık:** G.4 - Kullanım İstatistikleri ve Health Skor
**Açıklama:**
- Okul bazlı DAU/WAU
- Aktif öğrenci sayısı
- Oluşturulan deneme sayısı
- Mesaj hacmi
- Rapor/export hacmi
- Tenant health skor

**Etiketler:** epic:G-ticket, faz:5-ticket, priority:P1, type:feature
**Milestone:** Faz 5 - Ticket + Üst Panel

---

## Epic H - Güvenlik ve Üretim Sertleştirme

### H.1.1 Varsayılan Şifreleri Kaldırma
**Başlık:** H.1.1 - Varsayılan Şifreleri Kaldır
**Açıklama:**
- `123456` varsayılan şifrelerini kaldır
- Secure random + zorunlu şifre değiştirme
- NOT: Kullanıcı "varsayılan şifre iyidir" dedi, gözden geçir

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P0, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.1.2 Şifre Politikası Sertleştirme
**Başlık:** H.1.2 - Şifre Politikası Güçlendirme
**Açıklama:**
- Min 8 karakter (büyük/küçük/rakam/özel karakter)
- NOT: Kullanıcı "zorlamanın manası yok" dedi, gözden geçir

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P0, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.1.3 Secret Manager Stratejisi
**Başlık:** H.1.3 - .env Gizli Değerlerini Repodan Çıkar
**Açıklama:**
- .env gizli değerlerini repodan çıkar
- Secret manager stratejisi uygula
- Kullanıcı onayladı: "olur"

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P0, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.1.4 Auth Standardizasyonu
**Başlık:** H.1.4 - Cookie-First Auth Standardı
**Açıklama:**
- Cookie-first yapı
- localStorage token referanslarını temizle

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P0, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.1.5 Login Lockout ve Rate Limit
**Başlık:** H.1.5 - Login Lockout + Rate Limit Ayrımı
**Açıklama:**
- Login lockout mekanizması
- Login endpoint rate limit ayrımı

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P0, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.1.6 Prod DB SSL Zorunluluğu
**Başlık:** H.1.6 - Production DB SSL Zorunluluğu
**Açıklama:**
- Production ortamında DB SSL zorunlu kılma

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P0, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.2.1 Token Revoke/Oturum Yönetimi
**Başlık:** H.2.1 - Token Revoke ve Oturum Yönetimi
**Açıklama:**
- Session table + logout invalidation
- Token revoke mekanizması

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P1, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.2.2 Upload Endpoint Güvenliği
**Başlık:** H.2.2 - Upload Endpoint Güvenlik Standardı
**Açıklama:**
- Tüm upload endpointlerinde magic number + extension sanitize standardı

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P1, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.2.3 Audit Log
**Başlık:** H.2.3 - Audit Log Sistemi
**Açıklama:**
- Kim, ne zaman, hangi veride değişiklik logu

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P1, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.2.4 Hassas Log Maskeleme
**Başlık:** H.2.4 - Hassas Veri Maskeleme
**Açıklama:**
- tcNo, token, email vb. hassas verilerin loglarda maskelenmesi

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P1, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.3.1 Güvenlik Header ve CSP
**Başlık:** H.3.1 - Güvenlik Header ve CSP Profili
**Açıklama:**
- Güvenlik header ve CSP profilinin ortama göre sıkılaştırılması

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P2, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### H.3.2 Pentest ve Güvenlik Checklist
**Başlık:** H.3.2 - Periyodik Pentest ve CI Güvenlik Kontrolü
**Açıklama:**
- Periyodik pentest
- Otomatik güvenlik checklist CI kontrolü

**Etiketler:** epic:H-guvenlik, faz:1-guvenlik, priority:P2, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

---

## Epic I - Kalite, Performans ve Teknik Borç

### I.1 Encoding/Mojibake Temizliği
**Başlık:** I.1 - Encoding/Mojibake Temizliği
**Açıklama:**
- UI + doküman + locale metinlerinde encoding temizliği

**Etiketler:** epic:I-kalite, faz:6-rapor, priority:P1, type:bug
**Milestone:** Faz 6 - Rapor 2.0 + Performans

### I.2 Rapor Controller Bug Fix
**Başlık:** I.2 - Rapor Route Bug Fix
**Açıklama:**
- `exam/:id` route param kullanımı düzeltme

**Etiketler:** epic:I-kalite, faz:1-guvenlik, priority:P1, type:bug
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### I.3 Frontend Auth/Fetch Standardizasyonu
**Başlık:** I.3 - Frontend Auth/Fetch Standardizasyonu
**Açıklama:**
- Tek API client kullanımı
- Auth/fetch standardizasyonu

**Etiketler:** epic:I-kalite, faz:1-guvenlik, priority:P1, type:task
**Milestone:** Faz 1 - Güvenlik + Stabilizasyon

### I.4 TypeScript Strictleştirme
**Başlık:** I.4 - TypeScript Strictleştirme
**Açıklama:**
- `any` azaltma
- DTO ve response tiplerinin strictleştirilmesi

**Etiketler:** epic:I-kalite, faz:6-rapor, priority:P2, type:task
**Milestone:** Faz 6 - Rapor 2.0 + Performans

### I.5 Bulk Create Optimizasyonu
**Başlık:** I.5 - Bulk Create Optimizasyonu
**Açıklama:**
- createMany ile kritik akışlarda yazma optimizasyonu

**Etiketler:** epic:I-kalite, faz:6-rapor, priority:P2, type:task
**Milestone:** Faz 6 - Rapor 2.0 + Performans

### I.6 Export Memory Optimizasyonu
**Başlık:** I.6 - Export Memory Baskısını Azaltma
**Açıklama:**
- Export işlemlerinde stream/queue modeli
- Memory kullanım optimizasyonu

**Etiketler:** epic:I-kalite, faz:6-rapor, priority:P1, type:task
**Milestone:** Faz 6 - Rapor 2.0 + Performans

---

## Faz 0 - Hazırlık Taskları

### Faz 0.1 - Backlog Kilitleme
**Başlık:** Faz 0.1 - Backlog Kilitleme
**Açıklama:**
- Yeni özellik eklenmesini durdurma
- Mevcut kapsamı dondurma

**Etiketler:** faz:0-hazirlik, priority:P0, type:task
**Milestone:** Faz 0 - Hazırlık

### Faz 0.2 - Teknik RFC
**Başlık:** Faz 0.2 - Teknik RFC Hazırlama
**Açıklama:**
- Mimari kararların dokümantasyonu
- Paydaş onayı alma

**Etiketler:** faz:0-hazirlik, priority:P0, type:documentation
**Milestone:** Faz 0 - Hazırlık

### Faz 0.3 - Veri Modeli Onayı
**Başlık:** Faz 0.3 - Veri Modeli Onayı
**Açıklama:**
- Database/schema tasarımının review edilmesi
- Resmi onay

**Etiketler:** faz:0-hazirlik, priority:P0, type:documentation
**Milestone:** Faz 0 - Hazırlık

### Faz 0.4 - Güvenlik P0 Task Kırılımı
**Başlık:** Faz 0.4 - Güvenlik P0 Maddeleri İçin Task Kırılımı
**Açıklama:**
- Kritik güvenlik öğelerinin küçük görevlere bölünmesi

**Etiketler:** faz:0-hazirlik, priority:P0, type:task
**Milestone:** Faz 0 - Hazırlık

---

## İlk Sprint (2 Hafta) - Faz 1 Öncesi

### Sprint 1.1 - Varsayılan Şifrelerin Kaldırılması
**Başlık:** Sprint 1.1 - Varsayılan Şifrelerin Kaldırılması ve Geçiş Politikası
**Açıklama:**
- Mevcut varsayılan şifreleri tespit etme
- Güvenli geçiş politikası belirleme

**Etiketler:** faz:0-hazirlik, faz:1-guvenlik, priority:P0, type:task
**Milestone:** Faz 0 - Hazırlık

### Sprint 1.2 - Şifre Policy Sertleştirme
**Başlık:** Sprint 1.2 - Şifre Policy Sertleştirme + Lockout
**Açıklama:**
- Yeni şifre politikası uygulama
- Login lockout mekanizması

**Etiketler:** faz:0-hazirlik, faz:1-guvenlik, priority:P0, type:task
**Milestone:** Faz 0 - Hazırlık

### Sprint 1.3 - Auth İstemci Standardizasyonu
**Başlık:** Sprint 1.3 - Auth İstemci Standardizasyonu
**Açıklama:**
- Cookie-first yapıya geçiş planı
- Token referans temizliği

**Etiketler:** faz:0-hazirlik, faz:1-guvenlik, priority:P0, type:task
**Milestone:** Faz 0 - Hazırlık

### Sprint 1.4 - Rapor Route Bug Fix
**Başlık:** Sprint 1.4 - Rapor Route Bug Fix
**Açıklama:**
- `exam/:id` route param kullanımı düzeltme

**Etiketler:** faz:0-hazirlik, faz:1-guvenlik, priority:P1, type:bug
**Milestone:** Faz 0 - Hazırlık

### Sprint 1.5 - Domain/Lisans Veri Modeli Taslağı
**Başlık:** Sprint 1.5 - Domain/Lisans Veri Modeli Migration Taslağı
**Açıklama:**
- LicensePlan, SchoolLicense, DomainMapping modelleri için migration taslağı

**Etiketler:** faz:0-hazirlik, faz:2-saas-core, priority:P1, type:documentation
**Milestone:** Faz 0 - Hazırlık

### Sprint 1.6 - Ticket Domaini Taslağı
**Başlık:** Sprint 1.6 - Ticket Domaini Migration Taslağı
**Açıklama:**
- SupportTicket, SupportTicketMessage modelleri için migration taslağı

**Etiketler:** faz:0-hazirlik, faz:5-ticket, priority:P1, type:documentation
**Milestone:** Faz 0 - Hazırlık

### Sprint 1.7 - Landing Ayrımı Teknik Spike
**Başlık:** Sprint 1.7 - Landing Ayrımı Teknik Spike
**Açıklama:**
- Hostname bazlı render araştırması
- Proof of concept

**Etiketler:** faz:0-hazirlik, faz:2-saas-core, priority:P1, type:task
**Milestone:** Faz 0 - Hazırlık

### Sprint 1.8 - Pomodoro Dashboard Tasarımı
**Başlık:** Sprint 1.8 - Pomodoro Entegrasyonu İçin Dashboard Alan Tasarımı
**Açıklama:**
- UI/UX tasarımı
- Bileşen yerleşimi

**Etiketler:** faz:0-hazirlik, faz:3-installer, priority:P1, type:documentation
**Milestone:** Faz 0 - Hazırlık

### Sprint 1.9 - Streak Hesap Servisi POC
**Başlık:** Sprint 1.9 - Streak Hesap Servisinin POC Versiyonu
**Açıklama:**
- Proof of concept geliştirme
- Algoritma testi

**Etiketler:** faz:0-hazirlik, faz:3-installer, priority:P1, type:task
**Milestone:** Faz 0 - Hazırlık

### Sprint 1.10 - Setup Wizard Bilgi Mimarisi
**Başlık:** Sprint 1.10 - Setup Wizard Bilgi Mimarisi
**Açıklama:**
- Kurulum wizard'ının bilgi yapısı
- Adımların tanımlanması

**Etiketler:** faz:0-hazirlik, faz:3-installer, priority:P1, type:documentation
**Milestone:** Faz 0 - Hazırlık

---

## Nasıl Eklenecek?

### Adım 1: Milestone Oluşturma
GitHub Projects'ta "Milestones" bölümünden yukarıdaki 7 fazı oluşturun.

### Adım 2: Label Oluşturma
GitHub repo'da "Labels" bölümünden epic, faz, priority ve type etiketlerini oluşturun.

### Adım 3: Issue Oluşturma
Her bir task için GitHub Issue oluşturun:
- Title: Yukarıdaki başlık
- Description: Yukarıdaki açıklama
- Labels: İlgili etiketler
- Milestone: İlgili faz

### Adım 4: Projects'e Ekleme
Oluşturulan issue'ları https://github.com/users/HIbrahimK/projects/1/views/1 adresindeki projeye ekleyin.

### İpucu:
- Önce Faz 0 tasklarını ekleyerek başlayın
- Her epic için bir "Epic tracking issue" oluşturup alt taskları bağlayabilirsiniz
- Priority P0 olanları önce ekleyin (acil güvenlik maddeleri)

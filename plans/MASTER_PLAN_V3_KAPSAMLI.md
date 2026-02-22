# DENEME TAKIP SISTEMI - MASTER PLAN V3 (KAPSAMLI)

**Tarih:** 2026-02-22  
**Hazirlayan:** Kod/rapor bazli birlesik plan  
**Kapsam:** `plans/MASTER_PLAN_V2.md` + `rapor.md` + `plans/YENI_RAPOR_TURLERI_DETAYLI.md` + `plans/SECURITY_AUDIT_REPORT.md` + mevcut kod tabani

---

## 1) Karsilastirma Ozeti (V2 vs Son Rapor)

### 1.1 Durumu guclenen veya tamamlanan basliklar

| Baslik | V2 Durumu | 2026-02-22 Durumu | Kaynak Notu |
|---|---|---|---|
| Rol bazli yetki + JWT | Tamamlandi | Tamamlandi | rapor.md + auth modulu |
| SchoolId tenant izolasyonu | Tamamlandi | Tamamlandi | rapor.md + kod |
| CORS .env yonetimi | Acil aksiyon | Buyuk olcude cozuldu | `backend/src/main.ts` |
| Global rate limit guard | Acil aksiyon | Cozuldu | `backend/src/app.module.ts` |
| Import upload limit/mime | Eksik | Cozuldu | `backend/src/import/import.controller.ts` |
| Answer key dosya guvenligi | Eksik | Buyuk olcude cozuldu (private klasor) | `backend/src/exams/exams.service.ts` |
| Mentorluk gruplari | Yakin donem | Uretimde aktif | rapor.md + groups modulu |
| Coklu rapor ekranlari | Var | Genisledi (ranking matrix + year compare dahil) | rapor.md + reports modulu |

### 1.2 Hala acik veya kismi basliklar

| Baslik | Durum | Acik Risk |
|---|---|---|
| Varsayilan sifre kullanimi (`123456`) | Acik | Hesap ele gecirme riski |
| Sifre politikasi (`MinLength(4)`) | Acik | Zayif parola riski |
| Token tasima standardi | Kismi (cookie + bazi token referanslari) | Auth davranis tutarsizligi |
| Ticket sistemi | Baslamadi | Destek operasyonu olgun degil |
| Lisanslama + domain/subdomain | Kismi (model alani var, is kurali yok) | SaaS olgunlugu eksik |
| WordPress benzeri hazir kurulum | Baslamadi | Onboarding maliyeti yuksek |
| PWA varlik tamamliligi | Kismi | Mobil kurulum kalitesi dusuk |
| Raporlarda N+1 hotspot | Acik | Trafikte performans dususu |

---

## 2) Mevcut Hazir Yapi (Planin Uzerine Kurulacagi Temel)

1. RBAC + JWT + HttpOnly cookie login akisi (bearer fallback ile).
2. School tablosunda `subdomainAlias` ve `domain` alanlari hazir.
3. StudySession modelinde `isPomodoroMode` alani hazir.
4. Grup hedefleri, aktif hedefler ve tamamlanma isaretleme akisi hazir.
5. Geniş rapor cekirdegi mevcut: exam summary/detailed, subject, ranking matrix, year-over-year.
6. Mesajlasma + scheduler + queue (BullMQ/Redis) alt yapisi hazir.
7. Yedekleme/geri yukleme + sinif atlatma operasyonu hazir.

---

## 3) V3 Stratejik Hedef

DenemeTakip'i:

1. Okul odakli urunden, **SaaS platforma** (lisans + domain + hizli kurulum) tasimak,
2. Ogrenci/veli tarafinda **hedef ve karar destek** derinligini arttirmak,
3. Guvenlik ve performans aciklarini kapatarak **uretim olgunluguna** cikarmak.

---

## 4) V3 Kapsami (Epic Bazli)

## Epic A - SaaS Core: Lisanslama + Domain/Subdomain + Tenant Onboarding

### A.1 Veri Modeli
- `LicensePlan`
- `SchoolLicense`
- `DomainMapping` (ROOT_DOMAIN, SUBDOMAIN, SSL_STATUS, DNS_STATUS)
- `ProvisioningJob` (kurulum adim takibi)

### A.2 Is Kurallari
- Her okul: 1 aktif lisans + 1 ana domain/subdomain.
- Lisans limiti: ogrenci sayisi, aktif kullanici, depolama, rapor/export limiti.
- Lisans suresi dolunca: grace period, sonra yazma kilidi (read-only mod).

### A.3 Teknik Teslimatlar
- Domain dogrulama endpointleri (TXT/CNAME kontrol akisi).
- Lisans middleware (request bazli lisans kontrolu).
- Super admin panelinden okul olusturma + domain baglama + lisans atama.

---

## Epic B - WordPress Benzeri Hazir Kurulum (Installer)

### B.1 Kurulum Deneyimi
- Tek komutlu kurulum scripti (Windows/Linux).
- Web tabanli setup wizard:
  - okul bilgisi
  - admin hesabi
  - domain/subdomain
  - temel logo/renk
  - demo veri yukleme secenegi

### B.2 Teknik Teslimatlar
- `install` orchestrator (DB migrate + seed + ilk okul olusturma).
- Ortam dogrulama (Node, DB, Redis, env kontrolu).
- Kurulum logu + rollback adimlari.

---

## Epic C - Ana Sayfa Mimarisi Ayrimi

### C.1 Yeni Kural
- Ana domain (`denemetakip.net` gibi): urun tanitim landing page.
- Okul domain/subdomain: okul markali login/home.

### C.2 Uygulama
- Mevcut `frontend/src/app/page.tsx`:
  - okul landing template olarak ayrilacak.
- Yeni genel landing:
  - urun anlatimi
  - paketler/lisans
  - iletisim + demo talep
- Hostname tabanli render yonlendirmesi.

---

## Epic D - Ogrenci Uretkenlik Modulu (Pomodoro + Seri + Hedef)

### D.1 Pomodoro
- Mevcut `PomodoroTimer` bileseni dashboard ogrenci ana ekranina entegre edilecek.
- Session loglari mevcut `study/sessions` uzerinden devam edecek.
- Pomodoro ayarlari: 25/5 varsayilan, okul/ogrenci bazli ozellestirme.

### D.2 Calisma Serisi (Streak)
- Gunluk calisma var/yok hesabina gore ardiskik gun sayisi.
- Kural: min N dakika calisma = gun aktif.
- Seri kirilma, toparlanma, rozet tetikleme.

### D.3 Hedef Tamamlama + Aktif Hedefler
- Ogrenci bazli `StudentGoal` modeli:
  - hedef net
  - hedef puan
  - haftalik calisma dakikasi
  - gorev tamamlama yuzdesi
- Aktif hedef kartlari + yuzde ilerleme + kalan fark hesaplari.
- Veli ekraninda ayni hedeflerin sade ozeti.

---

## Epic E - Ogrenci/Veli Puan ve Rehberlik Motoru

### E.1 Puan Hesaplama
- TYT/AYT/LGS puan hesaplama servisi.
- Sinav sonucu geldiginde otomatik hesap ve trend.
- Ogrenci + veli ekraninda "hedefe kalan fark".

### E.2 Universite Tercih Rehberi
- Program ve universite tablosu (yillik taban veriler).
- Ogrencinin hedef bolum ve hedef universite secimi.
- Uygunluk skoru: mevcut puan, trend, hedefe uzaklik.

### E.3 LGS Hedef Lise
- LGS icin hedef lise secimi.
- Il/ilce, yuzdelik, kontenjan bazli uygunluk gostergesi.
- Veli icin sade "risk/uygunluk" paneli.

---

## Epic F - Rapor 2.0 (YENI_RAPOR_TURLERI_DETAYLI uyumlu)

### F.1 Yeni API ailesi
- Ogrenci gelisim raporu
- Sinif performans raporu
- Okul geneli analiz raporu
- Karsilastirmali donem raporu
- Veli ozet raporu
- Ogretmen performans raporu

### F.2 Operasyonel Raporlama
- Zamanlanmis rapor gonderimi (email + in-app).
- Rapor sablon/branding sistemi.
- Cache + invalidation + limit/pagination standardi.

### F.3 Performans
- Agir raporlar queue tabanli asenkron export.
- N+1 kirilmasi (toplu nvsimi).

---

## Epic G - Ticket Sistemi + Ust Kontrol Paneli

### G.1 Ticket Domaini
- `SupportTicket`
- `SupportTicketMessage`
- `SupportAttachment`
- `SupportSLAEvent`

### G.2 Islevler
- Okul admin/ogretmen tarafinda ticket acma.
- Ust panel (super admin/support):
  - ticket listeleme
  - durum degistirme
  - cevaplama
  - SLA takibinn 
  - tenant health skor hesaplama  

### G.3 Kullanim Istatisikleri
- Okul bazli:
  - DAU/WAU
  - aktif ogrenci
  - olusturulan deneme
  - mesaj hacmi
  - rapor/export hacmi
- Ust panelde tenant health skor.

---

## Epic H - Guvenlik ve Uretim Sertlestirme (Security Audit + Son Durum)

### H.1 P0 (Acil)
1. Varsayilan sifreleri kaldir (`123456`), secure random + zorunlu sifre degistirme. (buna gerek yok. varsayılan şifre iyidir)
2. Sifre politikasini min 8+ (buyuk/kucuk/rakam/ozel) yap. zorlamanın manası yok
3. `.env` gizli degerlerini repodan cikar; secret manager stratejisi uygula. olur
4. Auth standardi: cookie-first, localStorage token referanslarini temizle.
5. Login lockout + login endpoint rate limit ayrimi.
6. Prod DB SSL zorunlulugu.

### H.2 P1
1. Token revoke/oturum yonetimi (session table + logout invalidation).
2. Tum upload endpointlerinde magic number + extension sanitize standardi.
3. Audit log (kim, ne zaman, hangi veride degisiklik).
4. Hassas log maskeleme (tcNo, token, email vb).

### H.3 P2
1. Guvenlik header ve CSP profilinin ortama gore sikilastirilmasi.
2. Periyodik pentest + otomatik guvenlik checklist CI kontrolu.

---

## Epic I - Kalite, Performans ve Teknik Borc

1. Encoding/mojibake temizligi (UI + dokuman + locale metinleri).
2. Rapor controller bug fix (`exam/:id` route param kullanimi).
3. Frontend auth/fetch standardizasyonu (tek API client).
4. `any` azaltma: DTO ve response tiplerinin strictlestirilmesi.
5. Bulk create (createMany) ile kritik akislarda yazma optimizasyonu.
6. Export memory baskisini azaltan stream/queue modeli.

---

## 5) Yol Haritasi (Takvimli)

## Faz 0 - Hazirlik (2026-02-23 / 2026-03-01)
- Backlog kilitleme, teknik RFC, veri modeli onayi.
- Guvenlik P0 maddeleri icin task kirilimi.

## Faz 1 - Guvenlik + Stabilizasyon (2026-03-02 / 2026-03-22)
- H.1 tamamlanir.
- Kritik bug/encoding duzeltmeleri.
- Regression test paketi ve release gate.

## Faz 2 - SaaS Core + Landing Ayrimi (2026-03-23 / 2026-04-19)
- Epic A + Epic C cekirdek teslim.
- Domain/subdomain + lisans middleware beta.

## Faz 3 - Installer + Ogrenci Uretkenlik (2026-04-20 / 2026-05-17)
- Epic B + Epic D teslim.
- Pomodoro + streak + aktif hedefler production beta.

## Faz 4 - Puan/Rehberlik (2026-05-18 / 2026-06-14)
- Epic E teslim.
- Universite/LGS hedef modulu beta.

## Faz 5 - Ticket + Ust Panel (2026-06-15 / 2026-07-12)
- Epic G teslim.
- Kullanım istatistikleri ve tenant health panosu.

## Faz 6 - Rapor 2.0 + Performans (2026-07-13 / 2026-08-02)
- Epic F + I kritik maddeler.
- Yayin adayi (RC) + yuk testleri + son guvenlik denetimi.

---

## 6) Kabul Kriterleri (Definition of Done)

1. **Kurulum:** Yeni okul 15 dakika altinda canliya alinabilir.
2. **Lisans:** Lisanssiz/bitmis okul yazma islemi yapamaz (read-only fallback).
3. **Domain:** Okul bazli domain/subdomain SSL ile aktiflenir.
4. **Pomodoro/Streak:** Ogrenci panelinde aktif kullanilir, gunluk seri dogru hesaplanir.
5. **Hedefler:** Ogrenci ve veli ayni hedef ilerlemesini tutarli gorur.
6. **Rehberlik:** Hedef bolum/universite ve LGS hedef lise icin uygunluk skoru uretilir.
7. **Ticket:** Ust panelden ticket goruntuleme, cevaplama, SLA olcumu calisir.
8. **Raporlar:** Yeni 6 rapor tipi + zamanlama + sablon sistemi calisir.
9. **Guvenlik:** P0/P1 checklist maddeleri kapanmis olur.
10. **Performans:** Agir raporlarda p95 cevap suresi hedefe girer (cache ile <1.5s).

---

## 7) Ilk Sprint (2 Hafta) Oncelik Listesi

1. Varsayilan sifrelerin kaldirilmasi ve gecis politikasi.
2. Sifre policy sertlestirme + lockout.
3. Auth istemci standardizasyonu (token referans temizligi).
4. Rapor route bug fix (`exam/:id`).
5. Domain/lisans veri modeli migration taslagi.
6. Ticket domaini migration taslagi.
7. Landing ayrimi teknik spike (hostname bazli render).
8. Pomodoro entegrasyonu icin dashboard alan tasarimi.
9. Streak hesap servisinin POC versiyonu.
10. Setup wizard bilgi mimarisi.

---

## 8) Riskler ve Onleyici Plan

1. **Scope buyumesi riski:** Faz gecislerinde "must-have" listesi sabitlenecek.
2. **Veri kalitesi riski (tercih/lise/universite):** Dis veri seti surumlenip dogrulama katmani eklenecek.
3. **Auth gecis riski:** Cookie-first geciste feature flag + asamali rollout.
4. **Performans riski:** Rapor endpointleri icin erken benchmark + cache zorunlulugu.
5. **Operasyon riski:** Ticket ve lisans modulleri icin audit trail mecburi olacak.

---

## 9) Bu Planin V2'den Farki

1. V2'de ayrik olan guvenlik, rapor, lisans, ticket, hedef modulleri tek cati altinda birlestirildi.
2. "Okul urunu" modelinden "SaaS platform" modeline gecis acik olarak tanimlandi.
3. Yeni istekler (pomodoro-seri-hedef, puan/tercih, domain/lisans, ust panel ticket) takvimli ve teknik teslimata baglandi.
4. Mevcut kod tabaninda hazir olan bilesenler tekrar yazilmadan, dogrudan genisletme stratejisi secildi.


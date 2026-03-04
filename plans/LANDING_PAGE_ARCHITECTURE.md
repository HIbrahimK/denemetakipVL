# Deneme Takip Sistemi - Landing Page & Super Admin Mimarisi

## Genel Mimari

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Ana Domain: denemetakip.net                    │
├─────────────────────────────────────────────────────────────────────────┤
│  /                           → Landing Page (Ana Sayfa)                 │
│  /hakkimizda                 → Hakkımızda Sayfası                       │
│  /ozellikler                 → Özellikler Sayfası                       │
│  /fiyatlandirma              → Lisans Ücretleri                         │
│  /yardim                     → Yardım Merkezi                           │
│  /iletisim                   → İletişim Sayfası                         │
│  /okullar                    → Projeyi Kullanan Okullar                 │
│  /blog                       → Blog Sayfası                             │
│  /demo                       → Demo Başvuru Sayfası                     │
│  /super-admin                → Super Admin Paneli                       │
├─────────────────────────────────────────────────────────────────────────┤
│                        Subdomain'ler                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  demo.denemetakip.net        → Demo Okul Uygulaması                     │
│  ahl.denemetakip.net         → Ankara Atatürk Lisesi                    │
│  yal.denemetakip.net         → Yeni Anadolu Lisesi                      │
│  [okul-kodu].denemetakip.net → Dinamik Okul Subdomain'leri              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Teknoloji Stack

### Landing Page (Next.js App)
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter (body), Poppins (headings)
- **CMS**: MDX (Blog için)

### Super Admin Panel
- **Framework**: Next.js 14+
- **State**: React Query + Zustand
- **Charts**: Recharts
- **Table**: TanStack Table

### PWA Dinamik Yapılandırma
- **Manifest**: API'den dinamik üretim
- **Service Worker**: next-pwa
- **Icons**: Sharp ile otomatik boyutlandırma

## Sayfa Yapıları

### 1. Ana Sayfa (/)

```
┌────────────────────────────────────────────────────────────┐
│  🍔 Navbar (Logo, Menü, Giriş/Demo Butonları)               │
├────────────────────────────────────────────────────────────┤
│  🎯 HERO SECTION                                           │
│  "Deneme Sınavlarınızı Akıllıca Takip Edin"                │
│  [Hemen Başla] [Demo İste]                                 │
│  [Hero Görsel/Video]                                       │
├────────────────────────────────────────────────────────────┤
│  ✨ ÖZELLİKLER SECTION                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ 📊      │ │ 👥      │ │ 💬      │ │ 🎯      │          │
│  │ Deneme  │ │ Öğrenci │ │ Mesaj   │ │ Çalışma │          │
│  │ Takibi  │ │ Yönetimi│ │ Sistemi │ │ Planı   │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
├────────────────────────────────────────────────────────────┤
│  📱 UYGULAMA GÖRÜNTÜLERİ                                   │
│  [Ekran Görüntüleri Galerisi]                              │
├────────────────────────────────────────────────────────────┤
│  💬 KULLANICI YORUMLARI                                    │
│  ┌──────────────────┐ ┌──────────────────┐                │
│  │ "Harika bir..."  │ │ "Öğrencilerim..."│                │
│  │ ⭐⭐⭐⭐⭐       │ │ ⭐⭐⭐⭐⭐       │                │
│  │ - Ahmet Y.       │ │ - Ayşe K.        │                │
│  └──────────────────┘ └──────────────────┘                │
├────────────────────────────────────────────────────────────┤
│  🚀 BAŞLAMA KILAVUZU (3 Adım)                              │
│  1. Demo Talep Et → 2. Kurulum → 3. Kullanmaya Başla       │
├────────────────────────────────────────────────────────────┤
│  💰 FİYATLANDIRMA                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ Başlangıç│ │ Profesyon│ │ Kurumsal │                   │
│  │ ₺499/ay  │ │ ₺999/ay  │ │ Özel     │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
├────────────────────────────────────────────────────────────┤
│  📊 İSTATİSTİKLER                                          │
│  50+ Okul  │  10.000+ Öğrenci  │  100.000+ Deneme          │
├────────────────────────────────────────────────────────────┤
│  📰 BLOG ÖNİZLEMESİ                                        │
│  Son 3 blog yazısı kartları                                │
├────────────────────────────────────────────────────────────┤
│  📬 FOOTER                                                 │
│  Logo │ Linkler │ Sosyal Medya │ Newsletter                │
└────────────────────────────────────────────────────────────┘
```

### 2. Lisans Ücretleri (/fiyatlandirma)

```
┌────────────────────────────────────────────────────────────┐
│  💰 FİYATLANDIRMA PLANLARI                                 │
├────────────────────────────────────────────────────────────┤
│  Aylık │ Yıllık (%20 indirim) toggle                      │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │   BAŞLANGIÇ  │ │ PROFESYONEL  │ │  KURUMSAL    │       │
│  │              │ │   POPÜLER    │ │              │       │
│  │   ₺499/ay    │ │   ₺999/ay    │ │   Özel Teklif│       │
│  │              │ │              │ │              │       │
│  │ ✓ 500 Öğrenci│ │ ✓ Sınırsız   │ │ ✓ Her şey    │       │
│  │ ✓ 10 Sınav/ay│ │   Öğrenci    │ │   + Özel     │       │
│  │ ✓ Temel      │ │ ✓ Sınırsız   │ │   Geliştirme │       │
│  │   Raporlar   │ │   Sınav      │ │ ✓ SLA        │       │
│  │ ✓ Email      │ │ ✓ Gelişmiş   │ │ ✓ 7/24 Destek│       │
│  │   Destek     │ │   Raporlar   │ │              │       │
│  │              │ │ ✓ WhatsApp   │ │              │       │
│  │ [Başla]      │ │   Destek     │ │ [İletişime]  │       │
│  │              │ │              │ │   Geç]       │       │
│  │              │ │ [Başla]      │ │              │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
├────────────────────────────────────────────────────────────┤
│  🎁 TÜM PLANLARDA DAHİL                                    │
│  ✓ SSL Sertifikası  ✓ Otomatik Yedekleme  ✓ PWA          │
│  ✓ Özel Subdomain   ✓ Mobil Uygulama      ✓ API Erişimi  │
│  ✓ Teknik Destek    ✓ Güncellemeler       ✓ Eğitim       │
├────────────────────────────────────────────────────────────┤
│  ❓ SIKÇA SORULAN SORULAR                                   │
│  Accordion ile FAQ bölümü                                  │
└────────────────────────────────────────────────────────────┘
```

### 3. Yardım Sayfası (/yardim)

```
┌────────────────────────────────────────────────────────────┐
│  🔍 ARAMA                                                  │
│  "Nasıl yardımcı olabiliriz?"                              │
├────────────────────────────────────────────────────────────┤
│  📚 KATEGORİLER                                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ Başla- │ │ Deneme │ │ Öğrenci│ │ Mesaj  │              │
│  │ mak    │ │ Yükleme│ │ Ekleme │ │ Sistemi│              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
├────────────────────────────────────────────────────────────┤
│  📖 POPÜLER MAKALELER                                      │
│  - Excel ile toplu öğrenci ekleme                          │
│  - Deneme sonuçlarını yükleme                              │
│  - Çalışma planı oluşturma                                 │
│  - Veli bilgilendirme mesajları                            │
├────────────────────────────────────────────────────────────┤
│  📹 VİDEO EĞİTİMLERİ                                       │
│  [Video Kartları]                                          │
├────────────────────────────────────────────────────────────┤
│  💬 CANLI DESTEK                                           │
│  [Chat Widget]                                             │
└────────────────────────────────────────────────────────────┘
```

### 4. İletişim Sayfası (/iletisim)

```
┌────────────────────────────────────────────────────────────┐
│  📞 BİZE ULAŞIN                                            │
├────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐ ┌────────────────────────┐    │
│  │  📍 Adres              │ │  📧 Email              │    │
│  │  İstanbul, Türkiye     │ │  info@denemetakip.net  │    │
│  │                        │ │                        │    │
│  │  📞 Telefon            │ │  ⏰ Çalışma Saatleri   │    │
│  │  +90 212 123 45 67     │ │  Pazartesi-Cuma        │    │
│  │                        │ │  09:00 - 18:00         │    │
│  └────────────────────────┘ └────────────────────────┘    │
├────────────────────────────────────────────────────────────┤
│  📝 İLETİŞİM FORMU                                         │
│  İsim, Email, Konu, Mesaj alanları                         │
│  [Gönder]                                                  │
├────────────────────────────────────────────────────────────┤
│  🗺️ HARİTA                                                 │
│  [Google Maps Embed]                                       │
└────────────────────────────────────────────────────────────┘
```

### 5. Okullar Sayfası (/okullar)

```
┌────────────────────────────────────────────────────────────┐
│  🏫 BİZİ TERCİH EDEN OKULLAR                               │
│  50+ okul bize güveniyor                                   │
├────────────────────────────────────────────────────────────┤
│  🔍 FİLTRELE                                               │
│  [Şehir] [Tür] [Arama]                                     │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  │
│  │ [Logo]  Ankara Atatürk Lisesi                       │  │
│  │         Ankara │ Devlet │ 500 Öğrenci              │  │
│  │         "Sistem sayesinde öğrenci takibi..."        │  │
│  │         [Siteyi Ziyaret Et]                         │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ [Logo]  İstanbul Fen Lisesi                         │  │
│  │         İstanbul │ Özel │ 1200 Öğrenci             │  │
│  │         "Veli iletişimi çok kolaylaştı..."          │  │
│  │         [Siteyi Ziyaret Et]                         │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### 6. Blog Sayfası (/blog)

```
┌────────────────────────────────────────────────────────────┐
│  📝 BLOG                                                   │
│  Eğitim teknolojileri ve deneme takip ipuçları             │
├────────────────────────────────────────────────────────────┤
│  🏷️ ETİKETLER                                             │
│  #EğitimTeknolojisi #DenemeTakip #ÖğrenciBaşarısı          │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ [Görsel]    │ │ [Görsel]    │ │ [Görsel]    │          │
│  │ Kategori    │ │ Kategori    │ │ Kategori    │          │
│  │ Makale      │ │ Makale      │ │ Makale      │          │
│  │ Başlığı     │ │ Başlığı     │ │ Başlığı     │          │
│  │ Özet...     │ │ Özet...     │ │ Özet...     │          │
│  │ Devamını Oku│ │ Devamını Oku│ │ Devamını Oku│          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├────────────────────────────────────────────────────────────┤
│  📄 SAYFALAMA                                              │
│  [Önceki] 1 2 3 ... 10 [Sonraki]                          │
└────────────────────────────────────────────────────────────┘
```

### 7. Demo Sayfası (/demo)

```
┌────────────────────────────────────────────────────────────┐
│  🎯 DENEME TAKİP SİSTEMİNİ KEŞFEDİN                        │
│  Ücretsiz demo hesabı oluşturun                            │
├────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┬────────────────────────┐      │
│  │                        │                        │      │
│  │  📝 DEMO BAŞVURU       │  ✨ ÖZELLİKLER        │      │
│  │  FORMU                 │                        │      │
│  │                        │  ✅ Canlı deneme      │      │
│  │  • Okul Adı            │  ✅ Örnek veriler     │      │
│  │  • Yetkili Adı         │  ✅ 14 gün ücretsiz   │      │
│  │  • Email               │  ✅ Teknik destek     │      │
│  │  • Telefon             │                        │      │
│  │  • Öğrenci Sayısı      │  📊 DEMO İSTATİSTİK  │      │
│  │                        │  1000+ Demo Hesabı    │      │
│  │  [Hemen Oluştur]       │  500+ Aktif Kullanım  │      │
│  │                        │                        │      │
│  └────────────────────────┴────────────────────────┘      │
├────────────────────────────────────────────────────────────┤
│  🎥 DEMO VİDEOSU                                           │
│  [Video Player]                                            │
└────────────────────────────────────────────────────────────┘
```

### 8. Super Admin Paneli (/super-admin)

```
┌────────────────────────────────────────────────────────────┐
│  🎛️ SUPER ADMIN PANELİ        👤 Super Admin │ Çıkış      │
├──────────────┬─────────────────────────────────────────────┤
│              │                                             │
│  📊 GÖSTERGE │  📈 GENEL İSTATİSTİKLER                    │
│  PANELİ      │  ┌────────┐ ┌────────┐ ┌────────┐         │
│              │  │  50    │ │ 10.2K  │ │ 125K   │         │
│  📋 Okullar  │  │ Okul   │ │Öğrenci │ │ Deneme │         │
│  👤 Kullanıcı│  └────────┘ └────────┘ └────────┘         │
│  💰 Lisanslar│                                             │
│  📊 Raporlar │  📊 AYLARA GÖRE BÜYÜME                    │
│  ⚙️ Ayarlar  │  [Line Chart]                              │
│              │                                             │
│  🔔 Bildirim │  🏆 EN AKTİF OKULLAR                      │
│              │  1. Ankara Atatürk Lisesi - 500 öğrenci   │
│              │  2. İstanbul Fen Lisesi - 450 öğrenci     │
│              │  3. İzmir Anadolu Lisesi - 400 öğrenci    │
│              │                                             │
├──────────────┤  📈 SON 7 GÜN ETKİNLİĞİ                   │
│              │  [Activity Heatmap]                        │
│  YENİ OKUL   │                                             │
│  EKLE +      │  ⚠️ SİSTEM UYARILARI                      │
│              │  • 3 lisansı bitmek üzere                 │
│              │  • 2 okul ödeme gecikmesi                 │
│              │  • 1 sunucu uyarısı                       │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

#### Super Admin - Okul Yönetimi

```
┌────────────────────────────────────────────────────────────┐
│  📋 OKUL YÖNETİMİ                                          │
├────────────────────────────────────────────────────────────┤
│  [+ Yeni Okul Ekle]  [İçe Aktar]  [Dışa Aktar]            │
├────────────────────────────────────────────────────────────┤
│  🔍 Ara │ 📍 Şehir │ 📅 Tarih │ 📊 Durum │ 🏷️ Plan        │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ☑ │ [Logo] Ankara Atatürk Lisesi                   │  │
│  │   │ ahl.denemetakip.net │ Ankara │ Aktif │ Profesyonel│  │
│  │   │ 500 öğrenci │ 50 sınav │ Bitiş: 15.03.2025      │  │
│  │   │ [Gör] [Düzenle] [Lisans] [Sil]                  │  │
│  └─────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│  Sayfa 1 / 5 │ Toplam 50 okul                             │
└────────────────────────────────────────────────────────────┘
```

#### Super Admin - Yeni Okul Ekleme Formu

```
┌────────────────────────────────────────────────────────────┐
│  🏫 YENİ OKUL EKLE                                         │
├────────────────────────────────────────────────────────────┤
│  OKUL BİLGİLERİ                                            │
│  • Okul Adı (*)                                            │
│  • Okul Kodu (*) [Otomatik üretim]                         │
│  • Subdomain (*) [xxx].denemetakip.net                     │
│  • Özel Domain [opsiyonel]                                 │
│  • Logo [Yükle]                                            │
│  • Favicon [Yükle]                                         │
├────────────────────────────────────────────────────────────┤
│  TEMA AYARLARI                                             │
│  • Ana Renk [Renk Seçici]                                  │
│  • İkincil Renk [Renk Seçici]                              │
│  • Tema [Aydınlık / Karanlık / Sistem]                     │
├────────────────────────────────────────────────────────────┤
│  YETKİLİ BİLGİLERİ                                         │
│  • Yetkili Adı (*)                                         │
│  • Yetkili Email (*)                                       │
│  • Telefon (*)                                             │
├────────────────────────────────────────────────────────────┤
│  LİSANS BİLGİLERİ                                          │
│  • Plan (*) [Başlangıç / Profesyonel / Kurumsal]           │
│  • Başlangıç Tarihi (*)                                    │
│  • Bitiş Tarihi (*)                                        │
│  • Özel Fiyat [Kurumsal için]                              │
│  • Otomatik Yenileme [☑]                                   │
├────────────────────────────────────────────────────────────┤
│  [İptal]                              [Okul Oluştur]       │
└────────────────────────────────────────────────────────────┘
```

#### Super Admin - Okul Detay Sayfası

```
┌────────────────────────────────────────────────────────────┐
│  [Logo] Ankara Atatürk Lisesi                              │
│  ahl.denemetakip.net │ Ankara │ Aktif                      │
│  [Siteye Git] [Giriş Yap] [Düzenle] [Yedek Al] [Sil]      │
├──────────────┬─────────────────────────────────────────────┤
│              │                                             │
│  📊 GENEL    │  ÖĞRENCİ DAĞILIMI [Pie Chart]              │
│  • 500 Öğrenci                                        │
│  • 50 Deneme         │  AYLARA GÖRE SINAV SAYISI [Bar]    │
│  • 25 Öğretmen                                        │
│  • 1000 Veli         │                                     │
│              │  SON AKTİVİTELER                            │
│  💰 LİSANS   │  • 2 saat önce - 50 öğrenci eklendi       │
│  • Profesyonel       │  • 5 saat önce - Deneme yüklendi    │
│  • Bitiş: 15.03.2025 │  • 1 gün önce - Mesaj gönderildi    │
│  • 45 gün kaldı      │                                     │
│              │                                             │
│  ⚙️ HIZLI    │                                             │
│  İŞLEMLER    │                                             │
│  • Şifre Sıfırla                                       │
│  • Bakım Modu                                        │
│  • Veritabanı Export                                 │
│  • Logları Görüntüle                                  │
│              │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

## PWA Dinamik Yapılandırma

### Manifest API Endpoint

```
GET https://[subdomain].denemetakip.net/api/manifest

Response:
{
  "name": "Ankara Atatürk Lisesi",
  "short_name": "AAL",
  "description": "AAL Deneme Takip Sistemi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icons/icon-72x72.png", "sizes": "72x72" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512" }
  ]
}
```

### Otomatik Icon Üretimi

```typescript
// Sharp ile okul logosundan PWA icon'ları üretme
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
for (const size of sizes) {
  await sharp(logoPath)
    .resize(size, size)
    .toFile(`public/icons/icon-${size}x${size}.png`);
}
```

## Subdomain Routing Mimarisi

### DNS Yapılandırması

```
; Wildcard subdomain
*.denemetakip.net.  A     192.0.2.1
*.denemetakip.net.  AAAA  2001:db8::1
```

### Next.js Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const subdomain = host.replace('.denemetakip.net', '');
  
  // Ana domain
  if (host === 'denemetakip.net') {
    return NextResponse.next();
  }
  
  // Subdomain - Okul uygulamasına yönlendir
  if (subdomain && subdomain !== 'www') {
    // Okul varlığını kontrol et
    // Özel subdomain routing
    return NextResponse.rewrite(
      new URL(`/${subdomain}${request.nextUrl.pathname}`, request.url)
    );
  }
}
```

### Nginx Konfigürasyonu

```nginx
server {
    listen 80;
    server_name *.denemetakip.net denemetakip.net;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Otomatik Kurulum Akışı

```
┌──────────────────────────────────────────────────────────────┐
│  1. SÜPER ADMİN YENİ OKUL EKLE                               │
│     ↓                                                        │
│  2. FORM DOĞRULAMA                                           │
│     ↓                                                        │
│  3. VERİTABANINDA KAYIT OLUŞTURMA                            │
│     - School kaydı                                          │
│     - Admin User kaydı                                      │
│     - License kaydı                                         │
│     ↓                                                        │
│  4. SUBDOMAIN DNS KAYDI OLUŞTURMA                            │
│     - Cloudflare/DigitalOcean API                          │
│     ↓                                                        │
│  5. SSL SERTİFİKASI OLUŞTURMA                                │
│     - Let's Encrypt otomatik                                │
│     ↓                                                        │
│  6. PWA ASSETLERİNİ ÜRETME                                   │
│     - Logo işleme (Sharp)                                   │
│     - Favicon oluşturma                                     │
│     - Manifest.json oluşturma                               │
│     - Splash screen oluşturma                               │
│     ↓                                                        │
│  7. HOŞGELDİNİZ EMAILİ GÖNDERME                              │
│     - Giriş bilgileri                                        │
│     - Subdomain linki                                        │
│     - Hızlı başlangıç kılavuzu                               │
│     ↓                                                        │
│  8. KURULUM TAMAMLANDI ✓                                     │
└──────────────────────────────────────────────────────────────┘
```

## Teknoloji Detayları

### Landing Page Stack
- **Next.js 14** (App Router, Server Components)
- **Tailwind CSS** (Responsive, Dark Mode)
- **shadcn/ui** (UI Components)
- **Framer Motion** (Animations)
- **MDX** (Blog içerikleri)
- **React Hook Form** (Form yönetimi)
- **Zod** (Validasyon)

### Backend Entegrasyonu
- **Prisma** (Database ORM)
- **NextAuth.js** (Authentication)
- **React Query** (Server State)
- **Zustand** (Client State)

### DevOps
- **Docker** (Containerization)
- **GitHub Actions** (CI/CD)
- **Vercel** (Hosting - Landing)
- **DigitalOcean** (Backend Hosting)
- **Cloudflare** (DNS + CDN)

## Dosya Yapısı

```
landing-page/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Ana sayfa
│   ├── globals.css
│   ├── (pages)/
│   │   ├── hakkimizda/
│   │   ├── ozellikler/
│   │   ├── fiyatlandirma/
│   │   ├── yardim/
│   │   ├── iletisim/
│   │   ├── okullar/
│   │   ├── blog/
│   │   └── demo/
│   ├── super-admin/
│   │   ├── layout.tsx          # Super admin layout
│   │   ├── page.tsx            # Dashboard
│   │   ├── okullar/
│   │   ├── kullanicilar/
│   │   ├── lisanslar/
│   │   └── raporlar/
│   └── api/
│       ├── manifest/route.ts   # Dinamik PWA manifest
│       └── og/route.tsx        # Open Graph images
├── components/
│   ├── ui/                     # shadcn components
│   ├── layout/                 # Layout components
│   ├── sections/               # Page sections
│   └── super-admin/            # Admin components
├── lib/
│   ├── prisma.ts
│   ├── utils.ts
│   └── constants.ts
├── content/
│   └── blog/                   # MDX blog posts
├── public/
│   ├── images/
│   ├── fonts/
│   └── icons/
├── types/
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## Özet

Bu mimari ile:
- ✅ Tek kod tabanı ile çoklu landing page
- ✅ Her okul için özelleştirilmiş subdomain
- ✅ Dinamik PWA yapılandırması
- ✅ Kapsamlı Super Admin paneli
- ✅ Otomatik kurulum süreci
- ✅ Ölçeklenebilir yapı

elde edilecektir.

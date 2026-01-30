# Raporlar Modülü Kullanım Kılavuzu

## Genel Bakış

Raporlar modülü, okullarda yapılan denemelerin sonuçlarını görüntülemek, analiz etmek ve dışa aktarmak için geliştirilmiş kapsamlı bir rapor sistemidir.

## Erişim Yetkileri

- **Öğretmenler**: Tüm rapor özelliklerine erişebilir
- **Okul Yöneticileri**: Tüm rapor özelliklerine erişebilir
- **Öğrenciler ve Veliler**: Raporlara erişemez

## Özellikler

### 1. Sınav Raporları

#### Özet Rapor
Seçilen kriterlere göre tüm denemelerin özet bilgilerini gösterir:
- Deneme adı
- Tarih
- Katılım sayısı
- Derslerin okul net ortalamaları
- Puan ortalamaları

#### Ayrıntılı Rapor
Her sınav için detaylı ders bazlı istatistikler:
- Ortalama doğru sayısı
- Ortalama yanlış sayısı
- Ortalama boş sayısı
- Ortalama net sayısı

### 2. Ders Bazlı Raporlar

Belirli bir dersin tüm denemelerdeki performans geçmişini gösterir:
- Deneme bazında ortalamalar
- Zaman içinde performans trendi
- Katılım istatistikleri

## Kullanım

### Rapor Oluşturma

1. Dashboard'da "Raporlar" menüsüne tıklayın
2. Rapor parametrelerini seçin:
   - **Rapor Türü**: Sınav Raporu veya Ders Bazlı Rapor
   - **Sınav Türü**: TYT, AYT, LGS, veya ÖZEL
   - **Sınıf Seviyesi**: İsteğe bağlı (boş bırakılırsa tüm sınıflar)
   - **Ders**: Sadece ders bazlı raporlar için
3. Görünüm seçin (Sınav raporları için):
   - **Özet**: Genel bakış
   - **Ayrıntılı**: Detaylı ders istatistikleri
4. "Rapor Oluştur" butonuna tıklayın

### Raporları Dışa Aktarma

Oluşturulan her rapor iki formatta indirilebilir:

#### Excel Format (.xlsx)
- Tablo halinde düzenlenmiş veriler
- Excel'de düzenlenebilir
- Filtre ve sıralama yapılabilir
- Grafik oluşturma için uygun

#### PDF Format (.pdf)
- Yazdırmaya hazır format
- Profesyonel görünüm
- Paylaşıma uygun

**İndirme**: Rapor görüntülendikten sonra sağ üst köşedeki "Excel İndir" veya "PDF İndir" butonlarını kullanın.

## Rapor Türleri ve Örnekler

### Örnek 1: 8. Sınıf LGS Sınav Özet Raporu

```
Filtreler:
- Rapor Türü: Sınav Raporu
- Sınav Türü: LGS
- Sınıf Seviyesi: 8
- Görünüm: Özet

Sonuç:
Tüm 8. sınıf LGS denemelerinin listesi, her deneme için:
- Türkçe, Matematik, Fen, Sosyal, İngilizce, Din net ortalamaları
- Katılım sayıları
- Toplam puan ortalamaları
```

### Örnek 2: 12. Sınıf TYT Ayrıntılı Rapor

```
Filtreler:
- Rapor Türü: Sınav Raporu
- Sınav Türü: TYT
- Sınıf Seviyesi: 12
- Görünüm: Ayrıntılı

Sonuç:
Her TYT denemesi için ayrı ayrı:
- Türkçe: Ortalama doğru, yanlış, boş, net
- Matematik: Ortalama doğru, yanlış, boş, net
- Fen Bilimleri: Ortalama doğru, yanlış, boş, net
- Sosyal Bilimler: Ortalama doğru, yanlış, boş, net
```

### Örnek 3: TYT Türkçe Ders Raporu

```
Filtreler:
- Rapor Türü: Ders Bazlı Rapor
- Sınav Türü: TYT
- Ders: Türkçe
- Sınıf Seviyesi: 12

Sonuç:
TYT Türkçe dersinin tüm denemelerdeki performansı:
- Her deneme için Türkçe ortalamaları
- Zaman içinde performans değişimi
- Deneme bazında katılım sayıları
```

## API Endpointleri

Backend raporlar için aşağıdaki endpointleri sağlar:

### JSON Formatında Veri

- `GET /reports/exams/summary` - Sınav özet raporu
- `GET /reports/exams/detailed` - Sınav ayrıntılı raporu
- `GET /reports/subject` - Ders bazlı rapor
- `GET /reports/exam/:id` - Tekil sınav raporu

### Parametreler
- `examType`: TYT, AYT, LGS, OZEL (zorunlu)
- `gradeLevel`: 5-12 arası (isteğe bağlı)
- `lessonName`: Ders adı (ders bazlı raporlar için zorunlu)

### Excel İndirme

- `GET /reports/exams/summary/excel`
- `GET /reports/exams/detailed/excel`
- `GET /reports/subject/excel`

### PDF İndirme

- `GET /reports/exams/summary/pdf`
- `GET /reports/exams/detailed/pdf`
- `GET /reports/subject/pdf`

## Teknik Detaylar

### Backend Mimarisi

```
backend/src/reports/
├── reports.module.ts      # NestJS modülü
├── reports.service.ts     # İş mantığı ve veri işleme
├── reports.controller.ts  # API endpointleri
└── export.service.ts      # Excel ve PDF oluşturma
```

### Frontend Bileşenleri

```
frontend/src/app/dashboard/reports/
└── page.tsx              # Raporlar sayfası
```

### Kullanılan Kütüphaneler

**Backend:**
- `exceljs` - Excel dosyası oluşturma
- `pdfkit` - PDF dosyası oluşturma
- `@nestjs/common` - NestJS core

**Frontend:**
- `shadcn/ui` - UI bileşenleri
- `lucide-react` - İkonlar
- `next.js` - React framework

## Sorun Giderme

### "Ders bulunamadı" hatası
- Seçilen ders adının veritabanında mevcut olduğundan emin olun
- Ders adının sınav türüne uygun olduğunu kontrol edin

### Rapor boş geliyor
- Seçilen kriterlere uygun sınav olduğundan emin olun
- Sınavların sonuçları girilmiş olmalı
- Öğrenci katılımı olmalı

### PDF/Excel indirme çalışmıyor
- Tarayıcınızın indirme izinlerini kontrol edin
- Backend sunucusunun çalıştığından emin olun
- Console'da hata mesajlarını kontrol edin

## Güvenlik

- Tüm rapor endpointleri JWT ile korunmaktadır
- Sadece TEACHER ve SCHOOL_ADMIN rolleri erişebilir
- Her rapor sadece kullanıcının okuluna ait verileri gösterir

## Gelecek Geliştirmeler

Planlanan özellikler:
- Grafik ve görselleştirmeler
- Karşılaştırmalı raporlar
- E-posta ile rapor gönderme
- Otomatik periyodik raporlar
- Özelleştirilebilir rapor şablonları

# Denemetakip Landing + Superadmin + Frontend Rollout Plan

Bu plan, `Denemetakip landingpage geliştirmeleri.md` içindeki tüm maddeleri risk ve bağımlılık sırasına göre adım adım uygulamak için hazırlanmıştır.

## 1) Çalışma Şekli

- Branch: `feature/landing-superadmin-frontend-rollout`
- Ana yaklaşım: küçük ve test edilebilir adımlar, her adım sonrası doğrulama
- Değişiklik kümeleri: `landing-page`, `frontend`, `backend`, `super-admin`
- Her adım için:
  - Analiz ve etki alanı tespiti
  - Kodlama
  - Test/doğrulama
  - Commit

## 2) Önceliklendirme

### P0 (Canlı hatalar ve kritik riskler)

1. Frontend logout/login döngüsü (dashboardda kalma, cookie temizlenmeme)
2. İlk tıklamada hata verip ikinci tıklamada çalışması (`removeChild null`, 404 logo)
3. Tenant izolasyonu sorunları:
   - Öğrenci tarafında yanlış okul adı/logosu görünmesi
   - Rozetlerin okullar arası karışması
   - Çalışma planı ders/konu değişikliklerinin diğer okulları etkilemesi
4. Öğrenci deneme listesinde TYT/AYT yanlış eşleşme ve görünmeyen sınavlar

### P1 (İş akışı ve yönetim)

5. Superadmin okul düzenleme ekranı logo yükleme 404/400 hatası
6. Superadmin mail merkezi + lisans uyarıları sayfası
  - `info@`, `kvkk@`, `admin@2eh.net`, `admin@denemetakip.net` gibi hedeflere düşen kayıtların tek merkezden görüntülenmesi
  - Gelen kaydın kaynağa göre kategorilenmesi (`KVKK Uyarısı`, `Genel Bilgi`, `Sistem Yönetimi`, `Demo`, `İletişim`)
  - Mail/demo/talep kayıtlarının superadmin panelinde filtrelenmesi ve durum takibi
7. Okul dashboard yardım ve destek merkezi
  - Yalnız okul yöneticisinin ticket açabilmesi
  - Ticket yanıtlarını görüntüleme, ticket kapatma/yeniden açma
  - Superadmin ticket yanıt ekranı ile aynı veri kaynağının kullanılması
8. Okul kullanıcı kullanım logları (IP, kullanıcı, erişilen alanlar)
9. Yedekleme sisteminin okul bazlı ele alınması

### P2 (Landing page ve içerik/iletişim)

10. Tanıtım videosu, canlı veri alanı görsel/video slider
11. İletişim bilgileri ve mail akışlarının netleştirilmesi (`info@`, `kariyer@`, `kvkk@`)
12. Demo/iletişim formu maillerinin hedefi ve superadmin panel görünürlüğü
13. Özellikler/Fiyatlandırma eşleşmesi (admin panel verisi), buton okunurluğu
14. Okullar sayfasının dinamik filtrelenmesi (sadece mevcut iller)
15. Yardım/SSS/video içerikleri, ekran görüntüsü eklemeleri
  - Landing yardım merkezi ile okul dashboard yardım sayfasının içerik ortaklaştırılması
  - Yazılı anlatım + görüntülü/video anlatım bölümleri
16. Hukuki metin revizyonu (`gizlilik`, `kosullar`, `kvkk`)
17. Referans kullanıcı adlarının gerçek verilerle güncellenmesi

### P3 (UX iyileştirmeleri)

18. Sidebar menü gruplamaları
19. Giriş sayfası modernizasyonu
20. Mobil görünüm düzeltmeleri

## 3) Teknik İş Listesi (Adım Adım)

## Adım 1 - Keşif ve kapsam sabitleme (tamamlandı)

- İlgili route ve modülleri çıkar:
  - `landing-page/app/*`
  - `frontend/src/*`
  - `backend/src/*`
- Mail/form akışının backend endpointlerini tespit et
- Çok kiracılı (tenant) filtrelerin uygulandığı servisleri tespit et

Çıktı:
- Etkilenen dosya listesi
- Her P0 maddesi için düzeltme yaklaşımı

## Adım 2 - P0 hata düzeltmeleri

- Logout/login yönlendirme ve auth state temizliği
- İlk tıklama hatalarının kök neden analizi (`removeChild`, eksik logo fallback)
- Öğrenci denemeleri TYT/AYT filtre düzeltmesi
- Tenant izolasyonu: okul logo/adı, rozet, çalışma planı

Durum notu:
- Tamamlandı: logout/login döngüsü, favicon/removeChild hatası, logo URL 404 akışı, okul düzenleme 400 payload sorunu
- Tamamlandı: login + öğrenci sınav geçmişinde okul bazlı izolasyon güçlendirmeleri
- Tamamlandı: öğrenci sonuç ekranında TYT/AYT/LGS/OZEL tiplerinin veri bazlı filtrelenmesi
- Tamamlandı: ders/konu katalogu için okul bazlı subject/topic izolasyonu ve global katalogdan okul kopyası senkronizasyonu
- Tamamlandı: rozet öğrenci erişimi okul/kullanıcı bazında sıkılaştırıldı
- Tamamlandı: öğrenci grup üyeliği yeniden-aktivasyon ve grup listeleme scope düzeltmeleri
- Tamamlandı: çalışma planı öğrenci atama görünürlüğü school/group/class/grade bazında sıkılaştırıldı
- Tamamlandı: onaylı/toplu mesajlarda alıcı hedeflerinin kalıcı saklanması ve öğrenci bildirim akışı düzeltildi

Doğrulama:
- Manuel senaryo testleri + mümkünse birim/e2e test

## Adım 3 - Superadmin kritikleri

- Okul logo yükleme API/servis düzeltmesi
- Mail merkezi + lisans uyarı ekranı
  - İletişim formu ve demo taleplerini tek listede toplama
  - Kategori/kanal/hedef mail bazlı filtreleme
  - `KVKK Uyarısı` gibi otomatik etiketleme kuralları
- Kullanım logu altyapısı (günlük)

Durum notu:
- Başlıyor: superadmin mail merkezi, kategori kuralları ve lisans alarm ekranı
- Tamamlandı: superadmin mail merkezi, hedef inbox bazlı kategori etiketleme ve lisans uyarı akışı eklendi
- Tamamlandı: okul kullanıcı kullanım logları için global interceptor, superadmin filtreleme ekranı ve günlük istatistikler eklendi
- Tamamlandı: okul bazlı yedek kapsamı school-scoped ders/konu kataloğu, destek ticketları ve erişim loglarını içerecek şekilde genişletildi

Doğrulama:
- Superadmin panel iş akışı testleri

## Adım 4 - Okul dashboard destek merkezi

- Okul yöneticisi için destek/ticket oluşturma ekranı
- Açık/kapalı ticket listesi, yanıt geçmişi, kapatma/yeniden açma
- Superadmin ticket ekranının gerçek backend verisine bağlanması
- Gerekirse ticket yanıtlarında okul ve kullanıcı bağlamı gösterimi

Doğrulama:
- Okul yöneticisi ticket açma/yanıtlama/kapatma senaryoları
- Superadmin ticket cevaplama akışı

Durum notu:
- Tamamlandı: okul dashboard yardım ve destek merkezi, okul yöneticisi ticket açma/yanıtlama/kapatma akışı ve superadmin ticket yönetimi canlı veriye bağlandı

## Adım 5 - Landing page içerik ve entegrasyon

- Video, görsel slider, ekran görüntüleri
- İletişim ve demo formu mail hedeflerinin netleştirilmesi
- Fiyatlandırma verisinin admin panel planlarıyla eşlenmesi
- Dinamik okullar/il filtresi

Doğrulama:
- Route bazlı smoke test (`/`, `/ozellikler`, `/fiyatlandirma`, `/okullar`, `/iletisim`)

## Adım 6 - Hukuki ve yardım içerikleri

- `gizlilik`, `kosullar`, `kvkk`, `yardim` revizyonları
- Video yardım + ekran görüntülü anlatımlar
- Okul dashboard yardım ve destek sayfası için yazılı/görsel kullanım anlatımları

## Adım 7 - UI/UX son rötuşlar

- Sidebar gruplamaları
- Giriş sayfası güncel tasarım
- Mobil layout düzeltmeleri

## Adım 8 - GitHub teslim

- Her mantıklı adım için ayrı commit
- Branch push: `origin/feature/landing-superadmin-frontend-rollout`
- Sonunda tek PR açılabilir veya P0/P1 için ayrı PR önerilir

## 4) Commit Stratejisi

Örnek commit başlıkları:

- `fix(auth): resolve logout redirect and stale session loop`
- `fix(multitenancy): isolate school-scoped badges and study plans`
- `fix(exams): correct TYT/AYT filtering on student dashboard`
- `fix(superadmin): repair school logo upload and validation`
- `feat(landing): add demo video and dynamic school city filters`
- `feat(admin): add mail and license alert center`
- `feat(support): add school dashboard help and ticket center`
- `content(legal): revise privacy terms and kvkk pages`

## 5) Riskler

- Tenant izolasyonu mevcut veri modelinde migration gerektirebilir
- Mail yönlendirme için SMTP/worker tarafında ek konfigürasyon gerekebilir
- Hukuki metin güncellemesi teknik değil, içerik onayı gerektirebilir

## 6) Başarı Kriteri

- P0 maddelerinin tamamı üretim senaryolarında doğrulanmış olmalı
- P1 maddeleri işlevsel ve ölçülebilir olmalı
- Landing sayfaları içerik/iletişim/fiyat akışıyla tutarlı olmalı
- Tüm değişiklikler bu branch üzerinde commitlenmiş ve push edilmiş olmalı

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const blogPosts = [
  {
    title: 'Deneme Takip Sistemi Nasıl Kullanılır? Başlangıç Rehberi',
    slug: 'deneme-takip-sistemi-nasil-kullanilir',
    excerpt:
      'Deneme Takip Sistemi ile öğrencilerinizin sınav performanslarını kolayca takip edin. Bu rehberde sisteme giriş, öğrenci ekleme ve ilk deneme sınavının kaydedilmesini adım adım anlatıyoruz.',
    content: `# Deneme Takip Sistemi Nasıl Kullanılır?

Deneme Takip Sistemi, okulların ve dershanelerin öğrenci performansını dijital ortamda takip etmesini sağlayan kapsamlı bir platformdur. Bu rehberde sistemi ilk kez kullanacak okul yöneticileri için adım adım bir başlangıç kılavuzu sunuyoruz.

## 1. Sisteme Giriş

Okulunuzun alt alan adı üzerinden (örn: \`okulunuz.denemetakip.net\`) giriş sayfasına ulaşabilirsiniz. Okul yöneticisi olarak size verilen e-posta ve şifre ile giriş yapın.

## 2. Öğrenci ve Sınıf Ekleme

Giriş yaptıktan sonra ilk yapmanız gereken öğrencilerinizi sisteme eklemektir:

- **Tekli Ekleme:** Sol menüden "Öğrenciler" → "Yeni Öğrenci" butonuna tıklayın
- **Toplu Ekleme:** Excel dosyası ile yüzlerce öğrenciyi tek seferde ekleyin. "İçe Aktar" butonunu kullanın
- **Sınıf Oluşturma:** Önce sınıflarınızı tanımlayın, ardından öğrencileri sınıflara atayın

## 3. Deneme Sınavı Kaydetme

"Sınavlar" menüsünden yeni bir deneme sınavı oluşturabilirsiniz:

1. Sınav türünü seçin (TYT, AYT, LGS vb.)
2. Sınav tarihini ve adını girin
3. Optik form veya manuel giriş ile sonuçları ekleyin
4. Sistem otomatik olarak net hesaplaması yapar

## 4. Raporları İnceleme

Dashboard üzerinden öğrencilerinizin:
- Genel başarı ortalaması
- Konu bazlı güçlü/zayıf alanları
- Zaman içindeki ilerleme grafikleri
- Sınıf bazlı karşılaştırmalar

gibi raporlara anında erişebilirsiniz.

## 5. Veli Bildirimleri

Sistem üzerinden velilere otomatik bildirim gönderebilirsiniz. Her deneme sonrası veli, çocuğunun performansını kendi panelinden görebilir.

---

**İpucu:** İlk kullanımda "Yardım" menüsünden video eğitimlerimize de göz atabilirsiniz.`,
    category: 'Rehber',
    tags: ['başlangıç', 'rehber', 'kullanım', 'yeni başlayanlar'],
    status: 'PUBLISHED',
    author: 'Deneme Takip Ekibi',
    views: 1842,
    publishedAt: new Date('2026-02-01'),
  },
  {
    title: 'Excel ile Toplu Öğrenci Ekleme: Adım Adım Rehber',
    slug: 'excel-ile-toplu-ogrenci-ekleme',
    excerpt:
      'Yüzlerce öğrenciyi tek tek eklemek yerine Excel dosyası ile dakikalar içinde sisteme aktarın. Şablon indirme, veri hazırlama ve içe aktarma adımlarını detaylı anlatıyoruz.',
    content: `# Excel ile Toplu Öğrenci Ekleme

Dönem başında yüzlerce öğrenciyi tek tek eklemek zaman kaybıdır. Deneme Takip Sistemi'nin toplu içe aktarma özelliği ile bu işlemi dakikalara indirebilirsiniz.

## Adım 1: Şablonu İndirin

Yönetici panelinden "Öğrenciler" → "İçe Aktar" → "Şablon İndir" butonuna tıklayarak Excel şablonunu indirin.

## Adım 2: Verileri Hazırlayın

Şablondaki sütunları doldurun:

| Sütun | Açıklama | Zorunlu |
|-------|----------|---------|
| Ad | Öğrencinin adı | ✅ |
| Soyad | Öğrencinin soyadı | ✅ |
| Öğrenci No | Benzersiz numara | ✅ |
| Sınıf | Sınıf adı (ör: 9-A) | ✅ |
| E-posta | Öğrenci e-postası | ❌ |
| TC No | TC Kimlik numarası | ❌ |

## Adım 3: Dosyayı Yükleyin

Hazırladığınız dosyayı "İçe Aktar" sayfasından yükleyin. Sistem:
- Verileri doğrular
- Eksik sınıfları otomatik oluşturur
- Çakışan öğrenci numaralarını uyarır
- Başarıyla eklenen/hatalı kayıtları raporlar

## Dikkat Edilecekler

- Excel dosyası **.xlsx** formatında olmalıdır
- İlk satır başlık satırı olmalıdır
- Öğrenci numaraları benzersiz olmalıdır
- Sınıf adları tutarlı olmalıdır (9-A, 9-B gibi)

---

**Pro İpucu:** Her dönem başında mevcut öğrenci listesini "Dışa Aktar" ile indirip, yeni dönem için güncelleyerek tekrar yükleyebilirsiniz.`,
    category: 'Rehber',
    tags: ['excel', 'toplu ekleme', 'öğrenci', 'içe aktarma'],
    status: 'PUBLISHED',
    author: 'Deneme Takip Ekibi',
    views: 2156,
    publishedAt: new Date('2026-02-05'),
  },
  {
    title: 'Deneme Sınavı Sonuçlarını Analiz Etme Rehberi',
    slug: 'deneme-sinavi-sonuclarini-analiz-etme',
    excerpt:
      'Deneme sınavı sonuçlarını sadece girmek değil, doğru analiz etmek de önemli. Konu bazlı analiz, trend takibi ve öğrenciye özel raporlama ile başarıyı artırma yöntemlerini keşfedin.',
    content: `# Deneme Sınavı Sonuçlarını Analiz Etme

Deneme sınavları, bir öğrencinin mevcut durumunu gösteren en değerli araçlardır. Ancak asıl fark, bu sonuçların *nasıl analiz edildiğinde* ortaya çıkar.

## Genel Bakış Raporu

Her deneme sınavından sonra "Raporlar" menüsünden genel bakış raporu oluşturabilirsiniz:

- **Sınıf Ortalaması:** Sınıflarınızın genel performansı
- **En Yüksek / En Düşük:** Sıralama ve uç değerler
- **Önceki Sınavla Karşılaştırma:** Yükseliş ve düşüş trendleri

## Konu Bazlı Analiz

Sistem, her soruyu konu ve alt konuya eşleştirerek detaylı analiz sunar:

1. Hangi konularda sınıf geneli başarılı?
2. Hangi konularda toplu zayıflık var?
3. Bireysel olarak hangi öğrencinin hangi konuda desteğe ihtiyacı var?

Bu bilgilerle **ders planınızı optimize** edebilirsiniz.

## Trend Analizi

En az 3 deneme sonrasında trend grafikleri anlam kazanır:

- Öğrenci bazlı ilerleme eğrileri
- Konu bazlı başarı trendleri
- Sınıf bazlı karşılaştırmalı grafikler

## Veli Raporu

Her deneme sonrası velilere otomatik olarak gönderilen raporda:
- Çocuğunun net sayısı ve sıralaması
- Güçlü ve zayıf alanları
- Önerilen çalışma konuları

yer alır. Bu sayede veli-okul iletişimi güçlenir.

---

**Öneri:** Her ay düzenli olarak raporları inceleyip, etüt planlarınızı buna göre güncelleyin.`,
    category: 'Rehber',
    tags: ['analiz', 'rapor', 'sınav sonuçları', 'konu analizi'],
    status: 'PUBLISHED',
    author: 'Deneme Takip Ekibi',
    views: 1567,
    publishedAt: new Date('2026-02-10'),
  },
  {
    title: 'Çalışma Planı Modülü ile Öğrenci Verimliliğini Artırın',
    slug: 'calisma-plani-modulu-rehberi',
    excerpt:
      'Deneme Takip Sistemi\'nin çalışma planı modülü sayesinde öğrencilerinize kişiselleştirilmiş günlük ve haftalık programlar oluşturun. Görev takibi ve ilerleme raporları ile motivasyonu yükseltin.',
    content: `# Çalışma Planı Modülü

Deneme Takip Sistemi'nin çalışma planı modülü, öğrencilerin düzenli ve planlı çalışmasını sağlamak için tasarlanmıştır.

## Çalışma Planı Oluşturma

Öğretmen panelinden "Çalışma Planları" menüsüne girin:

1. **Plan Adı:** Örn. "Mart Ayı TYT Matematik Programı"
2. **Tarih Aralığı:** Başlangıç ve bitiş tarihi belirleyin
3. **Günlük Görevler:** Her gün için konu ve süre belirleyin
4. **Tekrar Günleri:** Haftalık tekrar günlerini planlayın

## Görev Türleri

- 📖 **Konu Çalışma:** Yeni konu anlatımı ve not çıkarma
- ✏️ **Soru Çözme:** Belirli sayıda soru çözme hedefi
- 📝 **Deneme Çözme:** Mini deneme veya tam deneme
- 🔄 **Tekrar:** Önceki konuların tekrarı

## Öğrenci Tarafı

Öğrenci kendi panelinden:
- Günlük görevlerini görebilir
- Tamamladığı görevleri işaretleyebilir
- Haftalık ilerleme yüzdesini takip edebilir
- Öğretmenine not bırakabilir

## İlerleme Raporları

Öğretmen olarak:
- Hangi öğrenci planına uyuyor?
- Kim geri kalmış?
- Tamamlanma oranları nedir?

sorularının cevaplarını anlık olarak görebilirsiniz.

---

**İpucu:** Deneme sonuçlarına göre zayıf konularda otomatik çalışma planı önerisi alabilirsiniz.`,
    category: 'Rehber',
    tags: ['çalışma planı', 'verimlilik', 'planlama', 'görev takibi'],
    status: 'PUBLISHED',
    author: 'Deneme Takip Ekibi',
    views: 1234,
    publishedAt: new Date('2026-02-15'),
  },
  {
    title: 'LGS Sınavında Başarılı Olmak İçin 10 Altın Kural',
    slug: 'lgs-sinavinda-basarili-olmak-icin-10-altin-kural',
    excerpt:
      'LGS sınavında başarılı olmak isteyen öğrenciler ve veliler için uzman öğretmenlerimizin derlediği 10 kritik kural. Zaman yönetiminden konu tekrarına, deneme stratejisinden sınav günü taktiklerine kadar her şey bu yazıda.',
    content: `# LGS Sınavında Başarılı Olmak İçin 10 Altın Kural

LGS (Liselere Geçiş Sınavı), 8. sınıf öğrencilerinin lise tercihlerini belirleyen kritik bir sınavdır. İşte başarı için uzman öğretmenlerimizin önerileri:

## 1. Erken Başlayın, Düzenli Çalışın

LGS hazırlığına en geç 8. sınıfın başında başlayın. Son 3 aya sıkıştırılmış çalışma, stres ve verimsizlik demektir. Her gün düzenli 2-3 saat çalışma, haftada bir gün 10 saat çalışmaktan çok daha etkilidir.

## 2. Müfredatı İyi Tanıyın

LGS, **sadece 8. sınıf müfredatından** soru sorar. Ancak 5-6-7. sınıf konuları da temel oluşturur. Eksik kalan temel konuları mutlaka tamamlayın.

## 3. Deneme Sınavlarını Ciddiye Alın

Her hafta en az **1 tam deneme** çözün. Deneme sınavlarında önemli olan:
- Gerçek sınav koşullarında çözün (süre tutun, telefonu kapatın)
- Sonrasında mutlaka **analiz yapın**
- Yanlışlarınızı not edin ve tekrar çalışın

> 💡 Deneme Takip Sistemi ile her denemenizin detaylı konu bazlı analizini görebilirsiniz.

## 4. Paragraf Çözme Pratiği Yapın

LGS'de Türkçe dersinin en büyük bölümünü paragraf soruları oluşturur. Her gün en az **3-5 paragraf sorusu** çözün. Hız ve anlama beceriniz zamanla gelişecektir.

## 5. Matematik'te Konu Eksiklerinizi Kapatın

Matematik, LGS'de en çok puan farkı yaratan derstir. Temel konularda (oran-orantı, denklemler, olasılık, geometri) eksiğiniz varsa bunları öncelikli olarak tamamlayın.

## 6. Fen Bilimlerinde Deney ve Gözlem Sorularına Odaklanın

LGS Fen soruları genellikle **deney yorumlama** ve **grafik okuma** becerilerini ölçer. Ezber yerine, olayların *neden* ve *nasıl* olduğunu anlamaya çalışın.

## 7. Zaman Yönetimi Becerisi Geliştirin

LGS'de 90 soru için 120 dakikanız var. Bu da soru başına ortalama **1 dakika 20 saniye** demek.

- Kolay soruları hızlı çözüp zorlu sorulara vakit ayırın
- Takıldığınız soruyu bırakıp devam edin, sonra geri dönün
- Deneme sınavlarında süre pratiği yapın

## 8. Yanlış Defter Tutun

Her denemeden sonra yanlış yaptığınız soruları bir deftere not edin:
- Sorunun konusu
- Neden yanlış yaptınız
- Doğru çözüm yöntemi

Sınav öncesi bu defteri tekrar etmek çok değerlidir.

## 9. Sağlığınıza Dikkat Edin

- **Uyku:** Her gece en az 8 saat uyuyun
- **Beslenme:** Düzenli ve sağlıklı beslenin
- **Hareket:** Günde en az 30 dakika fiziksel aktivite yapın
- **Mola:** Her 45 dakika çalışmada 10 dakika mola verin

Yorgun bir beyin verimli çalışamaz!

## 10. Sınav Günü Taktikleri

- Sınav öncesi gece erken yatın
- Sabah hafif kahvaltı yapın
- Sınav yerine erken gidin
- Optik formu dikkatli doldurun
- Bilmediğiniz soruları boş bırakmayın (yanlış ceza puanı yok!)

---

**Son söz:** LGS bir maraton, sprint değil. Düzenli çalışma, doğru strateji ve motivasyon ile hedeflerinize ulaşabilirsiniz. Deneme Takip Sistemi ile ilerlemenizi ölçün, zayıf noktalarınızı güçlendirin! 💪`,
    category: 'LGS',
    tags: ['LGS', 'sınav stratejisi', 'başarı', 'zaman yönetimi', '8. sınıf'],
    status: 'PUBLISHED',
    author: 'Eğitim Uzmanları',
    views: 3421,
    publishedAt: new Date('2026-02-20'),
  },
  {
    title: 'LGS Matematik: En Çok Yapılan 5 Hata ve Çözümleri',
    slug: 'lgs-matematik-en-cok-yapilan-hatalar',
    excerpt:
      'LGS Matematik bölümünde öğrencilerin en sık düştüğü 5 hata ve bunlardan kaçınmanın yolları. Oran-orantı, denklem kurma, geometri ve olasılık konularında dikkat edilmesi gereken noktalar.',
    content: `# LGS Matematik: En Çok Yapılan 5 Hata

Her yıl binlerce öğrenci LGS matematik bölümünde benzer hataları tekrarlıyor. Bu hataları bilmek, onlardan kaçınmanın ilk adımıdır.

## Hata 1: Soruyu Dikkatsiz Okuma

En sık yapılan hata, soruyu tam okumadan çözmeye başlamaktır.

**Örnek:** "Aşağıdakilerden hangisi yanlıştır?" sorusunda doğru şıkkı aramak.

**Çözüm:**
- Soruyu en az 2 kez okuyun
- Anahtar kelimeleri altını çizin ("yanlış", "en az", "en çok", "hariç")
- Ne sorulduğunu kendi cümlelerinizle ifade edin

## Hata 2: Birim Dönüştürme Hataları

Oran-orantı ve denklem sorularında birim tutarsızlığı sık karşılaşılan bir sorundur.

**Örnek:** Saati dakikaya, cm'yi m'ye çevirmeyi unutmak.

**Çözüm:**
- Çözüme başlamadan önce tüm birimleri aynı cinsne çevirin
- Sonucu kontrol ederken birimi de kontrol edin

## Hata 3: Negatif Sayılarda İşaret Hatası

Negatif sayılarla yapılan işlemlerde işaret hatası çok yaygındır.

**Çözüm:**
- (-) × (-) = (+) kuralını her zaman hatırlayın
- Parantez kullanarak işlemleri düzenli yazın
- Acele etmeden adım adım çözün

## Hata 4: Geometride Şekle Güvenme

Geometri sorularında verilen şeklin ölçekli olduğunu varsaymak hatalıdır.

**Çözüm:**
- Sadece verilen bilgileri kullanın
- "Şekle göre..." diye düşünmeyin
- Açı, kenar ve alan hesaplamalarında formüllere bağlı kalın

## Hata 5: Olasılık ve İstatistikte Sayma Hataları

Olasılık sorularında örnek uzayı yanlış belirlemek veya durumları atlamak sık yapılır.

**Çözüm:**
- Sistematik sayma tekniklerini kullanın
- Ağaç diyagramı veya tablo çizin
- Toplam olasılığın 1 olup olmadığını kontrol edin

---

## Genel Öneriler

1. **Günde 15-20 soru** düzenli çözün
2. Her yanlışı **yanlış defterinize** not edin
3. Zorlandığınız konulara **ek video** izleyin
4. Deneme sınavlarında **süre tutun**
5. Deneme Takip Sistemi'nde konu bazlı analiz yaparak zayıf noktalarınızı tespit edin

---

> 📊 Deneme Takip Sistemi, her deneme sonrası konu bazlı analiz sunarak hangi konularda hata yaptığınızı net olarak gösterir. Böylece çalışmanız gereken konuları tam olarak bilirsiniz.`,
    category: 'LGS',
    tags: ['LGS', 'matematik', 'sık yapılan hatalar', 'sınav ipuçları'],
    status: 'PUBLISHED',
    author: 'Matematik Bölümü',
    views: 2876,
    publishedAt: new Date('2026-02-25'),
  },
  {
    title: 'LGS Türkçe: Paragraf Sorularında Hız ve Doğruluk',
    slug: 'lgs-turkce-paragraf-sorularinda-hiz',
    excerpt:
      'LGS Türkçe dersinde paragraf soruları büyük yer tutar. Hızlı okuma, ana fikir bulma ve çeldirici şıkları eleme teknikleri ile Türkçe performansınızı artırın.',
    content: `# LGS Türkçe: Paragraf Sorularında Hız ve Doğruluk

LGS Türkçe bölümünde 20 sorunun büyük çoğunluğu paragraf sorularıdır. Bu soruları hem hızlı hem doğru çözmek, sınavdaki başarınızı doğrudan etkiler.

## Paragraf Okuma Stratejileri

### Aktif Okuma Tekniği
1. İlk cümleyi dikkatle okuyun (genellikle konuyu verir)
2. Son cümleyi okuyun (genellikle sonucu/ana fikri verir)
3. Anahtar kelimeleri zihinsel olarak işaretleyin
4. Soruyu okuyun ve paragrafta ilgili bölümü bulun

### Hızlı Okuma İpuçları
- Kelime kelime değil, **sözcük grupları halinde** okuyun
- Dudaklarınızı kıpırdatmadan okuyun (sessiz okuma)
- İlk okumada genel anlamı kavramaya çalışın
- Her gün **en az 15 dakika** kitap okuyun (hız zamanla artar)

## Soru Türleri ve Yaklaşımlar

### Ana Fikir Soruları
- "Bu paragrafın ana düşüncesi nedir?"
- Cevap genellikle paragrafın **bütününü** kapsar
- Tek bir detay ana fikir olamaz

### Başlık Soruları
- Başlık = Ana fikrin kısa özeti
- Çok genel veya çok dar başlıkları eleyin

### Çıkarım Soruları
- "Bu paragraftan aşağıdakilerden hangisi çıkarılabilir?"
- Paragrafta **doğrudan yazılmayan** ama anlam olarak ulaşılabilen bilgi
- Paragrafla çelişen şıkları eleyin

### Sözcük/Cümle Anlamı Soruları
- Kelimeyi cümle içinde düşünün
- Mecaz ve gerçek anlamı ayırt edin

## Pratik Çalışma Planı

| Gün | Çalışma |
|-----|---------|
| Pazartesi | 10 paragraf sorusu + analiz |
| Salı | 10 paragraf sorusu + analiz |
| Çarşamba | Deyim ve atasözleri çalışması |
| Perşembe | 10 paragraf sorusu + analiz |
| Cuma | Yazım kuralları tekrarı |
| Cumartesi | Mini deneme (20 soru) |
| Pazar | Yanlış analizi + tekrar |

## En Sık Yapılan Hatalar

1. Paragrafı okumadan şıklara bakmak
2. Kendi bilgisini cevaba katmak (paragrafta olmayan bilgi)
3. İlk doğru görünen şıkkı işaretleyip devam etmek
4. Süreyi yanlış kullanmak (kolay sorulara çok vakit harcamak)

---

> 💡 Deneme Takip Sistemi'nde Türkçe dersinin konu bazlı analizini inceleyerek paragraf, dil bilgisi ve sözcük bilgisi alanlarındaki performansınızı ayrı ayrı görebilirsiniz.`,
    category: 'LGS',
    tags: ['LGS', 'Türkçe', 'paragraf', 'okuma teknikleri'],
    status: 'PUBLISHED',
    author: 'Türkçe Bölümü',
    views: 1987,
    publishedAt: new Date('2026-03-01'),
  },
  {
    title: 'Veli Paneli Nasıl Kullanılır? Çocuğunuzun Performansını Takip Edin',
    slug: 'veli-paneli-nasil-kullanilir',
    excerpt:
      'Deneme Takip Sistemi veli paneli ile çocuğunuzun deneme sınavı sonuçlarını, konu bazlı analizlerini ve ilerleme grafiklerini kolayca takip edebilirsiniz.',
    content: `# Veli Paneli Kullanım Rehberi

Deneme Takip Sistemi'nin veli paneli, velilerin çocuklarının akademik performansını yakından takip etmesini sağlar.

## Veli Paneline Giriş

Okulunuzun size verdiği kullanıcı adı ve şifre ile \`okulunuz.denemetakip.net\` adresinden "Veli Girişi" seçeneğini kullanarak giriş yapabilirsiniz.

## Ana Ekran

Giriş yaptığınızda karşınıza çocuğunuzun:
- **Son deneme sonucu** ve sıralama
- **Genel ortalama** trendi (yükseliyor mu, düşüyor mu?)
- **Yaklaşan sınavlar** ve görevler

bilgileri gelir.

## Deneme Sonuçları

"Sınavlar" bölümünden tüm deneme sonuçlarına ulaşabilirsiniz:

- Her ders için ayrı net sayısı
- Sınıf sıralaması
- Genel sıralama
- Önceki denemelere kıyasla değişim

## Konu Bazlı Analiz

En değerli özelliklerden biri konu bazlı analizdir:

- Hangi konularda başarılı?
- Hangi konularda desteğe ihtiyaç var?
- Zaman içinde hangi konularda ilerleme kaydetti?

Bu bilgilerle evde çalışma yönlendirmesi yapabilirsiniz.

## Bildirimler

Sistem size otomatik bildirim gönderir:
- 📊 Yeni deneme sonuçları girildığinde
- 📋 Öğretmen not bıraktığında
- 📅 Yaklaşan sınavlar hakkında

## Öğretmenle İletişim

Panel üzerinden doğrudan öğretmenle mesajlaşabilirsiniz. Çocuğunuzla ilgili soru veya endişelerinizi kolayca iletebilirsiniz.

---

**Not:** Herhangi bir teknik sorunla karşılaşırsanız okul yönetimiyle iletişime geçebilir veya sistemdeki destek butonunu kullanabilirsiniz.`,
    category: 'Rehber',
    tags: ['veli', 'panel', 'kullanım', 'performans takibi'],
    status: 'PUBLISHED',
    author: 'Deneme Takip Ekibi',
    views: 1123,
    publishedAt: new Date('2026-03-03'),
  },
];

async function main() {
  console.log('🔄 Örnek blog yazıları oluşturuluyor...\n');

  for (const post of blogPosts) {
    const existing = await (prisma as any).blogPost.findUnique({
      where: { slug: post.slug },
    });

    if (existing) {
      console.log(`⏭️  Zaten mevcut: ${post.title}`);
      continue;
    }

    await (prisma as any).blogPost.create({ data: post });
    console.log(`✅ Oluşturuldu: ${post.title}`);
  }

  console.log(`\n✨ Toplam ${blogPosts.length} blog yazısı kontrol edildi.`);
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

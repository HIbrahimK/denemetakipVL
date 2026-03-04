import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Kullanım Koşulları - Deneme Takip Sistemi",
  description: "Deneme Takip Sistemi kullanım koşulları ve hizmet şartları.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Kullanım Koşulları</h1>
          <p className="text-muted-foreground mb-8">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Kabul</h2>
              <p className="text-muted-foreground leading-relaxed">
                Deneme Takip Sistemi&apos;ni (&quot;Platform&quot;) kullanarak bu kullanım
                koşullarını kabul etmiş sayılırsınız. Platform&apos;a erişim ve
                kullanım, bu koşullara tabidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Hizmet Tanımı</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platform, eğitim kurumlarına deneme sınavı yönetimi, öğrenci
                performans takibi, raporlama ve analiz hizmetleri
                sunmaktadır. Hizmetler, seçilen lisans planına göre sağlanır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Hesap Sorumlulukları</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Hesap bilgilerinizin gizliliğinden siz sorumlusunuz</li>
                <li>Hesabınız üzerinden gerçekleşen tüm işlemlerden siz sorumlusunuz</li>
                <li>Yetkisiz erişim tespit ettiğinizde derhal bizi bilgilendirmelisiniz</li>
                <li>Hesabınızı üçüncü kişilerle paylaşamazsınız</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Kabul Edilemez Kullanım</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Aşağıdaki davranışlar kesinlikle yasaktır:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Platform&apos;ın güvenliğini tehlikeye atacak eylemler</li>
                <li>Diğer kullanıcıların verilerine yetkisiz erişim</li>
                <li>Platform&apos;ın altyapısına zarar verecek işlemler</li>
                <li>Yasadışı amaçlarla kullanım</li>
                <li>Otomatik veri toplama (scraping) işlemleri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Fikri Mülkiyet</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platform&apos;ın tüm içeriği, tasarımı, kodu ve altyapısı
                şirketimize aittir. Kullanıcılara verilen lisans, yalnızca
                hizmet süresince ve belirlenen amaçlarla kullanım hakkı
                tanır. Çoğaltma, dağıtma veya türev eser oluşturma yasaktır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Veri Sahipliği</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platform&apos;a yüklediğiniz veriler (öğrenci bilgileri, sınav
                sonuçları vb.) size aittir. Lisans süreniz sona erdiğinde
                verilerinizi dışa aktarma hakkına sahipsiniz. Hesap silme
                talebinizde verileriniz 30 gün içinde kalıcı olarak silinir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Hizmet Seviyesi</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platform&apos;ın %99.9 erişilebilirlik oranında çalışmasını
                hedefliyoruz. Planlı bakım çalışmaları önceden
                bilgilendirilir. Doğal afet, siber saldırı vb. mücbir
                sebeplerden kaynaklanan kesintilerden sorumluluk kabul
                edilmez.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Ödeme Koşulları</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Ücretler seçilen plana göre aylık veya yıllık faturalandırılır</li>
                <li>Faturalar ödeme döneminin başında kesilir</li>
                <li>Geciken ödemelerde hizmet askıya alınabilir</li>
                <li>İade politikası 14 günlük deneme süresi ile sınırlıdır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Fesih</h2>
              <p className="text-muted-foreground leading-relaxed">
                Her iki taraf da 30 gün önceden yazılı bildirim ile hizmeti
                feshedebilir. Koşulların ihlali halinde şirket, bildirimsiz
                olarak hesabı askıya alma veya kapatma hakkını saklı tutar.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Uygulanacak Hukuk</h2>
              <p className="text-muted-foreground leading-relaxed">
                Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir.
                Uyuşmazlıklarda İstanbul mahkemeleri yetkilidir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. İletişim</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kullanım koşulları hakkında sorularınız için{" "}
                <a
                  href="mailto:info@denemetakip.net"
                  className="text-primary hover:underline"
                >
                  info@denemetakip.net
                </a>{" "}
                adresinden bize ulaşabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Gizlilik Politikası - Deneme Takip Sistemi",
  description: "Deneme Takip Sistemi gizlilik politikası ve veri koruma ilkeleri.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Gizlilik Politikası</h1>
          <p className="text-muted-foreground mb-8">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Giriş</h2>
              <p className="text-muted-foreground leading-relaxed">
                Deneme Takip Sistemi (&quot;biz&quot;, &quot;bizim&quot;, &quot;şirket&quot;) olarak
                kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu
                Gizlilik Politikası, hizmetlerimizi kullanırken topladığımız,
                kullandığımız ve koruduğumuz bilgileri açıklamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Toplanan Veriler</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Hizmetlerimizi sağlamak için aşağıdaki verileri topluyoruz:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Kimlik bilgileri (ad, soyad, e-posta)</li>
                <li>Eğitim bilgileri (okul, sınıf, öğrenci numarası)</li>
                <li>Sınav sonuçları ve performans verileri</li>
                <li>Kullanım verileri (oturum süresi, sayfa görüntülemeleri)</li>
                <li>Cihaz ve tarayıcı bilgileri</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Verilerin Kullanımı</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Toplanan veriler yalnızca aşağıdaki amaçlarla kullanılır:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Sınav yönetimi ve performans takibi hizmetlerinin sunulması</li>
                <li>Raporlama ve analiz işlemleri</li>
                <li>Hizmet kalitesinin iyileştirilmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Kullanıcılarla iletişim</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Veri Güvenliği</h2>
              <p className="text-muted-foreground leading-relaxed">
                Verilerinizi korumak için endüstri standardı güvenlik önlemleri
                uyguluyoruz: SSL/TLS şifreleme, güvenli sunucu altyapısı,
                düzenli güvenlik denetimleri, erişim kontrolü ve günlük
                yedekleme. Veriler Türkiye'deki sunucularda barındırılmaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Çerezler</h2>
              <p className="text-muted-foreground leading-relaxed">
                Web sitemiz, hizmetlerimizi sunmak ve deneyiminizi
                iyileştirmek için çerezler kullanmaktadır. Oturum çerezleri
                (giriş durumu) ve tercih çerezleri kullanılmaktadır. Üçüncü
                taraf analitik çerezleri kullanılmamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Üçüncü Taraflarla Paylaşım</h2>
              <p className="text-muted-foreground leading-relaxed">
                Kişisel verileriniz, yasal zorunluluklar haricinde üçüncü
                taraflarla paylaşılmaz. Altyapı hizmeti sağlayıcılarımız
                (sunucu, e-posta) ile yalnızca hizmet sunumu için gerekli
                minimum veri paylaşılır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Haklarınız</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                KVKK kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Eksik veya yanlış işlenen kişisel verilerin düzeltilmesini isteme</li>
                <li>Kişisel verilerin silinmesini veya yok edilmesini isteme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. İletişim</h2>
              <p className="text-muted-foreground leading-relaxed">
                Gizlilik politikamız hakkında sorularınız için{" "}
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

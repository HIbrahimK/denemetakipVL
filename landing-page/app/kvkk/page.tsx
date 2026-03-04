import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "KVKK Aydınlatma Metni - Deneme Takip Sistemi",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
};

export default function KVKKPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-muted-foreground mb-4">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında
            Aydınlatma Metni
          </p>
          <p className="text-muted-foreground mb-8">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Veri Sorumlusu
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
                uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla Deneme
                Takip Sistemi tarafından aşağıda açıklanan kapsamda
                işlenebilecektir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. İşlenen Kişisel Veriler
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Platformumuz kapsamında işlenen kişisel veri kategorileri:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                        Veri Kategorisi
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                        Veriler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr>
                      <td className="border border-gray-200 px-4 py-3">
                        Kimlik Bilgileri
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        Ad, soyad, T.C. kimlik numarası (isteğe bağlı)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3">
                        İletişim Bilgileri
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        E-posta adresi, telefon numarası
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3">
                        Eğitim Bilgileri
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        Okul, sınıf, öğrenci numarası, sınav sonuçları
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 px-4 py-3">
                        İşlem Güvenliği
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        IP adresi, oturum bilgileri, log kayıtları
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Kişisel Verilerin İşlenme Amaçları
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Eğitim hizmetlerinin sunulması ve deneme sınavı yönetimi
                </li>
                <li>
                  Öğrenci performans analizi ve raporlama
                </li>
                <li>
                  Veli bilgilendirme ve iletişim süreçlerinin yürütülmesi
                </li>
                <li>
                  Platform güvenliğinin sağlanması
                </li>
                <li>
                  Yasal yükümlülüklerin yerine getirilmesi
                </li>
                <li>
                  Hizmet kalitesinin ölçülmesi ve iyileştirilmesi
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Hukuki Sebepler
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Kişisel verileriniz KVKK&apos;nın 5. maddesi kapsamında
                aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Açık rızanız (gerektiğinde)</li>
                <li>
                  Sözleşmenin kurulması veya ifası için gerekli olması
                </li>
                <li>Hukuki yükümlülüğün yerine getirilmesi</li>
                <li>
                  Meşru menfaatlerimiz için gerekli olması (veri güvenliği,
                  hizmet iyileştirme)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Veri Aktarımı
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Kişisel verileriniz, KVKK&apos;nın 8. ve 9. maddelerinde
                belirtilen koşullar çerçevesinde yalnızca altyapı hizmeti
                sağlayıcıları (sunucu barındırma, e-posta servisi) ve yasal
                zorunluluk halinde yetkili kamu kurum ve kuruluşları ile
                paylaşılabilir. Yurt dışına veri aktarımı
                yapılmamaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Veri Saklama Süresi
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre
                boyunca saklanır. Hizmet sözleşmesinin sona ermesi
                durumunda, yasal zorunluluklar saklı kalmak kaydıyla,
                verileriniz 30 gün içinde silinir veya anonim hale
                getirilir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. İlgili Kişi Hakları
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                KVKK&apos;nın 11. maddesi kapsamında aşağıdaki haklara
                sahipsiniz:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  Kişisel verilerinizin işlenip işlenmediğini öğrenme
                </li>
                <li>
                  İşlenmişse buna ilişkin bilgi talep etme
                </li>
                <li>
                  İşlenme amacını ve bunların amacına uygun kullanılıp
                  kullanılmadığını öğrenme
                </li>
                <li>
                  Yurt içinde veya yurt dışında aktarıldığı üçüncü
                  kişileri bilme
                </li>
                <li>
                  Eksik veya yanlış işlenen kişisel verilerin
                  düzeltilmesini isteme
                </li>
                <li>
                  KVKK&apos;nın 7. maddesinde öngörülen şartlar
                  çerçevesinde silinmesini veya yok edilmesini isteme
                </li>
                <li>
                  Düzeltme, silme ve yok etme işlemlerinin aktarıldığı
                  üçüncü kişilere bildirilmesini isteme
                </li>
                <li>
                  İşlenen verilerin münhasıran otomatik sistemler
                  vasıtasıyla analiz edilmesi suretiyle aleyhine bir
                  sonucun ortaya çıkmasına itiraz etme
                </li>
                <li>
                  Kanuna aykırı olarak işlenmesi sebebiyle zarara
                  uğramanız hâlinde zararın giderilmesini talep etme
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Başvuru Yöntemi
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Yukarıda belirtilen haklarınızı kullanmak için{" "}
                <a
                  href="mailto:kvkk@denemetakip.net"
                  className="text-primary hover:underline"
                >
                  kvkk@denemetakip.net
                </a>{" "}
                adresine yazılı olarak veya Kişisel Verileri Koruma Kurulu
                tarafından belirlenen diğer yöntemlerle başvurabilirsiniz.
                Başvurularınız en geç 30 gün içinde yanıtlanacaktır.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

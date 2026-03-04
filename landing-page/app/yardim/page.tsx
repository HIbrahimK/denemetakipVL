import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  FileText,
  Users,
  BarChart3,
  CreditCard,
  Shield,
  Smartphone,
} from "lucide-react";

export const metadata = {
  title: "Yardım & SSS - Deneme Takip Sistemi",
  description:
    "Sıkça sorulan sorular ve yardım merkezi. Deneme Takip Sistemi hakkında merak ettikleriniz.",
};

const faqCategories = [
  {
    title: "Genel",
    icon: HelpCircle,
    questions: [
      {
        q: "Deneme Takip Sistemi nedir?",
        a: "Deneme Takip Sistemi, okulların deneme sınavlarını dijital ortamda yönetmesini, öğrenci performansını analiz etmesini ve velileri anlık bilgilendirmesini sağlayan kapsamlı bir eğitim teknolojisi platformudur.",
      },
      {
        q: "Hangi sınav türlerini destekliyorsunuz?",
        a: "TYT, AYT, LGS ve özel deneme sınavları dahil tüm sınav türlerini destekliyoruz. Optik form okuma ve manuel giriş seçenekleri mevcuttur.",
      },
      {
        q: "Sistemi kullanmak için teknik bilgi gerekiyor mu?",
        a: "Hayır, kullanıcı dostu arayüzümüz sayesinde temel bilgisayar bilgisi yeterlidir. Ayrıca detaylı kullanım kılavuzları ve video eğitimler sunuyoruz.",
      },
    ],
  },
  {
    title: "Hesap & Kurulum",
    icon: Users,
    questions: [
      {
        q: "Nasıl kayıt olabilirim?",
        a: "Demo talep formunu doldurarak veya iletişim sayfamızdan bize ulaşarak hızlıca kurulum sürecini başlatabilirsiniz. Ekibimiz sizinle iletişime geçecektir.",
      },
      {
        q: "Öğrenci ve veli hesapları nasıl oluşturuluyor?",
        a: "Okul yöneticileri öğrenci ve veli hesaplarını toplu olarak Excel ile veya tek tek oluşturabilir. Veliler otomatik SMS ile bilgilendirilir.",
      },
    ],
  },
  {
    title: "Raporlama & Analiz",
    icon: BarChart3,
    questions: [
      {
        q: "Ne tür raporlar sunuyorsunuz?",
        a: "Öğrenci bazlı, sınıf bazlı, konu bazlı ve genel okul performans raporları sunuyoruz. Tüm raporlar PDF ve Excel formatında indirilebilir.",
      },
      {
        q: "Raporlar ne sıklıkla güncellenir?",
        a: "Raporlar anlık olarak güncellenir. Sınav sonuçları girildikten hemen sonra tüm analizler otomatik olarak hesaplanır.",
      },
    ],
  },
  {
    title: "Fiyatlandırma & Ödeme",
    icon: CreditCard,
    questions: [
      {
        q: "Ücretsiz deneme süresi var mı?",
        a: "Evet, 14 günlük ücretsiz deneme sunuyoruz. Bu süre içinde tüm özellikleri test edebilirsiniz.",
      },
      {
        q: "Ödeme yöntemleri nelerdir?",
        a: "Kredi kartı, havale/EFT ve kurumsal fatura ile ödeme kabul ediyoruz. Yıllık ödemelerde %20 indirim uygulanır.",
      },
    ],
  },
  {
    title: "Güvenlik & Gizlilik",
    icon: Shield,
    questions: [
      {
        q: "Verilerimiz güvende mi?",
        a: "Evet, tüm veriler şifreli olarak saklanır. SSL/TLS sertifikası, günlük yedekleme ve KVKK uyumlu altyapı ile verileriniz güvende.",
      },
      {
        q: "KVKK'ya uyumlu musunuz?",
        a: "Evet, 6698 sayılı Kişisel Verilerin Korunması Kanunu'na tam uyumluyuz. Detaylar için KVKK sayfamızı inceleyebilirsiniz.",
      },
    ],
  },
  {
    title: "Mobil & Teknik",
    icon: Smartphone,
    questions: [
      {
        q: "Mobil uygulama var mı?",
        a: "Web uygulamamız PWA (Progressive Web App) teknolojisi ile çalışır. Herhangi bir tarayıcıdan ana ekrana ekleyerek uygulama deneyimi yaşayabilirsiniz.",
      },
      {
        q: "Hangi tarayıcıları destekliyorsunuz?",
        a: "Chrome, Firefox, Safari ve Edge'in güncel sürümleri tam desteklenmektedir.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Yardım Merkezi</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Sıkça Sorulan Sorular
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Deneme Takip Sistemi hakkında merak ettiklerinizin cevapları
            </p>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            {faqCategories.map((category, catIdx) => (
              <div key={catIdx} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                </div>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIdx) => (
                    <details
                      key={faqIdx}
                      className="group bg-white border rounded-lg overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-left pr-4">
                          {faq.q}
                        </span>
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Aradığınız cevabı bulamadınız mı?
            </h2>
            <p className="text-muted-foreground mb-6">
              Destek ekibimize ulaşın, size yardımcı olalım.
            </p>
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              İletişime Geçin
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Building2 } from "lucide-react";

const plans = [
  {
    name: "Başlangıç",
    description: "Küçük dershaneler ve bireysel öğretmenler için",
    price: "499",
    period: "aylık",
    features: [
      "100 öğrenciye kadar",
      "10 öğretmen",
      "TYT-AYT desteği",
      "Temel raporlama",
      "E-posta desteği",
      "Mobil uygulama erişimi",
      "SSL güvenlik",
      "Günlük yedekleme",
    ],
    cta: "Başla",
    popular: false,
  },
  {
    name: "Profesyonel",
    description: "Orta ölçekli eğitim kurumları için",
    price: "999",
    period: "aylık",
    features: [
      "500 öğrenciye kadar",
      "25 öğretmen",
      "Tüm sınav türleri (TYT, AYT, LGS, KPSS)",
      "Gelişmiş raporlama",
      "Öncelikli destek",
      "Mobil uygulama erişimi",
      "Özel branding",
      "API erişimi",
      "Veri analitiği",
      "Grup çalışma odaları",
    ],
    cta: "Başla",
    popular: true,
  },
  {
    name: "Kurumsal",
    description: "Büyük eğitim zincirleri için özel çözüm",
    price: "Özel",
    period: "fiyatlandırma",
    features: [
      "Sınırsız öğrenci",
      "Sınırsız öğretmen",
      "Tüm sınav türleri",
      "Özel geliştirmeler",
      "7/24 özel destek",
      "Beyaz etiket çözüm",
      "Özel sunucu seçenekleri",
      "SLA garantisi",
      "Eğitim ve danışmanlık",
      "Entegrasyon desteği",
    ],
    cta: "İletişime Geç",
    popular: false,
  },
];

const faqs = [
  {
    question: "Deneme süresi var mı?",
    answer:
      "Evet, tüm planlarımızda 14 gün ücretsiz deneme süresi sunuyoruz. Kredi kartı gerekmez.",
  },
  {
    question: "Planımı değiştirebilir miyim?",
    answer:
      "Kesinlikle! İhtiyaçlarınıza göre istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz.",
  },
  {
    question: "Öğrenci limitini aşarsam ne olur?",
    answer:
      "Limitinize yaklaştığınızda sizi bilgilendiriyoruz. Otomatik olarak bir üst plana geçiş yapabilir veya ek öğrenci paketi satın alabilirsiniz.",
  },
  {
    question: "Verilerim güvende mi?",
    answer:
      "Tüm verileriniz SSL şifreleme ile korunur ve günlük olarak yedeklenir. GDPR ve KVKK uyumlu çalışıyoruz.",
  },
  {
    question: "Eğitim desteği sunuyor musunuz?",
    answer:
      "Evet, Profesyonel ve Kurumsal planlarda kapsamlı eğitim ve onboarding desteği sağlıyoruz.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Şeffaf Fiyatlandırma
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            İhtiyacınıza en uygun planı seçin. Gizli maliyet yok, uzun vadeli
            taahhüt yok.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-primary text-primary-foreground shadow-xl scale-105"
                    : "bg-card border shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 text-sm font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      En Popüler
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p
                    className={`text-sm ${
                      plan.popular ? "opacity-90" : "text-muted-foreground"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="text-center mb-8">
                  {plan.price === "Özel" ? (
                    <div className="flex items-center justify-center gap-2">
                      <Building2 className="h-8 w-8" />
                      <span className="text-3xl font-bold">Özel Fiyat</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-5xl font-bold">₺{plan.price}</span>
                      <span
                        className={`block ${
                          plan.popular ? "opacity-90" : "text-muted-foreground"
                        }`}
                      >
                        /{plan.period}
                      </span>
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`h-5 w-5 flex-shrink-0 ${
                          plan.popular ? "text-white" : "text-primary"
                        }`}
                      />
                      <span
                        className={
                          plan.popular ? "text-white/90" : "text-foreground"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full ${
                    plan.popular
                      ? "bg-white text-primary hover:bg-white/90"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link
                    href={
                      plan.price === "Özel"
                        ? "/iletisim"
                        : "/demo"
                    }
                  >
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Sıkça Sorulan Sorular</h2>
            <p className="text-muted-foreground">
              Aklınıza takılan soruların cevapları
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Hala Kararsız mısınız?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Ücretsiz demo talep edin, size sistemimizi tanıtalım ve sorularınızı
            yanıtlayalım.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/demo">Ücretsiz Demo Al</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/iletisim">Bize Ulaşın</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

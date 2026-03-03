"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  BarChart3,
  Users,
  MessageSquare,
  Target,
  Calendar,
  BookOpen,
  Shield,
  Zap,
  Smartphone,
  Cloud,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Deneme Sınavı Yönetimi",
    description:
      "TYT, AYT, LGS ve tüm sınav türleri için kapsamlı deneme sınavı yönetimi. Excel import, otomatik değerlendirme ve detaylı analizler.",
  },
  {
    icon: BarChart3,
    title: "Detaylı Raporlama",
    description:
      "Öğrenci, sınıf ve okul bazlı kapsamlı raporlar. Konu bazlı analiz, net grafikleri ve başarı takibi.",
  },
  {
    icon: Users,
    title: "Öğrenci Takibi",
    description:
      "Her öğrencinin performansını takip edin. Güçlü ve zayıf konular, gelişim grafikleri ve kişiselleştirilmiş geri bildirimler.",
  },
  {
    icon: MessageSquare,
    title: "İletişim Sistemi",
    description:
      "Öğretmen-öğrenci-veli arasında kesintisiz iletişim. Duyurular, mesajlaşma ve bildirim sistemi.",
  },
  {
    icon: Target,
    title: "Hedef Belirleme",
    description:
      "Öğrenciler için kişiselleştirilmiş hedefler belirleyin. İlerlemeyi takip edin ve motivasyonu artırın.",
  },
  {
    icon: Calendar,
    title: "Sınav Takvimi",
    description:
      "Tüm deneme sınavlarını tek takvimde görüntüleyin. Otomatik hatırlatmalar ve planlama araçları.",
  },
  {
    icon: BookOpen,
    title: "Öğrenme Yönetim Sistemi",
    description:
      "Konu anlatımları, kaynak paylaşımı ve ödev takibi. Entegre LMS ile eğitim sürecini kolaylaştırın.",
  },
  {
    icon: Shield,
    title: "Güvenlik",
    description:
      "SSL şifreleme, rol bazlı erişim kontrolü ve veri güvenliği. Öğrenci verileriniz güvende.",
  },
];

const additionalFeatures = [
  {
    icon: Zap,
    title: "Hızlı Kurulum",
    description: "5 dakikada kurulum, anında kullanıma hazır.",
  },
  {
    icon: Smartphone,
    title: "Mobil Uyumlu",
    description: "Tüm cihazlarda sorunsuz çalışan responsive tasarım.",
  },
  {
    icon: Cloud,
    title: "Bulut Tabanlı",
    description: "Verileriniz güvenli bulut sunucularında saklanır.",
  },
  {
    icon: Lock,
    title: "Otomatik Yedekleme",
    description: "Günlük otomatik yedekleme ile veri kaybına son.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Tüm Özellikler
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Deneme Takip ile sınav hazırlık sürecini tamamen dijitalleştirin.
            Etkili, güvenli ve kullanıcı dostu çözümler.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/demo">Ücretsiz Demo Al</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Link href="/fiyatlandirma">Fiyatları Gör</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Kapsamlı Özellikler</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Her ihtiyacınızı karşılayacak şekilde tasarlanmış güçlü araçlar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Ekstra Avantajlar</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kullanımınızı kolaylaştıran ek özellikler
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Hemen Başlayın</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            14 gün ücretsiz deneme süresi ile tüm özellikleri keşfedin. Kredi
            kartı gerekmez.
          </p>
          <Button asChild size="lg">
            <Link href="/demo">Ücretsiz Deneme Başlat</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

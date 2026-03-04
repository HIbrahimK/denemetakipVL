import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { Briefcase, MapPin, Clock, Heart, Zap, Users } from "lucide-react";

export const metadata = {
  title: "Kariyer - Deneme Takip Sistemi",
  description:
    "Deneme Takip Sistemi ekibine katılın. Eğitim teknolojisinde fark yaratacak yetenekler arıyoruz.",
};

const benefits = [
  {
    icon: Zap,
    title: "Uzaktan Çalışma",
    description: "Türkiye'nin her yerinden çalışabilirsiniz",
  },
  {
    icon: Heart,
    title: "Esnek Çalışma",
    description: "Esnek çalışma saatleri ve iş-yaşam dengesi",
  },
  {
    icon: Users,
    title: "Küçük Ekip",
    description: "Etkili ve çevik bir ekipte çalışma fırsatı",
  },
];

export default function CareerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Ekibimize Katılın
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Eğitim teknolojisinde fark yaratmak isteyen tutkulu ekip
              arkadaşları arıyoruz.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Neden Biz?
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="text-center p-6">
                  <div className="inline-flex p-3 bg-primary/10 rounded-lg mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Açık Pozisyonlar
            </h2>

            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border text-center">
                <p className="text-muted-foreground mb-4">
                  Şu an aktif açık pozisyonumuz bulunmamaktadır.
                </p>
                <p className="text-sm text-muted-foreground">
                  Yine de özgeçmişinizi{" "}
                  <a
                    href="mailto:kariyer@denemetakip.net"
                    className="text-primary hover:underline"
                  >
                    kariyer@denemetakip.net
                  </a>{" "}
                  adresine göndererek havuzumuza dahil olabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

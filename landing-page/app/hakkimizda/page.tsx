import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Target,
  Users,
  Shield,
  Award,
  Heart,
  Lightbulb,
} from "lucide-react";

export const metadata = {
  title: "Hakkımızda - Deneme Takip Sistemi",
  description:
    "Deneme Takip Sistemi'nin hikayesi, misyonu ve değerleri. Eğitim teknolojisinde fark yaratıyoruz.",
};

const values = [
  {
    icon: Target,
    title: "Misyonumuz",
    description:
      "Türkiye'deki her okulun dijital dönüşümüne katkıda bulunarak eğitimde verimliliği artırmak.",
  },
  {
    icon: Lightbulb,
    title: "Vizyonumuz",
    description:
      "Eğitim teknolojisinde Türkiye'nin lider platformu olarak her öğrencinin potansiyeline ulaşmasını sağlamak.",
  },
  {
    icon: Heart,
    title: "Değerlerimiz",
    description:
      "Güvenilirlik, yenilikçilik, kullanıcı odaklılık ve sürekli gelişim ilkeleriyle çalışıyoruz.",
  },
];

const stats = [
  { number: "50+", label: "Okul" },
  { number: "10.000+", label: "Öğrenci" },
  { number: "500.000+", label: "Sınav Girişi" },
  { number: "99.9%", label: "Uptime" },
];

const team = [
  {
    name: "Eğitim Teknolojisi Ekibi",
    role: "Ürün Geliştirme",
    description: "Pedagojik yaklaşım ve teknoloji entegrasyonu",
  },
  {
    name: "Yazılım Mühendisliği",
    role: "Teknik Altyapı",
    description: "Güvenli, ölçeklenebilir ve hızlı platform",
  },
  {
    name: "Müşteri Başarısı",
    role: "Destek",
    description: "Okulların başarılı kullanımı için sürekli destek",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Eğitimde Dijital Dönüşüm
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Deneme Takip Sistemi, 2024 yılında eğitimde veri odaklı karar
              alma süreçlerini güçlendirmek amacıyla kurulmuştur. Okulların
              deneme sınavı süreçlerini dijitalleştirerek zaman kazandırıyor ve
              performans takibini kolaylaştırıyoruz.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Bizi Yönlendiren Değerler
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-xl border text-center"
                >
                  <div className="inline-flex p-3 bg-primary/10 rounded-lg mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Ekibimiz
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((member, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

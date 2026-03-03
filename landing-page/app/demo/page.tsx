import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Play,
  Users,
  School,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Demo Talebi - Deneme Takip Sistemi",
  description:
    "Deneme Takip Sistemi'ni ücretsiz deneyin. 14 gün ücretsiz demo hesabı oluşturun.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl">
                Sistemi <span className="text-primary">Ücretsiz Deneyin</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                14 gün ücretsiz demo hesabı oluşturun. Kredi kartı gerekmez,
                iptal edebilirsiniz.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Demo Başvurusu</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Okul Adı *</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="Örn: Ankara Atatürk Lisesi"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">
                          Yetkili Adı *
                        </label>
                        <input
                          type="text"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="Ad Soyad"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">
                          Email *
                        </label>
                        <input
                          type="email"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="email@okul.edu.tr"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefon *</label>
                      <input
                        type="tel"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="05XX XXX XX XX"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">
                          Öğrenci Sayısı
                        </label>
                        <select className="w-full mt-1 px-3 py-2 border rounded-md">
                          <option>0-100</option>
                          <option>100-500</option>
                          <option>500-1000</option>
                          <option>1000+</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Şehir</label>
                        <select className="w-full mt-1 px-3 py-2 border rounded-md">
                          <option>İstanbul</option>
                          <option>Ankara</option>
                          <option>İzmir</option>
                          <option>Diğer</option>
                        </select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Demo Hesabı Oluştur
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Başvurunuz incelendikten sonra 24 saat içinde
                      dönüş yapılacaktır.
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold font-heading mb-4">
                    Demo Hesabında Neler Var?
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Tam özellikli sistem erişimi",
                      "Örnek verilerle çalışma",
                      "Sınırsız kullanıcı ekleme",
                      "Excel içe aktarma",
                      "Raporlama ve analiz",
                      "Mobil uygulama erişimi",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">1000+</p>
                    <p className="text-xs text-muted-foreground">Demo Hesabı</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <School className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">50+</p>
                    <p className="text-xs text-muted-foreground">Aktif Okul</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">%95</p>
                    <p className="text-xs text-muted-foreground">Memnuniyet</p>
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    <Play className="h-10 w-10 text-primary shrink-0" />
                    <div>
                      <h4 className="font-semibold">Tanıtım Videosu</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sistemin özelliklerini ve kullanımını 5 dakikada
                        öğrenin.
                      </p>
                      <Link href="#">
                        <Button variant="link" className="px-0 mt-2">
                          Videoyu İzle
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "İletişim - Deneme Takip Sistemi",
  description:
    "Bize ulaşın. Deneme Takip Sistemi hakkında bilgi almak için iletişime geçin.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl">
                Bize <span className="text-primary">Ulaşın</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Sorularınız mı var? Size yardımcı olmaktan memnuniyet duyarız.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold font-heading mb-6">
                    İletişim Formu
                  </h2>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Ad *</label>
                        <input
                          type="text"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="Adınız"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Soyad *</label>
                        <input
                          type="text"
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                          placeholder="Soyadınız"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email *</label>
                      <input
                        type="email"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Konu *</label>
                      <select className="w-full mt-1 px-3 py-2 border rounded-md">
                        <option>Genel Bilgi</option>
                        <option>Demo Talebi</option>
                        <option>Teknik Destek</option>
                        <option>İş Birliği</option>
                        <option>Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Mesaj *</label>
                      <textarea
                        className="w-full mt-1 px-3 py-2 border rounded-md min-h-[120px]"
                        placeholder="Mesajınız..."
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Gönder
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Email</h3>
                        <p className="text-sm text-muted-foreground">
                          info@denemetakip.net
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Telefon</h3>
                        <p className="text-sm text-muted-foreground">
                          +90 212 123 45 67
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Adres</h3>
                        <p className="text-sm text-muted-foreground">
                          İstanbul, Türkiye
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Çalışma Saatleri</h3>
                        <p className="text-sm text-muted-foreground">
                          Pazartesi - Cuma
                          <br />
                          09:00 - 18:00
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Map Placeholder */}
                <Card className="overflow-hidden">
                  <div className="h-64 bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Harita burada görünecek</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

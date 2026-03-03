import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Okullar - Deneme Takip Sistemi",
  description:
    "Deneme Takip Sistemi'ni kullanan okullar. 50+ okul bize güveniyor.",
};

const schools = [
  {
    name: "Ankara Atatürk Lisesi",
    city: "Ankara",
    type: "Devlet",
    students: 500,
    quote:
      "Sistem sayesinde öğrenci takibi çok kolaylaştı. Veli iletişimi harika.",
    website: "#",
  },
  {
    name: "İstanbul Fen Lisesi",
    city: "İstanbul",
    type: "Devlet",
    students: 450,
    quote:
      "Excel ile toplu veri yükleme özelliği zamanımızdan çok tasarruf sağlıyor.",
    website: "#",
  },
  {
    name: "İzmir Anadolu Lisesi",
    city: "İzmir",
    type: "Devlet",
    students: 400,
    quote: "Çalışma planları ile öğrenci motivasyonu arttı.",
    website: "#",
  },
  {
    name: "Bursa İmam Hatip Lisesi",
    city: "Bursa",
    type: "Devlet",
    students: 350,
    quote: "Teknik destek ekibi çok hızlı ve ilgili.",
    website: "#",
  },
  {
    name: "Adana Fen Lisesi",
    city: "Adana",
    type: "Devlet",
    students: 300,
    quote: "TYT-AYT takibi artık çok kolay.",
    website: "#",
  },
  {
    name: "Antalya Anadolu Lisesi",
    city: "Antalya",
    type: "Devlet",
    students: 280,
    quote: "Veliler çok memnun, şeffaflık arttı.",
    website: "#",
  },
];

export default function SchoolsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl">
                Bizi <span className="text-primary">Tercih Eden</span> Okullar
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                50+ okul ve binlerce öğretmen bize güveniyor.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-8">
                <div>
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground">Okul</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">10K+</p>
                  <p className="text-sm text-muted-foreground">Öğrenci</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">81</p>
                  <p className="text-sm text-muted-foreground">Şehir</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Schools List */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Okul ara..."
                  className="pl-10"
                />
              </div>
              <select className="px-4 py-2 border rounded-md">
                <option>Tüm Şehirler</option>
                <option>Ankara</option>
                <option>İstanbul</option>
                <option>İzmir</option>
              </select>
              <select className="px-4 py-2 border rounded-md">
                <option>Tüm Tipler</option>
                <option>Devlet</option>
                <option>Özel</option>
              </select>
            </div>

            {/* Schools Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {schools.map((school) => (
                <Card key={school.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {school.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{school.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{school.city}</span>
                          <span>•</span>
                          <span>{school.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{school.students} Öğrenci</span>
                    </div>

                    <blockquote className="mt-4 text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-4">
                      "{school.quote}"
                    </blockquote>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Siteyi Ziyaret Et
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled>
                Önceki
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">
                Sonraki
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

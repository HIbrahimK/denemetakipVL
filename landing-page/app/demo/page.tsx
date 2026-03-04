"use client";

import { useState } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

export default function DemoPage() {
  const [formData, setFormData] = useState({
    schoolName: "",
    contactName: "",
    email: "",
    phone: "",
    studentCount: "0-100",
    city: "İstanbul",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.submitDemoRequest(formData);
      setSuccess(true);
      setFormData({
        schoolName: "",
        contactName: "",
        email: "",
        phone: "",
        studentCount: "0-100",
        city: "İstanbul",
        notes: "",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bir hata oluştu. Lütfen tekrar deneyin.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };
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
                  {success ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Başvurunuz Alındı!
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Demo talebiniz başarıyla iletildi. Ekibimiz en kısa
                        sürede sizinle iletişime geçecektir.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSuccess(false)}
                      >
                        Yeni Başvuru
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {error}
                        </div>
                      )}
                      <div>
                        <label htmlFor="schoolName" className="text-sm font-medium">
                          Okul Adı *
                        </label>
                        <input
                          id="schoolName"
                          name="schoolName"
                          type="text"
                          value={formData.schoolName}
                          onChange={handleChange}
                          className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Örn: Ankara Atatürk Lisesi"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contactName" className="text-sm font-medium">
                            Yetkili Adı *
                          </label>
                          <input
                            id="contactName"
                            name="contactName"
                            type="text"
                            value={formData.contactName}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Ad Soyad"
                            required
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="text-sm font-medium">
                            Email *
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="email@okul.edu.tr"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="phone" className="text-sm font-medium">
                          Telefon *
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="05XX XXX XX XX"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="studentCount" className="text-sm font-medium">
                            Öğrenci Sayısı
                          </label>
                          <select
                            id="studentCount"
                            name="studentCount"
                            value={formData.studentCount}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={loading}
                          >
                            <option value="0-100">0-100</option>
                            <option value="100-500">100-500</option>
                            <option value="500-1000">500-1000</option>
                            <option value="1000+">1000+</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="city" className="text-sm font-medium">
                            Şehir
                          </label>
                          <select
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={loading}
                          >
                            <option value="İstanbul">İstanbul</option>
                            <option value="Ankara">Ankara</option>
                            <option value="İzmir">İzmir</option>
                            <option value="Bursa">Bursa</option>
                            <option value="Antalya">Antalya</option>
                            <option value="Adana">Adana</option>
                            <option value="Konya">Konya</option>
                            <option value="Gaziantep">Gaziantep</option>
                            <option value="Diğer">Diğer</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="notes" className="text-sm font-medium">
                          Notlar (İsteğe bağlı)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={3}
                          className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          placeholder="Eklemek istediğiniz bilgiler..."
                          disabled={loading}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            Demo Hesabı Oluştur
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Başvurunuz incelendikten sonra 24 saat içinde dönüş
                        yapılacaktır.
                      </p>
                    </form>
                  )}
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

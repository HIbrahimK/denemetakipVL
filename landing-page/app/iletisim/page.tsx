"use client";

import { useState, FormEvent } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "Genel Bilgi",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setError("Lütfen tüm zorunlu alanları doldurun.");
      setLoading(false);
      return;
    }

    try {
      await api.submitContactForm(formData);
      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "Genel Bilgi",
        message: "",
      });
    } catch (err: any) {
      setError(err.data?.message || "Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.");
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

                  {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-green-800">Mesajınız gönderildi!</p>
                        <p className="text-sm text-green-700">En kısa sürede size dönüş yapılacaktır.</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="text-sm font-medium">Ad *</label>
                        <input
                          id="firstName"
                          name="firstName"
                          type="text"
                          className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                          placeholder="Adınız"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="text-sm font-medium">Soyad *</label>
                        <input
                          id="lastName"
                          name="lastName"
                          type="text"
                          className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                          placeholder="Soyadınız"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium">Email *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="text-sm font-medium">Konu *</label>
                      <select
                        id="subject"
                        name="subject"
                        className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option>Genel Bilgi</option>
                        <option>Demo Talebi</option>
                        <option>Teknik Destek</option>
                        <option>İş Birliği</option>
                        <option>Diğer</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="text-sm font-medium">Mesaj *</label>
                      <textarea
                        id="message"
                        name="message"
                        className="w-full mt-1 px-3 py-2 border rounded-md min-h-[120px] focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition resize-y"
                        placeholder="Mesajınız..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        "Gönder"
                      )}
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

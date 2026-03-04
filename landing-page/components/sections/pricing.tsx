"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const plans = [
  {
    name: "Başlangıç",
    price: "499",
    description: "Küçük okullar için ideal başlangıç paketi",
    features: [
      "100 Öğrenciye kadar",
      "10 Öğretmen",
      "Temel raporlar",
      "Email destek",
      "SSL Sertifikası",
      "Otomatik yedekleme",
    ],
    cta: "Başla",
    popular: false,
  },
  {
    name: "Profesyonel",
    price: "999",
    description: "Büyüyen okullar için kapsamlı çözüm",
    features: [
      "500 Öğrenciye kadar",
      "Sınırsız sınav",
      "Gelişmiş raporlar",
      "WhatsApp destek",
      "Özel subdomain",
      "PWA Mobil Uygulama",
      "API Erişimi",
      "Öncelikli destek",
    ],
    cta: "Başla",
    popular: true,
  },
  {
    name: "Kurumsal",
    price: "Özel",
    description: "Okul zincirleri ve kurumsal çözümler",
    features: [
      "Sınırsız öğrenci",
      "Özel domain",
      "7/24 Telefon desteği",
      "SLA Garantisi",
      "Özel entegrasyonlar",
      "Anında yedekleme",
      "Özel eğitim",
    ],
    cta: "İletişime Geç",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight font-heading sm:text-4xl">
            Şeffaf ve <span className="text-primary">Adil Fiyatlandırma</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Okulunuzun büyüklüğüne ve ihtiyaçlarına uygun esnek paketler.
            Gizli maliyet yok, iptal edebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    En Popüler
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-heading">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold font-heading">
                    {plan.price === "Özel" ? "" : "₺"}
                    {plan.price}
                  </span>
                  {plan.price !== "Özel" && (
                    <span className="text-muted-foreground">/ay</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/demo">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Tüm paketlerde SSL sertifikası, günlük yedekleme ve PWA desteği dahildir.
          </p>
        </div>
      </div>
    </section>
  );
}

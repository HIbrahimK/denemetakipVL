"use client";

import Link from "next/link";
import { ArrowRight, Play, BarChart3, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 pt-16 pb-24 lg:pt-24 lg:pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              50+ Okulun Güvendiği Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl lg:text-6xl">
              Deneme Sınavlarınızı{" "}
              <span className="text-primary">Akıllıca Takip Edin</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Öğrenci performansını analiz edin, velileri anında bilgilendirin
              ve okulunuzun başarısını artırın. Modern, kullanımı kolay ve
              kapsamlı bir yönetim sistemi.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/demo">
                <Button size="lg" className="w-full sm:w-auto">
                  Ücretsiz Demo Al
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/ozellikler">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Tanıtım Videosu
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div>
                <p className="text-3xl font-bold text-primary">50+</p>
                <p className="text-sm text-muted-foreground">Aktif Okul</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">10K+</p>
                <p className="text-sm text-muted-foreground">Öğrenci</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">100K+</p>
                <p className="text-sm text-muted-foreground">Deneme</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Image/Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-1">
              <div className="rounded-xl bg-card p-8 shadow-2xl">
                <div className="space-y-6">
                  {/* Mock Dashboard Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-primary/10 p-4 text-center">
                      <BarChart3 className="mx-auto h-8 w-8 text-primary mb-2" />
                      <p className="text-2xl font-bold">85.4</p>
                      <p className="text-xs text-muted-foreground">Ortalama</p>
                    </div>
                    <div className="rounded-lg bg-green-500/10 p-4 text-center">
                      <Users className="mx-auto h-8 w-8 text-green-500 mb-2" />
                      <p className="text-2xl font-bold">245</p>
                      <p className="text-xs text-muted-foreground">Öğrenci</p>
                    </div>
                    <div className="rounded-lg bg-orange-500/10 p-4 text-center">
                      <MessageSquare className="mx-auto h-8 w-8 text-orange-500 mb-2" />
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">Yeni Mesaj</p>
                    </div>
                  </div>

                  {/* Mock Chart */}
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium mb-4">Son 6 Sınav Performansı</p>
                    <div className="flex items-end justify-between h-32 gap-2">
                      {[65, 72, 68, 85, 78, 88].map((value, i) => (
                        <div
                          key={i}
                          className="w-full bg-primary rounded-t-sm transition-all hover:bg-primary/80"
                          style={{ height: `${value}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Ocak</span>
                      <span>Şubat</span>
                      <span>Mart</span>
                    </div>
                  </div>

                  {/* Mock Student List */}
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium mb-3">Son Eklenen Öğrenciler</p>
                    <div className="space-y-2">
                      {["Ahmet Yılmaz", "Ayşe Demir", "Mehmet Kaya"].map(
                        (name, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                                {name.charAt(0)}
                              </div>
                              <span className="text-sm">{name}</span>
                            </div>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              Aktif
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
              Canlı Veri
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

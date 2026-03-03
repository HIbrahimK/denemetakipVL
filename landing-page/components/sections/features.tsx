"use client";

import {
  BarChart3,
  Users,
  MessageSquare,
  Target,
  Calendar,
  FileSpreadsheet,
  Bell,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: BarChart3,
    title: "Deneme Takibi",
    description:
      "TYT, AYT ve LGS deneme sınavlarını kolayca takip edin. Detaylı istatistikler ve karşılaştırmalı analizler.",
  },
  {
    icon: Users,
    title: "Öğrenci Yönetimi",
    description:
      "Toplu öğrenci ekleme, sınıf yönetimi ve detaylı öğrenci profilleri. Excel ile içe aktarma desteği.",
  },
  {
    icon: MessageSquare,
    title: "Mesaj Sistemi",
    description:
      "Veli ve öğrencilere anlık bildirim gönderin. Toplu mesajlaşma ve şablon desteği.",
  },
  {
    icon: Target,
    title: "Çalışma Planı",
    description:
      "Kişiselleştirilmiş çalışma planları oluşturun. Görev atama ve ilerleme takibi.",
  },
  {
    icon: Calendar,
    title: "Sınav Takvimi",
    description:
      "Tüm sınavları takvim üzerinden yönetin. Otomatik hatırlatmalar ve planlama.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel Entegrasyonu",
    description:
      "Excel dosyalarıyla toplu veri yükleme. Hazır şablonlar ve doğrulama sistemi.",
  },
  {
    icon: Bell,
    title: "Push Bildirimleri",
    description:
      "Mobil ve web push bildirimleri. Öğrencilere anlık sonuç bildirimi.",
  },
  {
    icon: Shield,
    title: "Güvenli ve Hızlı",
    description:
      "SSL sertifikası, günlük yedekleme ve %99.9 uptime garantisi.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight font-heading sm:text-4xl">
            Tüm İhtiyaçlarınızı Karşılayan{" "}
            <span className="text-primary">Kapsamlı Özellikler</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Modern eğitim ihtiyaçlarına uygun, kullanımı kolay ve güçlü
            özelliklerle donatılmış platform.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

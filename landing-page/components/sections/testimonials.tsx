"use client";

import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Ahmet Yılmaz",
    role: "Müdür",
    school: "Ankara Atatürk Lisesi",
    content:
      "Deneme Takip Sistemi sayesinde öğrencilerimizin performansını çok daha iyi analiz edebiliyoruz. Veli iletişimi de çok kolaylaştı.",
    rating: 5,
  },
  {
    name: "Ayşe Kaya",
    role: "Matematik Öğretmeni",
    school: "İstanbul Fen Lisesi",
    content:
      "Excel ile toplu öğrenci ekleme ve deneme sonuçlarını yükleme özelliği hayat kurtarıcı. Saatler süren işlemler artık dakikalar içinde tamamlanıyor.",
    rating: 5,
  },
  {
    name: "Mehmet Demir",
    role: "Rehber Öğretmen",
    school: "İzmir Anadolu Lisesi",
    content:
      "Çalışma planı özelliği ile öğrencilerimize kişiselleştirilmiş programlar hazırlayabiliyoruz. Öğrenci motivasyonu çok arttı.",
    rating: 5,
  },
  {
    name: "Fatma Şahin",
    role: "Müdür Yardımcısı",
    school: "Bursa İmam Hatip Lisesi",
    content:
      "Sistem çok kullanıcı dostu. Teknik destek ekibi de çok hızlı yanıt veriyor. Kesinlikle tavsiye ediyorum.",
    rating: 5,
  },
  {
    name: "Ali Yıldız",
    role: "Fizik Öğretmeni",
    school: "Adana Fen Lisesi",
    content:
      "TYT ve AYT denemelerini kolayca takip edebiliyoruz. Sıralama ve karşılaştırma özellikleri çok başarılı.",
    rating: 5,
  },
  {
    name: "Zeynep Kılıç",
    role: "Müdür",
    school: "Antalya Anadolu Lisesi",
    content:
      "Veliler artık çocuklarının performansını anlık takip edebiliyor. Şeffaflık ve iletişim çok arttı.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight font-heading sm:text-4xl">
            Kullanıcılarımız <span className="text-primary">Ne Diyor?</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            50+ okul ve binlerce öğretmenin güvendiği platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.school}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

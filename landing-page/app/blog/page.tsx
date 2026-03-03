import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, ArrowRight, Tag } from "lucide-react";

export const metadata = {
  title: "Blog - Deneme Takip Sistemi",
  description:
    "Eğitim teknolojileri, deneme takip ipuçları ve öğrenci başarısı hakkında güncel içerikler.",
};

const posts = [
  {
    title: "Excel ile Toplu Öğrenci Ekleme Rehberi",
    excerpt:
      "Hundreds of students can be added in minutes using Excel. In this guide, we explain step by step...",
    category: "Rehber",
    date: "15 Mart 2024",
    readTime: "5 dk",
    slug: "excel-ogrenci-ekleme",
  },
  {
    title: "TYT ve AYT Denemelerini Etkili Takip Etme",
    excerpt:
      "Strategies to increase student motivation and track progress for university entrance exams...",
    category: "Eğitim",
    date: "10 Mart 2024",
    readTime: "8 dk",
    slug: "tyt-ayt-takip",
  },
  {
    title: "Veli İletişiminde En İyi Pratikler",
    excerpt:
      "Strengthen school-parent collaboration and increase student achievement...",
    category: "İletişim",
    date: "5 Mart 2024",
    readTime: "6 dk",
    slug: "veli-iletisimi",
  },
  {
    title: "Çalışma Planı Nasıl Oluşturulur?",
    excerpt:
      "Tips for personalized study plans and task tracking...",
    category: "Rehber",
    date: "1 Mart 2024",
    readTime: "7 dk",
    slug: "calisma-plani",
  },
  {
    title: "Yeni Özellik: Push Bildirimleri",
    excerpt:
      "Our new push notification system is live! Instant exam results and parent information...",
    category: "Yenilikler",
    date: "25 Şubat 2024",
    readTime: "4 dk",
    slug: "push-bildirimler",
  },
  {
    title: "Eğitim Teknolojilerinde 2024 Trendleri",
    excerpt:
      "AI, gamification and personalized learning: Technology trends shaping the future of education...",
    category: "Teknoloji",
    date: "20 Şubat 2024",
    readTime: "10 dk",
    slug: "egitim-teknoloji-trendleri",
  },
];

const categories = [
  "Tümü",
  "Rehber",
  "Eğitim",
  "İletişim",
  "Yenilikler",
  "Teknoloji",
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight font-heading sm:text-5xl">
                Blog
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Eğitim teknolojileri ve deneme takip ipuçları
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Yazı ara..." className="pl-10" />
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map((category, index) => (
                <Button
                  key={category}
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Posts Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {posts.map((post) => (
                <Card
                  key={post.slug}
                  className="hover:shadow-md transition-shadow flex flex-col"
                >
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Tag className="h-3 w-3" />
                      <span>{post.category}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime} okuma</span>
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Devamını Oku
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled>
                Önceki
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
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

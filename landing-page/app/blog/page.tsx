"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, ArrowRight, Tag, Eye, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  publishedAt: string;
  createdAt: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateReadTime(excerpt: string): string {
  // Rough estimate based on excerpt length (full content would be better)
  const words = excerpt.split(/\s+/).length;
  const minutes = Math.max(3, Math.ceil(words / 30));
  return `${minutes} dk`;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [postsRes, categoriesRes] = await Promise.all([
          api.getBlogPosts({ limit: "50" }),
          api.getBlogCategories(),
        ]);
        setPosts(postsRes.data);
        setCategories(["Tümü", ...categoriesRes]);
      } catch (err) {
        console.error("Blog verileri yüklenirken hata:", err);
        setError("Blog yazıları yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "Tümü" || post.category === activeCategory;
      const matchesSearch =
        !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [posts, searchTerm, activeCategory]);

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
                Eğitim teknolojileri, sınav stratejileri ve deneme takip ipuçları
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
                <Input
                  placeholder="Yazı ara..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-8 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">Yükleniyor...</span>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-12 text-destructive">
                {error}
              </div>
            )}

            {/* Posts Grid */}
            {!loading && !error && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {filteredPosts.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    {searchTerm
                      ? `"${searchTerm}" ile eşleşen yazı bulunamadı.`
                      : "Bu kategoride henüz yazı yok."}
                  </div>
                ) : (
                  filteredPosts.map((post) => (
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
                            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{post.views} görüntülenme</span>
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
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

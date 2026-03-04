"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "@/lib/api";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featuredImage: string | null;
  author: string;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function BlogManagementPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchPosts = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getBlogPosts({
        search: search || undefined,
        limit: "50",
      });
      setPosts(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      setError(err.message || "Blog yazıları yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu blog yazısını silmek istediğinize emin misiniz?")) return;
    try {
      await adminApi.deleteBlogPost(id);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Silme işlemi başarısız");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "Yayında";
      case "DRAFT": return "Taslak";
      case "ARCHIVED": return "Arşiv";
      default: return status;
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "default" as const;
      case "DRAFT": return "secondary" as const;
      case "ARCHIVED": return "outline" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
          <p className="text-muted-foreground">
            {meta.total} blog yazısı
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => fetchPosts(searchQuery)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push("/super-admin/blog/yeni")}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Yazı
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Blog yazısı ara..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Yükleniyor...</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Blog Posts */}
      {!loading && !error && (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <Badge variant={statusVariant(post.status)}>
                        {statusLabel(post.status)}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    {post.excerpt && (
                      <p className="text-muted-foreground mb-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {post.author}
                      </div>
                      {post.publishedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.publishedAt)}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        {post.views.toLocaleString("tr-TR")} görüntülenme
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs">+{post.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/super-admin/blog/duzenle/${post.id}`)
                      }
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Henüz blog yazısı bulunmuyor.</p>
          <Button
            className="mt-4"
            onClick={() => router.push("/super-admin/blog/yeni")}
          >
            <Plus className="h-4 w-4 mr-2" />
            İlk Yazıyı Oluştur
          </Button>
        </div>
      )}
    </div>
  );
}

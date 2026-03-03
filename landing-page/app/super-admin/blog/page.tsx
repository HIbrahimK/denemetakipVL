"use client";

import { useState } from "react";
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
} from "lucide-react";

const mockBlogPosts = [
  {
    id: "1",
    title: "YKS Sınavına Hazırlık: 3 Aylık Çalışma Planı",
    excerpt: "YKS sınavına son 3 ay kala etkili bir çalışma planı nasıl oluşturulur?",
    author: "Mehmet Yılmaz",
    status: "published",
    publishDate: "2024-01-15",
    category: "TYT-AYT",
    views: 1250,
  },
  {
    id: "2",
    title: "LGS Matematik Konu Anlatımı: Denklem Çözme",
    excerpt: "LGS matematik denklem çözme konu anlatımı ve örnek sorular...",
    author: "Ayşe Kaya",
    status: "published",
    publishDate: "2024-01-14",
    category: "LGS",
    views: 890,
  },
  {
    id: "3",
    title: "Etkili Not Alma Teknikleri",
    excerpt: "Derslerde daha verimli not almak için kullanabileceğiniz yöntemler...",
    author: "Ali Demir",
    status: "draft",
    publishDate: null,
    category: "Genel",
    views: 0,
  },
  {
    id: "4",
    title: "Deneme Sınavı Analizi Nasıl Yapılır?",
    excerpt: "Deneme sınavı sonuçlarınızı doğru analiz etme yöntemleri...",
    author: "Fatma Şahin",
    status: "published",
    publishDate: "2024-01-10",
    category: "TYT-AYT",
    views: 2150,
  },
  {
    id: "5",
    title: "Öğrenciler İçin Zaman Yönetimi İpuçları",
    excerpt: "Ders çalışma, sosyal aktivite ve dinlenme arasında denge kurmak...",
    author: "Mehmet Yılmaz",
    status: "draft",
    publishDate: null,
    category: "Genel",
    views: 0,
  },
];

export default function BlogManagementPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState(mockBlogPosts);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Bu blog yazısını silmek istediğinize emin misiniz?")) {
      setPosts(posts.filter((post) => post.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
          <p className="text-muted-foreground">
            Blog yazılarınızı yönetin ve yeni içerikler ekleyin
          </p>
        </div>
        <Button onClick={() => router.push("/super-admin/blog/yeni")}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Yazı
        </Button>
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

      {/* Blog Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <Badge
                      variant={post.status === "published" ? "default" : "secondary"}
                    >
                      {post.status === "published" ? "Yayında" : "Taslak"}
                    </Badge>
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {post.author}
                    </div>
                    {post.publishDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {post.publishDate}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {post.views.toLocaleString("tr-TR")} görüntülenme
                    </div>
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

      {filteredPosts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Blog yazısı bulunamadı.</p>
        </div>
      )}
    </div>
  );
}

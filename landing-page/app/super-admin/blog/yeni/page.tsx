"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Eye } from "lucide-react";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Genel",
    status: "draft",
    tags: "",
    featuredImage: null as File | null,
  });

  const handleSave = () => {
    // API call to save blog post
    router.push("/super-admin/blog");
  };

  const handlePublish = () => {
    // API call to publish blog post
    router.push("/super-admin/blog");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/super-admin/blog")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Yeni Blog Yazısı</h1>
            <p className="text-muted-foreground">Yeni bir blog içeriği oluşturun</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Taslak Kaydet
          </Button>
          <Button onClick={handlePublish}>
            <Eye className="h-4 w-4 mr-2" />
            Yayınla
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>İçerik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Başlık *</label>
                <Input
                  placeholder="Blog yazısı başlığı"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Özet</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md h-20 resize-none"
                  placeholder="Blog yazısı özeti (liste görünümünde gösterilir)"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">İçerik *</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md h-96 resize-none"
                  placeholder="Blog yazısı içeriğini buraya yazın... (Markdown desteklenir)"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ayarlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Kategori</label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="Genel">Genel</option>
                  <option value="TYT-AYT">TYT-AYT</option>
                  <option value="LGS">LGS</option>
                  <option value="KPSS">KPSS</option>
                  <option value="DGS">DGS</option>
                  <option value="YÖKDİL">YÖKDİL</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Durum</label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayınlanmış</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Etiketler</label>
                <Input
                  placeholder="Etiketleri virgülle ayırın"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kapak Görseli</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Görsel yüklemek için tıklayın veya sürükleyin
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

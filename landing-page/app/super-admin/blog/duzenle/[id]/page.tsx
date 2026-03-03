"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const postId = params.id;

  const [formData, setFormData] = useState({
    title: "YKS Sınavına Hazırlık: 3 Aylık Çalışma Planı",
    excerpt:
      "YKS sınavına son 3 ay kala etkili bir çalışma planı nasıl oluşturulur? Bu yazıda adım adım bir rehber sunuyoruz...",
    content: `
# YKS Sınavına Hazırlık: 3 Aylık Çalışma Planı

YKS sınavına hazırlık süreci uzun ve zorlu bir yolculuktur. Son 3 ay ise bu yolculuğun en kritik dönemidir. İşte size etkili bir çalışma planı:

## 1. Günlük Program Oluşturun

Her gün için belirli saatlerde belirli konulara çalışın. TYT ve AYT dengesini iyi kurun.

## 2. Deneme Sınavlarına Önem Verin

Haftada en az 2-3 deneme çözün ve sonuçlarınızı analiz edin.

## 3. Zayıf Konulara Odaklanın

Güçlü olduğunuz konuları tekrar etmek yerine, zayıf olduğunuz alanlara odaklanın.

## 4. Dinlenmeyi Unutmayın

Kaliteli dinlenme, kaliteli çalışma demektir. Günde 7-8 saat uyku şart!

Başarılar dileriz!
    `.trim(),
    category: "TYT-AYT",
    status: "published",
    tags: "YKS, TYT, AYT, Çalışma Planı, Sınav Hazırlık",
    publishDate: "2024-01-15",
    views: 1250,
  });

  const handleSave = () => {
    // API call to save blog post
    router.push("/super-admin/blog");
  };

  const handlePublish = () => {
    // API call to publish blog post
    router.push("/super-admin/blog");
  };

  const handleDelete = () => {
    if (confirm("Bu blog yazısını silmek istediğinize emin misiniz?")) {
      // API call to delete blog post
      router.push("/super-admin/blog");
    }
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
            <h1 className="text-2xl font-bold">Blog Yazısını Düzenle</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">ID: {postId}</p>
              <Badge variant={formData.status === "published" ? "default" : "secondary"}>
                {formData.status === "published" ? "Yayında" : "Taslak"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formData.views.toLocaleString("tr-TR")} görüntülenme
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Kaydet
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
                  className="w-full px-3 py-2 border rounded-md h-96 resize-none font-mono text-sm"
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
              <div>
                <label className="text-sm font-medium">Yayın Tarihi</label>
                <input
                  type="date"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.publishDate}
                  onChange={(e) =>
                    setFormData({ ...formData, publishDate: e.target.value })
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
                  Görsel değiştirmek için tıklayın veya sürükleyin
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İstatistikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Görüntülenme</span>
                <span className="font-semibold">
                  {formData.views.toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yayınlanma</span>
                <span className="font-semibold">{formData.publishDate}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

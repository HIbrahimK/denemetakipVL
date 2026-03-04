"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Eye, Upload, X, Loader2, ImageIcon } from "lucide-react";
import { adminApi } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function NewBlogPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Genel",
    tags: "",
    featuredImage: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Sadece resim dosyaları yüklenebilir");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return formData.featuredImage || null;
    try {
      setUploading(true);
      const result = await adminApi.uploadBlogImage(imageFile);
      return result.url;
    } catch (err: any) {
      setError("Görsel yüklenirken hata: " + (err.message || ""));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    if (!formData.title.trim()) {
      setError("Başlık zorunludur");
      return;
    }
    if (formData.content.trim().length < 10) {
      setError("İçerik en az 10 karakter olmalıdır");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Upload image if selected
      const featuredImage = await handleImageUpload();

      const tags = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await adminApi.createBlogPost({
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        category: formData.category,
        tags,
        status,
        featuredImage: featuredImage || undefined,
        author: "Super Admin",
      });

      router.push("/super-admin/blog");
    } catch (err: any) {
      setError(err.message || "Blog yazısı kaydedilirken hata oluştu");
    } finally {
      setSaving(false);
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
            <h1 className="text-2xl font-bold">Yeni Blog Yazısı</h1>
            <p className="text-muted-foreground">Yeni bir blog içeriği oluşturun</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit("DRAFT")}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Taslak Kaydet
          </Button>
          <Button
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
            Yayınla
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelect(file);
                }}
              />

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Kapak görseli"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                >
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    Görsel yüklemek için tıklayın veya sürükleyin
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 5MB - JPG, PNG, GIF, WebP
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

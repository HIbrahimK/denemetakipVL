"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Trash2, Users, BookOpen, Calendar } from "lucide-react";

export default function EditSchoolPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const schoolId = params.id;

  const [formData, setFormData] = useState({
    schoolName: "Ankara Atatürk Lisesi",
    schoolCode: "AAL",
    subdomain: "aal",
    customDomain: "www.ataturklisesi.edu.tr",
    adminName: "Ahmet Yılmaz",
    adminEmail: "admin@ataturklisesi.edu.tr",
    adminPhone: "0532 123 45 67",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    plan: "profesyonel",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
  });

  const handleSave = () => {
    // API call to update school
    router.push("/super-admin/okullar");
  };

  const handleDelete = () => {
    if (confirm("Bu okulu silmek istediğinize emin misiniz?")) {
      // API call to delete school
      router.push("/super-admin/okullar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/super-admin/okullar")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Okul Düzenle</h1>
            <p className="text-muted-foreground">{formData.schoolName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Öğrenci</p>
                <p className="text-2xl font-bold">1,250</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Öğretmen</p>
                <p className="text-2xl font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deneme Sayısı</p>
                <p className="text-2xl font-bold">28</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Okul Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Okul Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Okul Adı</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.schoolName}
                onChange={(e) =>
                  setFormData({ ...formData, schoolName: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Okul Kodu</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.schoolCode}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolCode: e.target.value })
                  }
                />
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
                  <option value="active">Aktif</option>
                  <option value="suspended">Askıda</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Subdomain</label>
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 mt-1 px-3 py-2 border rounded-l-md"
                  value={formData.subdomain}
                  onChange={(e) =>
                    setFormData({ ...formData, subdomain: e.target.value })
                  }
                />
                <span className="mt-1 px-3 py-2 border border-l-0 rounded-r-md bg-muted text-sm">
                  .denemetakip.net
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Özel Domain</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.customDomain}
                onChange={(e) =>
                  setFormData({ ...formData, customDomain: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Yetkili Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Yetkili Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Yetkili Adı</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.adminName}
                onChange={(e) =>
                  setFormData({ ...formData, adminName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.adminEmail}
                onChange={(e) =>
                  setFormData({ ...formData, adminEmail: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefon</label>
              <input
                type="tel"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.adminPhone}
                onChange={(e) =>
                  setFormData({ ...formData, adminPhone: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Tema Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle>Tema Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Logo</label>
              <div className="mt-1 border-2 border-dashed rounded-lg p-6 text-center">
                <p className="text-muted-foreground">Logo değiştirmek için tıklayın</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Ana Renk</label>
                <input
                  type="color"
                  className="w-full mt-1 h-10 rounded"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">İkincil Renk</label>
                <input
                  type="color"
                  className="w-full mt-1 h-10 rounded"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, secondaryColor: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lisans Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Lisans Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Plan</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.plan}
                onChange={(e) =>
                  setFormData({ ...formData, plan: e.target.value })
                }
              >
                <option value="baslangic">Başlangıç - ₺499/ay</option>
                <option value="profesyonel">Profesyonel - ₺999/ay</option>
                <option value="kurumsal">Kurumsal - Özel</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Başlangıç Tarihi</label>
                <input
                  type="date"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bitiş Tarihi</label>
                <input
                  type="date"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="pt-4">
              <Badge
                variant={
                  formData.status === "active" ? "default" : "secondary"
                }
              >
                {formData.status === "active" ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

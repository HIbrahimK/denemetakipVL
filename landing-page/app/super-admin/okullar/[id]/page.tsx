"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Trash2, Users, BookOpen, Calendar, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/api";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "2eh.net";

interface SchoolStats {
  id: string;
  name: string;
  appShortName: string;
  code: string;
  subdomainAlias: string | null;
  domain: string | null;
  logoUrl: string | null;
  createdAt: string;
  stats: {
    studentCount: number;
    userCount: number;
    examCount: number;
    messageCount: number;
    studyPlanCount: number;
    groupCount: number;
  };
  license: {
    id: string;
    planName: string;
    planId: string;
    status: string;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
    customPrice: number | null;
  } | null;
}

export default function EditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: schoolId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schoolData, setSchoolData] = useState<SchoolStats | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    appShortName: "",
    subdomainAlias: "",
    domain: "",
    logoUrl: "",
    address: "",
    phone: "",
    website: "",
  });

  useEffect(() => {
    loadSchool();
  }, [schoolId]);

  const loadSchool = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getSchoolStats(schoolId);
      setSchoolData(data);
      setFormData({
        name: data.name || "",
        code: data.code || "",
        appShortName: data.appShortName || "",
        subdomainAlias: data.subdomainAlias || "",
        domain: data.domain || "",
        logoUrl: data.logoUrl || "",
        address: data.address || "",
        phone: data.phone || "",
        website: data.website || "",
      });
    } catch (err: any) {
      setError(err.message || "Okul bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await adminApi.updateSchool(schoolId, {
        name: formData.name,
        code: formData.code,
        appShortName: formData.appShortName,
        subdomainAlias: formData.subdomainAlias || null,
        domain: formData.domain || null,
        logoUrl: formData.logoUrl || null,
        address: formData.address || null,
        phone: formData.phone || null,
        website: formData.website || null,
      });
      router.push("/super-admin/okullar");
    } catch (err: any) {
      setError(err.message || "Okul güncellenemedi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu okulu ve tüm verilerini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
      return;
    }
    try {
      setDeleting(true);
      setError(null);
      await adminApi.deleteSchool(schoolId);
      router.push("/super-admin/okullar");
    } catch (err: any) {
      setError(err.message || "Okul silinemedi");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Okul bilgileri yükleniyor...</span>
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error || "Okul bulunamadı"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/super-admin/okullar")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Geri Dön
        </Button>
      </div>
    );
  }

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
            <p className="text-muted-foreground">{schoolData.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Sil
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

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
                <p className="text-2xl font-bold">{schoolData.stats.studentCount.toLocaleString("tr-TR")}</p>
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
                <p className="text-sm text-muted-foreground">Kullanıcı</p>
                <p className="text-2xl font-bold">{schoolData.stats.userCount.toLocaleString("tr-TR")}</p>
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
                <p className="text-2xl font-bold">{schoolData.stats.examCount.toLocaleString("tr-TR")}</p>
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Okul Kodu</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Kısa Ad</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={formData.appShortName}
                  onChange={(e) => setFormData({ ...formData, appShortName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Subdomain</label>
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 mt-1 px-3 py-2 border rounded-l-md"
                  value={formData.subdomainAlias}
                  onChange={(e) => setFormData({ ...formData, subdomainAlias: e.target.value })}
                />
                <span className="mt-1 px-3 py-2 border border-l-0 rounded-r-md bg-muted text-sm">
                  .{ROOT_DOMAIN}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Özel Domain</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="www.example.com"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* İletişim */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Adres</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefon</label>
              <input
                type="tel"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Web Sitesi</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lisans Bilgileri */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Lisans Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            {schoolData.license ? (
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold">{schoolData.license.planName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durum</p>
                  <Badge variant={schoolData.license.status === "ACTIVE" ? "default" : "secondary"}>
                    {schoolData.license.status === "ACTIVE" ? "Aktif" : schoolData.license.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bitiş Tarihi</p>
                  <p className="font-semibold">
                    {new Date(schoolData.license.endDate).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Otomatik Yenileme</p>
                  <p className="font-semibold">{schoolData.license.autoRenew ? "Evet" : "Hayır"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Lisans bilgisi bulunmuyor.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

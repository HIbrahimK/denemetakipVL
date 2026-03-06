"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Save, Trash2, Users, BookOpen, Calendar, Loader2,
  Upload, Key, Plus, UserPlus, X, Shield, Image as ImageIcon,
} from "lucide-react";
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
  address: string | null;
  phone: string | null;
  website: string | null;
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

interface SchoolUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

interface LicensePlan {
  id: string;
  name: string;
  maxStudents: number;
  maxUsers: number;
  maxStorage: number;
  monthlyPrice: number;
  yearlyPrice: number;
  features: Record<string, boolean>;
  isActive: boolean;
}

type Tab = "info" | "admins" | "license";

export default function EditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: schoolId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [schoolData, setSchoolData] = useState<SchoolStats | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  // School info form
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

  // Admin users
  const [admins, setAdmins] = useState<SchoolUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", firstName: "", lastName: "", password: "", role: "SCHOOL_ADMIN" });
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [passwordModal, setPasswordModal] = useState<{ id: string; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Logo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // License
  const [licensePlans, setLicensePlans] = useState<LicensePlan[]>([]);
  const [licenseForm, setLicenseForm] = useState({
    planId: "",
    endDate: "",
    status: "ACTIVE",
    autoRenew: false,
  });
  const [savingLicense, setSavingLicense] = useState(false);

  useEffect(() => {
    loadSchool();
  }, [schoolId]);

  useEffect(() => {
    if (activeTab === "admins" && admins.length === 0) loadAdmins();
    if (activeTab === "license" && licensePlans.length === 0) loadLicensePlans();
  }, [activeTab]);

  const showMessage = (msg: string, type: "error" | "success") => {
    if (type === "error") { setError(msg); setSuccess(null); }
    else { setSuccess(msg); setError(null); }
    setTimeout(() => { setError(null); setSuccess(null); }, 4000);
  };

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
      if (data.license) {
        setLicenseForm({
          planId: data.license.planId || "",
          endDate: data.license.endDate ? data.license.endDate.slice(0, 10) : "",
          status: data.license.status || "ACTIVE",
          autoRenew: data.license.autoRenew || false,
        });
      }
    } catch (err: any) {
      setError(err.message || "Okul bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const users = await adminApi.getUsers({ schoolId });
      setAdmins(users.filter((u: SchoolUser) => u.role === "SCHOOL_ADMIN" || u.role === "TEACHER"));
    } catch (err: any) {
      showMessage(err.message || "Kullanıcılar yüklenemedi", "error");
    } finally {
      setLoadingAdmins(false);
    }
  };

  const loadLicensePlans = async () => {
    try {
      const plans = await adminApi.getLicensePlans();
      setLicensePlans(plans);
    } catch {
      // silent
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
      showMessage("Okul bilgileri güncellendi", "success");
    } catch (err: any) {
      showMessage(err.message || "Okul güncellenemedi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu okulu ve tüm verilerini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;
    try {
      setDeleting(true);
      await adminApi.deleteSchool(schoolId);
      router.push("/super-admin/okullar");
    } catch (err: any) {
      showMessage(err.message || "Okul silinemedi", "error");
    } finally {
      setDeleting(false);
    }
  };

  // ── Logo upload ──
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const result = await adminApi.uploadLogo(file);
      setFormData((prev) => ({ ...prev, logoUrl: result.url }));
      // Auto-save logo URL to school
      await adminApi.updateSchool(schoolId, { logoUrl: result.url });
      showMessage("Logo yüklendi", "success");
    } catch (err: any) {
      showMessage(err.message || "Logo yüklenemedi", "error");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Admin CRUD ──
  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.firstName || !newAdmin.lastName || !newAdmin.password) {
      showMessage("Tüm alanları doldurun", "error");
      return;
    }
    try {
      setSavingAdmin(true);
      await adminApi.createUser({
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        password: newAdmin.password,
        role: newAdmin.role,
        schoolId,
      });
      setShowAddAdmin(false);
      setNewAdmin({ email: "", firstName: "", lastName: "", password: "", role: "SCHOOL_ADMIN" });
      showMessage("Yönetici eklendi", "success");
      await loadAdmins();
    } catch (err: any) {
      showMessage(err.message || "Yönetici eklenemedi", "error");
    } finally {
      setSavingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (userId: string, name: string) => {
    if (!confirm(`${name} kullanıcısını silmek istediğinize emin misiniz?`)) return;
    try {
      await adminApi.deleteUser(userId);
      showMessage("Kullanıcı silindi", "success");
      await loadAdmins();
    } catch (err: any) {
      showMessage(err.message || "Kullanıcı silinemedi", "error");
    }
  };

  const handleChangePassword = async () => {
    if (!passwordModal || newPassword.length < 6) {
      showMessage("Şifre en az 6 karakter olmalıdır", "error");
      return;
    }
    try {
      setSavingPassword(true);
      await adminApi.changeUserPassword(passwordModal.id, newPassword);
      setPasswordModal(null);
      setNewPassword("");
      showMessage("Şifre güncellendi", "success");
    } catch (err: any) {
      showMessage(err.message || "Şifre güncellenemedi", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  // ── License ──
  const handleSaveLicense = async () => {
    if (!licenseForm.planId) {
      showMessage("Lisans planı seçin", "error");
      return;
    }
    try {
      setSavingLicense(true);
      await adminApi.updateSchoolLicense(schoolId, {
        planId: licenseForm.planId,
        endDate: licenseForm.endDate || undefined,
        status: licenseForm.status,
        autoRenew: licenseForm.autoRenew,
      });
      showMessage("Lisans güncellendi", "success");
      await loadSchool();
    } catch (err: any) {
      showMessage(err.message || "Lisans güncellenemedi", "error");
    } finally {
      setSavingLicense(false);
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: "Okul Bilgileri", icon: <BookOpen className="h-4 w-4" /> },
    { id: "admins", label: "Yöneticiler", icon: <Users className="h-4 w-4" /> },
    { id: "license", label: "Lisans", icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/super-admin/okullar")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl.startsWith("http") ? formData.logoUrl : `/api${formData.logoUrl}`}
                alt="Logo"
                className="h-10 w-10 rounded-lg object-contain border"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{schoolData.name}</h1>
              <p className="text-sm text-muted-foreground">
                {schoolData.subdomainAlias ? `${schoolData.subdomainAlias}.${ROOT_DOMAIN}` : schoolData.code}
              </p>
            </div>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
          Okulu Sil
        </Button>
      </div>

      {/* Messages */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">{success}</div>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg"><Users className="h-6 w-6 text-blue-600" /></div>
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
              <div className="p-3 bg-green-100 rounded-lg"><BookOpen className="h-6 w-6 text-green-600" /></div>
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
              <div className="p-3 bg-purple-100 rounded-lg"><Calendar className="h-6 w-6 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Deneme Sayısı</p>
                <p className="text-2xl font-bold">{schoolData.stats.examCount.toLocaleString("tr-TR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Okul Bilgileri ── */}
      {activeTab === "info" && (
        <div className="grid grid-cols-2 gap-6">
          {/* Logo Upload */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Okul Logosu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl.startsWith("http") ? formData.logoUrl : `/api${formData.logoUrl}`}
                      alt="Logo"
                      className="h-24 w-24 rounded-xl object-contain border-2 border-dashed border-muted-foreground/30"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}>
                    {uploadingLogo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {formData.logoUrl ? "Logo Değiştir" : "Logo Yükle"}
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG, JPG, SVG veya WebP. Maks. 5MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School Info */}
          <Card>
            <CardHeader><CardTitle>Okul Bilgileri</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Okul Adı</label>
                <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Okul Kodu</label>
                  <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Kısa Ad</label>
                  <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={formData.appShortName}
                    onChange={(e) => setFormData({ ...formData, appShortName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Subdomain</label>
                <div className="flex">
                  <input type="text" className="flex-1 mt-1 px-3 py-2 border rounded-l-md text-sm" value={formData.subdomainAlias}
                    onChange={(e) => setFormData({ ...formData, subdomainAlias: e.target.value })} />
                  <span className="mt-1 px-3 py-2 border border-l-0 rounded-r-md bg-muted text-sm">.{ROOT_DOMAIN}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Özel Domain</label>
                <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" placeholder="www.example.com"
                  value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader><CardTitle>İletişim Bilgileri</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Adres</label>
                <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Telefon</label>
                <input type="tel" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Web Sitesi</label>
                <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="col-span-2 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Bilgileri Kaydet
            </Button>
          </div>
        </div>
      )}

      {/* ── Tab: Yöneticiler ── */}
      {activeTab === "admins" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Bu okula ait yönetici ve öğretmen hesaplarını yönetin.</p>
            <Button size="sm" onClick={() => setShowAddAdmin(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> Yönetici Ekle
            </Button>
          </div>

          {/* Add Admin Form */}
          {showAddAdmin && (
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Yeni Yönetici Ekle</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowAddAdmin(false)}><X className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Ad</label>
                    <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={newAdmin.firstName}
                      onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Soyad</label>
                    <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={newAdmin.lastName}
                      onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">E-posta</label>
                  <input type="email" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} placeholder="admin@okul.com" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Şifre</label>
                    <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} placeholder="En az 6 karakter" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rol</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-white" value={newAdmin.role}
                      onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}>
                      <option value="SCHOOL_ADMIN">Okul Yöneticisi</option>
                      <option value="TEACHER">Öğretmen</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleAddAdmin} disabled={savingAdmin}>
                    {savingAdmin ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin List */}
          <Card>
            <CardContent className="p-0">
              {loadingAdmins ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">Bu okulda henüz yönetici bulunmuyor.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left text-sm font-medium p-3">Ad Soyad</th>
                      <th className="text-left text-sm font-medium p-3">E-posta</th>
                      <th className="text-left text-sm font-medium p-3">Rol</th>
                      <th className="text-left text-sm font-medium p-3">Kayıt Tarihi</th>
                      <th className="text-right text-sm font-medium p-3">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-3 text-sm font-medium">{admin.firstName} {admin.lastName}</td>
                        <td className="p-3 text-sm text-muted-foreground">{admin.email}</td>
                        <td className="p-3">
                          <Badge variant={admin.role === "SCHOOL_ADMIN" ? "default" : "secondary"}>
                            {admin.role === "SCHOOL_ADMIN" ? "Yönetici" : "Öğretmen"}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(admin.createdAt).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm"
                              onClick={() => { setPasswordModal({ id: admin.id, name: `${admin.firstName} ${admin.lastName}` }); setNewPassword(""); }}>
                              <Key className="h-3.5 w-3.5 mr-1" /> Şifre
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAdmin(admin.id, `${admin.firstName} ${admin.lastName}`)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Tab: Lisans ── */}
      {activeTab === "license" && (
        <div className="space-y-4">
          {/* Current License Info */}
          {schoolData.license && (
            <Card>
              <CardHeader><CardTitle className="text-base">Mevcut Lisans</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="font-semibold">{schoolData.license.planName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Durum</p>
                    <Badge variant={schoolData.license.status === "ACTIVE" ? "default" : "secondary"}>
                      {schoolData.license.status === "ACTIVE" ? "Aktif" : schoolData.license.status === "EXPIRED" ? "Süresi Dolmuş" : schoolData.license.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Başlangıç</p>
                    <p className="text-sm font-medium">{new Date(schoolData.license.startDate).toLocaleDateString("tr-TR")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bitiş</p>
                    <p className="text-sm font-medium">{new Date(schoolData.license.endDate).toLocaleDateString("tr-TR")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Otomatik Yenileme</p>
                    <p className="text-sm font-medium">{schoolData.license.autoRenew ? "Evet" : "Hayır"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* License Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {schoolData.license ? "Lisansı Güncelle" : "Yeni Lisans Oluştur"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Lisans Planı</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-white" value={licenseForm.planId}
                    onChange={(e) => setLicenseForm({ ...licenseForm, planId: e.target.value })}>
                    <option value="">Plan seçin...</option>
                    {licensePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — {plan.monthlyPrice > 0 ? `₺${plan.monthlyPrice}/ay` : "Özel Teklif"}
                        {plan.maxStudents > 0 ? ` (${plan.maxStudents} öğrenci)` : " (Sınırsız)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Durum</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-white" value={licenseForm.status}
                    onChange={(e) => setLicenseForm({ ...licenseForm, status: e.target.value })}>
                    <option value="ACTIVE">Aktif</option>
                    <option value="GRACE">Ödemesiz Dönem</option>
                    <option value="EXPIRED">Süresi Dolmuş</option>
                    <option value="SUSPENDED">Askıya Alınmış</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Bitiş Tarihi</label>
                  <input type="date" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={licenseForm.endDate}
                    onChange={(e) => setLicenseForm({ ...licenseForm, endDate: e.target.value })} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={licenseForm.autoRenew} className="rounded"
                      onChange={(e) => setLicenseForm({ ...licenseForm, autoRenew: e.target.checked })} />
                    <span className="text-sm font-medium">Otomatik Yenileme</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveLicense} disabled={savingLicense}>
                  {savingLicense ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {schoolData.license ? "Lisansı Güncelle" : "Lisans Oluştur"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Change Modal */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setPasswordModal(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-1">Şifre Değiştir</h3>
            <p className="text-sm text-muted-foreground mb-4">{passwordModal.name}</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Yeni Şifre</label>
                <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} placeholder="En az 6 karakter" autoFocus />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPasswordModal(null)}>İptal</Button>
                <Button size="sm" onClick={handleChangePassword} disabled={savingPassword}>
                  {savingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                  Güncelle
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

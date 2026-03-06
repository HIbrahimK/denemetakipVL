"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Loader2, Trash2, Edit2, X } from "lucide-react";
import { adminApi } from "@/lib/api";

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

const featureLabels: Record<string, string> = {
  basicReports: "Temel Raporlar",
  advancedReports: "Gelişmiş Raporlar",
  messaging: "Mesajlaşma",
  studyPlans: "Çalışma Planları",
  achievements: "Başarılar",
  pushNotifications: "Push Bildirimleri",
  emailSupport: "E-posta Destek",
  whatsappSupport: "WhatsApp Destek",
  prioritySupport: "Öncelikli Destek",
  customDevelopment: "Özel Geliştirme",
  sla: "SLA Garantisi",
  dedicatedSupport: "Özel Destek",
};

const emptyPlan: Omit<LicensePlan, "id"> = {
  name: "",
  maxStudents: 100,
  maxUsers: 10,
  maxStorage: 1024,
  monthlyPrice: 0,
  yearlyPrice: 0,
  features: {},
  isActive: true,
};

export default function PricingSettingsPage() {
  const [plans, setPlans] = useState<LicensePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<LicensePlan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const showMessage = (msg: string, type: "error" | "success") => {
    if (type === "error") { setError(msg); setSuccess(null); }
    else { setSuccess(msg); setError(null); }
    setTimeout(() => { setError(null); setSuccess(null); }, 4000);
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getLicensePlans();
      setPlans(data);
    } catch (err: any) {
      showMessage(err.message || "Planlar yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: LicensePlan) => {
    setEditingPlan({ ...plan });
    setIsNew(false);
  };

  const handleNew = () => {
    setEditingPlan({ ...emptyPlan, id: "" } as LicensePlan);
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editingPlan || !editingPlan.name) {
      showMessage("Plan adı gerekli", "error");
      return;
    }
    try {
      setSaving(true);
      if (isNew) {
        const { id, ...data } = editingPlan;
        await adminApi.createLicensePlan(data);
        showMessage("Plan oluşturuldu", "success");
      } else {
        const { id, ...data } = editingPlan;
        await adminApi.updateLicensePlan(editingPlan.id, data);
        showMessage("Plan güncellendi", "success");
      }
      setEditingPlan(null);
      await loadPlans();
    } catch (err: any) {
      showMessage(err.message || "Plan kaydedilemedi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (plan: LicensePlan) => {
    if (!confirm(`"${plan.name}" planını ${plan.isActive ? "deaktif" : "aktif"} etmek istediğinize emin misiniz?`)) return;
    try {
      await adminApi.updateLicensePlan(plan.id, { isActive: !plan.isActive });
      showMessage(`Plan ${plan.isActive ? "deaktif" : "aktif"} edildi`, "success");
      await loadPlans();
    } catch (err: any) {
      showMessage(err.message || "İşlem başarısız", "error");
    }
  };

  const toggleFeature = (key: string) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: {
        ...editingPlan.features,
        [key]: !editingPlan.features[key],
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ücretlendirme Ayarları</h1>
          <p className="text-muted-foreground text-sm">Landing page&apos;de gösterilen lisans planlarını yönetin</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" /> Yeni Plan
        </Button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">{success}</div>}

      {/* Plan Edit Form */}
      {editingPlan && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{isNew ? "Yeni Plan Oluştur" : `"${editingPlan.name}" Planını Düzenle`}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingPlan(null)}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Plan Adı</label>
                <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Aylık Fiyat (₺)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={editingPlan.monthlyPrice}
                  onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Yıllık Fiyat (₺)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={editingPlan.yearlyPrice}
                  onChange={(e) => setEditingPlan({ ...editingPlan, yearlyPrice: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Maks. Öğrenci (-1 = sınırsız)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={editingPlan.maxStudents}
                  onChange={(e) => setEditingPlan({ ...editingPlan, maxStudents: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Maks. Kullanıcı (-1 = sınırsız)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={editingPlan.maxUsers}
                  onChange={(e) => setEditingPlan({ ...editingPlan, maxUsers: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="text-sm font-medium">Maks. Depolama (MB)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={editingPlan.maxStorage}
                  onChange={(e) => setEditingPlan({ ...editingPlan, maxStorage: parseInt(e.target.value) || 0 })} />
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="text-sm font-medium mb-2 block">Özellikler</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(featureLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={!!editingPlan.features[key]} onChange={() => toggleFeature(key)} className="rounded" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingPlan(null)}>İptal</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isNew ? "Oluştur" : "Güncelle"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={!plan.isActive ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? "Aktif" : "Deaktif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-2">
                <span className="text-3xl font-bold">
                  {plan.monthlyPrice > 0 ? `₺${plan.monthlyPrice.toLocaleString("tr-TR")}` : "Özel Teklif"}
                </span>
                {plan.monthlyPrice > 0 && <span className="text-muted-foreground">/ay</span>}
                {plan.yearlyPrice > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">₺{plan.yearlyPrice.toLocaleString("tr-TR")}/yıl</p>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <p>Öğrenci: <strong>{plan.maxStudents === -1 ? "Sınırsız" : plan.maxStudents}</strong></p>
                <p>Kullanıcı: <strong>{plan.maxUsers === -1 ? "Sınırsız" : plan.maxUsers}</strong></p>
                <p>Depolama: <strong>{plan.maxStorage === -1 ? "Sınırsız" : `${plan.maxStorage} MB`}</strong></p>
              </div>

              <div className="flex flex-wrap gap-1">
                {Object.entries(plan.features || {}).filter(([, v]) => v).map(([key]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {featureLabels[key] || key}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(plan)}>
                  <Edit2 className="h-3.5 w-3.5 mr-1" /> Düzenle
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeactivate(plan)}>
                  {plan.isActive ? "Deaktif Et" : "Aktif Et"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  School,
  User,
  Palette,
  CreditCard,
  CheckCircle,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

export default function NewSchoolWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolCode: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    plan: "profesyonel",
  });

  const steps = [
    { id: 1, title: "Okul Bilgileri", icon: School },
    { id: 2, title: "Yetkili Bilgileri", icon: User },
    { id: 3, title: "Tema Ayarları", icon: Palette },
    { id: 4, title: "Lisans", icon: CreditCard },
    { id: 5, title: "Onay", icon: CheckCircle },
  ];

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = () => {
    router.push("/super-admin/okullar");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Yeni Okul Ekle</h1>
        <p className="text-muted-foreground">
          Yeni bir okul kurulumu oluşturun
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <step.icon className="h-5 w-5" />
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Okul Adı *</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Örn: Ankara Atatürk Lisesi"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Okul Kodu *</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="AAL"
                    value={formData.schoolCode}
                    onChange={(e) =>
                      setFormData({ ...formData, schoolCode: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subdomain *</label>
                  <div className="flex">
                    <input
                      type="text"
                      className="flex-1 mt-1 px-3 py-2 border rounded-l-md"
                      placeholder="aal"
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
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Yetkili Adı *</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Ad Soyad"
                  value={formData.adminName}
                  onChange={(e) =>
                    setFormData({ ...formData, adminName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="admin@okul.edu.tr"
                  value={formData.adminEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, adminEmail: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Telefon *</label>
                <input
                  type="tel"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="05XX XXX XX XX"
                  value={formData.adminPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, adminPhone: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Logo</label>
                <div className="mt-1 border-2 border-dashed rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">
                    Logo yüklemek için tıklayın veya sürükleyin
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Ana Renk</label>
                  <input type="color" className="w-full mt-1 h-10 rounded" defaultValue="#3b82f6" />
                </div>
                <div>
                  <label className="text-sm font-medium">İkincil Renk</label>
                  <input type="color" className="w-full mt-1 h-10 rounded" defaultValue="#1e40af" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Plan *</label>
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
                  <input type="date" className="w-full mt-1 px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium">Bitiş Tarihi</label>
                  <input type="date" className="w-full mt-1 px-3 py-2 border rounded-md" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>Okul:</strong> {formData.schoolName || "-"}</p>
                <p><strong>Kod:</strong> {formData.schoolCode || "-"}</p>
                <p><strong>Subdomain:</strong> {formData.subdomain || "-"}.denemetakip.net</p>
                <p><strong>Yetkili:</strong> {formData.adminName || "-"}</p>
                <p><strong>Email:</strong> {formData.adminEmail || "-"}</p>
                <p><strong>Plan:</strong> {formData.plan}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            {currentStep < 5 ? (
              <Button onClick={nextStep}>
                İleri
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>Okul Oluştur</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

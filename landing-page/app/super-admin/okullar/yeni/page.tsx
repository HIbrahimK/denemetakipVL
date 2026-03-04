"use client";

import { useState, useRef } from "react";
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
  Loader2,
  AlertCircle,
  Upload,
  X,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { adminApi, ApiError } from "@/lib/api";

type Step = 1 | 2 | 3 | 4 | 5;

interface CreatedSchool {
  school: { id: string; name: string; code: string; subdomainAlias: string | null; domain: string | null };
  admin: { id: string; email: string; firstName: string; lastName: string };
}

export default function NewSchoolWizardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSchool, setCreatedSchool] = useState<CreatedSchool | null>(null);
  const [copiedField, setCopiedField] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [domainMode, setDomainMode] = useState<"subdomain" | "custom">("subdomain");
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolCode: "",
    subdomain: "",
    customDomain: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#1e40af",
    plan: "profesyonel",
    licenseStartDate: new Date().toISOString().split("T")[0],
    licenseEndDate: "",
  });

  const steps = [
    { id: 1, title: "Okul Bilgileri", icon: School },
    { id: 2, title: "Yetkili Bilgileri", icon: User },
    { id: 3, title: "Tema Ayarları", icon: Palette },
    { id: 4, title: "Lisans", icon: CreditCard },
    { id: 5, title: "Onay", icon: CheckCircle },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.schoolName || !formData.schoolCode) {
          setError("Okul adı ve kodu zorunludur.");
          return false;
        }
        if (domainMode === "subdomain" && !formData.subdomain) {
          setError("Subdomain zorunludur.");
          return false;
        }
        if (domainMode === "custom" && !formData.customDomain) {
          setError("Özel domain zorunludur.");
          return false;
        }
        break;
      case 2:
        if (
          !formData.adminFirstName ||
          !formData.adminLastName ||
          !formData.adminEmail ||
          !formData.adminPassword
        ) {
          setError("Tüm yetkili bilgileri zorunludur.");
          return false;
        }
        if (formData.adminPassword.length < 4) {
          setError("Şifre en az 4 karakter olmalıdır.");
          return false;
        }
        break;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (currentStep < 5) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const prevStep = () => {
    setError("");
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Logo dosyası 5MB'den küçük olmalıdır.");
      return;
    }

    setLogoFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setLogoUploading(true);
    setError("");
    try {
      const result = await adminApi.uploadLogo(logoFile);
      setUploadedLogoUrl(result.url);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.data?.message || "Logo yüklenemedi.");
      } else {
        setError("Logo yüklenemedi. Lütfen tekrar deneyin.");
      }
    } finally {
      setLogoUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setUploadedLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleLogoSelect(fakeEvent);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const getSchoolAccessUrl = () => {
    if (domainMode === "custom" && formData.customDomain) {
      return `http://${formData.customDomain}`;
    }
    if (formData.subdomain) {
      // Local testing: use localhost:3000 since subdomains won't work locally without hosts file
      return `http://localhost:3000`;
    }
    return "http://localhost:3000";
  };

  const getSchoolDomainDisplay = () => {
    if (domainMode === "custom" && formData.customDomain) {
      return formData.customDomain;
    }
    if (formData.subdomain) {
      return `${formData.subdomain}.denemetakip.net`;
    }
    return "-";
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // Upload logo first if selected but not yet uploaded
    let finalLogoUrl = uploadedLogoUrl;
    if (logoFile && !uploadedLogoUrl) {
      try {
        const result = await adminApi.uploadLogo(logoFile);
        finalLogoUrl = result.url;
        setUploadedLogoUrl(result.url);
      } catch {
        setError("Logo yüklenemedi. Okul logosuz oluşturulacak.");
        finalLogoUrl = null;
      }
    }

    try {
      const result = await adminApi.createSchool({
        name: formData.schoolName,
        code: formData.schoolCode,
        subdomainAlias: domainMode === "subdomain" ? formData.subdomain : undefined,
        domain: domainMode === "custom" ? formData.customDomain : undefined,
        adminEmail: formData.adminEmail,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminPassword: formData.adminPassword,
        phone: formData.adminPhone || undefined,
        logoUrl: finalLogoUrl || undefined,
        licenseStartDate: formData.licenseStartDate || undefined,
        licenseEndDate: formData.licenseEndDate || undefined,
      });
      setCreatedSchool(result);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(
          Array.isArray(err.data?.message)
            ? err.data.message.join(", ")
            : err.data?.message || err.message
        );
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Success screen after school creation
  if (createdSchool) {
    const accessUrl = getSchoolAccessUrl();
    const domainDisplay = getSchoolDomainDisplay();
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800">Okul Başarıyla Oluşturuldu!</h2>
              <p className="text-green-600 mt-1">{createdSchool.school.name}</p>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-3 border">
              <h3 className="font-semibold text-lg mb-3">Okul Bilgileri</h3>
              
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Okul Kodu</span>
                <span className="font-mono font-medium">{createdSchool.school.code}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Domain</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{domainDisplay}</span>
                  <button
                    onClick={() => copyToClipboard(domainDisplay, "domain")}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedField === "domain" ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Admin Email</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{createdSchool.admin.email}</span>
                  <button
                    onClick={() => copyToClipboard(createdSchool.admin.email, "email")}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedField === "email" ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Admin Şifre</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{formData.adminPassword}</span>
                  <button
                    onClick={() => copyToClipboard(formData.adminPassword, "password")}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedField === "password" ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">🧪 Yerel Test Rehberi</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  Yerelde subdomain desteği olmadığı için okula{" "}
                  <code className="bg-blue-100 px-1 rounded">localhost:3000</code> üzerinden
                  erişebilirsiniz:
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>
                    <a
                      href="http://localhost:3000/login/school"
                      target="_blank"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      localhost:3000/login/school <ExternalLink className="h-3 w-3" />
                    </a>
                    {" "}adresine gidin
                  </li>
                  <li>
                    Email: <strong>{createdSchool.admin.email}</strong> ile giriş yapın
                  </li>
                  <li>Şifre: <strong>{formData.adminPassword}</strong></li>
                </ol>
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
                  <strong>Production/Staging:</strong> {domainDisplay} üzerinden direkt erişim sağlanır.
                  <br />
                  <strong>Yerelde subdomain test:</strong>{" "}
                  <code>C:\Windows\System32\drivers\etc\hosts</code> dosyasına{" "}
                  <code>127.0.0.1 {formData.subdomain || formData.customDomain || "okul"}.denemetakip.net</code> ekleyin.
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/super-admin/okullar")}
              >
                Okul Listesine Dön
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setCreatedSchool(null);
                  setCurrentStep(1);
                  setFormData({
                    schoolName: "",
                    schoolCode: "",
                    subdomain: "",
                    customDomain: "",
                    adminFirstName: "",
                    adminLastName: "",
                    adminEmail: "",
                    adminPhone: "",
                    adminPassword: "",
                    primaryColor: "#3b82f6",
                    secondaryColor: "#1e40af",
                    plan: "profesyonel",
                    licenseStartDate: new Date().toISOString().split("T")[0],
                    licenseEndDate: "",
                  });
                  removeLogo();
                }}
              >
                Yeni Okul Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 text-destructive rounded-md text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="schoolName" className="text-sm font-medium">
                  Okul Adı *
                </label>
                <input
                  id="schoolName"
                  name="schoolName"
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Örn: Ankara Atatürk Lisesi"
                  value={formData.schoolName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="schoolCode" className="text-sm font-medium">
                  Okul Kodu *
                </label>
                <input
                  id="schoolCode"
                  name="schoolCode"
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="AAL"
                  value={formData.schoolCode}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Domain Mode Selector */}
              <div>
                <label className="text-sm font-medium block mb-2">Domain Türü *</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setDomainMode("subdomain")}
                    className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                      domainMode === "subdomain"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                  >
                    Subdomain
                  </button>
                  <button
                    type="button"
                    onClick={() => setDomainMode("custom")}
                    className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${
                      domainMode === "custom"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border"
                    }`}
                  >
                    Özel Domain
                  </button>
                </div>

                {domainMode === "subdomain" ? (
                  <div>
                    <label htmlFor="subdomain" className="text-sm text-muted-foreground">
                      Subdomain *
                    </label>
                    <div className="flex mt-1">
                      <input
                        id="subdomain"
                        name="subdomain"
                        type="text"
                        className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="okul-kodu"
                        value={formData.subdomain}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <span className="px-3 py-2 border border-l-0 rounded-r-md bg-muted text-sm flex items-center">
                        .denemetakip.net
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Erişim: {formData.subdomain ? `${formData.subdomain}.denemetakip.net` : "okul-kodu.denemetakip.net"}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="customDomain" className="text-sm text-muted-foreground">
                      Özel Domain *
                    </label>
                    <input
                      id="customDomain"
                      name="customDomain"
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="deneme.okuladi.edu.tr"
                      value={formData.customDomain}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Okulun kendi domaini. DNS CNAME kaydının denemetakip.net&apos;e yönlenmesi gerekir.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="adminFirstName" className="text-sm font-medium">
                    Yetkili Adı *
                  </label>
                  <input
                    id="adminFirstName"
                    name="adminFirstName"
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ad"
                    value={formData.adminFirstName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="adminLastName" className="text-sm font-medium">
                    Yetkili Soyadı *
                  </label>
                  <input
                    id="adminLastName"
                    name="adminLastName"
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Soyad"
                    value={formData.adminLastName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="adminEmail" className="text-sm font-medium">
                  Email *
                </label>
                <input
                  id="adminEmail"
                  name="adminEmail"
                  type="email"
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="admin@okul.edu.tr"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="adminPassword" className="text-sm font-medium">
                  Şifre *
                </label>
                <input
                  id="adminPassword"
                  name="adminPassword"
                  type="password"
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="En az 4 karakter"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="adminPhone" className="text-sm font-medium">
                  Telefon
                </label>
                <input
                  id="adminPhone"
                  name="adminPhone"
                  type="tel"
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="05XX XXX XX XX"
                  value={formData.adminPhone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Logo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                {logoPreview ? (
                  <div className="mt-2 border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={logoPreview}
                        alt="Logo önizleme"
                        className="w-20 h-20 object-contain rounded-lg border bg-white"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{logoFile?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : ""}
                        </p>
                        {uploadedLogoUrl ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                            <CheckCircle className="h-3 w-3" /> Yüklendi
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-1"
                            onClick={handleLogoUpload}
                            disabled={logoUploading}
                          >
                            {logoUploading ? (
                              <>
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                Yükleniyor...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-1 h-3 w-3" />
                                Yükle
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <button
                        onClick={removeLogo}
                        className="p-1 hover:bg-muted rounded"
                        title="Logoyu kaldır"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Logo yüklemek için tıklayın veya sürükleyin
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, SVG, WebP (maks. 5MB)
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primaryColor" className="text-sm font-medium">Ana Renk</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0"
                      value={formData.primaryColor}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border rounded-md text-sm font-mono"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="secondaryColor" className="text-sm font-medium">İkincil Renk</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      id="secondaryColor"
                      name="secondaryColor"
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border rounded-md text-sm font-mono"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="plan" className="text-sm font-medium">
                  Plan *
                </label>
                <select
                  id="plan"
                  name="plan"
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.plan}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="baslangic">Başlangıç - ₺499/ay</option>
                  <option value="profesyonel">Profesyonel - ₺999/ay</option>
                  <option value="kurumsal">Kurumsal - Özel</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="licenseStartDate" className="text-sm font-medium">
                    Başlangıç Tarihi
                  </label>
                  <input
                    id="licenseStartDate"
                    name="licenseStartDate"
                    type="date"
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.licenseStartDate}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="licenseEndDate" className="text-sm font-medium">
                    Bitiş Tarihi
                  </label>
                  <input
                    id="licenseEndDate"
                    name="licenseEndDate"
                    type="date"
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.licenseEndDate}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>Okul:</strong> {formData.schoolName || "-"}</p>
                <p><strong>Kod:</strong> {formData.schoolCode || "-"}</p>
                <p>
                  <strong>Domain:</strong>{" "}
                  {domainMode === "subdomain"
                    ? formData.subdomain
                      ? `${formData.subdomain}.denemetakip.net`
                      : "-"
                    : formData.customDomain || "-"}
                </p>
                {domainMode === "custom" && formData.customDomain && (
                  <p className="text-xs text-amber-600">
                    ⚠️ Özel domain için DNS CNAME kaydı gerekir
                  </p>
                )}
                <p>
                  <strong>Yetkili:</strong>{" "}
                  {formData.adminFirstName} {formData.adminLastName}
                </p>
                <p><strong>Email:</strong> {formData.adminEmail || "-"}</p>
                <p><strong>Plan:</strong> {formData.plan}</p>
                {logoPreview && (
                  <div className="flex items-center gap-2">
                    <strong>Logo:</strong>
                    <img src={logoPreview} alt="Logo" className="w-8 h-8 object-contain rounded" />
                    {uploadedLogoUrl ? (
                      <span className="text-xs text-green-600">✓ Yüklendi</span>
                    ) : (
                      <span className="text-xs text-amber-600">Oluşturulurken yüklenecek</span>
                    )}
                  </div>
                )}
                {formData.licenseStartDate && (
                  <p><strong>Lisans Başlangıç:</strong> {formData.licenseStartDate}</p>
                )}
                {formData.licenseEndDate && (
                  <p><strong>Lisans Bitiş:</strong> {formData.licenseEndDate}</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            {currentStep < 5 ? (
              <Button onClick={nextStep} disabled={loading}>
                İleri
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  "Okul Oluştur"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

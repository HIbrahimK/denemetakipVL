"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Mail,
  Save,
  Loader2,
  Phone,
  MapPin,
} from "lucide-react";
import { adminApi } from "@/lib/api";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("contact");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Record<string, any>>({
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    whatsapp: "",
    socialMedia: {
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
    platformName: "Deneme Takip Sistemi",
    rootDomain: "2eh.net",
    smtpHost: "",
    smtpPort: "587",
    senderEmail: "",
    notifyNewSchool: true,
    notifyLicenseWarning: true,
    notifySystemError: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSiteSettings();
      if (data && typeof data === "object") {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await adminApi.updateSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Ayarlar kaydedilemedi");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateSocial = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [key]: value },
    }));
  };

  const settingsSections = [
    {
      id: "contact",
      title: "İletişim Bilgileri",
      icon: Phone,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">İletişim E-posta</label>
            <input type="email" className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={settings.contactEmail} onChange={(e) => updateSetting("contactEmail", e.target.value)} placeholder="info@denemetakip.net" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Telefon</label>
            <input type="tel" className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={settings.contactPhone} onChange={(e) => updateSetting("contactPhone", e.target.value)} placeholder="+90 212 000 00 00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">WhatsApp</label>
            <input type="tel" className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={settings.whatsapp} onChange={(e) => updateSetting("whatsapp", e.target.value)} placeholder="+905551234567" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Adres</label>
            <textarea className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={2}
              value={settings.contactAddress} onChange={(e) => updateSetting("contactAddress", e.target.value)} placeholder="İstanbul, Türkiye" />
          </div>
          <div className="pt-2">
            <label className="block text-sm font-medium mb-3">Sosyal Medya</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "twitter", label: "Twitter/X" },
                { key: "instagram", label: "Instagram" },
                { key: "linkedin", label: "LinkedIn" },
                { key: "youtube", label: "YouTube" },
              ].map((s) => (
                <div key={s.key}>
                  <label className="block text-xs text-muted-foreground mb-1">{s.label}</label>
                  <input type="url" className="w-full px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={settings.socialMedia?.[s.key] || ""} onChange={(e) => updateSocial(s.key, e.target.value)} placeholder="https://..." />
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "general",
      title: "Genel Ayarlar",
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Platform Adı</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={settings.platformName} onChange={(e) => updateSetting("platformName", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Ana Domain</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={settings.rootDomain} onChange={(e) => updateSetting("rootDomain", e.target.value)} />
          </div>
        </div>
      ),
    },
    {
      id: "email",
      title: "E-posta Ayarları",
      icon: Mail,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">SMTP Host</label>
            <input type="text" className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={settings.smtpHost} onChange={(e) => updateSetting("smtpHost", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">SMTP Port</label>
            <input type="number" className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={settings.smtpPort} onChange={(e) => updateSetting("smtpPort", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Gönderen Adresi</label>
            <input type="email" className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={settings.senderEmail} onChange={(e) => updateSetting("senderEmail", e.target.value)} />
          </div>
        </div>
      ),
    },
    {
      id: "notifications",
      title: "Bildirim Ayarları",
      icon: Bell,
      content: (
        <div className="space-y-3">
          {[
            { key: "notifyNewSchool", label: "Yeni Okul Bildirimi" },
            { key: "notifyLicenseWarning", label: "Lisans Uyarı Bildirimi" },
            { key: "notifySystemError", label: "Sistem Hatası Bildirimi" },
          ].map((n) => (
            <label key={n.key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={!!settings[n.key]} onChange={(e) => updateSetting(n.key, e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
              <span className="text-sm font-medium">{n.label}</span>
            </label>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground">Platform yapılandırma ayarları</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Kaydedildi!" : "Kaydet"}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">{error}</div>}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id ? "bg-primary text-white" : "hover:bg-gray-100"
                }`}
              >
                <section.icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            settingsSections
              .filter((s) => s.id === activeSection)
              .map((section) => (
                <div key={section.id} className="bg-white rounded-xl border p-6">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <section.icon className="h-5 w-5 text-primary" />
                    {section.title}
                  </h2>
                  {section.content}
                </div>
              ))
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Güvenlik Notu</p>
                <p className="text-sm text-blue-700 mt-1">
                  İletişim bilgileri landing page&apos;de görüntülenir. Ayar değişiklikleri anlık olarak uygulanır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Database,
  Mail,
  Save,
} from "lucide-react";

const settingsSections = [
  {
    id: "general",
    title: "Genel Ayarlar",
    icon: Settings,
    fields: [
      { label: "Platform Adı", value: "Deneme Takip Sistemi", type: "text" },
      { label: "İletişim Email", value: "info@denemetakip.net", type: "email" },
      { label: "Destek Telefon", value: "+90 212 000 00 00", type: "tel" },
    ],
  },
  {
    id: "domain",
    title: "Domain Ayarları",
    icon: Globe,
    fields: [
      { label: "Ana Domain", value: "denemetakip.net", type: "text" },
      { label: "Test Domain", value: "2eh.net", type: "text" },
      { label: "API URL", value: "http://localhost:3001", type: "url" },
    ],
  },
  {
    id: "email",
    title: "E-posta Ayarları",
    icon: Mail,
    fields: [
      { label: "SMTP Host", value: "smtp.ethereal.email", type: "text" },
      { label: "SMTP Port", value: "587", type: "number" },
      { label: "Gönderen Adresi", value: "noreply@denemetakip.com", type: "email" },
    ],
  },
  {
    id: "notifications",
    title: "Bildirim Ayarları",
    icon: Bell,
    fields: [
      { label: "Yeni Okul Bildirimi", value: "true", type: "checkbox" },
      { label: "Lisans Uyarı Bildirimi", value: "true", type: "checkbox" },
      { label: "Sistem Hatası Bildirimi", value: "true", type: "checkbox" },
    ],
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Ayarlar</h1>
          <p className="text-muted-foreground">Platform yapılandırma ayarları</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Save className="h-4 w-4" />
          {saved ? "Kaydedildi!" : "Kaydet"}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${
                    activeSection === section.id
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                <section.icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {settingsSections
            .filter((s) => s.id === activeSection)
            .map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-xl border p-6"
              >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.fields.map((field, idx) => (
                    <div key={idx}>
                      {field.type === "checkbox" ? (
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={field.value === "true"}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm font-medium">
                            {field.label}
                          </span>
                        </label>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium mb-1.5">
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            defaultValue={field.value}
                            className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Güvenlik Notu
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Ayar değişiklikleri anlık olarak uygulanır. Kritik
                  değişikliklerde dikkatli olunuz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

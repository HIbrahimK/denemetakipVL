"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Save, Settings as SettingsIcon } from "lucide-react";

export default function MessageSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/messages/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Hata",
        description: "Ayarlar yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/messages/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Ayarlar kaydedildi",
        });
      } else {
        toast({
          title: "Hata",
          description: "Ayarlar kaydedilemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Mesaj Ayarları</h1>
      </div>

      <Card className="p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <Label>Maksimum Karakter Limiti</Label>
            <Input
              type="number"
              value={settings.maxCharacterLimit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxCharacterLimit: parseInt(e.target.value),
                })
              }
              min={100}
            />
            <p className="text-sm text-gray-500 mt-1">
              Mesaj başına izin verilen maksimum karakter sayısı
            </p>
          </div>

          <div>
            <Label>Otomatik Silme Süresi (Gün)</Label>
            <Input
              type="number"
              value={settings.autoDeleteDays}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  autoDeleteDays: parseInt(e.target.value),
                })
              }
              min={1}
            />
            <p className="text-sm text-gray-500 mt-1">
              Mesajlar bu süre sonunda otomatik olarak silinir
            </p>
          </div>

          <div>
            <Label>Hatırlatma Süresi (Gün)</Label>
            <Input
              type="number"
              value={settings.reminderAfterDays}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  reminderAfterDays: parseInt(e.target.value),
                })
              }
              min={0}
            />
            <p className="text-sm text-gray-500 mt-1">
              Okunmamış mesajlar için hatırlatma gönderilecek süre (0 =
              devre dışı)
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.requireTeacherApproval}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    requireTeacherApproval: checked,
                  })
                }
              />
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Öğretmen toplu mesajları için yönetici onayı gerekli
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.enableEmailNotifications}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    enableEmailNotifications: checked,
                  })
                }
              />
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                E-posta bildirimleri aktif
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.enablePushNotifications}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    enablePushNotifications: checked,
                  })
                }
              />
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Push bildirimleri aktif
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

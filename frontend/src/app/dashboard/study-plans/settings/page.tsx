'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface School {
  id: string;
  name: string;
  autoCleanupEnabled: boolean;
  cleanupMonthsToKeep: number;
  lastCleanupAt: string | null;
}

export default function StudyPlanSettingsPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(true);
  const [cleanupMonthsToKeep, setCleanupMonthsToKeep] = useState(1);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/school');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard/study-plans');
      return;
    }
    fetchSchoolSettings();
  }, []);

  const fetchSchoolSettings = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);

    try {
      const response = await fetch(`${API_BASE_URL}/schools/${user.schoolId}`, {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSchool(data);
        setAutoCleanupEnabled(data.autoCleanupEnabled ?? true);
        setCleanupMonthsToKeep(data.cleanupMonthsToKeep ?? 1);
      }
    } catch (error) {
      console.error('Error fetching school settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!school) return;

    setSaving(true);
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token) {
      toast({
        title: 'Hata',
        description: 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.',
        variant: 'destructive',
      });
      setSaving(false);
      router.push('/login/school');
      return;
    }

    console.log('Saving settings:', { 
      schoolId: school.id, 
      autoCleanupEnabled, 
      cleanupMonthsToKeep,
      user: userStr ? JSON.parse(userStr) : null 
    });

    try {
      const response = await fetch(`${API_BASE_URL}/schools/${school.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          autoCleanupEnabled,
          cleanupMonthsToKeep,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Ayarlar kaydedilirken hata oluştu';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
          console.error('Backend error:', error);
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        
        if (response.status === 404) {
          errorMessage = 'Okul bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.';
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = 'Bu işlem için yetkiniz yok. SCHOOL_ADMIN rolü gerekli.';
          // Redirect to login if unauthorized
          setTimeout(() => router.push('/login/school'), 2000);
        }
        
        throw new Error(errorMessage);
      }

      toast({
        title: 'Başarılı',
        description: 'Ayarlar başarıyla kaydedildi',
      });

      fetchSchoolSettings();
    } catch (error: any) {
      console.error('Save settings error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/study-plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Çalışma Planı Ayarları</h1>
          <p className="text-muted-foreground mt-1">
            Otomatik temizleme ve diğer ayarları yönetin
          </p>
        </div>
      </div>

      {/* Auto Cleanup Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Otomatik Temizleme</CardTitle>
          <CardDescription>
            Eski aktif planları otomatik olarak temizleyin. Şablonlar hiçbir zaman silinmez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Cleanup */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoCleanup">Otomatik Temizleme</Label>
              <p className="text-sm text-muted-foreground">
                Her ayın 1. günü eski aktif planları otomatik olarak temizle
              </p>
            </div>
            <Switch
              id="autoCleanup"
              checked={autoCleanupEnabled}
              onCheckedChange={setAutoCleanupEnabled}
            />
          </div>

          {/* Months to Keep */}
          {autoCleanupEnabled && (
            <div className="space-y-2">
              <Label htmlFor="monthsToKeep">Saklama Süresi (Ay)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Bu süre kadar eski olmayan aktif planlar korunacak
              </p>
              <Input
                id="monthsToKeep"
                type="number"
                min={1}
                max={12}
                value={cleanupMonthsToKeep}
                onChange={(e) => setCleanupMonthsToKeep(parseInt(e.target.value) || 1)}
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Örnek: {cleanupMonthsToKeep} ay = Son {cleanupMonthsToKeep} ay içinde oluşturulan planlar korunur
              </p>
            </div>
          )}

          {/* Last Cleanup Info */}
          {school?.lastCleanupAt && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium">Son Temizleme</p>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(school.lastCleanupAt).toLocaleString('tr-TR', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
            <p className="text-sm text-blue-900 font-medium mb-2">ℹ️ Önemli Bilgiler</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Sadece <strong>aktif planlar</strong> (isTemplate=false) temizlenir</li>
              <li>Şablonlar hiçbir zaman silinmez</li>
              <li>Temizleme işlemi her ayın 1. günü gece yarısı çalışır</li>
              <li>Temizlenen planların atamaları ve görevleri de silinir</li>
              <li>Öğrenci performans verileri korunur</li>
            </ul>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Target } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function NewGoalPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    targetValue: '',
    deadline: '',
    description: '',
    targetData: {},
  });
  const router = useRouter();
  const { toast } = useToast();

  const goalTypes = [
    { value: 'EXAM_SCORE', label: 'Sınav Puanı Hedefi' },
    { value: 'STUDY_TIME', label: 'Çalışma Süresi Hedefi' },
    { value: 'TASK_COMPLETION', label: 'Görev Tamamlama Hedefi' },
    { value: 'SUBJECT_MASTERY', label: 'Konu Hakimiyeti Hedefi' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://localhost:4000/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          targetValue: parseFloat(formData.targetValue),
          currentValue: 0,
          status: 'ACTIVE',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('API Error:', errorData);
        throw new Error(errorMessage);
      }

      toast({
        title: 'Başarılı',
        description: 'Hedef oluşturuldu',
      });

      router.push('/dashboard/student-dashboard');
    } catch (error) {
      console.error('Error creating goal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Hedef oluşturulurken bir hata oluştu';
      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/dashboard/student-dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Hedeflerime Dön
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Yeni Hedef Belirle
          </CardTitle>
          <CardDescription>
            Kendine bir hedef belirle ve ilerlemeyi takip et
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">Hedef Tipi *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hedef tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetValue">Hedef Değer *</Label>
              <Input
                id="targetValue"
                type="number"
                placeholder="Örn: 450 (puan) veya 120 (dakika)"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Son Tarih *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                placeholder="Hedef hakkında notlar..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  'Hedefi Oluştur'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

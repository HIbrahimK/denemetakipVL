'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/auth';

export default function NewGroupPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxStudents: '',
    teacherId: '',
  });
  const router = useRouter();
  const { toast } = useToast();

  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      if (userData.role === 'SCHOOL_ADMIN' || userData.role === 'SUPER_ADMIN') {
        fetchTeachers();
      }
    }
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users?role=TEACHER`, {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data - only send non-empty fields
      const requestData: any = {
        name: formData.name,
      };
      
      if (formData.description) {
        requestData.description = formData.description;
      }

      if (formData.maxStudents) {
        const maxValue = Number(formData.maxStudents);
        if (Number.isFinite(maxValue) && maxValue > 0) {
          requestData.maxStudents = maxValue;
        }
      }

      if (isAdmin && formData.teacherId) {
        requestData.teacherId = formData.teacherId;
      }
      
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('API Error:', errorData);
        throw new Error(errorMessage);
      }

      toast({
        title: 'Başarılı',
        description: 'Mentor grubu oluşturuldu',
      });

      router.push('/dashboard/groups');
    } catch (error) {
      console.error('Error creating group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Grup oluşturulurken bir hata oluştu';
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
        <Link href="/dashboard/groups">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Gruplara Dön
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Yeni Mentor Grubu Oluştur
          </CardTitle>
          <CardDescription>
            Öğrencileriniz için bir mentor grubu oluşturun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Grup Adı *</Label>
              <Input
                id="name"
                placeholder="Örn: 12. Sınıf TYT Grubu"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                placeholder="Grup hakkında kısa bir açıklama..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label>Öğretmen (Opsiyonel)</Label>
                <Select value={formData.teacherId} onValueChange={(value) => setFormData({ ...formData, teacherId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Öğretmen seçiniz..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Maksimum Öğrenci</Label>
              <Input
                id="maxStudents"
                type="number"
                min={1}
                placeholder="Örn: 25"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
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
                  'Grubu Oluştur'
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

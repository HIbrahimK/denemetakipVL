'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/auth';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewGroupPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxStudents: '',
    teacherId: '',
    teacherIds: [] as string[],
  });
  const router = useRouter();
  const { toast } = useToast();

  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
  const mergedTeacherIds = useMemo(
    () =>
      [...new Set([...(formData.teacherId ? [formData.teacherId] : []), ...formData.teacherIds])],
    [formData.teacherId, formData.teacherIds],
  );

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
      const response = await fetch(`${API_BASE_URL}/users?role=TEACHER`);
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const toggleTeacher = (teacherId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      teacherIds: checked
        ? [...prev.teacherIds, teacherId]
        : prev.teacherIds.filter((id) => id !== teacherId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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

      if (isAdmin && mergedTeacherIds.length > 0) {
        requestData.teacherIds = mergedTeacherIds;
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
        throw new Error(errorMessage);
      }

      toast({
        title: 'Basarili',
        description: 'Mentor grubu olusturuldu',
      });

      router.push('/dashboard/groups');
    } catch (error) {
      console.error('Error creating group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Grup olusturulurken bir hata olustu';
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
            Gruplara Don
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Yeni Mentor Grubu Olustur
          </CardTitle>
          <CardDescription>Ogrencileriniz icin bir mentor grubu olusturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Grup Adi *</Label>
              <Input
                id="name"
                placeholder="Orn: 12. Sinif TYT Grubu"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Aciklama</Label>
              <Textarea
                id="description"
                placeholder="Grup hakkinda kisa bir aciklama..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            {isAdmin && (
              <div className="space-y-4 rounded-md border p-4">
                <div className="space-y-2">
                  <Label>Ana Mentor (Opsiyonel)</Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ogretmen seciniz..." />
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

                <div className="space-y-2">
                  <Label>Yetkili Ogretmenler</Label>
                  <div className="max-h-52 space-y-1 overflow-y-auto rounded-md border p-2">
                    {teachers.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">Ogretmen bulunamadi</div>
                    ) : (
                      teachers.map((teacher) => (
                        <label
                          key={teacher.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted/60"
                        >
                          <Checkbox
                            checked={mergedTeacherIds.includes(teacher.id)}
                            onCheckedChange={(nextChecked) => toggleTeacher(teacher.id, nextChecked === true)}
                          />
                          <span className="text-sm">
                            {teacher.firstName} {teacher.lastName}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Secilen ogretmenler grubu yonetebilir ve panoda paylasim yapabilir.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Maksimum Ogrenci</Label>
              <Input
                id="maxStudents"
                type="number"
                min={1}
                placeholder="Orn: 25"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Olusturuluyor...
                  </>
                ) : (
                  'Grubu Olustur'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Iptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

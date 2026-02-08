"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Settings } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface MentorGroup {
  id: string;
  name: string;
  description: string | null;
  gradeIds: number[];
  maxStudents: number;
  isActive: boolean;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export default function EditGroupPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const groupId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gradeIds: [] as number[],
    maxStudents: "",
    teacherId: "",
    isActive: true,
  });

  const isAdmin = user?.role === "SCHOOL_ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      fetchGrades(userData.schoolId);
      if (userData.role === "SCHOOL_ADMIN" || userData.role === "SUPER_ADMIN") {
        fetchTeachers();
      }
    }

    if (groupId) {
      fetchGroup(groupId);
    }
  }, [groupId]);

  const fetchGroup = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/groups/${id}`, {
        headers: {
        },
      });

      if (!response.ok) {
        throw new Error("Grup bilgileri alınamadı");
      }

      const data: MentorGroup = await response.json();
      setFormData({
        name: data.name,
        description: data.description || "",
        gradeIds: Array.isArray(data.gradeIds) ? data.gradeIds : [],
        maxStudents: data.maxStudents ? String(data.maxStudents) : "",
        teacherId: data.teacher?.id || "",
        isActive: data.isActive ?? true,
      });
    } catch (error) {
      console.error("Error fetching group:", error);
      toast({
        title: "Hata",
        description: "Grup bilgileri yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch("http://localhost:3001/users?role=TEACHER", {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchGrades = async (schoolId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/schools/${schoolId}/grades`, {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGrades(data);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const toggleGrade = (gradeValue: number) => {
    setFormData((prev) => {
      const exists = prev.gradeIds.includes(gradeValue);
      return {
        ...prev,
        gradeIds: exists ? prev.gradeIds.filter((g) => g !== gradeValue) : [...prev.gradeIds, gradeValue],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const requestData: any = {
        name: formData.name,
        description: formData.description,
        gradeIds: formData.gradeIds,
        isActive: formData.isActive,
      };

      if (formData.maxStudents) {
        const maxValue = Number(formData.maxStudents);
        if (Number.isFinite(maxValue) && maxValue > 0) {
          requestData.maxStudents = maxValue;
        }
      }

      if (isAdmin && formData.teacherId) {
        requestData.teacherId = formData.teacherId;
      }

      const response = await fetch(`http://localhost:3001/groups/${groupId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Grup güncellenemedi";
        throw new Error(errorMessage);
      }

      toast({
        title: "Başarılı",
        description: "Grup güncellendi",
      });
      router.push(`/dashboard/groups/${groupId}`);
    } catch (error) {
      console.error("Error updating group:", error);
      const errorMessage = error instanceof Error ? error.message : "Grup güncellenirken bir hata oluştu";
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
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
    <div className="p-8">
      <div className="mb-6">
        <Link href={`/dashboard/groups/${groupId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Gruba Dön
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Mentor Grubunu Düzenle
          </CardTitle>
          <CardDescription>
            Grup bilgilerini ve ayarlarını güncelleyin
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

            <div className="space-y-2">
              <Label>Sınıf Seviyeleri</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {grades.map((grade) => {
                  const gradeValue = Number(grade.name);
                  if (!Number.isFinite(gradeValue)) {
                    return null;
                  }
                  const checked = formData.gradeIds.includes(gradeValue);
                  return (
                    <label key={grade.id} className="flex items-center gap-2 p-2 rounded-md border cursor-pointer">
                      <Checkbox checked={checked} onCheckedChange={() => toggleGrade(gradeValue)} />
                      <span>{grade.name}. Sınıf</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label>Grup Durumu</Label>
                <p className="text-sm text-muted-foreground">Aktif/pasif durumunu değiştirin</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  "Güncelle"
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

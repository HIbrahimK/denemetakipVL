'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Target, TrendingUp, Loader2, Eye, Settings } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/auth';

interface MentorGroup {
  id: string;
  name: string;
  description: string | null;
  gradeIds: number[];
  createdById: string;
  createdAt: string;
  _count?: {
    memberships: number;
    goals: number;
  };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<MentorGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    activeGroups: 0,
    totalMembers: 0,
    totalGoals: 0,
    averageSuccess: 0,
  });
  const [syncingAuto, setSyncingAuto] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/school');
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    fetchGroups();
  }, []);

  const canManageGroups = user?.role === 'TEACHER' || user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
  const canSyncAutoGroups = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleSyncAutoGroups = async () => {
    setSyncingAuto(true);
    try {
      const response = await fetch(`${API_BASE_URL}/groups/auto/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Otomatik gruplar oluşturulamadı');
      }

      toast({
        title: 'Başarılı',
        description: 'Sınıf ve şube grupları güncellendi',
      });
      fetchGroups();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Otomatik gruplar oluşturulamadı';
      toast({
        title: 'Hata',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSyncingAuto(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/groups`, {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();

        setGroups(data);

        // statistikleri hesapla
        const totalMembers = data.reduce((sum: number, g: MentorGroup) => 
          sum + (g._count?.memberships || 0), 0);
        const totalGoals = data.reduce((sum: number, g: MentorGroup) => 
          sum + (g._count?.goals || 0), 0);

        setStats({
          activeGroups: data.length,
          totalMembers,
          totalGoals,
          averageSuccess: data.length > 0 ? Math.round((totalGoals / data.length) * 10) : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mentor Grupları</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'STUDENT' || user?.role === 'PARENT'
              ? 'Katıldığınız grupları görüntüleyin'
              : 'Öğrencilerinizi gruplandırın ve birlikte çalışmalarını sağlayın'}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          {canSyncAutoGroups && (
            <Button variant="outline" className="w-full sm:w-auto" onClick={handleSyncAutoGroups} disabled={syncingAuto}>
              {syncingAuto ? 'Oluşturuluyor...' : 'Sınıf Gruplarını Oluştur'}
            </Button>
          )}
          {canManageGroups && (
            <Link href="/dashboard/groups/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Grup Olutur
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* statistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Grup</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGroups}</div>
            <p className="text-xs text-muted-foreground">Toplam grup sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Üye</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeGroups > 0 
                ? `Ortalama ${Math.round(stats.totalMembers / stats.activeGroups)} kişi/grup`
                : 'Henüz üye yok'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grup Hedefi</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGoals}</div>
            <p className="text-xs text-muted-foreground">Toplam hedef sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Başarı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{stats.averageSuccess}</div>
            <p className="text-xs text-green-600">Grup performans</p>
          </CardContent>
        </Card>
      </div>

      {/* Grup Listesi */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Henüz grup yok</h3>
            <p className="text-muted-foreground mt-2">
              {user?.role === 'STUDENT' || user?.role === 'PARENT'
                ? 'Henüz bir gruba katılmadınız.'
                : 'İlk mentor grubunu oluşturarak başlayın.'}
            </p>
            {canManageGroups && (
              <Link href="/dashboard/groups/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Grubu Oluştur
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="border-dashed">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Aktif
                  </Badge>
                </div>
                <CardDescription>{group._count?.memberships || 0} öğrenci</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/groups/${group.id}/board`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Pano
                    </Link>
                  </Button>
                  {canManageGroups && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/groups/${group.id}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Ayarlar
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Target, TrendingUp, Loader2, Eye, Settings } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

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
      const response = await fetch('\/groups/auto/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Otomatik gruplar oluturulamad');
      }

      toast({
        title: 'Baarl',
        description: 'Snf ve ube gruplar gncellendi',
      });
      fetchGroups();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Otomatik gruplar oluturulamad';
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
      const response = await fetch('\/groups', {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mentor Gruplar</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'STUDENT' || user?.role === 'PARENT'
              ? 'Katldnz gruplar grntleyin'
              : 'rencilerinizi gruplandrn ve birlikte almalarn salayn'}
          </p>
        </div>
        <div className="flex gap-2">
          {canSyncAutoGroups && (
            <Button variant="outline" onClick={handleSyncAutoGroups} disabled={syncingAuto}>
              {syncingAuto ? 'Oluturuluyor...' : 'Snf Gruplarn Olutur'}
            </Button>
          )}
          {canManageGroups && (
            <Link href="/dashboard/groups/new">
              <Button>
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
            <p className="text-xs text-muted-foreground">Toplam grup says</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam ye</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeGroups > 0 
                ? `Ortalama ${Math.round(stats.totalMembers / stats.activeGroups)} kii/grup`
                : 'Henz ye yok'}
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
            <p className="text-xs text-muted-foreground">Toplam hedef says</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Baar</CardTitle>
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
            <h3 className="mt-4 text-lg font-semibold">Henz grup yok</h3>
            <p className="text-muted-foreground mt-2">
              {user?.role === 'STUDENT' || user?.role === 'PARENT'
                ? 'Henz bir gruba katlmadnz.'
                : 'lk mentor grubunu oluturarak balayn.'}
            </p>
            {canManageGroups && (
              <Link href="/dashboard/groups/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  lk Grubu Olutur
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
                <CardDescription>{group._count?.memberships || 0} renci</CardDescription>
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

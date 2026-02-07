'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Target, TrendingUp, Award, MessageSquare, Loader2, Eye } from 'lucide-react';
import Link from 'next/link';

interface MentorGroup {
  id: string;
  name: string;
  description: string | null;
  gradeIds: string[];
  createdById: string;
  createdAt: string;
  _count?: {
    members: number;
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
  const router = useRouter();

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

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/groups', {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);

        // İstatistikleri hesapla
        const totalMembers = data.reduce((sum: number, g: MentorGroup) => 
          sum + (g._count?.members || 0), 0);
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
          <h1 className="text-3xl font-bold">Mentor Grupları</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'STUDENT' 
              ? 'Katıldığınız grupları görüntüleyin'
              : 'Öğrencilerinizi gruplandırın ve birlikte çalışmalarını sağlayın'}
          </p>
        </div>
        {user?.role !== 'STUDENT' && (
          <Link href="/dashboard/groups/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Grup Oluştur
            </Button>
          </Link>
        )}
      </div>

      {/* İstatistikler */}
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
            <p className="text-xs text-green-600">Grup performansı</p>
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
              {user?.role === 'STUDENT'
                ? 'Henüz bir gruba katılmadınız.'
                : 'İlk mentor grubunu oluşturarak başlayın.'}
            </p>
            {user?.role !== 'STUDENT' && (
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
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <Card 
              key={group.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/groups/${group.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {group._count?.members || 0} üye • {group._count?.goals || 0} hedef
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Aktif
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.description && (
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                )}

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {group._count?.members || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Üye</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {group._count?.goals || 0}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Hedef</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {group.gradeIds.length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Sınıf</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/groups/${group.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Detaylar
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/messages/compose?groupId=${group.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Mesajlar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

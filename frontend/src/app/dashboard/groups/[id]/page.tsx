'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  Settings,
  UserPlus,
  ArrowLeft,
  BookOpen,
  Trophy,
  Clock
} from 'lucide-react';

interface GroupMember {
  id: string;
  studentId: string;
  joinedAt: string;
  student: {
    id: string;
    studentNumber: number;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface GroupGoal {
  id: string;
  title: string;
  targetScore: number;
  deadline: string;
  isAchieved: boolean;
  createdAt: string;
}

interface GroupStats {
  totalMembers: number;
  activeGoals: number;
  completedGoals: number;
  averageProgress: number;
}

interface MentorGroup {
  id: string;
  name: string;
  description: string | null;
  gradeIds: number[];
  maxStudents: number;
  isActive: boolean;
  coverImage: string | null;
  createdAt: string;
  teacher: {
    firstName: string;
    lastName: string;
  };
  memberships: GroupMember[];
  goals: GroupGoal[];
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;

  const [group, setGroup] = useState<MentorGroup | null>(null);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch group details
        const groupResponse = await fetch(`http://localhost:3001/groups/${groupId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!groupResponse.ok) {
          throw new Error('Grup bilgileri yüklenemedi');
        }

        const groupData = await groupResponse.json();
        setGroup(groupData);

        // Fetch group stats
        const statsResponse = await fetch(`http://localhost:3001/groups/${groupId}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupData();
    }
  }, [groupId, router]);

  const getGradeLabel = (gradeIds: number[]) => {
    if (!gradeIds || gradeIds.length === 0) return 'Tüm Sınıflar';
    const gradeNames = gradeIds.map(g => `${g}. Sınıf`).join(', ');
    return gradeNames;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Hata</CardTitle>
            <CardDescription>{error || 'Grup bulunamadı'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard/groups')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Gruplara Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/groups')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            {group.isActive ? (
              <Badge variant="default">Aktif</Badge>
            ) : (
              <Badge variant="secondary">Pasif</Badge>
            )}
          </div>
          {group.description && (
            <p className="text-muted-foreground">{group.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Üye Ekle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Üye</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Maks: {group.maxStudents}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Hedefler</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGoals}</div>
              <p className="text-xs text-muted-foreground">
                Devam ediyor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedGoals}</div>
              <p className="text-xs text-muted-foreground">
                Başarılı hedef
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama İlerleme</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Grup performansı
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Üyeler ({group.memberships.length})
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="mr-2 h-4 w-4" />
            Hedefler ({group.goals.length})
          </TabsTrigger>
          <TabsTrigger value="info">
            <BookOpen className="mr-2 h-4 w-4" />
            Bilgiler
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grup Üyeleri</CardTitle>
              <CardDescription>
                Bu gruba kayıtlı öğrencilerin listesi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {group.memberships.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz üye eklenmemiş
                </div>
              ) : (
                <div className="space-y-3">
                  {group.memberships.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.student.user.firstName[0]}
                            {member.student.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.student.user.firstName} {member.student.user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            No: {member.student.studentNumber}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(member.joinedAt).toLocaleDateString('tr-TR')}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Detay
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grup Hedefleri</CardTitle>
              <CardDescription>
                Bu grup için belirlenen hedefler
              </CardDescription>
            </CardHeader>
            <CardContent>
              {group.goals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz hedef eklenmemiş
                </div>
              ) : (
                <div className="space-y-3">
                  {group.goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{goal.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Hedef Puan: {goal.targetScore}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {goal.isAchieved ? (
                          <Badge variant="default">
                            <Trophy className="mr-1 h-3 w-3" />
                            Başarıldı
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(goal.deadline).toLocaleDateString('tr-TR')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grup Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Mentor</div>
                  <div className="text-lg">
                    {group.teacher.firstName} {group.teacher.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Sınıf Seviyeleri</div>
                  <div className="text-lg">{getGradeLabel(group.gradeIds)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Maksimum Üye</div>
                  <div className="text-lg">{group.maxStudents} öğrenci</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</div>
                  <div className="text-lg">
                    {new Date(group.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

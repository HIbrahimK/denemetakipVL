'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, Star, Target, Clock, BookOpen, Flame, Award, Loader2 } from 'lucide-react';

interface StudentAchievement {
  id: string;
  studentId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    type: string;
    requirement: any;
    iconName: string;
    colorScheme: string;
  };
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/school');
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    
    if (userData.role === 'STUDENT') {
      fetchStudentAchievements(userData.id);
    } else {
      fetchAllAchievements();
    }
  }, []);

  const fetchStudentAchievements = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/achievements/student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching all achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactElement> = {
      trophy: <Trophy className="h-6 w-6" />,
      star: <Star className="h-6 w-6" />,
      target: <Target className="h-6 w-6" />,
      clock: <Clock className="h-6 w-6" />,
      book: <BookOpen className="h-6 w-6" />,
      flame: <Flame className="h-6 w-6" />,
      award: <Award className="h-6 w-6" />,
    };
    return icons[iconName] || <Trophy className="h-6 w-6" />;
  };

  const getColorClasses = (color: string, unlocked: boolean) => {
    if (!unlocked) {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-400',
        border: 'border-gray-200',
      };
    }

    const colors: Record<string, any> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
      green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    };
    return colors[color] || colors.blue;
  };

  const getTimeSince = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const totalAchievements = user?.role === 'STUDENT' ? 20 : allAchievements.length; // Varsayılan 20

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Başarılarım</h1>
        <p className="text-muted-foreground mt-1">
          Çalışma hedeflerinize ulaşarak rozetler kazanın
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Rozet</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalAchievements} rozetin {unlockedAchievements.length}'si kazanıldı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanma Oranı</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              %{totalAchievements > 0 
                ? Math.round((unlockedAchievements.length / totalAchievements) * 100)
                : 0}
            </div>
            <Progress 
              value={totalAchievements > 0 
                ? (unlockedAchievements.length / totalAchievements) * 100
                : 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Son Rozet</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {unlockedAchievements.length > 0 
                ? unlockedAchievements[0].achievement.name.substring(0, 15) + '...'
                : 'Henüz yok'}
            </div>
            <p className="text-xs text-muted-foreground">
              {unlockedAchievements.length > 0 
                ? getTimeSince(unlockedAchievements[0].unlockedAt)
                : 'İlk rozetini kazan!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sıradaki Hedef</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {totalAchievements - unlockedAchievements.length > 0 
                ? `${totalAchievements - unlockedAchievements.length} rozet`
                : 'Tümü kazanıldı!'}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalAchievements - unlockedAchievements.length > 0 
                ? 'Kilidi aç'
                : 'Harika iş!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kazanılan Rozetler */}
      <Card>
        <CardHeader>
          <CardTitle>Kazanılan Rozetler</CardTitle>
          <CardDescription>Başarıyla kilidi açtığınız rozetler</CardDescription>
        </CardHeader>
        <CardContent>
          {unlockedAchievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Henüz rozet kazanılmadı</h3>
              <p className="text-muted-foreground mt-2">
                Çalışmaya başlayarak ilk rozetinizi kazanın!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {unlockedAchievements.map((sa) => {
                const colors = getColorClasses(sa.achievement.colorScheme, true);
                return (
                  <Card key={sa.id} className={`${colors.border} border-2`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-full ${colors.bg} ${colors.text}`}>
                          {getIconComponent(sa.achievement.iconName)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{sa.achievement.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {sa.achievement.description}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {getTimeSince(sa.unlockedAt)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kilitli Rozetler */}
      {totalAchievements - unlockedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kilitli Rozetler</CardTitle>
            <CardDescription>Bu rozetleri kazanmak için çalışmaya devam edin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Örnek kilitli rozetler - gerçek veride olmayan rozetleri göstermek için */}
              <Card className="border-gray-200 border-2 opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-full bg-gray-100 text-gray-400">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-400">Gizli Rozet</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Bu rozeti kazanmak için çalışmaya devam edin
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

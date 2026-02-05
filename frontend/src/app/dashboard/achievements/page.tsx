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
  const [unlockedAchievements, setUnlockedAchievements] = useState<StudentAchievement[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<any[]>([]);
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
      // Fetch from auth/me to get complete user data with student relation
      fetchCompleteUserData();
    } else {
      // For non-students, redirect to admin panel
      router.push('/dashboard/admin/achievements');
    }
  }, []);

  const fetchCompleteUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.student?.id) {
          fetchStudentAchievements(userData.student.id);
        } else {
          console.error('No student data found in user');
          setLoading(false);
        }
      } else {
        console.error('Failed to fetch user data');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const fetchStudentAchievements = async (studentId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Get student's unlocked and available achievements
      const response = await fetch(`http://localhost:3001/achievements/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnlockedAchievements(data.unlocked || []);
        setAvailableAchievements(data.available || []);
        
        // Combine both for total count
        const unlockedAchIds = data.unlocked.map((sa: StudentAchievement) => sa.achievementId);
        const combined = [
          ...data.unlocked.map((sa: StudentAchievement) => ({ ...sa.achievement, unlocked: true, unlockedAt: sa.unlockedAt })),
          ...data.available.map((ach: any) => ({ ...ach, unlocked: false }))
        ];
        setAllAchievements(combined);
      } else {
        console.error('Failed to fetch achievements');
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
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

  const totalAchievements = unlockedAchievements.length + availableAchievements.length;

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
                ? unlockedAchievements[0].achievement.name.substring(0, 15) + (unlockedAchievements[0].achievement.name.length > 15 ? '...' : '')
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
              {availableAchievements.length > 0 
                ? `${availableAchievements.length} rozet`
                : 'Tümü kazanıldı!'}
            </div>
            <p className="text-xs text-muted-foreground">
              {availableAchievements.length > 0 
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

      {/* Kazanılabilir Rozetler */}
      {availableAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kazanılabilir Rozetler</CardTitle>
            <CardDescription>Bu rozetleri kazanmak için çalışmaya devam edin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableAchievements.map((achievement) => {
                const colors = getColorClasses(achievement.colorScheme, false);
                return (
                  <Card key={achievement.id} className={`${colors.border} border-2 opacity-70`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-full ${colors.bg} ${colors.text}`}>
                          {getIconComponent(achievement.iconName)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">{achievement.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          {achievement.examType && (
                            <Badge variant="outline" className="mt-2">
                              {achievement.examType}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TÜM ROZETLER */}
      <Card>
        <CardHeader>
          <CardTitle>Tüm Rozetler</CardTitle>
          <CardDescription>
            Sistemdeki tüm rozetler ({allAchievements.filter(a => a.unlocked).length} / {allAchievements.length} kazanıldı)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allAchievements.map((achievement) => {
              const colors = getColorClasses(achievement.colorScheme, achievement.unlocked);
              return (
                <Card 
                  key={achievement.id} 
                  className={`${colors.border} border-2 ${!achievement.unlocked ? 'opacity-70' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-full ${colors.bg} ${colors.text}`}>
                        {achievement.unlocked ? (
                          getIconComponent(achievement.iconName)
                        ) : (
                          <Lock className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {!achievement.unlocked && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <h3 className="font-semibold">{achievement.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {achievement.examType && (
                            <Badge variant="outline">
                              {achievement.examType}
                            </Badge>
                          )}
                          {achievement.unlocked && achievement.unlockedAt && (
                            <Badge variant="outline">
                              {getTimeSince(achievement.unlockedAt)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trophy, Lock, Star, Target, Clock, BookOpen, Flame, Award, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '@/lib/auth';

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
    points: number;
    category: string;
    examType?: string;
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
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
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
      const response = await fetch(`${API_BASE_URL}/achievements/student/${studentId}`, {
        headers: {
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

  const getIconComponent = (iconName: string, size: string = "h-6 w-6") => {
    const icons: Record<string, React.ReactElement> = {
      trophy: <Trophy className={size} />,
      star: <Star className={size} />,
      target: <Target className={size} />,
      clock: <Clock className={size} />,
      book: <BookOpen className={size} />,
      flame: <Flame className={size} />,
      award: <Award className={size} />,
    };
    return icons[iconName] || <Trophy className={size} />;
  };

  const getColorClasses = (color: string, unlocked: boolean) => {
    if (!unlocked) {
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-400',
        border: 'border-slate-200',
        card: 'from-slate-50 to-slate-100',
        iconBg: 'bg-slate-100',
        badge: 'text-slate-500 border-slate-200 bg-slate-100',
      };
    }

    const colors: Record<string, any> = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-300',
        card: 'from-blue-50 via-cyan-50 to-sky-100',
        iconBg: 'bg-gradient-to-br from-cyan-100 to-blue-100',
        badge: 'text-blue-700 border-blue-200 bg-blue-100/80',
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-300',
        card: 'from-orange-50 via-amber-50 to-yellow-100',
        iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
        badge: 'text-orange-700 border-orange-200 bg-orange-100/80',
      },
      green: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        border: 'border-emerald-300',
        card: 'from-emerald-50 via-lime-50 to-green-100',
        iconBg: 'bg-gradient-to-br from-lime-100 to-emerald-100',
        badge: 'text-emerald-700 border-emerald-200 bg-emerald-100/80',
      },
      purple: {
        bg: 'bg-fuchsia-100',
        text: 'text-fuchsia-700',
        border: 'border-fuchsia-300',
        card: 'from-violet-50 via-fuchsia-50 to-pink-100',
        iconBg: 'bg-gradient-to-br from-violet-100 to-fuchsia-100',
        badge: 'text-fuchsia-700 border-fuchsia-200 bg-fuchsia-100/80',
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        card: 'from-yellow-50 via-amber-50 to-orange-100',
        iconBg: 'bg-gradient-to-br from-yellow-100 to-amber-100',
        badge: 'text-yellow-700 border-yellow-200 bg-yellow-100/80',
      },
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
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Kazanılan Rozetler
          </CardTitle>
          <CardDescription>Başarıyla kilidi açtığınız muhteşem rozetler</CardDescription>
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {unlockedAchievements.map((sa) => {
                const colors = getColorClasses(sa.achievement.colorScheme, true);
                return (
                  <Card 
                    key={sa.id} 
                    className={`group relative overflow-hidden border ${colors.border} bg-gradient-to-br ${colors.card} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
                  >
                    <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.8),_transparent_55%)]" />
                    
                    <Sparkles className={`absolute top-2 right-2 h-4 w-4 ${colors.text} opacity-80`} />
                    
                    <CardContent className="relative p-4">
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 p-3 rounded-2xl ${colors.iconBg} ${colors.text} border ${colors.border} shadow-sm group-hover:scale-105 transition-transform`}>
                          {getIconComponent(sa.achievement.iconName, "h-7 w-7")}
                        </div>
                        
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <h3 className="font-bold text-base leading-tight line-clamp-2">{sa.achievement.name}</h3>
                          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                            {sa.achievement.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <Badge variant="secondary" className={`${colors.badge} font-semibold text-[11px]`}>
                              {sa.achievement.points} Puan
                            </Badge>
                            <Badge variant="outline" className="text-[11px] border-slate-300 bg-white/70">
                              {getTimeSince(sa.unlockedAt)}
                            </Badge>
                            {sa.achievement.examType && (
                              <Badge variant="outline" className="text-[11px] border-slate-300 bg-white/70">
                                {sa.achievement.examType}
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
          )}
        </CardContent>
      </Card>

      {/* Kazanılabilir Rozetler - Accordion */}
      {availableAchievements.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="available" className="border-none">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">Kazanılabilir Rozetler</h3>
                      <p className="text-sm text-muted-foreground">
                        {availableAchievements.length} rozet kilidi açılmayı bekliyor
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4">
                    {availableAchievements.map((achievement) => {
                      const colors = getColorClasses(achievement.colorScheme, false);
                      return (
                        <Card 
                          key={achievement.id} 
                          className={`${colors.border} border opacity-70 hover:opacity-90 transition-all duration-200 bg-gradient-to-br ${colors.card}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text} relative border ${colors.border}`}>
                                {getIconComponent(achievement.iconName, "h-5 w-5")}
                                <Lock className="absolute -top-1 -right-1 h-4 w-4 text-gray-500 bg-white rounded-full p-0.5" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm leading-tight line-clamp-2">{achievement.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {achievement.description}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  <Badge variant="secondary" className={`text-[11px] ${colors.badge}`}>
                                    {achievement.points} Puan
                                  </Badge>
                                  {achievement.examType && (
                                    <Badge variant="outline" className="text-[11px] border-slate-300 bg-white/80">
                                      {achievement.examType}
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

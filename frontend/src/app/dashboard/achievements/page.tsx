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
              {totalAchievements} rozetin {unlockedAchievements.length}'si kazanld
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanma Oran</CardTitle>
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
                : 'Henz yok'}
            </div>
            <p className="text-xs text-muted-foreground">
              {unlockedAchievements.length > 0 
                ? getTimeSince(unlockedAchievements[0].unlockedAt)
                : 'lk rozetini kazan!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sradaki Hedef</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {availableAchievements.length > 0 
                ? `${availableAchievements.length} rozet`
                : 'Tm kazanld!'}
            </div>
            <p className="text-xs text-muted-foreground">
              {availableAchievements.length > 0 
                ? 'Kilidi a'
                : 'Harika i!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kazanlan Rozetler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Kazanlan Rozetler
          </CardTitle>
          <CardDescription>Baaryla kilidi atnz muhteem rozetler</CardDescription>
        </CardHeader>
        <CardContent>
          {unlockedAchievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Henz rozet kazanlmad</h3>
              <p className="text-muted-foreground mt-2">
                almaya balayarak ilk rozetinizi kazann!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {unlockedAchievements.map((sa) => {
                const colors = getColorClasses(sa.achievement.colorScheme, true);
                return (
                  <Card 
                    key={sa.id} 
                    className={`relative overflow-hidden ${colors.border} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 ${colors.bg} opacity-20`} />
                    
                    {/* Sparkle effect on top right */}
                    <Sparkles className={`absolute top-2 right-2 h-5 w-5 ${colors.text} animate-pulse`} />
                    
                    <CardContent className="relative p-6">
                      <div className="flex flex-col items-center text-center gap-4">
                        {/* Large Icon with glow */}
                        <div className={`p-6 rounded-full ${colors.bg} ${colors.text} shadow-lg border-4 ${colors.border}`}>
                          {getIconComponent(sa.achievement.iconName, "h-10 w-10")}
                        </div>
                        
                        <div className="space-y-2 w-full">
                          <h3 className="font-bold text-lg">{sa.achievement.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {sa.achievement.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 justify-center pt-2">
                            <Badge variant="secondary" className={`${colors.text} font-semibold`}>
                              {sa.achievement.points} Puan
                            </Badge>
                            <Badge variant="outline">
                              {getTimeSince(sa.unlockedAt)}
                            </Badge>
                            {sa.achievement.examType && (
                              <Badge variant="outline">
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

      {/* Kazanlabilir Rozetler - Accordion */}
      {availableAchievements.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="available" className="border-none">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">Kazanlabilir Rozetler</h3>
                      <p className="text-sm text-muted-foreground">
                        {availableAchievements.length} rozet kilidi almay bekliyor
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
                    {availableAchievements.map((achievement) => {
                      const colors = getColorClasses(achievement.colorScheme, false);
                      return (
                        <Card 
                          key={achievement.id} 
                          className={`${colors.border} border-2 opacity-60 hover:opacity-80 transition-opacity`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-3 rounded-full ${colors.bg} ${colors.text} relative`}>
                                {getIconComponent(achievement.iconName)}
                                <Lock className="absolute -top-1 -right-1 h-4 w-4 text-gray-500 bg-white rounded-full p-0.5" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm">{achievement.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {achievement.description}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {achievement.points} Puan
                                  </Badge>
                                  {achievement.examType && (
                                    <Badge variant="outline" className="text-xs">
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

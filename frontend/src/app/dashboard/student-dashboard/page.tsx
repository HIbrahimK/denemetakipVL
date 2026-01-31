'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Calendar,
  Flame,
  Loader2,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface Goal {
  id: string;
  userId: string;
  type: string;
  targetData: any;
  currentValue: number;
  targetValue: number;
  deadline: string;
  status: string;
  description: string | null;
}

export default function StudentDashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [studyStreak, setStudyStreak] = useState(0);
  const [todayStudyTime, setTodayStudyTime] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/school');
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    fetchGoals(userData.id);
    fetchStudyStats(userData.id);
  }, []);

  const fetchGoals = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/goals/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyStats = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Bugünkü çalışma süresi
      const today = new Date().toISOString().split('T')[0];
      const sessionsResponse = await fetch(
        `http://localhost:4000/study/sessions/student/${userId}?startDate=${today}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json();
        const totalSeconds = sessions.reduce((sum: number, s: any) => sum + s.duration, 0);
        setTodayStudyTime(Math.round(totalSeconds / 3600)); // saat cinsinden
        
        // Haftalık ilerleme (basit hesaplama)
        setWeeklyProgress(Math.min((totalSeconds / 14400) * 100, 100)); // 4 saatlik hedef
      }

      // Seri günleri hesapla (basitleştirilmiş)
      setStudyStreak(7); // TODO: Gerçek seri hesaplaması yapılacak
    } catch (error) {
      console.error('Error fetching study stats:', error);
    }
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      IN_PROGRESS: { label: 'Devam Ediyor', className: 'bg-blue-100 text-blue-800' },
      COMPLETED: { label: 'Tamamlandı', className: 'bg-green-100 text-green-800' },
      FAILED: { label: 'Başarısız', className: 'bg-red-100 text-red-800' },
    };
    return statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const getGoalTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      STUDY_TIME: 'Çalışma Süresi',
      EXAM_SCORE: 'Sınav Puanı',
      TOPIC_MASTERY: 'Konu Hakimiyeti',
      WEEKLY_GOAL: 'Haftalık Hedef',
    };
    return types[type] || type;
  };

  const formatDeadline = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Süresi doldu';
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Yarın';
    if (diffDays < 7) return `${diffDays} gün kaldı`;
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Çalışma Kontrol Paneli</h1>
          <p className="text-muted-foreground mt-1">
            Merhaba, {user?.firstName}! Bugün ne çalışmak istersin?
          </p>
        </div>
        <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <Flame className="h-5 w-5 text-orange-500" />
          <div>
            <div className="text-sm font-medium">{studyStreak} Günlük Seri</div>
            <div className="text-xs text-muted-foreground">Harika gidiyorsun!</div>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Çalışma</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStudyTime} saat</div>
            <p className="text-xs text-muted-foreground">Hedef: 4 saat</p>
            <Progress value={weeklyProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Hedefler</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goals.filter(g => g.status === 'IN_PROGRESS').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {goals.filter(g => g.status === 'COMPLETED').length} tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(todayStudyTime * 5)} saat</div>
            <p className="text-xs text-muted-foreground">Toplam çalışma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              %{goals.length > 0 
                ? Math.round((goals.filter(g => g.status === 'COMPLETED').length / goals.length) * 100)
                : 0}
            </div>
            <p className="text-xs text-green-600">Tamamlanan hedefler</p>
          </CardContent>
        </Card>
      </div>

      {/* Hedefler */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Hedeflerim</CardTitle>
              <CardDescription>Aktif hedeflerinizi takip edin</CardDescription>
            </div>
            <Link href="/dashboard/student-dashboard/new-goal">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Hedef
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Henüz hedef yok</h3>
              <p className="text-muted-foreground mt-2">
                İlk hedefinizi oluşturarak başlayın.
              </p>
              <Link href="/dashboard/student-dashboard/new-goal">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Hedefi Oluştur
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal);
                const badge = getStatusBadge(goal.status);
                
                return (
                  <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{getGoalTypeLabel(goal.type)}</h3>
                          <Badge className={badge.className}>{badge.label}</Badge>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDeadline(goal.deadline)}
                          </div>
                          <div>
                            {goal.currentValue} / {goal.targetValue} {goal.type === 'STUDY_TIME' ? 'saat' : 'puan'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">İlerleme</span>
                        <span className="font-medium">%{Math.round(progress)}</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hızlı Aksiyonlar */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/study-plans">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Çalışma Planlarım</CardTitle>
              <CardDescription>Planlarınızı görüntüleyin</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/groups">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <Trophy className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Grup Çalışmaları</CardTitle>
              <CardDescription>Gruplara katılın</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/achievements">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <Target className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Başarılarım</CardTitle>
              <CardDescription>Kazandığınız rozetler</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, ChevronRight, Loader2, CheckCircle2, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface StudyPlan {
  id: string;
  name: string;
  description: string | null;
  examType: string;
  gradeLevels: number[];
  targetType: 'INDIVIDUAL' | 'GROUP';
  weekStartDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'ASSIGNED';
  isTemplate: boolean;
  createdAt: string;
  teacher?: {
    firstName: string;
    lastName: string;
  };
  _count?: {
    tasks: number;
  };
  tasks?: StudyTask[];
}

interface StudyTask {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'VERIFIED';
  subjectName: string | null;
  topicName: string | null;
  dayIndex: number;
  rowIndex: number;
}

export default function MyTasksPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/school');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);
    
    // Allow both students and teachers to access this page
    // Teachers can view their assigned plans too
    
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/study/plans`, {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Öğrenci için: atanan planları göster (isTemplate true olsa bile)
        // Backend zaten sadece öğrenciye atanan planları döndürüyor
        const assignedPlans = data.filter((p: StudyPlan) => 
          p.status === 'ACTIVE' || p.status === 'ASSIGNED'
        );
        
        // Fetch tasks for each plan to calculate completion stats
        const plansWithStats = await Promise.all(
          assignedPlans.map(async (plan: StudyPlan) => {
            const tasksResponse = await fetch(`${API_BASE_URL}/study/tasks?planId=${plan.id}`, {
              headers: {
              },
            });
            
            if (tasksResponse.ok) {
              const tasks = await tasksResponse.json();
              return { ...plan, tasks };
            }
            return plan;
          })
        );
        
        setPlans(plansWithStats);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExamTypeBadge = (examType: string) => {
    const colors: Record<string, string> = {
      TYT: 'bg-blue-100 text-blue-800',
      AYT: 'bg-purple-100 text-purple-800',
      LGS: 'bg-green-100 text-green-800',
    };
    return colors[examType] || 'bg-gray-100 text-gray-800';
  };

  const getCompletionStats = (plan: StudyPlan) => {
    if (!plan.tasks || plan.tasks.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    const completed = plan.tasks.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED').length;
    const total = plan.tasks.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM yyyy', { locale: tr });
  };

  const getDayName = (index: number) => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    return days[index];
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Çalışma Görevlerim</h1>
          <p className="text-muted-foreground mt-1">
            Size atanan Çalışma planlarını görüntüleyin ve görevlerinizi tamamlayın
          </p>
        </div>
      </div>

      {/* Plans List */}
      {plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Henüz size atanmış bir çalışma planı bulunmuyor.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const stats = getCompletionStats(plan);
            
            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge className={getExamTypeBadge(plan.examType)}>
                      {plan.examType}
                    </Badge>
                    <Badge variant={stats.percentage === 100 ? 'default' : 'secondary'}>
                      %{stats.percentage}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{plan.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {plan.description || 'Açıklama yok'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Teacher Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>
                      Öğretmen: {plan.teacher?.firstName} {plan.teacher?.lastName}
                    </span>
                  </div>
                  
                  {/* Week Start Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Hafta Başlangıcı: {formatDate(plan.weekStartDate)}</span>
                  </div>
                  
                  {/* Completion Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tamamlanan Görevler</span>
                      <span className="font-medium">
                        {stats.completed} / {stats.total}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Link href={`/dashboard/my-tasks/${plan.id}`} className="block">
                    <Button className="w-full" variant={stats.percentage === 100 ? 'outline' : 'default'}>
                      {stats.percentage === 100 ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Planı Görüntüle
                        </>
                      ) : (
                        <>
                          <Clock className="mr-2 h-4 w-4" />
                          Görevleri Gör
                        </>
                      )}
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

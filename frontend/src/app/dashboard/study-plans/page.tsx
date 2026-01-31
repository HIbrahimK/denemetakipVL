'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, Target, TrendingUp, Loader2, BookOpen, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface StudyPlan {
  id: string;
  studentId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  student?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  _count?: {
    tasks: number;
  };
}

export default function StudyPlansPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activePlans: 0,
    assignedStudents: 0,
    completedTasks: 0,
    averageSuccess: 0,
  });
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/school');
      return;
    }
    setUser(JSON.parse(userStr));
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const currentUser = JSON.parse(userStr || '{}');

      let endpoint = 'http://localhost:4000/study/plans';
      
      // Eğer öğrenci ise sadece kendi planlarını göster
      if (currentUser.role === 'STUDENT') {
        endpoint = `http://localhost:4000/study/plans/student/${currentUser.id}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data);

        // İstatistikleri hesapla
        const active = data.filter((p: StudyPlan) => p.status === 'ACTIVE').length;
        const uniqueStudents = new Set(data.map((p: StudyPlan) => p.studentId)).size;
        const totalTasks = data.reduce((sum: number, p: StudyPlan) => sum + (p._count?.tasks || 0), 0);
        
        setStats({
          activePlans: active,
          assignedStudents: uniqueStudents,
          completedTasks: totalTasks,
          averageSuccess: data.length > 0 ? Math.round((active / data.length) * 100) : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      ACTIVE: { label: 'Aktif', className: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Tamamlandı', className: 'bg-blue-100 text-blue-800' },
      PAUSED: { label: 'Duraklatıldı', className: 'bg-yellow-100 text-yellow-800' },
    };
    return statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Çalışma Planları</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'STUDENT' 
              ? 'Çalışma planlarınızı görüntüleyin ve takip edin'
              : 'Öğrencileriniz için kişiselleştirilmiş çalışma planları oluşturun'}
          </p>
        </div>
        {user?.role !== 'STUDENT' && (
          <Link href="/dashboard/study-plans/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Plan Oluştur
            </Button>
          </Link>
        )}
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Planlar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlans}</div>
            <p className="text-xs text-muted-foreground">Toplam {plans.length} plan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atanan Öğrenci</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedStudents}</div>
            <p className="text-xs text-muted-foreground">Benzersiz öğrenci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görev</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tüm planlarda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiflik Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{stats.averageSuccess}</div>
            <p className="text-xs text-green-600">Aktif planlar</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'STUDENT' ? 'Çalışma Planlarım' : 'Tüm Planlar'}
          </CardTitle>
          <CardDescription>
            {user?.role === 'STUDENT' 
              ? 'Size atanan çalışma planlarını görüntüleyin'
              : 'Oluşturduğunuz çalışma planlarını yönetin'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Henüz plan yok</h3>
              <p className="text-muted-foreground mt-2">
                {user?.role === 'STUDENT'
                  ? 'Size henüz bir çalışma planı atanmamış.'
                  : 'Yeni bir çalışma planı oluşturarak başlayın.'}
              </p>
              {user?.role !== 'STUDENT' && (
                <Link href="/dashboard/study-plans/new">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    İlk Planı Oluştur
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => {
                const badge = getStatusBadge(plan.status);
                return (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/study-plans/${plan.id}`)}
                  >
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                        {plan.student && (
                          <> • {plan.student.user.firstName} {plan.student.user.lastName}</>
                        )}
                      </p>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge className={badge.className}>{badge.label}</Badge>
                        {plan._count && (
                          <Badge variant="outline">
                            {plan._count.tasks} görev
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronLeft, 
  Calendar, 
  Users, 
  BookOpen, 
  Clock, 
  HelpCircle, 
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

// Types
interface StudyTask {
  id: string;
  rowIndex: number;
  dayIndex: number;
  subjectName?: string;
  topicName?: string;
  targetQuestionCount?: number;
  targetDuration?: number;
  targetResource?: string;
  completedQuestionCount: number;
  actualDuration: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';
  parentApproved: boolean;
  teacherApproved: boolean;
  student?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
    studentNumber: string;
  };
}

interface StudyPlan {
  id: string;
  name: string;
  description: string | null;
  examType: string;
  gradeLevels: number[];
  targetType: 'INDIVIDUAL' | 'GROUP';
  targetId: string | null;
  weekStartDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  planData: {
    rows: Array<{
      id: string;
      cells: Array<{
        subjectName?: string;
        topicName?: string;
        targetQuestionCount?: number;
        targetDuration?: number;
        targetResource?: string;
      } | null>;
    }>;
  };
  teacher?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  student?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  group?: {
    name: string;
  };
  tasks: StudyTask[];
  _count?: {
    tasks: number;
  };
}

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function StudyPlanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const planId = params.id as string;

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/school');
      return;
    }
    setUser(JSON.parse(userStr));
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/study/plans/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      } else {
        toast({
          title: 'Hata',
          description: 'Plan yüklenirken bir hata oluştu',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'Taslak', className: 'bg-gray-100 text-gray-800' },
      ACTIVE: { label: 'Aktif', className: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Tamamlandı', className: 'bg-blue-100 text-blue-800' },
      ARCHIVED: { label: 'Arşivlendi', className: 'bg-yellow-100 text-yellow-800' },
    };
    return config[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const getTaskStatusBadge = (task: StudyTask) => {
    if (task.teacherApproved) {
      return { label: 'Onaylandı', className: 'bg-green-100 text-green-800' };
    }
    if (task.parentApproved) {
      return { label: 'Veli Onayında', className: 'bg-blue-100 text-blue-800' };
    }
    if (task.status === 'COMPLETED') {
      return { label: 'Tamamlandı', className: 'bg-yellow-100 text-yellow-800' };
    }
    if (task.status === 'IN_PROGRESS') {
      return { label: 'Devam Ediyor', className: 'bg-purple-100 text-purple-800' };
    }
    return { label: 'Bekliyor', className: 'bg-gray-100 text-gray-800' };
  };

  const getCellProgress = (rowIndex: number, dayIndex: number) => {
    if (!plan) return { total: 0, completed: 0, percentage: 0 };
    
    const cellTasks = plan.tasks.filter(
      t => t.rowIndex === rowIndex && t.dayIndex === dayIndex
    );
    
    if (cellTasks.length === 0) return { total: 0, completed: 0, percentage: 0 };
    
    // Calculate weighted percentage based on question counts
    const totalTargetQuestions = cellTasks.reduce((sum, t) => 
      sum + (t.targetQuestionCount || 0), 0
    );
    const totalCompletedQuestions = cellTasks.reduce((sum, t) => 
      sum + (t.completedQuestionCount || 0), 0
    );
    
    const completed = cellTasks.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED').length;
    
    // Use question-based percentage if targets exist, otherwise use task count
    const percentage = totalTargetQuestions > 0
      ? Math.round((totalCompletedQuestions / totalTargetQuestions) * 100)
      : Math.round((completed / cellTasks.length) * 100);
    
    return {
      total: cellTasks.length,
      completed,
      percentage,
    };
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllPending = () => {
    if (!plan) return;
    const pending = plan.tasks
      .filter(t => t.status === 'COMPLETED' && !t.teacherApproved)
      .map(t => t.id);
    setSelectedTasks(pending);
  };

  const handleBulkApproval = async () => {
    if (selectedTasks.length === 0) return;
    
    setProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const promises = selectedTasks.map(taskId =>
        fetch(`http://localhost:3001/study/tasks/${taskId}/teacher-approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            approved: approvalAction === 'approve',
            comment: approvalComment,
          }),
        })
      );

      await Promise.all(promises);

      toast({
        title: 'Başarılı',
        description: `${selectedTasks.length} görev ${approvalAction === 'approve' ? 'onaylandı' : 'reddedildi'}`,
      });

      setSelectedTasks([]);
      setApprovalModalOpen(false);
      setApprovalComment('');
      fetchPlan();
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'İşlem sırasında bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Pending approval tasks
  const pendingTasks = plan?.tasks.filter(
    t => t.status === 'COMPLETED' && !t.teacherApproved
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Plan bulunamadı</h3>
            <Button className="mt-4" onClick={() => router.push('/dashboard/study-plans')}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusBadge = getStatusBadge(plan.status);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/dashboard/study-plans')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <h1 className="text-3xl font-bold mt-4">{plan.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
            <Badge variant="outline">{plan.examType}</Badge>
            {plan.gradeLevels.map(g => (
              <Badge key={g} variant="secondary">{g}. Sınıf</Badge>
            ))}
          </div>
        </div>
        {user?.role === 'TEACHER' && plan.status === 'DRAFT' && (
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Planı Aktifleştir
          </Button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hedef</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {plan.targetType === 'INDIVIDUAL' 
                ? plan.student?.user 
                  ? `${plan.student.user.firstName} ${plan.student.user.lastName}`
                  : 'Bireysel'
                : plan.group?.name || 'Grup'}
            </div>
            <p className="text-xs text-muted-foreground">
              {plan.targetType === 'INDIVIDUAL' ? 'Öğrenci' : 'Grup'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başlangıç</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {format(new Date(plan.weekStartDate), 'dd MMM yyyy', { locale: tr })}
            </div>
            <p className="text-xs text-muted-foreground">Hafta başlangıcı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Görevler</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{plan.tasks.length}</div>
            <p className="text-xs text-muted-foreground">Toplam görev</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onay Bekleyen</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Görev</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Tablo Görünümü</TabsTrigger>
          <TabsTrigger value="pending">
            Onay Bekleyen ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="all">Tüm Görevler</TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Haftalık Plan</CardTitle>
              <CardDescription>
                Öğrencilerin ilerleme durumu her hücrede gösterilmektedir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-3 text-left font-medium w-16">#</th>
                      {DAYS.map((day, index) => (
                        <th key={day} className="p-3 text-left font-medium min-w-[140px]">
                          <div>{day}</div>
                          <div className="text-xs text-muted-foreground font-normal">
                            {format(addDays(new Date(plan.weekStartDate), index), 'dd MMM', { locale: tr })}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {plan.planData?.rows?.map((row, rowIndex) => (
                      <tr key={row.id} className="border-t">
                        <td className="p-3 text-muted-foreground">{rowIndex + 1}</td>
                        {row.cells.map((cell, dayIndex) => {
                          const progress = getCellProgress(rowIndex, dayIndex);
                          const hasContent = cell || progress.total > 0;
                          
                          return (
                            <td key={dayIndex} className="p-2">
                              {hasContent ? (
                                <div className={`p-3 rounded-md text-sm ${
                                  progress.percentage === 100 
                                    ? 'bg-green-50 border border-green-200' 
                                    : progress.percentage > 0
                                    ? 'bg-yellow-50 border border-yellow-200'
                                    : 'bg-muted/50 border border-muted'
                                }`}>
                                  {cell && (
                                    <div className="space-y-1 mb-2">
                                      {cell.subjectName && (
                                        <div className="font-medium">{cell.subjectName}</div>
                                      )}
                                      {cell.topicName && (
                                        <div className="text-xs text-muted-foreground">{cell.topicName}</div>
                                      )}
                                    </div>
                                  )}
                                  {progress.total > 0 && (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>İlerleme</span>
                                        <span>{progress.percentage}%</span>
                                      </div>
                                      <Progress value={progress.percentage} className="h-1.5" />
                                      <div className="text-xs text-muted-foreground">
                                        {progress.completed}/{progress.total} tamamlandı
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-16 flex items-center justify-center text-muted-foreground text-sm">
                                  -
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approval */}
        <TabsContent value="pending">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Onay Bekleyen Görevler</CardTitle>
                <CardDescription>
                  Öğrenciler tarafından tamamlanan görevleri inceleyin
                </CardDescription>
              </div>
              {user?.role === 'TEACHER' && pendingTasks.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllPending}>
                    Tümünü Seç
                  </Button>
                  <Button 
                    size="sm" 
                    disabled={selectedTasks.length === 0}
                    onClick={() => { setApprovalAction('approve'); setApprovalModalOpen(true); }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Onayla ({selectedTasks.length})
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-semibold">Onay bekleyen görev yok</h3>
                  <p className="text-muted-foreground mt-2">
                    Tüm görevler onaylanmış veya henüz tamamlanmamış
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50"
                    >
                      {user?.role === 'TEACHER' && (
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={() => toggleTaskSelection(task.id)}
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {task.student?.user.firstName} {task.student?.user.lastName}
                            </span>
                            <Badge variant="outline">
                              {DAYS[task.dayIndex]} - Satır {task.rowIndex + 1}
                            </Badge>
                          </div>
                          <Badge className={getTaskStatusBadge(task).className}>
                            {getTaskStatusBadge(task).label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Ders:</span>
                            <span className="ml-1 font-medium">{task.subjectName || '-'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Konu:</span>
                            <span className="ml-1 font-medium">{task.topicName || '-'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Soru:</span>
                            <span className="ml-1 font-medium">
                              {task.completedQuestionCount}/{task.targetQuestionCount || '-'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Süre:</span>
                            <span className="ml-1 font-medium">
                              {task.actualDuration} dk
                            </span>
                          </div>
                        </div>

                        {(task.correctCount > 0 || task.wrongCount > 0 || task.blankCount > 0) && (
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">Doğru: {task.correctCount}</span>
                            <span className="text-red-600">Yanlış: {task.wrongCount}</span>
                            <span className="text-gray-600">Boş: {task.blankCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tasks */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Görevler</CardTitle>
              <CardDescription>Plan kapsamındaki tüm görevler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {plan.tasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {task.student?.user.firstName} {task.student?.user.lastName}
                          </span>
                          <Badge variant="outline">
                            {DAYS[task.dayIndex]} - Satır {task.rowIndex + 1}
                          </Badge>
                        </div>
                        <Badge className={getTaskStatusBadge(task).className}>
                          {getTaskStatusBadge(task).label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Ders:</span>
                          <span className="ml-1">{task.subjectName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Konu:</span>
                          <span className="ml-1">{task.topicName || '-'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hedef Soru:</span>
                          <span className="ml-1">{task.targetQuestionCount || '-'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hedef Süre:</span>
                          <span className="ml-1">{task.targetDuration ? `${task.targetDuration} dk` : '-'}</span>
                        </div>
                      </div>

                      {task.status !== 'PENDING' && (
                        <div className="pt-2 border-t">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Çözülen:</span>
                              <span className="ml-1 font-medium">{task.completedQuestionCount}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Gerçek Süre:</span>
                              <span className="ml-1 font-medium">{task.actualDuration} dk</span>
                            </div>
                            <div className="flex gap-3">
                              <span className="text-green-600">D: {task.correctCount}</span>
                              <span className="text-red-600">Y: {task.wrongCount}</span>
                              <span className="text-gray-600">B: {task.blankCount}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bulk Approval Modal */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Görevleri Onayla' : 'Görevleri Reddet'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {selectedTasks.length} görev için işlem yapılacak
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Yorum (Opsiyonel)</label>
              <Textarea
                placeholder="Onay veya ret için yorum ekleyin..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalModalOpen(false)}>
              İptal
            </Button>
            <Button 
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleBulkApproval}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : approvalAction === 'approve' ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Onayla
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reddet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

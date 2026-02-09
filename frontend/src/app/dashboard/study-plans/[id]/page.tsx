'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChevronLeft,
  Calendar,
  Users,
  BookOpen,
  Clock,
  HelpCircle,
  FileText,
  Loader2,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle
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
  isTemplate: boolean;
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
  assignedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignments?: {
    id: string;
    targetType: string;
    targetId: string;
    startDate: string;
    endDate: string;
    status: string;
    customPlanData: any;
    assignedBy: {
      firstName: string;
      lastName: string;
    };
  }[];
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
  const [assignmentSummary, setAssignmentSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

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
      });

      if (res.ok) {
        const data = await res.json();
        setPlan(data);

        // If template, fetch assignment summary
        if (data.isTemplate) {
          const summaryRes = await fetch(`http://localhost:3001/study/plans/${planId}/assignment-summary`, {
          });
          if (summaryRes.ok) {
            setAssignmentSummary(await summaryRes.json());
          }
        }
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
    if (task.status === 'COMPLETED') {
      return { label: 'Tamamlandı', className: 'bg-green-100 text-green-800' };
    }
    if (task.status === 'IN_PROGRESS') {
      return { label: 'Devam Ediyor', className: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Bekliyor', className: 'bg-gray-100 text-gray-800' };
  };

  // Get task targets from planData if not available in task itself
  const getTaskTargets = (task: StudyTask) => {
    if (!plan?.planData) return { targetQuestionCount: task.targetQuestionCount, targetDuration: task.targetDuration, targetResource: task.targetResource };
    
    const rows = plan.planData.rows || [];
    const row = rows[task.rowIndex];
    const cell = row?.cells?.[task.dayIndex];
    
    return {
      targetQuestionCount: task.targetQuestionCount || cell?.targetQuestionCount,
      targetDuration: task.targetDuration || cell?.targetDuration,
      targetResource: task.targetResource || cell?.targetResource,
    };
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

  const handleCancelAssignment = async (assignmentId: string) => {
    if (!confirm('Bu atamayı iptal etmek istediğinize emin misiniz?')) return;

    setProcessing(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/study/plans/assignments/${assignmentId}/cancel`, {
        method: 'POST',
      });
      if (response.ok) {
        toast({ title: 'Başarılı', description: 'Atama iptal edildi' });
        fetchPlan();
      } else {
        throw new Error('İptal işlemi başarısız');
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'Atama iptal edilemedi', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

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
        {user?.role === 'TEACHER' && plan.isTemplate && (
          <Button variant="outline" onClick={() => router.push(`/dashboard/study-plans/new?edit=${plan.id}`)}>  
            <FileText className="mr-2 h-4 w-4" />
            Şablonu Düzenle
          </Button>
        )}
        {user?.role === 'TEACHER' && !plan.isTemplate && (
          <Button variant="outline" onClick={() => router.push(`/dashboard/study-plans/new?edit=${plan.id}`)}>  
            <FileText className="mr-2 h-4 w-4" />
            Planı Düzenle
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
                : plan.targetType === 'GROUP'
                  ? plan.group?.name || 'Grup'
                  : plan.isTemplate
                    ? 'Şablon'
                    : plan.targetType}
            </div>
            <p className="text-xs text-muted-foreground">
              {plan.isTemplate
                ? (assignmentSummary ? assignmentSummary.summary : 'Atama Bilgisi Bekleniyor')
                : (plan.targetType === 'INDIVIDUAL' ? 'Öğrenci' : plan.targetType)}
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Tablo Görünümü</TabsTrigger>
          {plan.isTemplate && <TabsTrigger value="assignments">Aktif Atamalar ({plan.assignments?.filter(a => a.status !== 'CANCELLED').length || 0})</TabsTrigger>}
          <TabsTrigger value="all">Tüm Görevler</TabsTrigger>
        </TabsList>

        {/* Assignments Tab */}
        {plan.isTemplate && (
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Aktif Atamalar</CardTitle>
                <CardDescription>Bu şablonun kullanıldığı aktif atamalar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plan.assignments?.filter(a => a.status === 'ACTIVE').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Aktif atama bulunamadı.</div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-3 text-left">Hedef</th>
                            <th className="p-3 text-left">Tarih Aralığı</th>
                            <th className="p-3 text-left">Atayan</th>
                            <th className="p-3 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.assignments?.filter(a => a.status === 'ACTIVE').map(assignment => (
                            <tr key={assignment.id} className="border-t">
                              <td className="p-3 font-medium">
                                {assignment.targetType === 'STUDENT' ? 'Öğrenci' :
                                  assignment.targetType === 'GROUP' ? 'Grup' :
                                    assignment.targetType === 'CLASS' ? 'Sınıf' :
                                      assignment.targetType === 'GRADE' ? 'Tüm Sınıf Seviyesi' : assignment.targetType}
                                {/* ID lookup would be nicer but basic info is ok */}
                              </td>
                              <td className="p-3 text-muted-foreground">
                                {format(new Date(assignment.startDate), 'dd MMM')} - {format(new Date(assignment.endDate), 'dd MMM yyyy', { locale: tr })}
                              </td>
                              <td className="p-3 text-muted-foreground">
                                {assignment.assignedBy?.firstName} {assignment.assignedBy?.lastName}
                              </td>
                              <td className="p-3 text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleCancelAssignment(assignment.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                  <XCircle className="h-4 w-4 mr-1" /> İptal Et
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

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
                                <div className={`p-3 rounded-md text-sm ${progress.percentage === 100
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
                                      {/* Teacher's Targets */}
                                      {(cell.targetQuestionCount || cell.targetDuration || cell.targetResource) && (
                                        <div className="mt-2 pt-2 border-t space-y-1">
                                          {cell.targetQuestionCount && (
                                            <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                                              <HelpCircle className="h-3 w-3" />
                                              Hedef: {cell.targetQuestionCount} soru
                                            </div>
                                          )}
                                          {cell.targetDuration && (
                                            <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              Süre: {cell.targetDuration} dk
                                            </div>
                                          )}
                                          {cell.targetResource && (
                                            <div className="text-xs text-blue-700 font-medium truncate">
                                              📚 {cell.targetResource}
                                            </div>
                                          )}
                                        </div>
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
        {/* All Tasks */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Görevler</CardTitle>
              <CardDescription>Görevler ve atanan öğrenciler</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {(() => {
                  // Group tasks by day, row, subject, and topic
                  const groupedTasks = plan.tasks.reduce((acc, task) => {
                    const key = `${task.dayIndex}-${task.rowIndex}`;
                    if (!acc[key]) {
                      acc[key] = {
                        dayIndex: task.dayIndex,
                        rowIndex: task.rowIndex,
                        subjectName: task.subjectName || null,
                        topicName: task.topicName || null,
                        tasks: []
                      };
                    }
                    acc[key].tasks.push(task);
                    return acc;
                  }, {} as Record<string, {
                    dayIndex: number;
                    rowIndex: number;
                    subjectName: string | null;
                    topicName: string | null;
                    tasks: typeof plan.tasks;
                  }>);

                  return Object.entries(groupedTasks).map(([key, group]) => {
                    // Get targets from the first task or plan data
                    const firstTask = group.tasks[0];
                    const targets = getTaskTargets(firstTask);

                    return (
                      <AccordionItem key={key} value={key}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">
                                {DAYS[group.dayIndex]} - Satır {group.rowIndex + 1}
                              </Badge>
                              <div className="text-left">
                                <div className="font-medium">
                                  {group.subjectName || 'Ders Belirtilmemiş'} 
                                  {group.topicName && ` - ${group.topicName}`}
                                </div>
                                <div className="text-sm text-muted-foreground flex gap-4">
                                  <span>Hedef: {targets.targetQuestionCount || '-'} soru</span>
                                  <span>{targets.targetDuration || '-'} dakika</span>
                                  {targets.targetResource && <span>Kaynak: {targets.targetResource}</span>}
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="ml-2">
                              {group.tasks.length} öğrenci
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            {group.tasks.map(task => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">
                                    {task.student?.user.firstName} {task.student?.user.lastName}
                                  </span>
                                  <Badge className={getTaskStatusBadge(task).className}>
                                    {getTaskStatusBadge(task).label}
                                  </Badge>
                                </div>
                                
                                {/* Progress Info */}
                                {(task.completedQuestionCount > 0 || task.actualDuration > 0) ? (
                                  <div className="flex gap-6 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Çözülen:</span>
                                      <span className="ml-1 font-medium text-blue-600">
                                        {task.completedQuestionCount || 0}/{targets.targetQuestionCount || '-'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Süre:</span>
                                      <span className="ml-1 font-medium text-blue-600">
                                        {task.actualDuration || 0} dk
                                      </span>
                                    </div>
                                    {(task.correctCount > 0 || task.wrongCount > 0 || task.blankCount > 0) && (
                                      <>
                                        <span className="text-green-600 font-medium">
                                          D: {task.correctCount || 0}
                                        </span>
                                        <span className="text-red-600 font-medium">
                                          Y: {task.wrongCount || 0}
                                        </span>
                                        <span className="text-gray-600 font-medium">
                                          B: {task.blankCount || 0}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Henüz başlanmadı</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  });
                })()}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

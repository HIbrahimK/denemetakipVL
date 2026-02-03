'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { TaskCompletionModal } from './TaskCompletionModal';

interface StudyPlan {
  id: string;
  name: string;
  description: string | null;
  examType: string;
  weekStartDate: string;
  status: string;
  teacher?: {
    firstName: string;
    lastName: string;
  };
  planData?: {
    rows?: number;
    columns?: number;
  };
}

interface StudyTask {
  id: string;
  planId: string;
  studentId: string;
  rowIndex: number;
  dayIndex: number;
  subjectName: string | null;
  topicName: string | null;
  targetQuestionCount: number | null;
  targetDuration: number | null;
  targetResource: string | null;
  status: 'PENDING' | 'COMPLETED' | 'VERIFIED';
  completedQuestionCount: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  actualDuration: number;
  actualResource: string | null;
  studentNotes: string | null;
  completedAt: string | null;
}

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<StudyTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/school');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'STUDENT') {
      router.push('/dashboard');
      return;
    }
    
    fetchPlanAndTasks();
  }, [planId]);

  const fetchPlanAndTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch plan details
      const planResponse = await fetch(`http://localhost:3001/study/plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!planResponse.ok) {
        throw new Error('Failed to fetch plan');
      }

      const planData = await planResponse.json();
      setPlan(planData);

      // Fetch tasks for this plan
      const tasksResponse = await fetch(`http://localhost:3001/study/tasks?planId=${planId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (task: StudyTask | undefined, rowIndex: number, dayIndex: number) => {
    if (task && task.status === 'PENDING') {
      setSelectedTask(task);
      setIsModalOpen(true);
    } else if (task) {
      // For completed tasks, show details (could open a view-only modal)
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  const handleTaskComplete = async (taskId: string, data: {
    completedQuestionCount: number;
    correctCount: number;
    wrongCount: number;
    blankCount: number;
    actualDuration?: number;
    actualResource?: string;
    studentNotes?: string;
  }) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/study/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Refresh tasks
        await fetchPlanAndTasks();
        setIsModalOpen(false);
        setSelectedTask(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  };

  const getTaskAtPosition = (rowIndex: number, dayIndex: number): StudyTask | undefined => {
    return tasks.find(t => t.rowIndex === rowIndex && t.dayIndex === dayIndex);
  };

  const getCompletionStats = () => {
    if (tasks.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    const completed = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED').length;
    const total = tasks.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  const getExamTypeBadge = (examType: string) => {
    const colors: Record<string, string> = {
      TYT: 'bg-blue-100 text-blue-800',
      AYT: 'bg-purple-100 text-purple-800',
      LGS: 'bg-green-100 text-green-800',
    };
    return colors[examType] || 'bg-gray-100 text-gray-800';
  };

  const getTaskStatusColor = (task: StudyTask | undefined) => {
    if (!task) return 'bg-gray-50 border-gray-200';
    
    switch (task.status) {
      case 'COMPLETED':
        return 'bg-green-50 border-green-300 hover:bg-green-100';
      case 'VERIFIED':
        return 'bg-blue-50 border-blue-300 hover:bg-blue-100';
      case 'PENDING':
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer';
    }
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM yyyy', { locale: tr });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} dk`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} sa ${mins} dk` : `${hours} sa`;
  };

  // Determine the number of rows from tasks or default to 5
  const maxRowIndex = tasks.length > 0 ? Math.max(...tasks.map(t => t.rowIndex)) : -1;
  const rowCount = Math.max(maxRowIndex + 1, 5); // At least 5 rows to show all tasks

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
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground">Çalışma planı bulunamadı.</p>
            <Link href="/dashboard/my-tasks" className="mt-4">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getCompletionStats();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-tasks">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{plan.name}</h1>
            <Badge className={getExamTypeBadge(plan.examType)}>
              {plan.examType}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {plan.description || 'Açıklama yok'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tamamlanan</p>
                <p className="text-2xl font-bold">{stats.completed}/{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">İlerleme</p>
                <p className="text-2xl font-bold">%{stats.percentage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hafta Başlangıcı</p>
                <p className="text-lg font-bold">{formatDate(plan.weekStartDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Öğretmen</p>
                <p className="text-lg font-bold">
                  {plan.teacher?.firstName} {plan.teacher?.lastName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Haftalık Çalışma Planı
          </CardTitle>
          <CardDescription>
            Öğretmeninizin belirlediği hedefleri tabloda görebilirsiniz. Her hücreye tıklayarak görevinizi tamamlayabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-3 bg-muted/50 text-left font-medium text-sm w-16">
                    Sıra
                  </th>
                  {DAYS_SHORT.map((day, index) => (
                    <th 
                      key={index} 
                      className="border p-3 bg-muted/50 text-center font-medium text-sm min-w-[140px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rowCount }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border p-3 text-center font-medium text-muted-foreground bg-muted/30">
                      {rowIndex + 1}
                    </td>
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const task = getTaskAtPosition(rowIndex, dayIndex);
                      
                      return (
                        <td 
                          key={dayIndex} 
                          className={`border p-2 transition-colors ${getTaskStatusColor(task)}`}
                          onClick={() => handleCellClick(task, rowIndex, dayIndex)}
                        >
                          {task ? (
                            <div className="space-y-1">
                              {task.subjectName && (
                                <p className="font-medium text-sm truncate">
                                  {task.subjectName}
                                </p>
                              )}
                              {task.topicName && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {task.topicName}
                                </p>
                              )}
                              
                              {/* Teacher Targets - More Prominent */}
                              {(task.targetQuestionCount || task.targetDuration || task.targetResource) && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-1 mt-2">
                                  <p className="text-xs font-semibold text-blue-900 mb-1">Öğretmen Hedefi:</p>
                                  {task.targetQuestionCount && (
                                    <div className="flex items-center gap-1 text-xs text-blue-800">
                                      <Target className="h-3 w-3 flex-shrink-0" />
                                      <span className="font-medium">{task.targetQuestionCount} soru</span>
                                    </div>
                                  )}
                                  {task.targetDuration && (
                                    <div className="flex items-center gap-1 text-xs text-blue-800">
                                      <Clock className="h-3 w-3 flex-shrink-0" />
                                      <span className="font-medium">{formatDuration(task.targetDuration)}</span>
                                    </div>
                                  )}
                                  {task.targetResource && (
                                    <div className="flex items-center gap-1 text-xs text-blue-800">
                                      <BookOpen className="h-3 w-3 flex-shrink-0" />
                                      <span className="font-medium truncate">{task.targetResource}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {task.status === 'PENDING' && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                  Yapılmadı
                                </Badge>
                              )}
                              {task.status === 'COMPLETED' && task.targetQuestionCount && (
                                (() => {
                                  const completionPercentage = Math.round((task.completedQuestionCount / task.targetQuestionCount) * 100);
                                  if (completionPercentage === 100) {
                                    return (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        %100 Tamamlandı
                                      </Badge>
                                    );
                                  } else if (completionPercentage >= 80) {
                                    return (
                                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                        %{completionPercentage} Tamamlandı
                                      </Badge>
                                    );
                                  } else {
                                    return (
                                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                        %{completionPercentage} Tamamlandı
                                      </Badge>
                                    );
                                  }
                                })()
                              )}
                              {task.status === 'COMPLETED' && !task.targetQuestionCount && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Tamamlandı
                                </Badge>
                              )}
                              {task.status === 'VERIFIED' && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Onaylandı
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="h-16 flex items-center justify-center text-muted-foreground text-xs">
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
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 border rounded bg-white" />
              <span>Bekleyen (Tıklayarak tamamlayın)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 border rounded bg-green-50 border-green-300" />
              <span>Tamamlandı</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 border rounded bg-blue-50 border-blue-300" />
              <span>Onaylandı</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onComplete={handleTaskComplete}
      />
    </div>
  );
}

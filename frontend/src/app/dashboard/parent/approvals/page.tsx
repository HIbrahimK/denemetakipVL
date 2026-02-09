'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertCircle,
  BookOpen,
  Clock,
  HelpCircle,
  FileText,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Types
interface StudyTask {
  id: string;
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
  actualResource?: string;
  studentNotes?: string;
  status: string;
  parentApproved: boolean;
  teacherApproved: boolean;
  completedAt?: string;
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
    studentNumber: string;
  };
  plan: {
    name: string;
    examType: string;
  };
}

export default function ParentApprovalsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Approval modal state
  const [selectedTask, setSelectedTask] = useState<StudyTask | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Bulk selection
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/parent');
      return;
    }
    setUser(JSON.parse(userStr));
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const currentUser = JSON.parse(userStr || '{}');

      // Get parent's children tasks that need approval
      const res = await fetch(`${API_BASE_URL}/study/tasks/parent/${currentUser.parentId || currentUser.id}`, {
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        // Fallback: fetch all children tasks
        const childrenRes = await fetch(`${API_BASE_URL}/parents/children`, {
        });
        
        if (childrenRes.ok) {
          const children = await childrenRes.json();
          const allTasks: StudyTask[] = [];
          
          for (const child of children) {
            const tasksRes = await fetch(`${API_BASE_URL}/study/tasks/student/${child.id}`, {
            });
            if (tasksRes.ok) {
              const childTasks = await tasksRes.json();
              allTasks.push(...childTasks);
            }
          }
          
          setTasks(allTasks);
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const openApprovalModal = (task: StudyTask, action: 'approve' | 'reject') => {
    setSelectedTask(task);
    setApprovalAction(action);
    setComment('');
    setApprovalModalOpen(true);
  };

  const handleApproval = async () => {
    if (!selectedTask) return;
    
    setProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE_URL}/study/tasks/${selectedTask.id}/parent-approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approved: approvalAction === 'approve',
          comment,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Başarılı',
          description: `Görev ${approvalAction === 'approve' ? 'onaylandı' : 'reddedildi'}`,
        });
        setApprovalModalOpen(false);
        fetchTasks();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Bir hata oluştu');
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllPending = () => {
    const pending = pendingTasks.map(t => t.id);
    setSelectedTasks(pending);
  };

  const handleBulkApproval = async (action: 'approve' | 'reject') => {
    if (selectedTasks.length === 0) return;
    
    setProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const promises = selectedTasks.map(taskId =>
        fetch(`${API_BASE_URL}/study/tasks/${taskId}/parent-approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            approved: action === 'approve',
            comment: '',
          }),
        })
      );

      await Promise.all(promises);

      toast({
        title: 'Başarılı',
        description: `${selectedTasks.length} görev ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`,
      });

      setSelectedTasks([]);
      fetchTasks();
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

  // Filter tasks
  const pendingTasks = tasks.filter(t => t.status === 'COMPLETED' && !t.parentApproved);
  const approvedTasks = tasks.filter(t => t.parentApproved && !t.teacherApproved);
  const completedTasks = tasks.filter(t => t.teacherApproved);

  // Stats
  const stats = {
    total: tasks.length,
    pending: pendingTasks.length,
    approved: approvedTasks.length,
    completed: completedTasks.length,
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
      <div>
        <h1 className="text-3xl font-bold">Onaylarım</h1>
        <p className="text-muted-foreground mt-1">
          Çocuğunuzun tamamladığı görevleri inceleyin ve onaylayın
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görev</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onay Bekleyen</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Onay Bekleyen ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Onaylanan ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Tamamlanan ({stats.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Onay Bekleyen Görevler</CardTitle>
                <CardDescription>
                  Çocuğunuzun tamamladığı görevleri inceleyin
                </CardDescription>
              </div>
              {pendingTasks.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllPending}>
                    Tümünü Seç
                  </Button>
                  {selectedTasks.length > 0 && (
                    <>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleBulkApproval('approve')}
                        disabled={processing}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Onayla ({selectedTasks.length})
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleBulkApproval('reject')}
                        disabled={processing}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reddet
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <EmptyState message="Onay bekleyen görev bulunmuyor" />
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showCheckbox={true}
                      isSelected={selectedTasks.includes(task.id)}
                      onToggle={() => toggleTaskSelection(task.id)}
                      onApprove={() => openApprovalModal(task, 'approve')}
                      onReject={() => openApprovalModal(task, 'reject')}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Onaylanan Görevler</CardTitle>
              <CardDescription>
                Öğretmen onayı bekleyen görevler
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedTasks.length === 0 ? (
                <EmptyState message="Onaylanan görev bulunmuyor" />
              ) : (
                <div className="space-y-3">
                  {approvedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Tamamlanan Görevler</CardTitle>
              <CardDescription>
                Öğretmen tarafından onaylanan görevler
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedTasks.length === 0 ? (
                <EmptyState message="Tamamlanan görev bulunmuyor" />
              ) : (
                <div className="space-y-3">
                  {completedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Modal */}
      <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Görevi Onayla' : 'Görevi Reddet'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                <div><span className="text-muted-foreground">Öğrenci:</span> {selectedTask.student.user.firstName} {selectedTask.student.user.lastName}</div>
                <div><span className="text-muted-foreground">Ders:</span> {selectedTask.subjectName || '-'}</div>
                <div><span className="text-muted-foreground">Konu:</span> {selectedTask.topicName || '-'}</div>
                <div><span className="text-muted-foreground">Soru:</span> {selectedTask.completedQuestionCount} Çözülen</div>
                <div><span className="text-muted-foreground">Süre:</span> {selectedTask.actualDuration} dk</div>
                <div className="flex gap-3 pt-1">
                  <span className="text-green-600">D: {selectedTask.correctCount}</span>
                  <span className="text-red-600">Y: {selectedTask.wrongCount}</span>
                  <span className="text-gray-600">B: {selectedTask.blankCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Yorum (Opsiyonel)</Label>
                <Textarea
                  placeholder="Onay veya ret işin yorum ekleyin..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalModalOpen(false)}>
              İptal
            </Button>
            <Button 
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleApproval}
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

// Helper Components

function TaskCard({
  task,
  showCheckbox = false,
  isSelected = false,
  onToggle,
  onApprove,
  onReject,
  showActions = false,
}: {
  task: StudyTask;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onToggle?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50">
      {showCheckbox && (
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
      )}
      
      <div className="flex-1 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {task.student.user.firstName} {task.student.user.lastName}
            </span>
            <Badge variant="outline" className="text-xs">
              {task.plan.examType}
            </Badge>
          </div>
          {task.completedAt && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.completedAt), 'dd MMM yyyy', { locale: tr })}
            </div>
          )}
        </div>

        {/* Task Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> Ders
            </span>
            <span className="font-medium block">{task.subjectName || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Konu</span>
            <span className="font-medium block">{task.topicName || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <HelpCircle className="h-3 w-3" /> Soru
            </span>
            <span className="font-medium block">
              {task.completedQuestionCount} Çözülen
              {task.targetQuestionCount ? ` / ${task.targetQuestionCount} hedef` : ''}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Süre
            </span>
            <span className="font-medium block">{task.actualDuration} dk</span>
          </div>
        </div>

        {/* Results */}
        {(task.correctCount > 0 || task.wrongCount > 0 || task.blankCount > 0) && (
          <div className="flex gap-4 text-sm pt-2 border-t">
            <span className="text-green-600 font-medium">Doğru: {task.correctCount}</span>
            <span className="text-red-600 font-medium">Yanlış: {task.wrongCount}</span>
            <span className="text-gray-600 font-medium">Boş: {task.blankCount}</span>
            {task.correctCount + task.wrongCount + task.blankCount > 0 && (
              <span className="text-muted-foreground">
                Net: {((task.correctCount - (task.wrongCount * 0.25))).toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Notes */}
        {task.studentNotes && (
          <div className="text-sm bg-muted p-2 rounded">
            <span className="text-muted-foreground">Öğrenci Notu:</span> {task.studentNotes}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={onApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Onayla
            </Button>
            <Button size="sm" variant="destructive" onClick={onReject}>
              <XCircle className="mr-2 h-4 w-4" />
              Reddet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">{message}</h3>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium">{children}</label>;
}

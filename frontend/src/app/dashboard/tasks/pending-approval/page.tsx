'use client';

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Task {
  id: string;
  subjectName: string;
  topicName?: string;
  targetQuestionCount?: number;
  targetDuration?: number;
  targetResource?: string;
  completedQuestionCount: number;
  actualDuration: number;
  actualResource?: string;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  studentNotes?: string;
  completedAt: string;
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
    class: {
      name: string;
      grade: {
        name: string;
      };
    };
  };
  plan: {
    id: string;
    name: string;
  };
}

export default function PendingApprovalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingTasks();
  }, []);

  const fetchPendingTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/study/tasks/pending-approval`, {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedTask) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/study/tasks/${selectedTask.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: approveComment || undefined }),
      });

      if (response.ok) {
        setShowApproveModal(false);
        setApproveComment('');
        setSelectedTask(null);
        fetchPendingTasks();
      } else {
        toast({
          title: 'Hata',
          description: 'Onaylama başarısız oldu',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error approving task:', error);
      toast({
        title: 'Hata',
        description: 'Bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTask || !rejectComment.trim()) {
      toast({
        title: 'Uyarı',
        description: 'Lütfen reddetme sebebini yazın',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/study/tasks/${selectedTask.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: rejectComment }),
      });

      if (response.ok) {
        setShowRejectModal(false);
        setRejectComment('');
        setSelectedTask(null);
        fetchPendingTasks();
      } else {
        toast({
          title: 'Hata',
          description: 'Reddetme başarısız oldu',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast({
        title: 'Hata',
        description: 'Bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Geri Dön
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Onay Bekleyen Görevler</h1>
        <p className="text-gray-600 mt-2">
          Öğrenciler tarafından tamamlanmış ve onayınızı bekleyen görevler
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">Onay bekleyen görev bulunmuyor</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {task.student.user.firstName} {task.student.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {task.student.class.grade.name} - {task.student.class.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Plan: {task.plan.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Onay Bekliyor
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(task.completedAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Görev Bilgileri</h4>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Ders:</span> {task.subjectName}
                    </p>
                    {task.topicName && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Konu:</span> {task.topicName}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Hedefler</h4>
                    {task.targetQuestionCount && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Hedef Soru:</span> {task.targetQuestionCount}
                      </p>
                    )}
                    {task.targetDuration && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Hedef Süre:</span> {task.targetDuration} dk
                      </p>
                    )}
                    {task.targetResource && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Hedef Kaynak:</span> {task.targetResource}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Gerçekleşen</h4>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Çözülen Soru:</span> {task.completedQuestionCount}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Süre:</span> {task.actualDuration} dk
                    </p>
                    {task.actualResource && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Kaynak:</span> {task.actualResource}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Sonuçlar</h4>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">
                        ✓ {task.correctCount} Doğru
                      </span>
                      <span className="text-red-600">
                        ✗ {task.wrongCount} Yanlış
                      </span>
                      <span className="text-gray-600">
                        {task.blankCount} Boş
                      </span>
                    </div>
                  </div>
                </div>

                {task.studentNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <h4 className="font-semibold text-gray-700 mb-1 text-sm">Öğrenci Notları:</h4>
                    <p className="text-sm text-gray-600">{task.studentNotes}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowApproveModal(true);
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    ✓ Onayla
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowRejectModal(true);
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    ✗ Reddet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Görevi Onayla</h3>
            <p className="text-gray-600 mb-4">
              {selectedTask.student.user.firstName} {selectedTask.student.user.lastName} adlı öğrencinin
              görevini onaylamak istediğinize emin misiniz?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yorum (Opsiyonel)
              </label>
              <textarea
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Öğrenciye bir yorum ekleyebilirsiniz..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setApproveComment('');
                  setSelectedTask(null);
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'İşleniyor...' : 'Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Görevi Reddet</h3>
            <p className="text-gray-600 mb-4">
              {selectedTask.student.user.firstName} {selectedTask.student.user.lastName} adlı öğrencinin
              görevini reddetmek istediğinize emin misiniz?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reddetme Sebebi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                placeholder="Lütfen reddetme sebebini açıklayın..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectComment('');
                  setSelectedTask(null);
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectComment.trim()}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'İşleniyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

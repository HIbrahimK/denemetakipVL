'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Target, 
  AlertCircle,
  Calculator,
  FileText,
  X
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: StudyTask | null;
  onComplete: (taskId: string, data: {
    completedQuestionCount: number;
    correctCount: number;
    wrongCount: number;
    blankCount: number;
    actualDuration?: number;
    actualResource?: string;
    studentNotes?: string;
  }) => Promise<void>;
}

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export function TaskCompletionModal({ 
  isOpen, 
  onClose, 
  task, 
  onComplete 
}: TaskCompletionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [completedQuestionCount, setCompletedQuestionCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [blankCount, setBlankCount] = useState<number>(0);
  const [actualDuration, setActualDuration] = useState<number | ''>('');
  const [actualResource, setActualResource] = useState<string>('');
  const [studentNotes, setStudentNotes] = useState<string>('');

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      if (task.status === 'COMPLETED' || task.status === 'VERIFIED') {
        // Pre-fill with existing data for completed tasks
        setCompletedQuestionCount(task.completedQuestionCount || 0);
        setCorrectCount(task.correctCount || 0);
        setWrongCount(task.wrongCount || 0);
        setBlankCount(task.blankCount || 0);
        setActualDuration(task.actualDuration || '');
        setActualResource(task.actualResource || '');
        setStudentNotes(task.studentNotes || '');
      } else {
        // Reset for new completion
        setCompletedQuestionCount(task.targetQuestionCount || 0);
        setCorrectCount(0);
        setWrongCount(0);
        setBlankCount(0);
        setActualDuration(task.targetDuration || '');
        setActualResource(task.targetResource || '');
        setStudentNotes('');
      }
      setError(null);
    }
  }, [task]);

  // Auto-calculate blank count when correct + wrong changes
  useEffect(() => {
    const total = correctCount + wrongCount;
    if (total <= completedQuestionCount) {
      setBlankCount(completedQuestionCount - total);
    }
  }, [correctCount, wrongCount, completedQuestionCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task) return;
    
    // Validation
    if (completedQuestionCount < 0) {
      setError('Soru sayısı 0\'dan küçük olamaz');
      return;
    }
    
    const totalAnswers = correctCount + wrongCount + blankCount;
    if (totalAnswers !== completedQuestionCount) {
      setError(`Doğru + Yanlış + Boş = Toplam soru sayısına eşit olmalıdır. Şu an: ${totalAnswers}, olması gereken: ${completedQuestionCount}`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await onComplete(task.id, {
        completedQuestionCount,
        correctCount,
        wrongCount,
        blankCount,
        actualDuration: actualDuration || undefined,
        actualResource: actualResource || undefined,
        studentNotes: studentNotes || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Görev tamamlanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number | '') => {
    if (minutes === '' || minutes === 0) return '';
    if (minutes < 60) {
      return `${minutes} dk`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} sa ${mins} dk` : `${hours} sa`;
  };

  const isCompleted = task?.status === 'COMPLETED' || task?.status === 'VERIFIED';
  const netScore = correctCount - (wrongCount * 0.25);
  const successRate = completedQuestionCount > 0 
    ? Math.round((correctCount / completedQuestionCount) * 100) 
    : 0;

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isCompleted ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Görev Detayları
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 text-primary" />
                  Görevi Tamamla
                </>
              )}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {DAYS[task.dayIndex]} - Sıra {task.rowIndex + 1}
          </DialogDescription>
        </DialogHeader>

        {/* Task Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-700" />
            <span className="font-semibold text-blue-900">{task.subjectName || 'Ders belirtilmemiş'}</span>
          </div>
          {task.topicName && (
            <div className="text-sm text-blue-800 pl-7 font-medium">
              Konu: {task.topicName}
            </div>
          )}
          
          {/* Teacher-Defined Targets - Prominent Display */}
          {(task.targetQuestionCount || task.targetDuration || task.targetResource) && (
            <div className="bg-white rounded-lg p-3 border-2 border-blue-300 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-700" />
                <span className="font-bold text-blue-900 text-sm">Öğretmeninizin Belirlediği Hedefler:</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {task.targetQuestionCount && (
                  <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                    <Target className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-blue-600 font-medium">Soru Sayısı:</span>
                      <span className="text-base font-bold text-blue-900 ml-2">{task.targetQuestionCount} soru</span>
                    </div>
                  </div>
                )}
                {task.targetDuration && (
                  <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                    <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-blue-600 font-medium">Süre:</span>
                      <span className="text-base font-bold text-blue-900 ml-2">{formatDuration(task.targetDuration)}</span>
                    </div>
                  </div>
                )}
                {task.targetResource && (
                  <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                    <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <span className="text-sm text-blue-600 font-medium">Kaynak:</span>
                      <span className="text-base font-bold text-blue-900 ml-2">{task.targetResource}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Completion Warning */}
        {task.targetQuestionCount && completedQuestionCount > 0 && completedQuestionCount !== task.targetQuestionCount && (
          (() => {
            const completionPercentage = Math.round((completedQuestionCount / task.targetQuestionCount) * 100);
            if (completionPercentage < 80) {
              return (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Hedefiniz {task.targetQuestionCount} soru ama {completedQuestionCount} soru giriyorsunuz 
                    (<strong>%{completionPercentage}</strong> tamamlama). Hedefinize ulaşmayı deneyin!
                  </AlertDescription>
                </Alert>
              );
            } else if (completionPercentage < 100) {
              return (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Hedefiniz {task.targetQuestionCount} soru ama {completedQuestionCount} soru giriyorsunuz 
                    (<strong>%{completionPercentage}</strong> tamamlama).
                  </AlertDescription>
                </Alert>
              );
            } else if (completionPercentage > 100) {
              return (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Tebrikler! Hedefinizin üzerinde (<strong>%{completionPercentage}</strong>) çalışma yaptınız.
                  </AlertDescription>
                </Alert>
              );
            }
            return null;
          })()
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Count */}
          <div className="space-y-2">
            <Label htmlFor="completedQuestionCount">
              Çözülen Soru Sayısı
            </Label>
            <Input
              id="completedQuestionCount"
              type="number"
              min={0}
              value={completedQuestionCount}
              onChange={(e) => setCompletedQuestionCount(parseInt(e.target.value) || 0)}
              disabled={isCompleted || loading}
              placeholder="Kaç soru çözdünüz?"
            />
          </div>

          {/* Correct/Wrong/Blank Counts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="correctCount" className="text-green-600">
                Doğru
              </Label>
              <Input
                id="correctCount"
                type="number"
                min={0}
                value={correctCount}
                onChange={(e) => setCorrectCount(parseInt(e.target.value) || 0)}
                disabled={isCompleted || loading}
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wrongCount" className="text-red-600">
                Yanlış
              </Label>
              <Input
                id="wrongCount"
                type="number"
                min={0}
                value={wrongCount}
                onChange={(e) => setWrongCount(parseInt(e.target.value) || 0)}
                disabled={isCompleted || loading}
                className="border-red-200 focus:border-red-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blankCount" className="text-gray-600">
                Boş
              </Label>
              <Input
                id="blankCount"
                type="number"
                min={0}
                value={blankCount}
                onChange={(e) => setBlankCount(parseInt(e.target.value) || 0)}
                disabled={isCompleted || loading}
                className="border-gray-200 focus:border-gray-400"
              />
            </div>
          </div>

          {/* Stats Summary */}
          {completedQuestionCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-blue-800">
                <Calculator className="h-4 w-4" />
                <span className="font-medium">Sonuç Özeti</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-blue-700">
                  Net: <span className="font-bold">{netScore.toFixed(2)}</span>
                </div>
                <div className="text-blue-700">
                  Başarı: <span className="font-bold">%{successRate}</span>
                </div>
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="actualDuration">
              Çalışma Süresi (dakika)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="actualDuration"
                type="number"
                min={0}
                value={actualDuration}
                onChange={(e) => setActualDuration(parseInt(e.target.value) || '')}
                disabled={isCompleted || loading}
                placeholder="Örn: 60"
                className="flex-1"
              />
              {actualDuration && (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  = {formatDuration(actualDuration)}
                </span>
              )}
            </div>
          </div>

          {/* Resource */}
          <div className="space-y-2">
            <Label htmlFor="actualResource">
              Kullanılan Kaynak
            </Label>
            <Input
              id="actualResource"
              value={actualResource}
              onChange={(e) => setActualResource(e.target.value)}
              disabled={isCompleted || loading}
              placeholder="Hangi kaynağı kullandınız?"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="studentNotes">
              Notlar
            </Label>
            <Textarea
              id="studentNotes"
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              disabled={isCompleted || loading}
              placeholder="Çalışma hakkında notlarınız..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {isCompleted ? 'Kapat' : 'İptal'}
            </Button>
            {!isCompleted && (
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Görevi Tamamla
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

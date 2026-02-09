'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { studyTasksApi } from '@/lib/api/study';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CompleteTaskDialogProps {
  taskId: number;
  taskName: string;
  questionCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function CompleteTaskDialog({
  taskId,
  taskName,
  questionCount,
  open,
  onOpenChange,
  onComplete,
}: CompleteTaskDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    completedQuestions: questionCount,
    correctAnswers: 0,
    wrongAnswers: 0,
    blankAnswers: 0,
    timeSpent: 0,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await studyTasksApi.complete(taskId, formData);
      onComplete();
      onOpenChange(false);
      toast({
        title: "Başarılı",
        description: "Görev başarıyla tamamlandı",
      });
    } catch (error) {
      console.error('Task completion failed:', error);
      toast({
        title: "Hata",
        description: "Görev tamamlanırken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Görevi Tamamla
          </DialogTitle>
          <DialogDescription>{taskName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="correct">Doğru</Label>
              <Input
                id="correct"
                type="number"
                min={0}
                value={formData.correctAnswers}
                onChange={(e) =>
                  setFormData({ ...formData, correctAnswers: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="wrong">Yanlış</Label>
              <Input
                id="wrong"
                type="number"
                min={0}
                value={formData.wrongAnswers}
                onChange={(e) =>
                  setFormData({ ...formData, wrongAnswers: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="blank">Boş</Label>
              <Input
                id="blank"
                type="number"
                min={0}
                value={formData.blankAnswers}
                onChange={(e) =>
                  setFormData({ ...formData, blankAnswers: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="timeSpent">Süre (dakika)</Label>
            <Input
              id="timeSpent"
              type="number"
              min={0}
              value={formData.timeSpent}
              onChange={(e) =>
                setFormData({ ...formData, timeSpent: parseInt(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notlar (opsiyonel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Bu görev hakkında notlarınız..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Tamamla'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

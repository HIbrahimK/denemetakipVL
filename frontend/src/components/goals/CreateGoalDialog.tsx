'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Target } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { goalsApi } from '@/lib/api/study';
import { useToast } from '@/hooks/use-toast';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateGoalDialog({ open, onOpenChange, onCreated }: CreateGoalDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'STUDY_HOURS',
    targetValue: 0,
    targetUnit: '',
    targetDate: new Date(),
  });

  const goalTypes = [
    { value: 'STUDY_HOURS', label: 'Çalışma Saati', unit: 'saat' },
    { value: 'QUESTIONS_SOLVED', label: 'Soru Sayısı', unit: 'soru' },
    { value: 'EXAM_SCORE', label: 'Sınav Puanı', unit: 'net' },
    { value: 'STREAK_DAYS', label: 'Çalışma Serisi', unit: 'gün' },
    { value: 'CUSTOM', label: 'Özel Hedef', unit: '' },
  ];

  const selectedType = goalTypes.find((t) => t.value === formData.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await goalsApi.create({
        ...formData,
        targetUnit: selectedType?.unit || formData.targetUnit,
        targetDate: formData.targetDate.toISOString(),
      });
      onCreated();
      onOpenChange(false);
      toast({
        title: "Başarılı",
        description: "Hedef başarıyla oluşturuldu",
      });
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'STUDY_HOURS',
        targetValue: 0,
        targetUnit: '',
        targetDate: new Date(),
      });
    } catch (error) {
      console.error('Goal creation failed:', error);
      toast({
        title: "Hata",
        description: "Hedef oluşturulurken hata oluştu",
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
            <Target className="h-5 w-5 text-blue-600" />
            Yeni Hedef Oluştur
          </DialogTitle>
          <DialogDescription>Kendin için bir hedef belirle ve takip et</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Hedef Adı</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="örn. Haftalık 500 soru çöz"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Hedef Tipi</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goalTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="targetValue">Hedef Değer</Label>
              <Input
                id="targetValue"
                type="number"
                min={0}
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="targetUnit">Birim</Label>
              <Input
                id="targetUnit"
                value={selectedType?.unit || formData.targetUnit}
                onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                disabled={formData.type !== 'CUSTOM'}
                placeholder="saat, soru, vb."
              />
            </div>
          </div>

          <div>
            <Label>Hedef Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.targetDate, 'PPP', { locale: tr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.targetDate}
                  onSelect={(date) => date && setFormData({ ...formData, targetDate: date })}
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

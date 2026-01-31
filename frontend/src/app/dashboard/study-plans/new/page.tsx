'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function NewStudyPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState('INDIVIDUAL');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [tasks, setTasks] = useState<any[]>([]);

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        subjectName: '',
        topicId: null,
        questionCount: 0,
        date: new Date(),
      },
    ]);
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast({
        title: "Hata",
        description: "Başlangıç ve bitiş tarihi seçmelisiniz",
        variant: "destructive",
      });
      return;
    }

    if (tasks.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir görev eklemelisiniz",
        variant: "destructive",
      });
      return;
    }

    // Validate tasks
    for (const task of tasks) {
      if (!task.subjectName || task.questionCount <= 0) {
        toast({
          title: "Hata",
          description: "Tüm görevler için ders adı ve soru sayısı girilmelidir",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const payload = {
        name,
        description,
        targetType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        tasks: tasks.map(task => ({
          subjectName: task.subjectName,
          topicId: task.topicId,
          questionCount: task.questionCount,
          date: task.date ? task.date.toISOString() : new Date().toISOString(),
        })),
      };

      const res = await fetch('http://localhost:3001/study/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: "Başarılı",
          description: "Çalışma planı oluşturuldu",
        });
        router.push('/dashboard/study-plans');
      } else {
        const error = await res.json();
        toast({
          title: "Hata",
          description: error.message || "Plan oluşturulurken hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Plan creation failed:', error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Çalışma Planı Oluştur</CardTitle>
          <CardDescription>
            Öğrencileriniz için detaylı bir çalışma planı hazırlayın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Temel Bilgiler */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Plan Adı</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="örn. TYT Matematik Yoğun Çalışma"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Plan hakkında detaylı açıklama..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="targetType">Hedef Tipi</Label>
                <Select value={targetType} onValueChange={setTargetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Bireysel</SelectItem>
                    <SelectItem value="CLASS">Sınıf</SelectItem>
                    <SelectItem value="GROUP">Grup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Başlangıç Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP', { locale: tr }) : 'Tarih seçin'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        locale={tr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Bitiş Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP', { locale: tr }) : 'Tarih seçin'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        locale={tr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Görevler */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Çalışma Görevleri</Label>
                <Button type="button" variant="outline" size="sm" onClick={addTask}>
                  <Plus className="mr-2 h-4 w-4" />
                  Görev Ekle
                </Button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  Henüz görev eklenmedi. Yukarıdaki butonu kullanarak görev ekleyin.
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={task.id} className="flex gap-3 items-start p-4 border rounded-lg">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Ders</Label>
                            <Input
                              placeholder="Matematik"
                              value={task.subjectName}
                              onChange={(e) => {
                                const newTasks = [...tasks];
                                newTasks[index].subjectName = e.target.value;
                                setTasks(newTasks);
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Soru Sayısı</Label>
                            <Input
                              type="number"
                              placeholder="20"
                              value={task.questionCount}
                              onChange={(e) => {
                                const newTasks = [...tasks];
                                newTasks[index].questionCount = parseInt(e.target.value);
                                setTasks(newTasks);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Aksiyonlar */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Oluşturuluyor...' : 'Plan Oluştur'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

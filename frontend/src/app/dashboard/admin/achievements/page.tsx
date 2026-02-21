'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Trophy, Star, Target, Clock, BookOpen, Flame, Award, Crown, Medal, Plus, Edit, Trash2, Power, PowerOff, Users, Loader2, Check, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/auth';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  requirement: any;
  iconName: string;
  colorScheme: string;
  points: number;
  isActive: boolean;
  examType?: string;
  winnerCount?: number;
  studentAchievements?: Array<{
    id: string;
    unlockedAt: string;
    student: {
      id: string;
      user: {
        id: string;
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
  }>;
}

const ICONS = {
  trophy: Trophy,
  star: Star,
  target: Target,
  clock: Clock,
  book: BookOpen,
  flame: Flame,
  award: Award,
  crown: Crown,
  medal: Medal,
};

const COLORS = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  gold: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
};

const CATEGORIES = [
  { value: 'STREAK', label: 'Duzenlilik' },
  { value: 'MILESTONE', label: 'Basari' },
  { value: 'IMPROVEMENT', label: 'Gelisim' },
  { value: 'GROUP', label: 'Grup' },
  { value: 'CONSISTENCY', label: 'Kararlilik' },
];

const EXAM_TYPES = [
  { value: 'LGS', label: 'LGS' },
  { value: 'TYT', label: 'TYT' },
  { value: 'AYT', label: 'AYT' },
];

type AchievementBundle = 'TYT' | 'AYT' | 'LGS' | 'CONSISTENCY';

const BUNDLE_ACTIONS: Array<{
  value: AchievementBundle;
  loadLabel: string;
  deleteLabel: string;
}> = [
  { value: 'TYT', loadLabel: 'TYT Rozetlerini Yukle', deleteLabel: 'TYT Rozetlerini Sil' },
  { value: 'AYT', loadLabel: 'AYT Rozetlerini Yukle', deleteLabel: 'AYT Rozetlerini Sil' },
  { value: 'LGS', loadLabel: 'LGS Rozetlerini Yukle', deleteLabel: 'LGS Rozetlerini Sil' },
  { value: 'CONSISTENCY', loadLabel: 'Kararlilik Rozetlerini Yukle', deleteLabel: 'Kararlilik Rozetlerini Sil' },
];

export default function AchievementManagementPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bundleLoading, setBundleLoading] = useState<AchievementBundle | null>(null);
  const [bundleDeleting, setBundleDeleting] = useState<AchievementBundle | null>(null);
  const [bundleToDelete, setBundleToDelete] = useState<AchievementBundle | null>(null);
  const [examTypeFilter, setExamTypeFilter] = useState<'ALL' | 'TYT' | 'AYT' | 'LGS'>('ALL');
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<Achievement>>({
    name: '',
    description: '',
    category: 'MILESTONE',
    type: '',
    requirement: {},
    iconName: 'trophy',
    colorScheme: 'blue',
    points: 0,
    examType: undefined,
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/school');
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    
    if (userData.role !== 'SCHOOL_ADMIN' && userData.role !== 'TEACHER') {
      router.push('/dashboard');
      return;
    }

    fetchAchievements('ALL');
  }, []);

  const fetchStudents = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const userData = JSON.parse(userStr);
      const schoolId = userData.schoolId;
      
      const response = await fetch(`${API_BASE_URL}/students?schoolId=${schoolId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAchievements = async (
    filter: 'ALL' | 'TYT' | 'AYT' | 'LGS' = examTypeFilter,
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        includeInactive: 'true',
      });
      if (filter !== 'ALL') {
        params.set('examType', filter);
      }

      const response = await fetch(`${API_BASE_URL}/achievements?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Hata',
        description: 'Rozetler yuklenirken bir hata olustu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const viewAchievementDetail = async (achievement: Achievement) => {
    try {
      const response = await fetch(`${API_BASE_URL}/achievements/${achievement.id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedAchievement(data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching achievement details:', error);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/achievements/${id}/toggle`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast({ title: 'Basarili', description: 'Rozet durumu guncellendi' });
        fetchAchievements(examTypeFilter);
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'Islem basarisiz', variant: 'destructive' });
    }
  };

  const openDeleteModal = (id: string) => {
    setAchievementToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!achievementToDelete) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/achievements/${achievementToDelete}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({ title: 'Basarili', description: 'Rozet silindi' });
        setShowDeleteModal(false);
        setAchievementToDelete(null);
        fetchAchievements(examTypeFilter);
      } else {
        toast({ title: 'Hata', description: 'Silme islemi basarisiz', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'Silme islemi basarisiz', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const openGrantModal = async (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setSelectedStudentIds([]);
    setStudentSearch('');
    setShowGrantModal(true);
    if (students.length === 0) {
      await fetchStudents();
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const grantAchievement = async () => {
    if (selectedStudentIds.length === 0 || !selectedAchievement) {
      toast({ title: 'Uyari', description: 'Lutfen en az bir ogrenci secin', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);
      
      // Grant achievement to all selected students
      const promises = selectedStudentIds.map(studentId =>
        fetch(`${API_BASE_URL}/achievements/check-unlock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            studentId,
            achievementType: selectedAchievement.type,
          }),
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;

      if (successCount > 0) {
        toast({ 
          title: 'Basarili', 
          description: `Rozet ${successCount} ogrenciye verildi` 
        });
        setShowGrantModal(false);
        setSelectedStudentIds([]);
      } else {
        toast({ 
          title: 'Hata', 
          description: 'Rozet verilemedi', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'Islem basarisiz', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      category: 'MILESTONE',
      type: '',
      requirement: {},
      iconName: 'trophy',
      colorScheme: 'blue',
      points: 0,
    });
    setShowFormModal(true);
  };

  const openEditModal = (achievement: Achievement) => {
    setFormData(achievement);
    setShowFormModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.type) {
      toast({ title: 'Uyari', description: 'Lutfen tum zorunlu alanlari doldurun', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const url = formData.id
        ? `${API_BASE_URL}/achievements/${formData.id}`
        : `${API_BASE_URL}/achievements`;
      
      const response = await fetch(url, {
        method: formData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: 'Basarili', description: formData.id ? 'Rozet guncellendi' : 'Rozet olusturuldu' });
        setShowFormModal(false);
        fetchAchievements(examTypeFilter);
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'Islem basarisiz', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExamTypeFilterChange = (value: 'ALL' | 'TYT' | 'AYT' | 'LGS') => {
    setExamTypeFilter(value);
    fetchAchievements(value);
  };

  const seedBundle = async (bundle: AchievementBundle) => {
    try {
      setBundleLoading(bundle);
      const response = await fetch(`${API_BASE_URL}/achievements/seed-bundle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ bundle }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Rozet paketi yuklenemedi');
      }

      toast({
        title: 'Basarili',
        description: `${bundle} paketinde ${data.total || 0} rozet isleme alindi`,
      });

      fetchAchievements(examTypeFilter);
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error?.message || 'Rozet paketi yuklenemedi',
        variant: 'destructive',
      });
    } finally {
      setBundleLoading(null);
    }
  };

  const deleteBundle = async (bundle: AchievementBundle) => {
    try {
      setBundleDeleting(bundle);
      const response = await fetch(`${API_BASE_URL}/achievements/seed-bundle/${bundle}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || 'Rozet paketi silinemedi');
      }

      toast({
        title: 'Basarili',
        description: `${bundle} paketinden ${data.deleted || 0} rozet silindi`,
      });

      fetchAchievements(examTypeFilter);
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error?.message || 'Rozet paketi silinemedi',
        variant: 'destructive',
      });
    } finally {
      setBundleDeleting(null);
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = ICONS[iconName as keyof typeof ICONS] || Trophy;
    return <Icon className="h-6 w-6" />;
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.category || 'OTHER';
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rozet Yonetimi</h1>
          <p className="text-muted-foreground mt-1">
            Ogrencilerin kazanabilecegi rozetleri yonetin
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Rozet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hazir Rozet Paketleri ve Filtre</CardTitle>
          <CardDescription>
            Ihtiyaciniza gore TYT, AYT, LGS ve Kararlilik paketlerini yukleyip silebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full md:w-72 space-y-2">
            <Label>Sinav Turu Filtresi</Label>
            <Select
              value={examTypeFilter}
              onValueChange={(value) =>
                handleExamTypeFilterChange(value as 'ALL' | 'TYT' | 'AYT' | 'LGS')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtre secin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tum Sinav Turleri</SelectItem>
                {EXAM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rozet Paketlerini Yukle</Label>
            <div className="flex flex-wrap gap-2">
              {BUNDLE_ACTIONS.map((bundle) => (
                <Button
                  key={`load-${bundle.value}`}
                  variant="outline"
                  className="h-auto whitespace-normal text-left"
                  onClick={() => seedBundle(bundle.value)}
                  disabled={bundleLoading !== null}
                >
                  {bundleLoading === bundle.value && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {bundle.loadLabel}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rozet Paketlerini Sil</Label>
            <div className="flex flex-wrap gap-2">
              {BUNDLE_ACTIONS.map((bundle) => (
                <Button
                  key={`delete-${bundle.value}`}
                  variant="destructive"
                  className="h-auto whitespace-normal text-left"
                  onClick={() => setBundleToDelete(bundle.value)}
                  disabled={bundleDeleting !== null}
                >
                  {bundleDeleting === bundle.value && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {bundle.deleteLabel}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Not: Lise okullari genelde TYT/AYT paketlerini, ortaokullar LGS paketini yukler.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rozetler</CardTitle>
          <CardDescription>
            Toplam {achievements.length} rozet  {achievements.filter(a => a.isActive).length} aktif
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Secilen filtreye uygun rozet bulunamadi.
            </p>
          ) : (
          <Tabs defaultValue={Object.keys(groupedAchievements)[0] || 'MILESTONE'}>
            <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap">
              {CATEGORIES.map(cat => (
                groupedAchievements[cat.value] && (
                  <TabsTrigger key={cat.value} value={cat.value} className="shrink-0">
                    {cat.label} ({groupedAchievements[cat.value]?.length || 0})
                  </TabsTrigger>
                )
              ))}
            </TabsList>

            {CATEGORIES.map(cat => (
              groupedAchievements[cat.value] && (
                <TabsContent key={cat.value} value={cat.value} className="space-y-3">
                  {groupedAchievements[cat.value].map(achievement => {
                    const colors = COLORS[achievement.colorScheme as keyof typeof COLORS] || COLORS.blue;
                    return (
                      <div
                        key={achievement.id}
                        className={`flex flex-col gap-3 p-4 border rounded-lg sm:flex-row sm:items-center sm:justify-between ${!achievement.isActive ? 'opacity-50' : ''}`}
                      >
                        <div className="flex w-full min-w-0 items-center gap-3 sm:flex-1 sm:gap-4">
                          <div className={`p-3 rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {getIconComponent(achievement.iconName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold break-words">{achievement.name}</h3>
                              {achievement.examType && (
                                <Badge variant="outline">{achievement.examType}</Badge>
                              )}
                              {!achievement.isActive && (
                                <Badge variant="secondary">Pasif</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="outline" className="shrink-0">{achievement.points} puan</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 max-w-full px-2"
                                onClick={() => viewAchievementDetail(achievement)}
                              >
                                <Users className="h-3 w-3 mr-1" />
                                Kazananlar ({achievement.winnerCount || 0})
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-full sm:w-auto"
                            onClick={() => openGrantModal(achievement)}
                            title="Ogrenciye rozet ver"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Rozet Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={() => openEditModal(achievement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={() => toggleActive(achievement.id)}
                          >
                            {achievement.isActive ? (
                              <Power className="h-4 w-4 text-green-600" />
                            ) : (
                              <PowerOff className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={() => openDeleteModal(achievement.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              )
            ))}
          </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAchievement?.name}</DialogTitle>
            <DialogDescription>{selectedAchievement?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Bu Rozeti Kazananlar ({selectedAchievement?.studentAchievements?.length || 0})</h4>
              {selectedAchievement?.studentAchievements && selectedAchievement.studentAchievements.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedAchievement.studentAchievements.map(sa => (
                    <div key={sa.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{sa.student.user.firstName} {sa.student.user.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {sa.student.class.grade.name}. Sinif {sa.student.class.name}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(sa.unlockedAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Henuz kimse kazanmadi</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grant Achievement Modal */}
      <Dialog open={showGrantModal} onOpenChange={setShowGrantModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rozet Ver: {selectedAchievement?.name}</DialogTitle>
            <DialogDescription>
              Bu rozeti manuel olarak ogrencilere verebilirsiniz. Birden fazla ogrenci secebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ogrenci Ara ve Sec</Label>
              <Command className="border rounded-lg">
                <CommandInput 
                  placeholder="Ogrenci adi veya sinif ara..." 
                  value={studentSearch}
                  onValueChange={setStudentSearch}
                />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>Ogrenci bulunamadi.</CommandEmpty>
                  <CommandGroup>
                    {students
                      .filter(student => {
                        const searchLower = studentSearch.toLowerCase();
                        const fullName = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
                        const className = `${student.class.grade.name} ${student.class.name}`.toLowerCase();
                        return fullName.includes(searchLower) || className.includes(searchLower);
                      })
                      .map(student => (
                        <CommandItem
                          key={student.id}
                          value={student.id}
                          onSelect={() => toggleStudentSelection(student.id)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedStudentIds.includes(student.id)}
                            onCheckedChange={() => toggleStudentSelection(student.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium">
                              {student.user.firstName} {student.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {student.class.grade.name}. Sinif {student.class.name}
                            </p>
                          </div>
                        </CommandItem>
                      ))
                    }
                  </CommandGroup>
                </CommandList>
              </Command>
              {selectedStudentIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedStudentIds.map(id => {
                    const student = students.find(s => s.id === id);
                    if (!student) return null;
                    return (
                      <Badge key={id} variant="secondary" className="flex items-center gap-1">
                        {student.user.firstName} {student.user.lastName}
                        <button
                          onClick={() => toggleStudentSelection(id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrantModal(false)}>
              Iptal
            </Button>
            <Button 
              onClick={grantAchievement} 
              disabled={selectedStudentIds.length === 0 || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Veriliyor...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Rozet Ver ({selectedStudentIds.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rozeti Sil</DialogTitle>
            <DialogDescription>
              Bu rozeti silmek istediginize emin misiniz? Bu islem geri alinamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={submitting}
            >
              Iptal
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Sil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!bundleToDelete} onOpenChange={(open) => !open && setBundleToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rozet Paketini Sil</DialogTitle>
            <DialogDescription>
              {bundleToDelete === 'CONSISTENCY'
                ? 'Kararlilik/Gelisim paketindeki rozetleri silmek istediginize emin misiniz?'
                : `${bundleToDelete || ''} paketindeki rozetlerin tamami silinecek. Devam edilsin mi?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBundleToDelete(null)} disabled={bundleDeleting !== null}>
              Vazgec
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!bundleToDelete) return;
                const deletingBundle = bundleToDelete;
                setBundleToDelete(null);
                await deleteBundle(deletingBundle);
              }}
              disabled={bundleDeleting !== null}
            >
              {bundleDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                'Paketi Sil'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Rozet Duzenle' : 'Yeni Rozet'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rozet Adi *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Orn: Matematik Ustasi"
                />
              </div>
              <div className="space-y-2">
                <Label>Tip Kodu *</Label>
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Orn: FULL_MATH_LGS"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aciklama *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Rozet aciklamasi"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sinav Turu</Label>
                <Select value={formData.examType || 'none'} onValueChange={(value) => setFormData({ ...formData, examType: value === 'none' ? undefined : value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seciniz</SelectItem>
                    {EXAM_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ikon</Label>
                <Select value={formData.iconName} onValueChange={(value) => setFormData({ ...formData, iconName: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ICONS).map(icon => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Renk</Label>
                <Select value={formData.colorScheme} onValueChange={(value) => setFormData({ ...formData, colorScheme: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(COLORS).map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Puan</Label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormModal(false)}>Iptal</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              {formData.id ? 'Guncelle' : 'Olustur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



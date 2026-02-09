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
  { value: 'STREAK', label: 'Dzenlilik' },
  { value: 'MILESTONE', label: 'Baar' },
  { value: 'IMPROVEMENT', label: 'Geliim' },
  { value: 'GROUP', label: 'Grup' },
  { value: 'CONSISTENCY', label: 'Kararllk' },
];

const EXAM_TYPES = [
  { value: 'LGS', label: 'LGS' },
  { value: 'TYT', label: 'TYT' },
  { value: 'AYT', label: 'AYT' },
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

    fetchAchievements();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      
      const userData = JSON.parse(userStr);
      const schoolId = userData.schoolId;
      
      const response = await fetch(`${API_BASE_URL}/students?schoolId=${schoolId}`, {
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/achievements?includeInactive=true`, {
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: 'Hata',
        description: 'Rozetler yklenirken bir hata olutu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const viewAchievementDetail = async (achievement: Achievement) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/achievements/${achievement.id}`, {
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/achievements/${id}/toggle`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({ title: 'Baarl', description: 'Rozet durumu gncellendi' });
        fetchAchievements();
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'lem baarsz', variant: 'destructive' });
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/achievements/${achievementToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Baarl', description: 'Rozet silindi' });
        setShowDeleteModal(false);
        setAchievementToDelete(null);
        fetchAchievements();
      } else {
        toast({ title: 'Hata', description: 'Silme ilemi baarsz', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'Silme ilemi baarsz', variant: 'destructive' });
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
      toast({ title: 'Uyar', description: 'Ltfen en az bir renci sein', variant: 'destructive' });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Grant achievement to all selected students
      const promises = selectedStudentIds.map(studentId =>
        fetch(`${API_BASE_URL}/achievements/check-unlock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
          title: 'Baarl', 
          description: `Rozet ${successCount} renciye verildi` 
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
      toast({ title: 'Hata', description: 'lem baarsz', variant: 'destructive' });
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
      toast({ title: 'Uyar', description: 'Ltfen tm zorunlu alanlar doldurun', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = formData.id
        ? `${API_BASE_URL}/achievements/${formData.id}`
        : '\/achievements';
      
      const response = await fetch(url, {
        method: formData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: 'Baarl', description: formData.id ? 'Rozet gncellendi' : 'Rozet oluturuldu' });
        setShowFormModal(false);
        fetchAchievements();
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'lem baarsz', variant: 'destructive' });
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold">Rozet Ynetimi</h1>
          <p className="text-muted-foreground mt-1">
            rencilerin kazanabilecei rozetleri ynetin
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Rozet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rozetler</CardTitle>
          <CardDescription>
            Toplam {achievements.length} rozet  {achievements.filter(a => a.isActive).length} aktif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(groupedAchievements)[0] || 'MILESTONE'}>
            <TabsList>
              {CATEGORIES.map(cat => (
                groupedAchievements[cat.value] && (
                  <TabsTrigger key={cat.value} value={cat.value}>
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
                        className={`flex items-center justify-between p-4 border rounded-lg ${!achievement.isActive ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-3 rounded-lg ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {getIconComponent(achievement.iconName)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{achievement.name}</h3>
                              {achievement.examType && (
                                <Badge variant="outline">{achievement.examType}</Badge>
                              )}
                              {!achievement.isActive && (
                                <Badge variant="secondary">Pasif</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{achievement.points} puan</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => viewAchievementDetail(achievement)}
                              >
                                <Users className="h-3 w-3 mr-1" />
                                Kazananlar
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openGrantModal(achievement)}
                            title="renciye rozet ver"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Rozet Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(achievement)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
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
                          {sa.student.class.grade.name}. Snf {sa.student.class.name}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(sa.unlockedAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Henz kimse kazanmad</p>
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
              Bu rozeti manuel olarak rencilere verebilirsiniz. Birden fazla renci seebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>renci Ara ve Se</Label>
              <Command className="border rounded-lg">
                <CommandInput 
                  placeholder="renci ad veya snf ara..." 
                  value={studentSearch}
                  onValueChange={setStudentSearch}
                />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>renci bulunamad.</CommandEmpty>
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
                              {student.class.grade.name}. Snf {student.class.name}
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
              ptal
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
              Bu rozeti silmek istediinize emin misiniz? Bu ilem geri alnamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={submitting}
            >
              ptal
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

      {/* Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Rozet Dzenle' : 'Yeni Rozet'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rozet Ad *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="rn: Matematik Ustas"
                />
              </div>
              <div className="space-y-2">
                <Label>Tip Kodu *</Label>
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="rn: FULL_MATH_LGS"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aklama *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Rozet aklamas"
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
                <Label>Snav Tr</Label>
                <Select value={formData.examType || 'none'} onValueChange={(value) => setFormData({ ...formData, examType: value === 'none' ? undefined : value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Seiniz</SelectItem>
                    {EXAM_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>kon</Label>
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
            <Button variant="outline" onClick={() => setShowFormModal(false)}>ptal</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              {formData.id ? 'Gncelle' : 'Olutur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen, 
  Loader2,
  ChevronRight,
  Layers,
  Search
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Subject {
  id: string;
  name: string;
  examType: 'TYT' | 'AYT' | 'LGS';
  gradeLevels: number[];
  order: number;
  isActive: boolean;
  _count?: {
    topics: number;
  };
}

const EXAM_TYPES = [
  { value: 'TYT', label: 'TYT', grades: [9, 10, 11, 12] },
  { value: 'AYT', label: 'AYT', grades: [10, 11, 12] },
  { value: 'LGS', label: 'LGS', grades: [5, 6, 7, 8] },
];

export default function AdminSubjectsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState<string>('ALL');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    examType: 'TYT' as 'TYT' | 'AYT' | 'LGS',
    gradeLevels: [] as number[],
    order: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('\/subjects', {
      });

      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      } else {
        toast({
          title: 'Hata',
          description: 'Dersler yklenirken bir hata olutu',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      examType: 'TYT',
      gradeLevels: [9, 10, 11, 12],
      order: subjects.length,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      examType: subject.examType,
      gradeLevels: subject.gradeLevels,
      order: subject.order,
      isActive: subject.isActive,
    });
    setModalOpen(true);
  };

  const openDeleteModal = (subject: Subject) => {
    setSubjectToDelete(subject);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: 'Hata',
        description: 'Ders ad zorunludur',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const url = editingSubject 
        ? `${API_BASE_URL}/subjects/${editingSubject.id}`
        : '\/subjects';
      
      const method = editingSubject ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({
          title: 'Baarl',
          description: editingSubject ? 'Ders gncellendi' : 'Ders oluturuldu',
        });
        setModalOpen(false);
        fetchSubjects();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Bir hata olutu');
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;

    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE_URL}/subjects/${subjectToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast({
          title: 'Baarl',
          description: 'Ders silindi',
        });
        setDeleteModalOpen(false);
        fetchSubjects();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Bir hata olutu');
      }
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGrade = (grade: number) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: prev.gradeLevels.includes(grade)
        ? prev.gradeLevels.filter(g => g !== grade)
        : [...prev.gradeLevels, grade].sort()
    }));
  };

  const getAvailableGrades = () => {
    const exam = EXAM_TYPES.find(e => e.value === formData.examType);
    return exam?.grades || [];
  };

  // Filter subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExamType = examTypeFilter === 'ALL' || subject.examType === examTypeFilter;
    return matchesSearch && matchesExamType;
  });

  // Group by exam type
  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    if (!acc[subject.examType]) acc[subject.examType] = [];
    acc[subject.examType].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ders Ynetimi</h1>
          <p className="text-muted-foreground mt-1">
            TYT, AYT ve LGS derslerini ynetin
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ders
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ders ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Snav Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tm</SelectItem>
                <SelectItem value="TYT">TYT</SelectItem>
                <SelectItem value="AYT">AYT</SelectItem>
                <SelectItem value="LGS">LGS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects List */}
      <div className="space-y-6">
        {EXAM_TYPES.map(examType => {
          const examSubjects = groupedSubjects[examType.value] || [];
          if (examSubjects.length === 0 && examTypeFilter !== 'ALL' && examTypeFilter !== examType.value) {
            return null;
          }
          if (examSubjects.length === 0 && examTypeFilter === 'ALL') {
            return null;
          }

          return (
            <Card key={examType.value}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5" />
                    <CardTitle>{examType.label} Dersleri</CardTitle>
                  </div>
                  <Badge variant="outline">{examSubjects.length} ders</Badge>
                </div>
                <CardDescription>
                  {examType.grades.join(', ')}. snflar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {examSubjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Bu snav tipi iin ders bulunmuyor
                  </div>
                ) : (
                  <div className="space-y-2">
                    {examSubjects
                      .sort((a, b) => a.order - b.order)
                      .map(subject => (
                        <div
                          key={subject.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-muted-foreground text-sm w-8">
                              {subject.order + 1}
                            </div>
                            <div>
                              <h3 className="font-medium">{subject.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex gap-1">
                                  {subject.gradeLevels.map(grade => (
                                    <Badge key={grade} variant="secondary" className="text-xs">
                                      {grade}. Snf
                                    </Badge>
                                  ))}
                                </div>
                                {subject._count && (
                                  <Badge variant="outline" className="text-xs">
                                    <Layers className="h-3 w-3 mr-1" />
                                    {subject._count.topics} konu
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/admin/subjects/${subject.id}/topics`)}
                            >
                              Konular
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(subject)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteModal(subject)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredSubjects.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Ders bulunamad</h3>
              <p className="text-muted-foreground mt-2">
                Arama kriterlerinize uygun ders bulunmuyor
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'Ders Dzenle' : 'Yeni Ders'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ders Ad *</Label>
              <Input
                placeholder="rn: Matematik"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Snav Tipi *</Label>
              <Select 
                value={formData.examType} 
                onValueChange={(value: 'TYT' | 'AYT' | 'LGS') => {
                  const exam = EXAM_TYPES.find(e => e.value === value);
                  setFormData(prev => ({ 
                    ...prev, 
                    examType: value,
                    gradeLevels: exam?.grades || []
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Snf Seviyeleri *</Label>
              <div className="flex flex-wrap gap-3">
                {getAvailableGrades().map(grade => (
                  <div key={grade} className="flex items-center space-x-2">
                    <Checkbox
                      id={`grade-${grade}`}
                      checked={formData.gradeLevels.includes(grade)}
                      onCheckedChange={() => toggleGrade(grade)}
                    />
                    <Label htmlFor={`grade-${grade}`} className="cursor-pointer">
                      {grade}. Snf
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sralama</Label>
              <Input
                type="number"
                min={0}
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked as boolean }))}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Aktif
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              ptal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ders Sil</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              <strong>{subjectToDelete?.name}</strong> dersini silmek istediinize emin misiniz?
            </p>
            {subjectToDelete?._count?.topics && subjectToDelete._count.topics > 0 && (
              <p className="text-sm text-destructive mt-2">
                Bu dersin {subjectToDelete._count.topics} konusu var. Silmek konular da silecektir.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              ptal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

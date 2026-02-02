'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, Target, TrendingUp, Loader2, BookOpen, Eye, Filter, Copy, FileText, GraduationCap, Send, Trash2, Search, X, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format, startOfWeek, addWeeks } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface StudyPlan {
  id: string;
  name: string;
  description: string | null;
  examType: string;
  gradeLevels: number[];
  targetType: 'INDIVIDUAL' | 'GROUP';
  targetId: string | null;
  weekStartDate: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'ASSIGNED' | 'CANCELLED';
  isTemplate: boolean;
  isPublic?: boolean;
  createdAt: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    tasks: number;
    assignments?: number;
  };
  // Extended data from API
  student?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  group?: {
    name: string;
  };
}

interface Student {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  studentNumber: string;
  class?: {
    id: string;
    name: string;
    grade?: {
      id: string;
      level: number;
    };
  };
}

interface MentorGroup {
  id: string;
  name: string;
  _count?: {
    students: number;
  };
}

interface Grade {
  id: string;
  level: number;
  schoolId: string;
}

interface Class {
  id: string;
  name: string;
  gradeId: string;
  grade?: {
    level: number;
  };
  _count?: {
    students: number;
  };
}

export default function StudyPlansPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [templates, setTemplates] = useState<StudyPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<StudyPlan[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  // Filters
  const [examTypeFilter, setExamTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Template Filters (Monthly + Sort)
  const [templateMonth, setTemplateMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [templateYear, setTemplateYear] = useState<number>(new Date().getFullYear());
  const [templateCreatedBy, setTemplateCreatedBy] = useState<string>('all'); // 'mine' | 'all'
  const [templateSortBy, setTemplateSortBy] = useState<string>('newest'); // 'newest' | 'most-used' | 'name'
  
  // Active tab
  const [activeTab, setActiveTab] = useState('active'); // Changed default to 'active'
  
  // Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedPlanForAssignment, setSelectedPlanForAssignment] = useState<StudyPlan | null>(null);
  const [assignmentTargetType, setAssignmentTargetType] = useState<'STUDENT' | 'GROUP' | 'CLASS' | 'GRADE'>('STUDENT');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [assignmentYear, setAssignmentYear] = useState(new Date().getFullYear());
  const [assignmentMonth, setAssignmentMonth] = useState(new Date().getMonth() + 1);
  const [assignmentWeek, setAssignmentWeek] = useState(1);
  const [assigning, setAssigning] = useState(false);
  
  // Assignment data sources
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<MentorGroup[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPlanForDelete, setSelectedPlanForDelete] = useState<StudyPlan | null>(null);
  const [deleteMode, setDeleteMode] = useState<'cancel' | 'delete'>('cancel');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login/school');
      return;
    }
    setUser(JSON.parse(userStr));
    fetchPlans();
    fetchAssignmentData();
  }, []);

  // Re-fetch when template filters change
  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [templateMonth, templateYear, templateCreatedBy, templateSortBy]);

  // Apply filters to templates
  useEffect(() => {
    let filtered = templates;
    
    if (examTypeFilter !== 'ALL') {
      filtered = filtered.filter(p => p.examType === examTypeFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredTemplates(filtered);
  }, [templates, examTypeFilter, searchQuery]);

  // Apply filters to assigned plans
  useEffect(() => {
    let filtered = plans;
    
    if (examTypeFilter !== 'ALL') {
      filtered = filtered.filter(p => p.examType === examTypeFilter);
    }
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredPlans(filtered);
  }, [plans, examTypeFilter, statusFilter, searchQuery]);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch templates with filters
      const templateParams = new URLSearchParams({
        month: templateMonth.toString(),
        year: templateYear.toString(),
        createdBy: templateCreatedBy,
        sortBy: templateSortBy,
      });
      
      const templatesResponse = await fetch(`http://localhost:3001/study/plans/templates?${templateParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Fetch assigned plans
      const plansResponse = await fetch('http://localhost:3001/study/plans?isTemplate=false', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (templatesResponse.ok && plansResponse.ok) {
        const templatesData = await templatesResponse.json();
        const plansData = await plansResponse.json();
        
        // Kullanıcı rolüne göre filtreleme
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        
        if (currentUser?.role === 'STUDENT') {
          // Öğrenci için: tüm atanan planları göster
          setPlans(plansData.filter((p: StudyPlan) => p.status === 'ACTIVE' || p.status === 'ASSIGNED'));
          setTemplates([]);
        } else {
          // Öğretmen/Admin için: template'ler ve atanan planlar ayrı
          setTemplates(templatesData);
          setPlans(plansData);
        }
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      // Fetch students
      const studentsRes = await fetch('http://localhost:3001/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data);
      }

      // Fetch groups
      const groupsRes = await fetch('http://localhost:3001/groups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setGroups(data);
      }

      // Fetch grades
      const gradesRes = await fetch('http://localhost:3001/schools/grades', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (gradesRes.ok) {
        const data = await gradesRes.json();
        setGrades(data);
      }

      // Fetch classes - Need to get user's schoolId first
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const schoolId = userData.schoolId;
        
        const classesRes = await fetch(`http://localhost:3001/schools/${schoolId}/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (classesRes.ok) {
          const data = await classesRes.json();
          setClasses(data);
        }
      }
    } catch (error) {
      console.error('Error fetching assignment data:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      DRAFT: { label: 'Taslak', variant: 'secondary' },
      ACTIVE: { label: 'Aktif', variant: 'default' },
      ASSIGNED: { label: 'Atandı', variant: 'default' },
      COMPLETED: { label: 'Tamamlandı', variant: 'outline' },
      ARCHIVED: { label: 'Arşivlendi', variant: 'destructive' },
      CANCELLED: { label: 'İptal Edildi', variant: 'destructive' },
    };
    return statusConfig[status] || { label: status, variant: 'secondary' };
  };

  const getExamTypeBadge = (examType: string) => {
    const colors: Record<string, string> = {
      TYT: 'bg-blue-100 text-blue-800',
      AYT: 'bg-purple-100 text-purple-800',
      LGS: 'bg-green-100 text-green-800',
    };
    return colors[examType] || 'bg-gray-100 text-gray-800';
  };

  const getTargetLabel = (plan: StudyPlan) => {
    if (plan.targetType === 'INDIVIDUAL') {
      return plan.student ? `${plan.student.user.firstName} ${plan.student.user.lastName}` : 'Bireysel';
    }
    return plan.group?.name || 'Grup';
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM yyyy', { locale: tr });
  };

  // Assignment functions
  const openAssignModal = (plan: StudyPlan) => {
    setSelectedPlanForAssignment(plan);
    setSelectedTargets([]);
    setAssignmentTargetType('STUDENT');
    setAssignModalOpen(true);
  };

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const getFilteredStudents = () => {
    if (!studentSearch) return students.slice(0, 20);
    const search = studentSearch.toLowerCase();
    return students.filter(s => 
      s.user.firstName.toLowerCase().includes(search) ||
      s.user.lastName.toLowerCase().includes(search) ||
      s.studentNumber.includes(search)
    ).slice(0, 20);
  };

  const getMonthName = (month: number) => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return months[month - 1];
  };

  const handleAssign = async () => {
    if (!selectedPlanForAssignment || selectedTargets.length === 0) return;
    
    setAssigning(true);
    const token = localStorage.getItem('token');
    
    try {
      const targets = selectedTargets.map(id => ({
        type: assignmentTargetType,
        id
      }));

      const response = await fetch(`http://localhost:3001/study/plans/${selectedPlanForAssignment.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targets,
          year: assignmentYear,
          month: assignmentMonth,
          weekNumber: assignmentWeek,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Plan atanırken hata oluştu');
      }

      const result = await response.json();
      const { summary } = result;
      
      // Build detailed message
      const messageParts: string[] = [];
      if (summary.students.count > 0) {
        messageParts.push(`${summary.students.count} öğrenciye`);
      }
      if (summary.groups.count > 0) {
        messageParts.push(`${summary.groups.count} gruba (${summary.groups.totalStudents} öğrenci)`);
      }
      if (summary.classes.count > 0) {
        messageParts.push(`${summary.classes.count} sınıfa (${summary.classes.totalStudents} öğrenci)`);
      }
      if (summary.grades.count > 0) {
        messageParts.push(`${summary.grades.count} sınıf seviyesine (${summary.grades.totalStudents} öğrenci)`);
      }

      const detailMessage = messageParts.join(', ');

      toast({
        title: 'Plan Başarıyla Atandı',
        description: `${detailMessage} - Toplam ${summary.totalStudents} öğrenci için ${result.taskCount} görev oluşturuldu`,
      });

      setAssignModalOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  // Delete functions
  const openDeleteModal = (plan: StudyPlan) => {
    setSelectedPlanForDelete(plan);
    setDeleteMode('cancel');
    setDeleteModalOpen(true);
  };

  const openDeleteTemplateModal = (template: StudyPlan) => {
    setSelectedPlanForDelete(template);
    setDeleteMode('delete');
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPlanForDelete) return;
    
    setDeleting(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3001/study/plans/${selectedPlanForDelete.id}?mode=${deleteMode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Plan silinirken hata oluştu');
      }

      toast({
        title: 'Başarılı',
        description: deleteMode === 'delete' ? 'Şablon silindi' : 'Atamalar iptal edildi',
      });

      setDeleteModalOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Duplicate function
  const handleDuplicate = async (plan: StudyPlan) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3001/study/plans/${plan.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Plan kopyalanırken hata oluştu');
      }

      toast({
        title: 'Başarılı',
        description: 'Plan kopyalandı',
      });

      fetchPlans();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu',
        variant: 'destructive',
      });
    }
  };

  // Stats calculation
  const stats = {
    templates: templates.length,
    assigned: plans.length,
    active: plans.filter(p => p.status === 'ACTIVE' || p.status === 'ASSIGNED').length,
    completed: plans.filter(p => p.status === 'COMPLETED').length,
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Çalışma Planları</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'STUDENT' 
              ? 'Çalışma planlarınızı görüntüleyin ve takip edin'
              : 'Plan şablonları oluşturun ve öğrencilere atayın'}
          </p>
        </div>
        {user?.role !== 'STUDENT' && (
          <div className="flex gap-3">
            {user?.role === 'SCHOOL_ADMIN' && (
              <>
                <Link href="/dashboard/admin/subjects">
                  <Button variant="outline">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Ders/Konu Yönetimi
                  </Button>
                </Link>
                <Link href="/dashboard/study-plans/settings">
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Ayarlar
                  </Button>
                </Link>
              </>
            )}
            <Link href="/dashboard/study-plans/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Şablon Oluştur
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Şablonlar</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.templates}</div>
            <p className="text-xs text-muted-foreground">Oluşturulan şablonlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atanan Planlar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assigned}</div>
            <p className="text-xs text-muted-foreground">Öğrencilere atanan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-green-600">Devam eden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Biten planlar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Input
                  placeholder="Plan ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sınav Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Sınavlar</SelectItem>
                <SelectItem value="TYT">TYT</SelectItem>
                <SelectItem value="AYT">AYT</SelectItem>
                <SelectItem value="LGS">LGS</SelectItem>
              </SelectContent>
            </Select>
            {activeTab === 'assigned' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="ASSIGNED">Atandı</SelectItem>
                  <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                  <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Active Plans & Templates */}
      {user?.role !== 'STUDENT' ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">
              <Target className="mr-2 h-4 w-4" />
              Aktif Planlar ({plans.length})
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="mr-2 h-4 w-4" />
              Şablonlar ({templates.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Plans Tab - First */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Aktif Planlar</CardTitle>
                <CardDescription>
                  {filteredPlans.length} aktif plan gösteriliyor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Henüz aktif plan yok</h3>
                    <p className="text-muted-foreground mt-2">
                      Şablon atayarak aktif planlar oluşturun.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPlans.map((plan) => (
                      <Card key={plan.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{plan.name}</CardTitle>
                              <CardDescription className="line-clamp-1">
                                {plan.description || 'Açıklama yok'}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-blue-600 text-white">Aktif Plan</Badge>
                              <Badge className={getExamTypeBadge(plan.examType)}>{plan.examType}</Badge>
                              {(() => {
                                const statusBadge = getStatusBadge(plan.status);
                                return <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>;
                              })()}
                            </div>
                            <div className="flex justify-between pt-2">
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/study-plans/${plan.id}`)}
                                >
                                  <Eye className="mr-1 h-4 w-4" />
                                  Görüntüle
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openAssignModal(plan)}
                                >
                                  <Send className="mr-1 h-4 w-4" />
                                  Tekrar Ata
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteModal(plan)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab - Second */}
          <TabsContent value="templates">
            {/* Template Filters */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Filtreler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Month Selector */}
                  <div className="space-y-2">
                    <Label>Ay</Label>
                    <Select value={templateMonth.toString()} onValueChange={(v) => setTemplateMonth(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ocak</SelectItem>
                        <SelectItem value="2">Şubat</SelectItem>
                        <SelectItem value="3">Mart</SelectItem>
                        <SelectItem value="4">Nisan</SelectItem>
                        <SelectItem value="5">Mayıs</SelectItem>
                        <SelectItem value="6">Haziran</SelectItem>
                        <SelectItem value="7">Temmuz</SelectItem>
                        <SelectItem value="8">Ağustos</SelectItem>
                        <SelectItem value="9">Eylül</SelectItem>
                        <SelectItem value="10">Ekim</SelectItem>
                        <SelectItem value="11">Kasım</SelectItem>
                        <SelectItem value="12">Aralık</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year Selector */}
                  <div className="space-y-2">
                    <Label>Yıl</Label>
                    <Select value={templateYear.toString()} onValueChange={(v) => setTemplateYear(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Created By Filter */}
                  <div className="space-y-2">
                    <Label>Oluşturan</Label>
                    <Select value={templateCreatedBy} onValueChange={setTemplateCreatedBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Şablonlar</SelectItem>
                        <SelectItem value="mine">Kendi Şablonlarım</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label>Sıralama</Label>
                    <Select value={templateSortBy} onValueChange={setTemplateSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">En Yeni</SelectItem>
                        <SelectItem value="most-used">En Çok Kullanılan</SelectItem>
                        <SelectItem value="name">İsme Göre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Şablonları</CardTitle>
                <CardDescription>
                  {filteredTemplates.length} şablon gösteriliyor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Henüz şablon yok</h3>
                    <p className="text-muted-foreground mt-2">
                      Yeni bir çalışma planı şablonu oluşturarak başlayın.
                    </p>
                    <Link href="/dashboard/study-plans/new">
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        İlk Şablonu Oluştur
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates.map((plan) => (
                      <Card key={plan.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{plan.name}</CardTitle>
                              <CardDescription className="line-clamp-1">
                                {plan.description || 'Açıklama yok'}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-purple-600 text-white">Şablon</Badge>
                              <Badge className={getExamTypeBadge(plan.examType)}>{plan.examType}</Badge>
                              {plan.isPublic && (
                                <Badge variant="outline" className="text-green-600 border-green-600">Paylaşıldı</Badge>
                              )}
                              {plan._count && plan._count.assignments && plan._count.assignments > 0 && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                  {plan._count.assignments}x Kullanıldı
                                </Badge>
                              )}
                            </div>
                            
                            {/* Teacher info */}
                            {plan.teacher && (
                              <div className="text-xs text-muted-foreground">
                                Oluşturan: {plan.teacher.firstName} {plan.teacher.lastName}
                              </div>
                            )}
                            
                            {/* Grade levels */}
                            <div className="flex flex-wrap gap-1">
                              {plan.gradeLevels.map(grade => (
                                <Badge key={grade} variant="outline" className="text-xs">
                                  {grade}. Sınıf
                                </Badge>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between pt-2">
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/study-plans/${plan.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Detay
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDuplicate(plan)}
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Kopyala ve Düzenle
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteTemplateModal(plan);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Sil
                                </Button>
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => openAssignModal(plan)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Ata
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        /* Student View */
        <Card>
          <CardHeader>
            <CardTitle>Çalışma Planlarım</CardTitle>
            <CardDescription>
              {filteredPlans.length} plan gösteriliyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Henüz plan yok</h3>
                <p className="text-muted-foreground mt-2">
                  Size henüz bir çalışma planı atanmamış.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlans.map((plan) => {
                  const statusBadge = getStatusBadge(plan.status);
                  return (
                    <Card 
                      key={plan.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/dashboard/study-plans/${plan.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg truncate">{plan.name}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {plan.description || 'Açıklama yok'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getExamTypeBadge(plan.examType)}>{plan.examType}</Badge>
                            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                          </div>
                          {plan.weekStartDate && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(plan.weekStartDate)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assignment Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plan Ata: {selectedPlanForAssignment?.name}</DialogTitle>
            <DialogDescription>
              Bu planı öğrencilere, gruplara veya sınıflara atayın
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Target Type Selection */}
            <div className="space-y-2">
              <Label>Hedef Tipi</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={assignmentTargetType === 'STUDENT' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setAssignmentTargetType('STUDENT'); setSelectedTargets([]); }}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Öğrenci
                </Button>
                <Button
                  type="button"
                  variant={assignmentTargetType === 'GROUP' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setAssignmentTargetType('GROUP'); setSelectedTargets([]); }}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Mentör Grubu
                </Button>
                <Button
                  type="button"
                  variant={assignmentTargetType === 'CLASS' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setAssignmentTargetType('CLASS'); setSelectedTargets([]); }}
                >
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Şube
                </Button>
                <Button
                  type="button"
                  variant={assignmentTargetType === 'GRADE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setAssignmentTargetType('GRADE'); setSelectedTargets([]); }}
                >
                  <GraduationCap className="h-4 w-4 mr-1" />
                  Sınıf Seviyesi
                </Button>
              </div>
            </div>

            {/* Target Selection */}
            <div className="space-y-2">
              <Label>
                {assignmentTargetType === 'STUDENT' && 'Öğrenci Seçimi'}
                {assignmentTargetType === 'GROUP' && 'Grup Seçimi'}
                {assignmentTargetType === 'CLASS' && 'Şube Seçimi'}
                {assignmentTargetType === 'GRADE' && 'Sınıf Seviyesi Seçimi'}
              </Label>

              {/* Student Search */}
              {assignmentTargetType === 'STUDENT' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Öğrenci ara..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {getFilteredStudents().map(student => (
                      <div 
                        key={student.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted border-b last:border-b-0"
                      >
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={selectedTargets.includes(student.id)}
                          onCheckedChange={() => toggleTarget(student.id)}
                        />
                        <Label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer">
                          <div className="font-medium">
                            {student.user.firstName} {student.user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {student.studentNumber} - {student.class?.name || 'Sınıf yok'}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group Selection */}
              {assignmentTargetType === 'GROUP' && (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {groups.map(group => (
                    <div 
                      key={group.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted border-b last:border-b-0"
                    >
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={selectedTargets.includes(group.id)}
                        onCheckedChange={() => toggleTarget(group.id)}
                      />
                      <Label htmlFor={`group-${group.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{group.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {group._count?.students || 0} öğrenci
                        </div>
                      </Label>
                    </div>
                  ))}
                  {groups.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      Henüz mentör grubunuz yok
                    </div>
                  )}
                </div>
              )}

              {/* Class Selection */}
              {assignmentTargetType === 'CLASS' && (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {classes.map(cls => (
                    <div 
                      key={cls.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted border-b last:border-b-0"
                    >
                      <Checkbox
                        id={`class-${cls.id}`}
                        checked={selectedTargets.includes(cls.id)}
                        onCheckedChange={() => toggleTarget(cls.id)}
                      />
                      <Label htmlFor={`class-${cls.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{cls.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {cls.grade?.level}. Sınıf - {cls._count?.students || 0} öğrenci
                        </div>
                      </Label>
                    </div>
                  ))}
                  {classes.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      Şube bulunamadı
                    </div>
                  )}
                </div>
              )}

              {/* Grade Selection */}
              {assignmentTargetType === 'GRADE' && (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {grades.map(grade => (
                    <div 
                      key={grade.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted border-b last:border-b-0"
                    >
                      <Checkbox
                        id={`grade-${grade.id}`}
                        checked={selectedTargets.includes(grade.id)}
                        onCheckedChange={() => toggleTarget(grade.id)}
                      />
                      <Label htmlFor={`grade-${grade.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium">{grade.level}. Sınıf</div>
                        <div className="text-xs text-muted-foreground">
                          Tüm {grade.level}. sınıf öğrencileri
                        </div>
                      </Label>
                    </div>
                  ))}
                  {grades.length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      Sınıf seviyesi bulunamadı
                    </div>
                  )}
                </div>
              )}

              {/* Selected count */}
              {selectedTargets.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{selectedTargets.length} seçildi</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedTargets([])}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Temizle
                  </Button>
                </div>
              )}
            </div>

            {/* Week Selection */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Yıl</Label>
                <Select 
                  value={assignmentYear.toString()} 
                  onValueChange={(v) => setAssignmentYear(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ay</Label>
                <Select 
                  value={assignmentMonth.toString()} 
                  onValueChange={(v) => setAssignmentMonth(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <SelectItem key={m} value={m.toString()}>{getMonthName(m)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hafta</Label>
                <Select 
                  value={assignmentWeek.toString()} 
                  onValueChange={(v) => setAssignmentWeek(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1. Hafta</SelectItem>
                    <SelectItem value="2">2. Hafta</SelectItem>
                    <SelectItem value="3">3. Hafta</SelectItem>
                    <SelectItem value="4">4. Hafta</SelectItem>
                    <SelectItem value="5">5. Hafta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg text-sm">
              <strong>Seçilen Dönem:</strong> {getMonthName(assignmentMonth)} {assignmentYear}, {assignmentWeek}. Hafta
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleAssign} 
              disabled={assigning || selectedTargets.length === 0}
            >
              {assigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atanıyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Planı Ata ({selectedTargets.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedPlanForDelete?.isTemplate ? 'Şablonu Sil' : 'Planı Sil'}: {selectedPlanForDelete?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPlanForDelete?.isTemplate 
                ? 'Bu şablon kalıcı olarak silinecektir. Bu işlem geri alınamaz.'
                : 'Bu işlem geri alınamaz. Lütfen silme seçeneğini belirleyin:'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {!selectedPlanForDelete?.isTemplate && (
            <div className="space-y-3 py-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${deleteMode === 'cancel' ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'}`}
                onClick={() => setDeleteMode('cancel')}
              >
                <div className="flex items-center gap-2">
                  <input type="radio" checked={deleteMode === 'cancel'} readOnly />
                  <div>
                    <div className="font-medium">Sadece Atamaları İptal Et</div>
                    <div className="text-sm text-muted-foreground">
                      Şablon korunur, ancak bu plana yapılan tüm atamalar iptal edilir. 
                      Öğrenci performans verileri silinmez.
                    </div>
                  </div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${deleteMode === 'delete' ? 'border-destructive bg-destructive/5' : 'hover:border-muted-foreground'}`}
                onClick={() => setDeleteMode('delete')}
              >
                <div className="flex items-center gap-2">
                  <input type="radio" checked={deleteMode === 'delete'} readOnly />
                  <div>
                    <div className="font-medium text-destructive">Şablonu Tamamen Sil</div>
                    <div className="text-sm text-muted-foreground">
                      Şablon ve tüm atamalar kalıcı olarak silinir.
                      Öğrenci performans verileri korunur.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPlanForDelete?.isTemplate && (
            <div className="py-4">
              <div className="p-4 border border-destructive rounded-lg bg-destructive/5">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-destructive mb-2">Uyarı:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Bu şablon kalıcı olarak silinecektir</li>
                    <li>Bu şablondan oluşturulmuş aktif planlar etkilenmeyecektir</li>
                    <li>Bu işlem geri alınamaz</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className={deleteMode === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                deleteMode === 'cancel' ? 'Atamaları İptal Et' : 'Planı Sil'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

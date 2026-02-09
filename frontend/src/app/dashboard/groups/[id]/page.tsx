'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Calendar,
  Settings,
  UserPlus,
  ArrowLeft,
  BookOpen,
  Trophy,
  Clock,
  Trash2
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/auth';

interface GroupMember {
  id: string;
  studentId: string;
  joinedAt: string;
  student: {
    id: string;
    studentNumber: string | null;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface GroupGoal {
  id: string;
  goalType: string;
  targetData?: {
    title?: string;
    targetValue?: number;
    unit?: string;
    description?: string;
  };
  deadline?: string | null;
  isActive: boolean;
  isPublished?: boolean;
  isCompleted?: boolean;
  createdAt: string;
}

interface TransferCandidate {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  class?: {
    name?: string;
    grade?: {
      name?: string;
    };
  };
  currentGroup?: {
    id: string;
    name: string;
  } | null;
  isInThisGroup: boolean;
}

interface GroupStats {
  memberCount: number;
  completedTasks: number;
  groupGoals: number;
  activeGroupGoals: number;
  totalStudyHours: number;
  avgStudyHoursPerMember: number;
}

interface GoalFormState {
  goalType: string;
  title: string;
  targetValue: string;
  unit: string;
  description: string;
  deadline: string;
  isActive: boolean;
  isPublished: boolean;
  isCompleted: boolean;
}

const GOAL_TEMPLATES: Record<
  string,
  { label: string; defaultTitle: string; defaultUnit: string; description: string }
> = {
  SCORE: {
    label: 'Puan',
    defaultTitle: 'Deneme Puanı Hedefi',
    defaultUnit: 'puan',
    description: 'Ortalama deneme puanı hedefi',
  },
  TASK: {
    label: 'Görev',
    defaultTitle: 'Tamamlanan Görev Sayısı',
    defaultUnit: 'görev',
    description: 'Toplam tamamlanan görev hedefi',
  },
  STUDY_HOURS: {
    label: 'Çalışma Saati',
    defaultTitle: 'Toplam Çalışma Saati',
    defaultUnit: 'saat',
    description: 'Grubun toplam çalışma saati hedefi',
  },
  CUSTOM: {
    label: 'Özel',
    defaultTitle: 'Özel Hedef',
    defaultUnit: '',
    description: 'Özel hedef tanımı',
  },
};

const getGoalTypeLabel = (goalType: string) => {
  return GOAL_TEMPLATES[goalType]?.label ?? goalType;
};

interface MentorGroup {
  id: string;
  name: string;
  description: string | null;
  gradeIds: number[];
  maxStudents: number;
  isActive: boolean;
  coverImage: string | null;
  createdAt: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  memberships: GroupMember[];
  goals: GroupGoal[];
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;
  const { toast } = useToast();

  const [group, setGroup] = useState<MentorGroup | null>(null);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [grades, setGrades] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferClasses, setTransferClasses] = useState<any[]>([]);
  const [transferStudents, setTransferStudents] = useState<TransferCandidate[]>([]);
  const [transferGradeId, setTransferGradeId] = useState<string>('');
  const [transferClassId, setTransferClassId] = useState<string>('');
  const [transferSearch, setTransferSearch] = useState('');
  const [transferStudentId, setTransferStudentId] = useState<string>('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState<GoalFormState>({
    goalType: 'CUSTOM',
    title: '',
    targetValue: '',
    unit: '',
    description: '',
    deadline: '',
    isActive: true,
    isPublished: true,
    isCompleted: false,
  });
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
        if (!localStorage.getItem('token')) {
          router.push('/login');
          return;
        }

        // Fetch group details
        const groupResponse = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
          headers: {
          },
        });

        if (!groupResponse.ok) {
          throw new Error('Grup bilgileri yüklenemedi');
        }

        const groupData = await groupResponse.json();
        setGroup(groupData);

        // Fetch group stats
        const statsResponse = await fetch(`${API_BASE_URL}/groups/${groupId}/stats`, {
          headers: {
          },
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupData();
    }
  }, [groupId, router]);

  useEffect(() => {
    if (user?.role === 'STUDENT' && groupId) {
      router.replace(`/dashboard/groups/${groupId}/board`);
    }
  }, [user, groupId, router]);

  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
  const isGroupTeacher = user?.role === 'TEACHER' && user?.id === group?.teacher?.id;
  const canManageGroup = isAdmin || isGroupTeacher;
  const teacherLabel = group?.teacher ? `${group.teacher.firstName} ${group.teacher.lastName}` : 'Atanmamış';

  const getGradeLabel = (gradeIds: number[]) => {
    if (!gradeIds || gradeIds.length === 0) return 'Tüm Sınıflar';
    const gradeNames = gradeIds.map(g => `${g}. Sınıf`).join(', ');
    return gradeNames;
  };

  // Modal functions
  const openAddMemberModal = async () => {
    setShowAddMemberModal(true);
    setSelectedGradeId('');
    setSelectedClassId('');
    setSearchTerm('');
    setSelectedStudents([]);
    setAvailableStudents([]);
    setModalLoading(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const schoolId = user?.schoolId;
      
      // Fetch grades from schools API
      const gradesResponse = await fetch(`${API_BASE_URL}/schools/${schoolId}/grades`, {
      });
      
      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json();
        setGrades(gradesData);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchClasses = async (gradeId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedClassId('');
    setAvailableStudents([]);
    setSelectedStudents([]);

    if (!gradeId) {
      setClasses([]);
      return;
    }

    try {
      const classesResponse = await fetch(`${API_BASE_URL}/groups/grades/${gradeId}/classes`, {
      });

      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        setClasses(classesData);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudents([]);

    if (!classId) {
      setAvailableStudents([]);
      return;
    }

    try {
      setModalLoading(true);
      const studentsResponse = await fetch(
        `${API_BASE_URL}/groups/${groupId}/available-students?classId=${classId}`,
        {
        }
      );

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setAvailableStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const refreshGroupData = async () => {
    const groupResponse = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
    });

    if (groupResponse.ok) {
      const groupData = await groupResponse.json();
      setGroup(groupData);
    }

    const statsResponse = await fetch(`${API_BASE_URL}/groups/${groupId}/stats`, {
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      setStats(statsData);
    }
  };

  const addSelectedMembers = async () => {
    if (selectedStudents.length === 0) return;

    setAddingMembers(true);
    try {
      // Use bulk endpoint for better performance
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIds: selectedStudents }),
      });

      if (!response.ok) {
        throw new Error('Öğrenciler eklenirken bir hata oluştu');
      }

      const result = await response.json();
      
      // Show result
      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map((e: any) => e.error).join(', ');
        toast({
          title: "Kısmi Başarı",
          description: `${result.totalAdded} öğrenci eklendi. Bazı öğrenciler eklenemedi: ${errorMessages}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Başarılı",
          description: `${result.totalAdded} öğrenci başarıyla eklendi`,
        });
      }

      setShowAddMemberModal(false);
      await refreshGroupData();
    } catch (error) {
      console.error('Error adding members:', error);
      toast({
        title: "Hata",
        description: "Öğrenciler eklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setAddingMembers(false);
    }
  };

  const openTransferModal = async () => {
    setShowTransferModal(true);
    setTransferGradeId('');
    setTransferClassId('');
    setTransferSearch('');
    setTransferStudentId('');
    setTransferStudents([]);
    setTransferClasses([]);
    setTransferLoading(true);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const schoolId = user?.schoolId;

      const gradesResponse = await fetch(`${API_BASE_URL}/schools/${schoolId}/grades`, {
      });

      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json();
        setGrades(gradesData);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setTransferLoading(false);
    }
  };

  const fetchTransferClasses = async (gradeId: string) => {
    setTransferGradeId(gradeId);
    setTransferClassId('');
    setTransferStudents([]);
    setTransferStudentId('');

    if (!gradeId) {
      setTransferClasses([]);
      return;
    }

    try {
      const classesResponse = await fetch(`${API_BASE_URL}/groups/grades/${gradeId}/classes`, {
      });

      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        setTransferClasses(classesData);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchTransferStudents = async (classId: string) => {
    setTransferClassId(classId);
    setTransferStudentId('');

    if (!classId) {
      setTransferStudents([]);
      return;
    }

    try {
      setTransferLoading(true);
      const studentsResponse = await fetch(
        `${API_BASE_URL}/groups/${groupId}/transfer-candidates?classId=${classId}`,
        {
        }
      );

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setTransferStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setTransferLoading(false);
    }
  };

  const handleTransferMember = async () => {
    if (!transferStudentId) return;
    const selectedStudent = transferStudents.find((student) => student.id === transferStudentId);
    const currentGroupName = selectedStudent?.currentGroup?.name || 'Grupsuz';
    const confirmed = window.confirm(
      `Öğrenci mevcut grubu: ${currentGroupName}. Bu gruba aktarılsın mı?`
    );
    if (!confirmed) return;
    setTransferring(true);

    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: transferStudentId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Öğrenci aktarılamadı';
        throw new Error(errorMessage);
      }

      toast({
        title: 'Başarılı',
        description: 'Öğrenci gruba aktarıldı',
      });
      setShowTransferModal(false);
      await refreshGroupData();
    } catch (error) {
      console.error('Error transferring student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Öğrenci aktarılırken hata oluştu';
      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setTransferring(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    const confirmed = window.confirm('Bu grubu silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/groups/${group.id}`, {
        method: 'DELETE',
        headers: {
        },
      });

      if (!response.ok) {
        throw new Error('Grup silinemedi');
      }

      toast({
        title: 'Başarılı',
        description: 'Grup silindi',
      });
      router.push('/dashboard/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Hata',
        description: 'Grup silinirken bir hata oluştu',
        variant: 'destructive',
      });
    }
  };

  const getGoalTitle = (goal: GroupGoal) => {
    return goal.targetData?.title || 'Hedef';
  };

  const getGoalTargetLabel = (goal: GroupGoal) => {
    const value = goal.targetData?.targetValue;
    const unit = goal.targetData?.unit;
    if (value === undefined || value === null) {
      return 'Hedef değeri belirtilmemiş';
    }
    return `${value}${unit ? ` ${unit}` : ''}`;
  };

  const getGoalProgress = (goal: GroupGoal) => {
    if (!stats) return null;
    const targetValue = goal.targetData?.targetValue;
    if (targetValue === undefined || targetValue === null || targetValue === 0) {
      if (goal.goalType === 'TASK' && goal.isCompleted) {
        return { percentage: 100, currentValue: 1, targetValue: 1 };
      }
      return null;
    }

    let currentValue: number | null = null;
    if (goal.goalType === 'STUDY_HOURS') {
      currentValue = stats.totalStudyHours;
    } else if (goal.goalType === 'TASK') {
      currentValue = goal.isCompleted ? targetValue : stats.completedTasks;
    }

    if (currentValue === null) {
      return null;
    }

    const percentage = Math.min(100, Math.round((currentValue / targetValue) * 100));
    return { percentage, currentValue, targetValue };
  };

  const handleGoalTypeChange = (value: string) => {
    const template = GOAL_TEMPLATES[value] || GOAL_TEMPLATES.CUSTOM;
    setGoalForm((prev) => ({
      ...prev,
      goalType: value,
      title: prev.title ? prev.title : template.defaultTitle,
      unit: prev.unit ? prev.unit : template.defaultUnit,
      description: prev.description ? prev.description : template.description,
      isCompleted: value === 'TASK' ? prev.isCompleted : false,
    }));
  };

  const openCreateGoalModal = () => {
    setEditingGoalId(null);
    setGoalForm({
      goalType: 'CUSTOM',
      title: '',
      targetValue: '',
      unit: '',
      description: '',
      deadline: '',
      isActive: true,
      isPublished: true,
      isCompleted: false,
    });
    setShowGoalModal(true);
  };

  const openEditGoalModal = (goal: GroupGoal) => {
    setEditingGoalId(goal.id);
    setGoalForm({
      goalType: goal.goalType || 'CUSTOM',
      title: goal.targetData?.title || '',
      targetValue: goal.targetData?.targetValue !== undefined ? String(goal.targetData?.targetValue) : '',
      unit: goal.targetData?.unit || '',
      description: goal.targetData?.description || '',
      deadline: goal.deadline ? goal.deadline.slice(0, 10) : '',
      isActive: goal.isActive,
      isPublished: goal.isPublished ?? true,
      isCompleted: goal.isCompleted ?? false,
    });
    setShowGoalModal(true);
  };

  const saveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(true);

    try {
      if (!goalForm.title.trim()) {
        throw new Error('Hedef adı zorunludur');
      }

      if (!goalForm.goalType) {
        throw new Error('Hedef türü seçilmelidir');
      }

      const targetValue = goalForm.targetValue ? Number(goalForm.targetValue) : undefined;
      if (goalForm.targetValue && !Number.isFinite(targetValue)) {
        throw new Error('Hedef değeri geçerli bir sayı olmalıdır');
      }

      const payload: any = {
        goalType: goalForm.goalType,
        targetData: {
          title: goalForm.title.trim(),
          targetValue: Number.isFinite(targetValue) ? targetValue : undefined,
          unit: goalForm.unit || undefined,
          description: goalForm.description || undefined,
        },
        deadline: goalForm.deadline || undefined,
        isPublished: goalForm.isPublished,
        isCompleted: goalForm.isCompleted,
      };

      if (editingGoalId) {
        payload.isActive = goalForm.isActive;
      }

      const url = editingGoalId
        ? `${API_BASE_URL}/groups/${groupId}/goals/${editingGoalId}`
        : `${API_BASE_URL}/groups/${groupId}/goals`;
      const method = editingGoalId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Hedef kaydedilemedi';
        throw new Error(errorMessage);
      }

      toast({
        title: 'Başarılı',
        description: editingGoalId ? 'Hedef güncellendi' : 'Hedef oluşturuldu',
      });
      setShowGoalModal(false);
      await refreshGroupData();
    } catch (error) {
      console.error('Error saving goal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Hedef kaydedilirken hata oluştu';
      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSavingGoal(false);
    }
  };

  const deleteGoal = async (goalId: string) => {
    const confirmed = window.confirm('Bu hedefi silmek istediğinize emin misiniz?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
        },
      });

      if (!response.ok) {
        throw new Error('Hedef silinemedi');
      }

      toast({
        title: 'Başarılı',
        description: 'Hedef silindi',
      });
      await refreshGroupData();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Hata',
        description: 'Hedef silinirken bir hata oluştu',
        variant: 'destructive',
      });
    }
  };

  const toggleGoalCompletion = async (goal: GroupGoal) => {
    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/goals/${goal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCompleted: !goal.isCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error('Görev durumu güncellenemedi');
      }

      toast({
        title: 'Başarılı',
        description: goal.isCompleted ? 'Görev tekrar aktif edildi' : 'Görev tamamlandı olarak işaretlendi',
      });
      await refreshGroupData();
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      toast({
        title: 'Hata',
        description: 'Görev durumu güncellenirken bir hata oluştu',
        variant: 'destructive',
      });
    }
  };

  // Filter students by search term
  const filteredStudents = availableStudents.filter(student => {
    const fullName = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const allFilteredSelected =
    filteredStudents.length > 0 && filteredStudents.every((student) => selectedStudents.includes(student.id));

  const toggleSelectAllFiltered = () => {
    if (filteredStudents.length === 0) return;
    if (allFilteredSelected) {
      setSelectedStudents((prev) => prev.filter((id) => !filteredStudents.some((s) => s.id === id)));
    } else {
      setSelectedStudents((prev) => Array.from(new Set([...prev, ...filteredStudents.map((s) => s.id)])));
    }
  };

  const filteredTransferStudents = transferStudents.filter((student) => {
    const fullName = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
    return fullName.includes(transferSearch.toLowerCase());
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Hata</CardTitle>
            <CardDescription>{error || 'Grup bulunamadı'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard/groups')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Gruplara Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/groups')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            {group.isActive ? (
              <Badge variant="default">Aktif</Badge>
            ) : (
              <Badge variant="secondary">Pasif</Badge>
            )}
          </div>
          {group.description && (
            <p className="text-muted-foreground">{group.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/groups/${group.id}/board`)}>
            Pano
          </Button>
          {canManageGroup && (
            <>
              <Button variant="outline" onClick={() => router.push(`/dashboard/groups/edit/${group.id}`)}>
                <Settings className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
              <Button onClick={openAddMemberModal}>
                <UserPlus className="mr-2 h-4 w-4" />
                Üye Ekle
              </Button>
              <Button variant="outline" onClick={openTransferModal}>
                Aktar
              </Button>
              <Button variant="destructive" onClick={handleDeleteGroup}>
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Üye</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.memberCount}</div>
              <p className="text-xs text-muted-foreground">
                Maks: {group.maxStudents || '-'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Hedefler</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGroupGoals}</div>
              <p className="text-xs text-muted-foreground">
                Toplam {stats.groupGoals} hedef
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Çalışma</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudyHours}</div>
              <p className="text-xs text-muted-foreground">
                Saat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Üye Başına</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgStudyHoursPerMember}</div>
              <p className="text-xs text-muted-foreground">
                Ortalama saat
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Üyeler ({group.memberships.length})
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="mr-2 h-4 w-4" />
            Hedefler ({group.goals.length})
          </TabsTrigger>
          <TabsTrigger value="info">
            <BookOpen className="mr-2 h-4 w-4" />
            Bilgiler
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grup Üyeleri</CardTitle>
              <CardDescription>
                Bu gruba kayıtlı öğrencilerin listesi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {group.memberships.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz üye eklenmemiş
                </div>
              ) : (
                <div className="space-y-3">
                  {group.memberships.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.student.user.firstName[0]}
                            {member.student.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.student.user.firstName} {member.student.user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            No: {member.student.studentNumber}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(member.joinedAt).toLocaleDateString('tr-TR')}
                        </Badge>
                        {canManageGroup && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/students/${member.student.id}`)}
                          >
                            Detay
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Grup Hedefleri</CardTitle>
                  <CardDescription>
                    Bu grup için belirlenen hedefler
                  </CardDescription>
                </div>
                {canManageGroup && (
                  <Button size="sm" onClick={openCreateGoalModal}>
                    <Target className="mr-2 h-4 w-4" />
                    Yeni Hedef
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {group.goals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Henüz hedef eklenmemiş
                </div>
              ) : (
                <div className="space-y-3">
                  {group.goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="space-y-1 flex-1 pr-4">
                        <div className="font-medium">{getGoalTitle(goal)}</div>
                        <div className="text-sm text-muted-foreground">
                          {getGoalTargetLabel(goal)}
                        </div>
                        <Badge variant="outline" className="w-fit">
                          {getGoalTypeLabel(goal.goalType)}
                        </Badge>
                        {goal.targetData?.description && (
                          <div className="text-xs text-muted-foreground">
                            {goal.targetData.description}
                          </div>
                        )}
                        {(() => {
                          const progress = getGoalProgress(goal);
                          if (!progress) return null;
                          return (
                            <div className="space-y-1 pt-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{progress.currentValue} / {progress.targetValue}</span>
                                <span>%{progress.percentage}</span>
                              </div>
                              <Progress value={progress.percentage} />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-2">
                        {goal.isActive ? (
                          <Badge variant="default">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Pasif</Badge>
                        )}
                        {goal.goalType === 'TASK' && (
                          <Badge variant={goal.isCompleted ? 'default' : 'outline'}>
                            {goal.isCompleted ? 'Tamamlandı' : 'Bekliyor'}
                          </Badge>
                        )}
                        {goal.deadline && (
                          <Badge variant="outline">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(goal.deadline).toLocaleDateString('tr-TR')}
                          </Badge>
                        )}
                        {canManageGroup && (
                          <>
                            {goal.goalType === 'TASK' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleGoalCompletion(goal)}
                              >
                                {goal.isCompleted ? 'Geri Al' : 'Tamamla'}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => openEditGoalModal(goal)}>
                              Düzenle
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                              Sil
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grup Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Mentor</div>
                  <div className="text-lg">
                    {teacherLabel}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Sınıf Seviyeleri</div>
                  <div className="text-lg">{getGradeLabel(group.gradeIds)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Maksimum Üye</div>
                  <div className="text-lg">{group.maxStudents} öğrenci</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</div>
                  <div className="text-lg">
                    {new Date(group.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Member Modal */}
      {canManageGroup && (
        <Dialog open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gruba Üye Ekle</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Step 1: Select Grade */}
              <div className="space-y-2">
                <Label>Sınıf Seviyesi</Label>
                <Select value={selectedGradeId} onValueChange={fetchClasses}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sınıf seçiniz..." />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade: any) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}. Sınıf
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            {/* Step 2: Select Class */}
            {selectedGradeId && (
              <div className="space-y-2">
                <Label>Şube</Label>
                <Select value={selectedClassId} onValueChange={fetchStudents}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şube seçiniz..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({cls._count?.students || 0} öğrenci)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Step 3: Search and Select Students */}
            {selectedClassId && (
              <>
                <div className="space-y-2">
                  <Label>Öğrenci Ara</Label>
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Öğrenci adı veya soyadı..."
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{filteredStudents.length} öğrenci listelendi</span>
                  <Button type="button" variant="ghost" size="sm" onClick={toggleSelectAllFiltered}>
                    {allFilteredSelected ? 'Tüm Seçimleri Kaldır' : 'Tümünü Seç'}
                  </Button>
                </div>

                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {modalLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Yükleniyor...
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Öğrenci bulunamadı
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredStudents.map((student: any) => (
                        <label
                          key={student.id}
                          className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudentSelection(student.id)}
                          />
                          <Avatar>
                            <AvatarFallback className="text-sm">
                              {student.user.firstName[0]}
                              {student.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">
                              {student.user.firstName} {student.user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.class?.name} - {student.class?.grade?.name}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            </div>

            <DialogFooter className="flex justify-between items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedStudents.length} öğrenci seçildi
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddMemberModal(false)}
                  disabled={addingMembers}
                >
                  İptal
                </Button>
                <Button
                  onClick={addSelectedMembers}
                  disabled={selectedStudents.length === 0 || addingMembers}
                >
                  {addingMembers ? 'Ekleniyor...' : `${selectedStudents.length} Öğrenci Ekle`}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {canManageGroup && (
        <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Öğrenci Aktar</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sınıf Seviyesi</Label>
                <Select value={transferGradeId} onValueChange={fetchTransferClasses}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sınıf seçiniz..." />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade: any) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}. Sınıf
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {transferGradeId && (
                <div className="space-y-2">
                  <Label>Şube</Label>
                  <Select value={transferClassId} onValueChange={fetchTransferStudents}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şube seçiniz..." />
                    </SelectTrigger>
                    <SelectContent>
                      {transferClasses.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls._count?.students || 0} öğrenci)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {transferClassId && (
                <>
                  <div className="space-y-2">
                    <Label>Öğrenci Ara</Label>
                    <Input
                      type="text"
                      value={transferSearch}
                      onChange={(e) => setTransferSearch(e.target.value)}
                      placeholder="Öğrenci adı veya soyadı..."
                    />
                  </div>

                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    {transferLoading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Yükleniyor...
                      </div>
                    ) : filteredTransferStudents.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Öğrenci bulunamadı
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredTransferStudents.map((student) => (
                          <label
                            key={student.id}
                            className={`flex items-center gap-3 p-3 transition-colors ${
                              student.isInThisGroup ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent cursor-pointer'
                            }`}
                          >
                            <Checkbox
                              checked={transferStudentId === student.id}
                              onCheckedChange={(checked) => setTransferStudentId(checked ? student.id : '')}
                              disabled={student.isInThisGroup}
                            />
                            <Avatar>
                              <AvatarFallback className="text-sm">
                                {student.user.firstName[0]}
                                {student.user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium">
                                {student.user.firstName} {student.user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {student.class?.name} - {student.class?.grade?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {student.currentGroup
                                  ? `Mevcut Grup: ${student.currentGroup.name}`
                                  : 'Grupsuz'}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex justify-between items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {transferStudentId
                  ? `Seçilen öğrencinin grubu: ${
                      transferStudents.find((student) => student.id === transferStudentId)?.currentGroup?.name || 'Grupsuz'
                    }`
                  : 'Öğrenci seçilmedi'}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTransferModal(false)}
                  disabled={transferring}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleTransferMember}
                  disabled={!transferStudentId || transferring}
                >
                  {transferring ? 'Aktarılıyor...' : 'Aktar'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {canManageGroup && (
        <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingGoalId ? 'Hedefi Düzenle' : 'Yeni Hedef'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={saveGoal} className="space-y-4">
              <div className="space-y-2">
                <Label>Hedef Türü</Label>
                <Select value={goalForm.goalType} onValueChange={handleGoalTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hedef türü seçiniz..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCORE">Puan</SelectItem>
                    <SelectItem value="TASK">Görev</SelectItem>
                    <SelectItem value="STUDY_HOURS">Çalışma Saati</SelectItem>
                    <SelectItem value="CUSTOM">Özel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hedef Adı *</Label>
                <Input
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="Örn: TYT Net Ortalaması"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Hedef Değer</Label>
                  <Input
                    type="number"
                    value={goalForm.targetValue}
                    onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })}
                    placeholder="Örn: 80"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Birim</Label>
                  <Input
                    value={goalForm.unit}
                    onChange={(e) => setGoalForm({ ...goalForm, unit: e.target.value })}
                    placeholder="Örn: puan / saat"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Textarea
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  placeholder="Hedef ile ilgili açıklama..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Son Tarih</Label>
                <Input
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label>Panoda Yayınla</Label>
                  <p className="text-sm text-muted-foreground">Öğrenciler panoda görebilsin</p>
                </div>
                <Switch
                  checked={goalForm.isPublished}
                  onCheckedChange={(checked) => setGoalForm({ ...goalForm, isPublished: checked })}
                />
              </div>

              {goalForm.goalType === 'TASK' && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label>Görev Tamamlandı</Label>
                    <p className="text-sm text-muted-foreground">Öğretmen tamamlandı durumunu işaretler</p>
                  </div>
                  <Switch
                    checked={goalForm.isCompleted}
                    onCheckedChange={(checked) => setGoalForm({ ...goalForm, isCompleted: checked })}
                  />
                </div>
              )}

              {editingGoalId && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label>Hedef Durumu</Label>
                    <p className="text-sm text-muted-foreground">Aktif/pasif durumunu değiştirin</p>
                  </div>
                  <Switch
                    checked={goalForm.isActive}
                    onCheckedChange={(checked) => setGoalForm({ ...goalForm, isActive: checked })}
                  />
                </div>
              )}

              <DialogFooter className="flex justify-between items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {editingGoalId ? 'Düzenleme modu' : 'Yeni hedef'}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" type="button" onClick={() => setShowGoalModal(false)} disabled={savingGoal}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={savingGoal}>
                    {savingGoal ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

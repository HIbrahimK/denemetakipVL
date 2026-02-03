'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Clock
} from 'lucide-react';

interface GroupMember {
  id: string;
  studentId: string;
  joinedAt: string;
  student: {
    id: string;
    studentNumber: number;
    user: {
      firstName: string;
      lastName: string;
    };
  };
}

interface GroupGoal {
  id: string;
  title: string;
  targetScore: number;
  deadline: string;
  isAchieved: boolean;
  createdAt: string;
}

interface GroupStats {
  totalMembers: number;
  activeGoals: number;
  completedGoals: number;
  averageProgress: number;
}

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
    firstName: string;
    lastName: string;
  };
  memberships: GroupMember[];
  goals: GroupGoal[];
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;

  const [group, setGroup] = useState<MentorGroup | null>(null);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch group details
        const groupResponse = await fetch(`http://localhost:3001/groups/${groupId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!groupResponse.ok) {
          throw new Error('Grup bilgileri yüklenemedi');
        }

        const groupData = await groupResponse.json();
        setGroup(groupData);

        // Fetch group stats
        const statsResponse = await fetch(`http://localhost:3001/groups/${groupId}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
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
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const schoolId = user?.schoolId;
      
      // Fetch grades from schools API
      const gradesResponse = await fetch(`http://localhost:3001/schools/${schoolId}/grades`, {
        headers: { 'Authorization': `Bearer ${token}` },
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
      const token = localStorage.getItem('token');
      const classesResponse = await fetch(`http://localhost:3001/groups/grades/${gradeId}/classes`, {
        headers: { 'Authorization': `Bearer ${token}` },
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
      const token = localStorage.getItem('token');
      const studentsResponse = await fetch(
        `http://localhost:3001/groups/${groupId}/available-students?classId=${classId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setAvailableStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const addSelectedMembers = async () => {
    if (selectedStudents.length === 0) return;

    setAddingMembers(true);
    try {
      const token = localStorage.getItem('token');
      
      // Use bulk endpoint for better performance
      const response = await fetch(`http://localhost:3001/groups/${groupId}/members/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
        const errorMessages = result.errors.map((e: any) => e.error).join('\n');
        alert(`Bazı öğrenciler eklenemedi:\n${errorMessages}`);
      } else {
        alert(`${result.totalAdded} öğrenci başarıyla eklendi`);
      }

      setShowAddMemberModal(false);
      
      // Refresh group data
      const groupResponse = await fetch(`http://localhost:3001/groups/${groupId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (groupResponse.ok) {
        const groupData = await groupResponse.json();
        setGroup(groupData);
      }

      // Refresh stats
      const statsResponse = await fetch(`http://localhost:3001/groups/${groupId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error adding members:', error);
      alert('Öğrenciler eklenirken bir hata oluştu');
    } finally {
      setAddingMembers(false);
    }
  };

  // Filter students by search term
  const filteredStudents = availableStudents.filter(student => {
    const fullName = `${student.user.firstName} ${student.user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
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
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <Button onClick={openAddMemberModal}>
            <UserPlus className="mr-2 h-4 w-4" />
            Üye Ekle
          </Button>
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
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Maks: {group.maxStudents}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Hedefler</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGoals}</div>
              <p className="text-xs text-muted-foreground">
                Devam ediyor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedGoals}</div>
              <p className="text-xs text-muted-foreground">
                Başarılı hedef
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama İlerleme</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Grup performansı
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
                        <Button variant="ghost" size="sm">
                          Detay
                        </Button>
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
              <CardTitle>Grup Hedefleri</CardTitle>
              <CardDescription>
                Bu grup için belirlenen hedefler
              </CardDescription>
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
                      <div className="space-y-1">
                        <div className="font-medium">{goal.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Hedef Puan: {goal.targetScore}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {goal.isAchieved ? (
                          <Badge variant="default">
                            <Trophy className="mr-1 h-3 w-3" />
                            Başarıldı
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(goal.deadline).toLocaleDateString('tr-TR')}
                          </Badge>
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
                    {group.teacher.firstName} {group.teacher.lastName}
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
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Gruba Üye Ekle</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddMemberModal(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Step 1: Select Grade */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sınıf Seviyesi
                </label>
                <select
                  value={selectedGradeId}
                  onChange={(e) => fetchClasses(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sınıf seçiniz...</option>
                  {grades.map((grade: any) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}. Sınıf
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Class */}
              {selectedGradeId && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Şube
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => fetchStudents(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Şube seçiniz...</option>
                    {classes.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls._count?.students || 0} öğrenci)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 3: Search and Select Students */}
              {selectedClassId && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Öğrenci Ara
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Öğrenci adı veya soyadı..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    {modalLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Yükleniyor...
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Öğrenci bulunamadı
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredStudents.map((student: any) => (
                          <label
                            key={student.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudentSelection(student.id)}
                              className="h-5 w-5 text-blue-600 rounded"
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
                              <div className="text-sm text-gray-500">
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

            <div className="p-6 border-t flex justify-between items-center bg-gray-50">
              <div className="text-sm text-gray-600">
                {selectedStudents.length} öğrenci seçildi
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddMemberModal(false)}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

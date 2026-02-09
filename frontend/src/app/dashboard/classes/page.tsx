'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Users, GraduationCap, ArrowRightLeft, Merge } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface Class {
  id: string;
  name: string;
  grade: {
    id: string;
    name: string;
  };
  gradeId: string;
  _count: {
    students: number;
  };
}

interface Student {
  id: string;
  studentNumber: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

// Sabit snf seviyeleri (5-12)
const FIXED_GRADES = [
  { id: '5', name: '5' },
  { id: '6', name: '6' },
  { id: '7', name: '7' },
  { id: '8', name: '8' },
  { id: '9', name: '9' },
  { id: '10', name: '10' },
  { id: '11', name: '11' },
  { id: '12', name: '12' },
];

export default function ClassesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState<string>('');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  
  // Form states - Yeni format: gradeLevel ve section
  const [formData, setFormData] = useState({ gradeLevel: '', section: '' });
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [mergeData, setMergeData] = useState({ sourceClassId: '', targetClassId: '' });
  const [transferData, setTransferData] = useState({ targetClassId: '' });
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || '\';

  useEffect(() => {
    // Get user info and schoolId
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'SCHOOL_ADMIN') {
      router.push('/dashboard');
      return;
    }

    setSchoolId(user.schoolId);
    fetchClasses(user.schoolId);
  }, []);

  const fetchClasses = async (schoolId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/schools/${schoolId}/classes`, {
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Grade level'dan grade ID bul
  const getGradeIdByLevel = (gradeLevel: string) => {
    const grade = classes.find(c => c.grade.name === gradeLevel);
    return grade?.gradeId || '';
  };

  // Snf adn "5/A" formatnda gster
  const displayClassName = (classItem: Class) => {
    return `${classItem.grade.name}/${classItem.name}`;
  };

  const handleAddClass = async () => {
    if (!formData.gradeLevel || !formData.section) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/schools/${schoolId}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gradeLevel: parseInt(formData.gradeLevel),
          section: formData.section,
        }),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        setFormData({ gradeLevel: '', section: '' });
        fetchClasses(schoolId);
        toast({
          title: "Baarl",
          description: "Snf baaryla eklendi.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.message || 'Snf eklenemedi',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding class:', error);
    }
  };

  const handleEditClass = async () => {
    if (!selectedClass || !formData.gradeLevel || !formData.section) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/schools/${schoolId}/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gradeLevel: parseInt(formData.gradeLevel),
          section: formData.section,
        }),
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setSelectedClass(null);
        setFormData({ gradeLevel: '', section: '' });
        fetchClasses(schoolId);
        toast({
          title: "Baarl",
          description: "Snf baaryla gncellendi.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.message || 'Snf gncellenemedi',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/schools/${schoolId}/classes/${selectedClass.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsDeleteDialogOpen(false);
        setSelectedClass(null);
        fetchClasses(schoolId);
        toast({
          title: "Baarl",
          description: "Snf baaryla silindi.",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.message || 'Snf silinemedi',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Hata",
        description: 'Snf silinirken bir hata olutu',
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    setFormData({ gradeLevel: '', section: '' });
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (classItem: Class) => {
    setSelectedClass(classItem);
    // Mevcut snfn grade ve section deerlerini ayr
    setFormData({ 
      gradeLevel: classItem.grade.name, 
      section: classItem.name 
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsDeleteDialogOpen(true);
  };

  const openMergeDialog = () => {
    setMergeData({ sourceClassId: '', targetClassId: '' });
    setIsMergeDialogOpen(true);
  };

  const openTransferDialog = async (classItem: Class) => {
    setSelectedClass(classItem);
    setTransferData({ targetClassId: '' });
    setSelectedStudents([]);
    await fetchStudents(classItem.id);
    setIsTransferDialogOpen(true);
  };

  const fetchStudents = async (classId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/students?classId=${classId}`, {
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleMergeClasses = async () => {
    if (!mergeData.sourceClassId || !mergeData.targetClassId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/schools/${schoolId}/classes/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mergeData),
      });

      if (response.ok) {
        const result = await response.json();
        setIsMergeDialogOpen(false);
        fetchClasses(schoolId);
        toast({
          title: "Baarl",
          description: result.message,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.message || 'Snflar birletirilemedi',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error merging classes:', error);
      toast({
        title: "Hata",
        description: 'Birletirme srasnda bir hata olutu',
        variant: "destructive",
      });
    }
  };

  const handleTransferStudents = async () => {
    if (!selectedClass || !transferData.targetClassId) return;

    try {
      const token = localStorage.getItem('token');
      const body: any = { targetClassId: transferData.targetClassId };
      
      if (selectedStudents.length > 0) {
        body.studentIds = selectedStudents;
      }

      const response = await fetch(`${API_URL}/schools/${schoolId}/classes/${selectedClass.id}/transfer-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        setIsTransferDialogOpen(false);
        setSelectedClass(null);
        setSelectedStudents([]);
        fetchClasses(schoolId);
        toast({
          title: "Baarl",
          description: result.message,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.message || 'renciler aktarlamad',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error transferring students:', error);
      toast({
        title: "Hata",
        description: 'Aktarma srasnda bir hata olutu',
        variant: "destructive",
      });
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Snf Ynetimi</h1>
          <p className="text-muted-foreground">Okuldaki snflar ynetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openMergeDialog}>
            <Merge className="mr-2 h-4 w-4" />
            Snf Birletir
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Snf Ekle
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Snf</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam renci</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((sum, c) => sum + c._count.students, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Snf Seviyesi</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{FIXED_GRADES.length}</div>
            <p className="text-xs text-muted-foreground">Farkl snf seviyesi</p>
          </CardContent>
        </Card>
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Snflar</CardTitle>
          <CardDescription>Tm snflar grntleyin ve ynetin</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Snf</TableHead>
                <TableHead>ube</TableHead>
                <TableHead>renci Says</TableHead>
                <TableHead className="text-right">lemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Ykleniyor...</TableCell>
                </TableRow>
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Henz snf eklenmemi</TableCell>
                </TableRow>
              ) : (
                classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">{classItem.grade.name}. Snf</TableCell>
                    <TableCell>{displayClassName(classItem)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {classItem._count.students} renci
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTransferDialog(classItem)}
                          disabled={classItem._count.students === 0}
                          title="renci Aktar"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(classItem)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(classItem)}
                          disabled={classItem._count.students > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Snf Ekle</DialogTitle>
            <DialogDescription>Yeni bir snf oluturun</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Snf Seviyesi</Label>
              <Select
                value={formData.gradeLevel}
                onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seiniz" />
                </SelectTrigger>
                <SelectContent>
                  {FIXED_GRADES.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}. Snf
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">ube Ad</Label>
              <Input
                id="section"
                placeholder="rn: A, B, Szel, Saysal"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              ptal
            </Button>
            <Button onClick={handleAddClass}>Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Snf Dzenle</DialogTitle>
            <DialogDescription>Snf bilgilerini gncelleyin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-grade">Snf Seviyesi</Label>
              <Select
                value={formData.gradeLevel}
                onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seiniz" />
                </SelectTrigger>
                <SelectContent>
                  {FIXED_GRADES.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name}. Snf
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-section">ube Ad</Label>
              <Input
                id="edit-section"
                placeholder="rn: A, B, Szel, Saysal"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ptal
            </Button>
            <Button onClick={handleEditClass}>Gncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Snf Sil</DialogTitle>
            <DialogDescription>
              {selectedClass && displayClassName(selectedClass)} snfn silmek istediinizden emin misiniz?
              Bu ilem geri alnamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              ptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteClass}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Classes Dialog */}
      <Dialog open={isMergeDialogOpen} onOpenChange={setIsMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Snflar Birletir</DialogTitle>
            <DialogDescription>
              Kaynak snftaki tm renciler hedef snfa aktarlacak ve kaynak snf silinecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kaynak Snf (Silinecek)</Label>
              <Select
                value={mergeData.sourceClassId}
                onValueChange={(value) => setMergeData({ ...mergeData, sourceClassId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seiniz" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {displayClassName(cls)} ({cls._count.students} renci)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hedef Snf</Label>
              <Select
                value={mergeData.targetClassId}
                onValueChange={(value) => setMergeData({ ...mergeData, targetClassId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seiniz" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter(cls => cls.id !== mergeData.sourceClassId)
                    .map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {displayClassName(cls)} ({cls._count.students} renci)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMergeDialogOpen(false)}>
              ptal
            </Button>
            <Button onClick={handleMergeClasses}>Birletir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Students Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>renci Aktar</DialogTitle>
            <DialogDescription>
              {selectedClass && displayClassName(selectedClass)} snfndan renci aktarn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Hedef Snf</Label>
              <Select
                value={transferData.targetClassId}
                onValueChange={(value) => setTransferData({ targetClassId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seiniz" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter(cls => cls.id !== selectedClass?.id)
                    .map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {displayClassName(cls)} ({cls._count.students} renci)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>renci Seimi</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllStudents}
                >
                  {selectedStudents.length === students.length ? 'Tmn Kaldr' : 'Tmn Se'}
                </Button>
              </div>
              <div className="border rounded-md max-h-64 overflow-y-auto">
                {students.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Bu snfta renci bulunmuyor
                  </div>
                ) : (
                  <div className="divide-y">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2 p-3 hover:bg-muted">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudentSelection(student.id)}
                        />
                        <label className="flex-1 text-sm cursor-pointer">
                          {student.studentNumber} - {student.user.firstName} {student.user.lastName}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedStudents.length > 0
                  ? `${selectedStudents.length} renci seildi`
                  : 'Hi renci seilmedi (tm renciler aktarlacak)'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
              ptal
            </Button>
            <Button onClick={handleTransferStudents}>
              {selectedStudents.length > 0 ? 'Seilenleri Aktar' : 'Tmn Aktar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

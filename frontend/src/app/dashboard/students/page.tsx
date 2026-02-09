"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    GraduationCap,
    Plus,
    Search,
    UserCircle,
    MoreVertical,
    Edit,
    Trash2,
    Key,
    FileUp,
    Users,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AddStudentModal } from "@/components/students/add-student-modal";
import { EditStudentModal } from "@/components/students/edit-student-modal";
import { ChangePasswordModal } from "@/components/students/change-password-modal";
import { ChangeParentPasswordModal } from "@/components/students/change-parent-password-modal";
import { ImportStudentsModal } from "@/components/students/import-students-modal";
import { BulkTransferModal } from "@/components/students/bulk-transfer-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { API_BASE_URL } from '@/lib/auth';

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [filters, setFilters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("all");
    const [selectedClass, setSelectedClass] = useState("all");
    const [userRole, setUserRole] = useState<string>('');

    // Selection state
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [isBulkTransferOpen, setIsBulkTransferOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editStudent, setEditStudent] = useState<any>(null);
    const [passwordStudent, setPasswordStudent] = useState<any>(null);
    const [parentPasswordStudent, setParentPasswordStudent] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");
        setUserRole(user.role || '');

        try {
            // Fetch filters
            const filtersRes = await fetch(`${API_BASE_URL}/students/filters`, {
            });
            const filtersData = await filtersRes.json();
            setFilters(filtersData);

            // Fetch students
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (selectedGrade && selectedGrade !== "all") params.append("gradeId", selectedGrade);
            if (selectedClass && selectedClass !== "all") params.append("classId", selectedClass);

            const studentsRes = await fetch(`${API_BASE_URL}/students?${params.toString()}`, {
            });
            const studentsData = await studentsRes.json();
            setStudents(studentsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search, selectedGrade, selectedClass]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(students.map(s => s.id));
            setSelectedStudents(allIds);
        } else {
            setSelectedStudents(new Set());
        }
    };

    const handleSelectStudent = (studentId: string, checked: boolean) => {
        const newSelected = new Set(selectedStudents);
        if (checked) {
            newSelected.add(studentId);
        } else {
            newSelected.delete(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const handleBulkDelete = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE_URL}/students/bulk-delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ studentIds: Array.from(selectedStudents) }),
            });

            if (res.ok) {
                setSelectedStudents(new Set());
                setIsBulkDeleteOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const token = localStorage.getItem("token");
        try {
            await fetch(`${API_BASE_URL}/students/${deleteId}`, {
                method: "DELETE",
            });
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteId(null);
        }
    };

    const getStudentAvatarUrl = (student: any) => {
        if (student.user.avatarSeed) {
            const parts = student.user.avatarSeed.split(':');
            if (parts.length === 2) {
                return `https://api.dicebear.com/7.x/${parts[0]}/svg?seed=${parts[1]}`;
            }
        }
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.user.firstName}`;
    };

    const classesList = filters.find(g => g.id === selectedGrade)?.classes || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-indigo-600" />
                        Öðrenciler
                    </h2>
                    <p className="text-slate-500">Okulunuzdaki öðrencileri yönetin ve kaydedin.</p>
                </div>
                {userRole !== 'TEACHER' && (
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsImportOpen(true)}>
                            <FileUp className="h-4 w-4" />
                            Excel'den Yükle
                        </Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-600/20" onClick={() => setIsAddOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Yeni Öðrenci
                        </Button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                {/* Bulk Actions Bar */}
                {selectedStudents.size > 0 && userRole !== 'TEACHER' && (
                    <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                            {selectedStudents.size} öðrenci seçildi
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => setIsBulkTransferOpen(true)}
                            >
                                <Users className="h-4 w-4" />
                                Sýnýf Deðiþtir
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={() => setIsBulkDeleteOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Toplu Sil
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Öðrenci adý, no veya TC ile ara..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        value={selectedGrade}
                        onValueChange={(value) => {
                            setSelectedGrade(value);
                            setSelectedClass("all");
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tüm Sýnýflar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Sýnýflar</SelectItem>
                            {filters.map((grade) => (
                                <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={selectedClass}
                        onValueChange={(value) => setSelectedClass(value)}
                        disabled={!selectedGrade || selectedGrade === "all"}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Tüm Þubeler" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Þubeler</SelectItem>
                            {classesList.map((cls: any) => (
                                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                                {userRole !== 'TEACHER' && (
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={students.length > 0 && selectedStudents.size === students.length}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                )}
                                <TableHead className="w-[80px] text-slate-600 dark:text-slate-400 font-semibold">Profil</TableHead>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Öðrenci Bilgileri</TableHead>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Sýnýf/Þube</TableHead>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Öðrenci No / TC</TableHead>
                                <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">Ýþlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={userRole !== 'TEACHER' ? 6 : 5} className="text-center py-10 text-slate-500">
                                        Yüklüyor...
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={userRole !== 'TEACHER' ? 6 : 5} className="text-center py-10 text-slate-500">
                                        Öðrenci bulunamadý.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => (
                                    <TableRow key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        {userRole !== 'TEACHER' && (
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedStudents.has(student.id)}
                                                    onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                                                />
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <Avatar className="h-10 w-10 border-2 border-indigo-200 dark:border-indigo-800">
                                                <AvatarImage src={getStudentAvatarUrl(student)} />
                                                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">
                                                    {student.user.firstName[0]}{student.user.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <a 
                                                href={`/dashboard/student/results?studentId=${student.id}`}
                                                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                            >
                                                {student.user.firstName} {student.user.lastName}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                                    {student.class.grade.name}
                                                </Badge>
                                                <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800">
                                                    {student.class.name}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                <span className="text-slate-400 dark:text-slate-500 font-normal">No:</span> {student.studentNumber || "-"}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                <span className="text-slate-400 dark:text-slate-500 font-medium">TC:</span> {student.tcNo || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    {userRole !== 'TEACHER' && (
                                                        <DropdownMenuItem onClick={() => setEditStudent(student)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Düzenle
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => setPasswordStudent(student)}>
                                                        <Key className="mr-2 h-4 w-4" /> Öðrenci Þifresi Deðiþtir
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setParentPasswordStudent(student)} className="text-purple-600">
                                                        <Key className="mr-2 h-4 w-4" /> Veli Þifresi Deðiþtir
                                                    </DropdownMenuItem>
                                                    {userRole !== 'TEACHER' && (
                                                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(student.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Sil
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modals */}
            <AddStudentModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                onSuccess={fetchData}
            />
            {editStudent && (
                <EditStudentModal
                    student={editStudent}
                    open={!!editStudent}
                    onOpenChange={(open: boolean) => !open && setEditStudent(null)}
                    onSuccess={fetchData}
                />
            )}
            {passwordStudent && (
                <ChangePasswordModal
                    student={passwordStudent}
                    open={!!passwordStudent}
                    onOpenChange={(open: boolean) => !open && setPasswordStudent(null)}
                />
            )}
            {parentPasswordStudent && (
                <ChangeParentPasswordModal
                    student={parentPasswordStudent}
                    open={!!parentPasswordStudent}
                    onOpenChange={(open: boolean) => !open && setParentPasswordStudent(null)}
                />
            )}
            <ImportStudentsModal
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                onSuccess={fetchData}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Öðrenciyi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu öðrenciyi ve tüm verilerini silmek istediðinize emin misiniz? Bu iþlem geri alýnamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                            Evet, Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Dialog */}
            <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Toplu Öðrenci Silme</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedStudents.size} öðrenciyi ve tüm verilerini silmek istediðinize emin misiniz? Bu iþlem geri alýnamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleBulkDelete}>
                            Evet, {selectedStudents.size} Öðrenciyi Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Transfer Modal */}
            <BulkTransferModal
                isOpen={isBulkTransferOpen}
                onClose={() => setIsBulkTransferOpen(false)}
                onSuccess={() => {
                    setSelectedStudents(new Set());
                    fetchData();
                }}
                selectedCount={selectedStudents.size}
                studentIds={Array.from(selectedStudents)}
            />
        </div>
    );
}

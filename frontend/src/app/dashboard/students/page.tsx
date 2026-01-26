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
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AddStudentModal } from "@/components/students/add-student-modal";
import { EditStudentModal } from "@/components/students/edit-student-modal";
import { ChangePasswordModal } from "@/components/students/change-password-modal";
import { ImportStudentsModal } from "@/components/students/import-students-modal";
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

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [filters, setFilters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("");
    const [selectedClass, setSelectedClass] = useState("");

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editStudent, setEditStudent] = useState<any>(null);
    const [passwordStudent, setPasswordStudent] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");

        try {
            // Fetch filters
            const filtersRes = await fetch("http://localhost:3001/students/filters", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const filtersData = await filtersRes.json();
            setFilters(filtersData);

            // Fetch students
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (selectedGrade) params.append("gradeId", selectedGrade);
            if (selectedClass) params.append("classId", selectedClass);

            const studentsRes = await fetch(`http://localhost:3001/students?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
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

    const handleDelete = async () => {
        if (!deleteId) return;
        const token = localStorage.getItem("token");
        try {
            await fetch(`http://localhost:3001/students/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteId(null);
        }
    };

    const classesList = filters.find(g => g.id === selectedGrade)?.classes || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-indigo-600" />
                        Öğrenciler
                    </h2>
                    <p className="text-slate-500">Okulunuzdaki öğrencileri yönetin ve kaydedin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsImportOpen(true)}>
                        <FileUp className="h-4 w-4" />
                        Excel'den Yükle
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-600/20" onClick={() => setIsAddOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Yeni Öğrenci
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Öğrenci adı, no veya TC ile ara..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Select
                        value={selectedGrade}
                        onChange={(e) => {
                            setSelectedGrade(e.target.value);
                            setSelectedClass("");
                        }}
                    >
                        <option value="">Tüm Sınıflar</option>
                        {filters.map((grade) => (
                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                    </Select>
                    <Select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        disabled={!selectedGrade}
                    >
                        <option value="">Tüm Şubeler</option>
                        {classesList.map((cls: any) => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </Select>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
                    <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead className="w-[80px] text-slate-600 dark:text-slate-400 font-semibold">Profil</TableHead>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Öğrenci Bilgileri</TableHead>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Sınıf/Şube</TableHead>
                                <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Öğrenci No / TC</TableHead>
                                <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        Öğrenci bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student) => (
                                    <TableRow key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                        <TableCell>
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                                                {student.user.firstName[0]}{student.user.lastName[0]}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-slate-900 dark:text-slate-100">{student.user.firstName} {student.user.lastName}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{student.user.email}</div>
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
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => setEditStudent(student)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Düzenle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setPasswordStudent(student)}>
                                                        <Key className="mr-2 h-4 w-4" /> Şifre Değiştir
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(student.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Sil
                                                    </DropdownMenuItem>
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
            <ImportStudentsModal
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                onSuccess={fetchData}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Öğrenciyi Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu öğrenciyi ve tüm verilerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
        </div>
    );
}

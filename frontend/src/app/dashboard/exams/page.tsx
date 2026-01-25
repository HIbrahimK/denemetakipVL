"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart2,
    Edit,
    FileSpreadsheet,
    MoreHorizontal,
    Trash2,
    Users
} from "lucide-react";
import { CreateExamModal } from "@/components/create-exam-modal";
import { EditExamModal } from "@/components/edit-exam-modal";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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

export default function ExamsPage() {
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<'exam' | 'results' | null>(null);
    const [editExam, setEditExam] = useState<any>(null);

    const fetchExams = () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            window.location.href = '/';
            return;
        }

        const user = JSON.parse(userStr);
        const schoolId = user.schoolId;

        if (!schoolId) return;

        setLoading(true);
        fetch(`http://localhost:3001/exams?schoolId=${schoolId}`)
            .then(res => res.json())
            .then(data => {
                setExams(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleDelete = async () => {
        if (!deleteId || !deleteType) return;

        const endpoint = deleteType === 'exam'
            ? `http://localhost:3001/exams/${deleteId}`
            : `http://localhost:3001/exams/${deleteId}/results`;

        try {
            const res = await fetch(endpoint, { method: 'DELETE' });
            if (res.ok) {
                fetchExams();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteId(null);
            setDeleteType(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sınavlar</h2>
                    <p className="text-slate-500 dark:text-slate-400">Tüm deneme sınavlarını buradan yönetebilirsiniz.</p>
                </div>
                <CreateExamModal onSuccess={fetchExams} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-slate-500 dark:text-slate-400 col-span-full text-center py-10">Yükleniyor...</p>
                ) : exams.length === 0 ? (
                    <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400">Henüz sınav oluşturulmamış.</p>
                    </div>
                ) : exams.map((exam) => (
                    <Card key={exam.id} className="group hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-800 dark:bg-slate-900">
                        <CardHeader className="relative pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 mb-2">
                                        {exam.type}
                                    </span>
                                    <CardTitle className="line-clamp-1 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {exam.title}
                                    </CardTitle>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {new Date(exam.date).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 text-slate-400 hover:text-indigo-600">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/exams/${exam.id}/results`} className="cursor-pointer">
                                                <BarChart2 className="mr-2 h-4 w-4" /> İstatistikler
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer" onClick={() => setEditExam(exam)}>
                                            <Edit className="mr-2 h-4 w-4" /> Düzenle
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => { setDeleteId(exam.id); setDeleteType('results'); }}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Sonuçları Temizle
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => { setDeleteId(exam.id); setDeleteType('exam'); }}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Sınavı Sil
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm mb-6">
                                <div className="flex items-center gap-2">
                                    {exam._count?.attempts > 0 ? (
                                        <>
                                            <Users className="h-4 w-4 text-emerald-600" />
                                            <span className="font-medium text-emerald-600">{exam._count.attempts} Öğrenci Katıldı</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileSpreadsheet className="h-4 w-4 text-amber-500" />
                                            <span className="text-amber-500 font-medium">Sonuç Bekleniyor</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/dashboard/exams/${exam.id}/results`}>
                                        <BarChart2 className="mr-2 h-4 w-4" />
                                        Sonuçlar
                                    </Link>
                                </Button>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" asChild>
                                    <Link href={`/dashboard/import?examId=${exam.id}`}>
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Yükle
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <EditExamModal
                exam={editExam}
                open={!!editExam}
                onOpenChange={(open) => !open && setEditExam(null)}
                onSuccess={fetchExams}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteType === 'exam'
                                ? "Bu sınavı ve tüm bağlı verilerini kalıcı olarak silmek üzeresiniz. Bu işlem geri alınamaz."
                                : "Bu sınava ait yüklenmiş tüm öğrenci sonuçlarını silmek üzeresiniz. Sınav kaydı kalacaktır."
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                            Evet, Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

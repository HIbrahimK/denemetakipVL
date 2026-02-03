"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    BarChart2,
    Edit,
    Filter,
    CalendarRange,
    Layers,
    FileSpreadsheet,
    MoreHorizontal,
    Trash2,
    Users,
    Download
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
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [gradeFilter, setGradeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [userRole, setUserRole] = useState<string>('');

    const fetchExams = () => {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!userStr) {
            window.location.href = '/';
            return;
        }

        const user = JSON.parse(userStr);
        const schoolId = user.schoolId;
        setUserRole(user.role || '');

        if (!schoolId) return;

        setLoading(true);
        fetch(`http://localhost:3001/exams?schoolId=${schoolId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch exams');
                }
                return res.json();
            })
            .then(data => {
                // Ensure data is an array
                if (!Array.isArray(data)) {
                    console.error('Expected array but got:', data);
                    setExams([]);
                    setLoading(false);
                    return;
                }
                const sorted = [...data].sort((a, b) => {
                    const aDate = new Date(a.createdAt || a.date || 0).getTime();
                    const bDate = new Date(b.createdAt || b.date || 0).getTime();
                    return bDate - aDate;
                });
                setExams(sorted);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setExams([]);
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
            const token = localStorage.getItem('token');
            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });
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

    const filteredExams = useMemo(() => {
        let list = [...exams];
        if (typeFilter !== 'ALL') {
            list = list.filter(e => e.type === typeFilter);
        }
        if (gradeFilter) {
            const gradeNum = parseInt(gradeFilter);
            list = list.filter(e => Number(e.gradeLevel) === gradeNum);
        }
        if (startDate) {
            const start = new Date(startDate).getTime();
            list = list.filter(e => new Date(e.date).getTime() >= start);
        }
        if (endDate) {
            const end = new Date(endDate).getTime();
            list = list.filter(e => new Date(e.date).getTime() <= end);
        }
        return list;
    }, [exams, typeFilter, gradeFilter, startDate, endDate]);

    const resetFilters = () => {
        setTypeFilter('ALL');
        setGradeFilter('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sınavlar</h2>
                    <p className="text-slate-500 dark:text-slate-400">Tüm deneme sınavlarını buradan yönetebilirsiniz. Takvim görünümü için <Link href="/dashboard/exams/calendar" className="text-indigo-600 hover:underline font-medium">Deneme Takvimi</Link> sayfasını ziyaret edin.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/exams/calendar">
                            <CalendarRange className="mr-2 h-4 w-4" />
                            Deneme Takvimi
                        </Link>
                    </Button>
                    {userRole === 'SCHOOL_ADMIN' && <CreateExamModal onSuccess={fetchExams} />}
                </div>
            </div>

            {/* Filters */}
            <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-indigo-50 to-slate-50 dark:from-slate-900 dark:via-slate-900/70 dark:to-slate-900">
                <CardHeader className="pb-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                        <Filter className="h-4 w-4" /> Filtrele ve sırala
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sınav türü, tarih aralığı ve sınıf seviyesine göre listeyi daraltın. Son eklenen üstte.</p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2"><Layers className="h-4 w-4" /> Sınav Türü</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">Tümü</option>
                            <option value="TYT">TYT</option>
                            <option value="AYT">AYT</option>
                            <option value="LGS">LGS</option>
                            <option value="OZEL">Özel</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2"><Users className="h-4 w-4" /> Sınıf Seviyesi</label>
                        <select
                            value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value)}
                            className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Tümü</option>
                            {[5,6,7,8,9,10,11,12].map(grade => (
                                <option key={grade} value={grade}>{grade}. Sınıf</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2"><CalendarRange className="h-4 w-4" /> Başlangıç</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2"><CalendarRange className="h-4 w-4" /> Bitiş</label>
                        <div className="flex gap-2 items-center">
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="h-10"
                            />
                            <Button variant="outline" size="icon" className="shrink-0 border-slate-300 dark:border-slate-700" onClick={resetFilters}>
                                Sıfırla
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-slate-500 dark:text-slate-400 col-span-full text-center py-10">Yükleniyor...</p>
                ) : filteredExams.length === 0 ? (
                    <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400">Filtrelere uyan sınav bulunamadı.</p>
                    </div>
                ) : filteredExams.map((exam) => (
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
                                        {userRole === 'SCHOOL_ADMIN' && (
                                            <>
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
                                            </>
                                        )}
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
                                        Veri Yükle
                                    </Link>
                                </Button>
                            </div>
                            {exam.answerKeyUrl && (
                                <Button
                                    variant="outline"
                                    className="w-full mt-3 gap-2"
                                    onClick={() => window.open(`http://localhost:3001${exam.answerKeyUrl}`, '_blank')}
                                >
                                    <Download className="h-4 w-4" />
                                    Cevap Anahtarı
                                </Button>
                            )}
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

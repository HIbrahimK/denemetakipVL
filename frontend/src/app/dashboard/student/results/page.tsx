"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { API_BASE_URL } from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart3,
    TrendingUp,
    Target,
    Award,
    Loader2,
    Search,
    Calendar,
    BookOpen,
    ChevronRight,
    Download,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

type ExamType = 'TYT' | 'AYT' | 'LGS';
type ProgressRange = 'LAST_5' | 'LAST_10' | 'ALL';

interface LessonResult {
    lessonName: string;
    correct: number;
    incorrect: number;
    empty: number;
    net: number;
    point: number;
}

interface ExamScore {
    type: string;
    score: number;
    rankSchool: number | null;
    rankClass: number | null;
    rankDistrict: number | null;
    rankCity: number | null;
    rankGen: number | null;
}

interface ExamAttempt {
    attemptId: string;
    examId: string;
    examTitle: string;
    examDate: string;
    examType: ExamType;
    publisher: string | null;
    totalNet: number;
    lessonResults: LessonResult[];
    scores: ExamScore[];
    primaryScoreType?: string | null;
    schoolAverageNet?: number | null;
    classAverageNet?: number | null;
    schoolAverageScore?: number | null;
    classAverageScore?: number | null;
    schoolParticipantCount: number | null;
    districtParticipantCount: number | null;
    cityParticipantCount: number | null;
    generalParticipantCount: number | null;
    answerKeyUrl?: string | null;
}

interface MissedExam {
    id: string;
    title: string;
    date: string;
    type: ExamType;
    publisher: string | null;
}

interface StudentData {
    studentInfo: {
        id: string;
        firstName: string;
        lastName: string;
        studentNumber: string | null;
        className: string;
        gradeName: string;
    };
    statistics: {
        totalExams: number;
        highestScore: number;
        avgSchoolRank: number | null;
    };
    examHistory: ExamAttempt[];
    missedExams: MissedExam[];
}

function StudentResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const studentId = searchParams.get('studentId');
    const [data, setData] = useState<StudentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedExamType, setSelectedExamType] = useState<ExamType | 'ALL'>('ALL');
    const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
    const [progressRange, setProgressRange] = useState<ProgressRange>('LAST_10');
    const [includePreviousYear, setIncludePreviousYear] = useState(false);
    const formatTooltipValue = (value: number | string | undefined) =>
        typeof value === 'number' || typeof value === 'string'
            ? Number(value).toFixed(2)
            : '-';

    useEffect(() => {
        const fetchData = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            try {
                // If studentId is provided in URL, use it (for admin/teacher view)
                // Otherwise use /me/exams (for student's own view)
                const endpoint = studentId 
                    ? `${API_BASE_URL}/students/${studentId}/exams`
                    : `${API_BASE_URL}/students/me/exams`;
                    
                const response = await fetch(endpoint, {
                    credentials: 'include',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        router.push('/login/student');
                        return;
                    }
                    throw new Error('Sonuçlar alınamadı.');
                }

                const result = await response.json();
                if (!result?.studentInfo || !Array.isArray(result?.examHistory)) {
                    throw new Error('Geçersiz yanıt alındı.');
                }
                setData(result);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    setError('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
                } else {
                    setError('Sonuçlar yüklenirken hata oluştu.');
                }
            } finally {
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId, router]);

    // Determine available exam types based on grade
    const availableExamTypes = useMemo(() => {
        if (!data || !data.studentInfo || !data.studentInfo.gradeName) return [];
        const grade = data.studentInfo.gradeName;
        
        // 5-8: LGS
        if (['5', '6', '7', '8'].some(g => grade.includes(g))) {
            return ['LGS'];
        }
        // 9-10: TYT
        if (['9', '10'].some(g => grade.includes(g))) {
            return ['TYT'];
        }
        // 11-12: TYT & AYT
        if (['11', '12'].some(g => grade.includes(g))) {
            return ['TYT', 'AYT'];
        }
        return ['TYT'];
    }, [data]);

    // Set initial exam type based on available types
    useEffect(() => {
        if (availableExamTypes.length > 0 && selectedExamType === 'ALL') {
            setSelectedExamType(availableExamTypes[0] as ExamType);
        }
    }, [availableExamTypes, selectedExamType]);

    const filteredExams = useMemo(() => {
        if (!data) return [];
        let exams = data.examHistory;

        if (selectedExamType !== 'ALL') {
            exams = exams.filter(e => e.examType === selectedExamType);
        }

        if (searchTerm) {
            exams = exams.filter(e =>
                e.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.publisher?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return exams;
    }, [data, selectedExamType, searchTerm]);

    // Calculate lesson averages for selected exam type
    const lessonAverages = useMemo(() => {
        if (!data || !filteredExams || filteredExams.length === 0) return [];

        const lessonMap = new Map<string, { totalNet: number; count: number }>();

        filteredExams.forEach(exam => {
            exam.lessonResults.forEach(lesson => {
                const current = lessonMap.get(lesson.lessonName) || { totalNet: 0, count: 0 };
                current.totalNet += lesson.net;
                current.count += 1;
                lessonMap.set(lesson.lessonName, current);
            });
        });

        return Array.from(lessonMap.entries())
            .map(([name, data]) => ({
                name,
                avgNet: data.count > 0 ? data.totalNet / data.count : 0,
                count: data.count,
            }))
            .sort((a, b) => b.avgNet - a.avgNet);
    }, [data, filteredExams]);

    const progressExams = useMemo(() => {
        if (!filteredExams || filteredExams.length === 0) return [];

        const sortedByDateDesc = filteredExams
            .slice()
            .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());

        if (progressRange === 'ALL') {
            return sortedByDateDesc.slice().reverse();
        }

        const limit = progressRange === 'LAST_5' ? 5 : 10;
        return sortedByDateDesc.slice(0, limit).reverse();
    }, [filteredExams, progressRange]);

    const previousYearAverages = useMemo(() => {
        if (!progressExams || progressExams.length === 0 || !filteredExams || filteredExams.length === 0) {
            return null;
        }

        const rangeStart = new Date(progressExams[0].examDate);
        const rangeEnd = new Date(progressExams[progressExams.length - 1].examDate);
        if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
            return null;
        }

        const previousRangeStart = new Date(rangeStart);
        previousRangeStart.setFullYear(previousRangeStart.getFullYear() - 1);

        const previousRangeEnd = new Date(rangeEnd);
        previousRangeEnd.setFullYear(previousRangeEnd.getFullYear() - 1);

        const previousYearExams = filteredExams.filter((exam) => {
            const examDate = new Date(exam.examDate);
            if (Number.isNaN(examDate.getTime())) {
                return false;
            }
            return examDate >= previousRangeStart && examDate <= previousRangeEnd;
        });

        if (previousYearExams.length === 0) {
            return null;
        }

        const average = (values: Array<number | null | undefined>) => {
            const validValues = values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
            if (validValues.length === 0) return null;
            const sum = validValues.reduce((acc, value) => acc + value, 0);
            return Number((sum / validValues.length).toFixed(2));
        };

        return {
            studentPuan: average(previousYearExams.map((exam) => exam.scores[0]?.score ?? null)),
            classPuan: average(previousYearExams.map((exam) => exam.classAverageScore ?? null)),
            schoolPuan: average(previousYearExams.map((exam) => exam.schoolAverageScore ?? null)),
            studentNet: average(previousYearExams.map((exam) => exam.totalNet ?? null)),
            classNet: average(previousYearExams.map((exam) => exam.classAverageNet ?? null)),
            schoolNet: average(previousYearExams.map((exam) => exam.schoolAverageNet ?? null)),
            examCount: previousYearExams.length,
        };
    }, [filteredExams, progressExams]);

    // Progress chart data
    const progressData = useMemo(() => {
        if (!progressExams || progressExams.length === 0) return [];
        return progressExams.map((exam, idx) => {
            const primaryScore = exam.scores.length > 0 ? exam.scores[0].score : null;
            const schoolRank = exam.scores.length > 0 ? exam.scores[0].rankSchool : null;
            return {
                name: `${idx + 1}`,
                date: new Date(exam.examDate).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
                puan: primaryScore,
                net: exam.totalNet,
                classPuan: exam.classAverageScore ?? null,
                schoolPuan: exam.schoolAverageScore ?? null,
                classNet: exam.classAverageNet ?? null,
                schoolNet: exam.schoolAverageNet ?? null,
                prevStudentPuan: includePreviousYear ? previousYearAverages?.studentPuan ?? null : null,
                prevClassPuan: includePreviousYear ? previousYearAverages?.classPuan ?? null : null,
                prevSchoolPuan: includePreviousYear ? previousYearAverages?.schoolPuan ?? null : null,
                prevStudentNet: includePreviousYear ? previousYearAverages?.studentNet ?? null : null,
                prevClassNet: includePreviousYear ? previousYearAverages?.classNet ?? null : null,
                prevSchoolNet: includePreviousYear ? previousYearAverages?.schoolNet ?? null : null,
                siralama: schoolRank,
            };
        });
    }, [progressExams, includePreviousYear, previousYearAverages]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-10 gap-4">
                <p className="text-slate-600 dark:text-slate-400">{error}</p>
                <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center p-10 gap-4">
                <p className="text-slate-600 dark:text-slate-400">Veri yüklenemedi.</p>
                <Button onClick={() => router.push('/dashboard')}>Ana Sayfaya Dün</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 min-h-screen -mx-4 sm:-mx-8 px-4 sm:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Deneme Sonuçlarım
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {data.studentInfo.firstName} {data.studentInfo.lastName} {data.studentInfo.studentNumber && `(${data.studentInfo.studentNumber})`}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                        {data.studentInfo.gradeName} - {data.studentInfo.className}
                    </p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Deneme ara..."
                        className="pl-8 border-indigo-200 focus:border-indigo-400 dark:border-indigo-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Exam Type Tabs (Button Group) */}
            {availableExamTypes.length > 1 && (
                <div className="flex gap-2 pb-4">
                    {availableExamTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedExamType(type as ExamType)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                                selectedExamType === type
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Toplam Deneme</CardTitle>
                        <BarChart3 className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{filteredExams.length}</div>
                        <p className="text-xs text-white/70 mt-1">
                            {selectedExamType !== 'ALL' ? `${selectedExamType} denemeleri` : 'Tüm denemeler'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">En Yüksek Puan</CardTitle>
                        <TrendingUp className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {filteredExams.length > 0
                                ? Math.max(...filteredExams.flatMap(e => e.scores.map(s => s.score))).toFixed(2)
                                : '0.00'}
                        </div>
                        <p className="text-xs text-white/70 mt-1">Son {filteredExams.length} denemede</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Ortalama Net</CardTitle>
                        <Target className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {filteredExams.length > 0
                                ? (filteredExams.reduce((sum, e) => sum + e.totalNet, 0) / filteredExams.length).toFixed(2)
                                : '0.00'}
                        </div>
                        <p className="text-xs text-white/70 mt-1">Toplam net ortalaması</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/90">Ortalama Sıralama</CardTitle>
                        <Award className="h-5 w-5 text-white/80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {data.statistics.avgSchoolRank || '-'}
                        </div>
                        <p className="text-xs text-white/70 mt-1">Okul sıralaması</p>
                    </CardContent>
                </Card>
            </div>

            {/* Lesson Cards */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Ders Ortalamaları
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                    {lessonAverages.map((lesson, idx) => {
                        const gradients = [
                            'from-blue-500 to-indigo-600',
                            'from-purple-500 to-pink-600',
                            'from-emerald-500 to-teal-600',
                            'from-orange-500 to-red-600',
                            'from-cyan-500 to-blue-600',
                            'from-fuchsia-500 to-purple-600',
                            'from-lime-500 to-green-600',
                            'from-amber-500 to-orange-600',
                        ];
                        const gradient = gradients[idx % gradients.length];
                        
                        return (
                            <Card
                                key={lesson.name}
                                className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg transform relative overflow-hidden group ${
                                    selectedLesson === lesson.name
                                        ? 'ring-2 ring-indigo-500 scale-[1.02] shadow-lg'
                                        : ''
                                }`}
                                onClick={() => setSelectedLesson(selectedLesson === lesson.name ? null : lesson.name)}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                <div className="absolute top-2 right-2">
                                    {selectedLesson === lesson.name && (
                                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                                    )}
                                </div>
                                <CardHeader className="px-3 pb-2 pt-3">
                                    <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center line-clamp-2 min-h-[2.2rem] flex items-center justify-center">
                                        {lesson.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-3 pb-3 pt-0">
                                    <div className={`text-2xl font-bold text-center bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                                        {lesson.avgNet.toFixed(1)}
                                    </div>
                                    <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-1.5">
                                        {lesson.count} deneme
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Lesson Detail Panel */}
            {selectedLesson && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center justify-between">
                            <span>{selectedLesson} Detayı</span>
                            <button
                                onClick={() => setSelectedLesson(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ?
                            </button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={filteredExams
                                        .slice()
                                        .reverse()
                                        .map((exam, idx) => {
                                            const lessonResult = exam.lessonResults.find(
                                                l => l.lessonName === selectedLesson
                                            );
                                            return {
                                                name: `${idx + 1}`,
                                                net: lessonResult?.net || 0,
                                            };
                                        })}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                                    <YAxis style={{ fontSize: '10px' }} />
                                    <Tooltip formatter={formatTooltipValue} />
                                    <Line type="monotone" dataKey="net" stroke="#4f46e5" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Son 5 Deneme
                            </h3>
                            {filteredExams.slice(0, 5).map(exam => {
                                const lessonResult = exam.lessonResults.find(l => l.lessonName === selectedLesson);
                                if (!lessonResult) return null;
                                return (
                                    <div
                                        key={exam.attemptId}
                                        className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2"
                                    >
                                        <span className="text-slate-600 dark:text-slate-400 truncate flex-1">
                                            {exam.examTitle}
                                        </span>
                                        <div className="flex gap-2 items-center ml-2">
                                            <span className="text-emerald-600 font-semibold">{lessonResult.correct}D</span>
                                            <span className="text-red-500">{lessonResult.incorrect}Y</span>
                                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                                {lessonResult.net.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Exam Cards Grid */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Girdiğim Denemeler ({filteredExams.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExams.map(exam => {
                        const primaryScore = exam.scores.length > 0 ? exam.scores[0] : null;
                        return (
                            <Card
                                key={exam.attemptId}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => {
                                    const url = studentId 
                                        ? `/dashboard/student/results/${exam.examId}?studentId=${studentId}`
                                        : `/dashboard/student/results/${exam.examId}`;
                                    router.push(url);
                                }}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-sm font-semibold line-clamp-2">
                                                {exam.examTitle}
                                            </CardTitle>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                {exam.publisher || exam.examType}
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(exam.examDate).toLocaleDateString('tr-TR')}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-indigo-50 dark:bg-indigo-950 p-2 rounded">
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Puan</p>
                                            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                                {primaryScore?.score.toFixed(2) || '-'}
                                            </p>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-950 p-2 rounded">
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Net</p>
                                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                {exam.totalNet.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Sıralamalar */}
                                    <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-2">
                                        {primaryScore?.rankClass && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600 dark:text-slate-400">Sınıf Sırası:</span>
                                                <span className="font-semibold">
                                                    {primaryScore.rankClass}
                                                    {/* Sınıf katılımcı sayısı bilinmiyor; yalnızca sırayı gösteriyoruz */}
                                                </span>
                                            </div>
                                        )}
                                        {primaryScore?.rankSchool && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600 dark:text-slate-400">Okul Sırası:</span>
                                                <span className="font-semibold">
                                                    {primaryScore.rankSchool}
                                                    {exam.schoolParticipantCount && (
                                                        <span className="text-slate-500">/{exam.schoolParticipantCount}</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {primaryScore?.rankDistrict && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600 dark:text-slate-400">İlçe Sırası:</span>
                                                <span className="font-semibold">
                                                    {primaryScore.rankDistrict}
                                                    {exam.districtParticipantCount && (
                                                        <span className="text-slate-500">/{exam.districtParticipantCount}</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {primaryScore?.rankCity && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600 dark:text-slate-400">İl Sırası:</span>
                                                <span className="font-semibold">
                                                    {primaryScore.rankCity}
                                                    {exam.cityParticipantCount && (
                                                        <span className="text-slate-500">/{exam.cityParticipantCount}</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {primaryScore?.rankGen && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600 dark:text-slate-400">Genel Sıra:</span>
                                                <span className="font-semibold">
                                                    {primaryScore.rankGen}
                                                    {exam.generalParticipantCount && (
                                                        <span className="text-slate-500">/{exam.generalParticipantCount}</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {exam.answerKeyUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full gap-2 mt-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(`${API_BASE_URL}/exams/${exam.examId}/answer-key`, '_blank');
                                            }}
                                        >
                                            <Download className="h-3 w-3" />
                                            Cevap Anahtarı
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Progress Charts - Deneme listesinin altinda */}
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Gelisim Grafikleri
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                        <Tabs value={progressRange} onValueChange={(value) => setProgressRange(value as ProgressRange)}>
                            <TabsList className="grid h-9 grid-cols-3">
                                <TabsTrigger value="LAST_5" className="px-3 text-xs">Son 5 Deneme</TabsTrigger>
                                <TabsTrigger value="LAST_10" className="px-3 text-xs">Son 10 Deneme</TabsTrigger>
                                <TabsTrigger value="ALL" className="px-3 text-xs">Tum Denemeler</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <Checkbox
                                checked={includePreviousYear}
                                onCheckedChange={(checked) => setIncludePreviousYear(Boolean(checked))}
                            />
                            Onceki yil ortalamalarini goster
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Puan Karsilastirma ({progressExams.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={progressData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" style={{ fontSize: '10px' }} />
                                    <YAxis style={{ fontSize: '10px' }} />
                                    <Tooltip formatter={formatTooltipValue} />
                                    <Legend />
                                    <Line type="monotone" dataKey="puan" stroke="#4f46e5" strokeWidth={2} name="Ogrenci" />
                                    <Line type="monotone" dataKey="classPuan" stroke="#f59e0b" strokeWidth={2} name="Sinif Ort." />
                                    <Line type="monotone" dataKey="schoolPuan" stroke="#0ea5e9" strokeWidth={2} name="Okul Ort." />
                                    {includePreviousYear && previousYearAverages?.classPuan !== null && (
                                        <Line
                                            type="monotone"
                                            dataKey="prevClassPuan"
                                            stroke="#f59e0b"
                                            strokeDasharray="6 4"
                                            strokeWidth={1.5}
                                            name="Gecen Yil Sinif Ort."
                                            dot={false}
                                        />
                                    )}
                                    {includePreviousYear && previousYearAverages?.schoolPuan !== null && (
                                        <Line
                                            type="monotone"
                                            dataKey="prevSchoolPuan"
                                            stroke="#0ea5e9"
                                            strokeDasharray="6 4"
                                            strokeWidth={1.5}
                                            name="Gecen Yil Okul Ort."
                                            dot={false}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Net Karsilastirma ({progressExams.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={progressData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" style={{ fontSize: '10px' }} />
                                    <YAxis style={{ fontSize: '10px' }} />
                                    <Tooltip formatter={formatTooltipValue} />
                                    <Legend />
                                    <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} name="Ogrenci" />
                                    <Line type="monotone" dataKey="classNet" stroke="#f97316" strokeWidth={2} name="Sinif Ort." />
                                    <Line type="monotone" dataKey="schoolNet" stroke="#0284c7" strokeWidth={2} name="Okul Ort." />
                                    {includePreviousYear && previousYearAverages?.classNet !== null && (
                                        <Line
                                            type="monotone"
                                            dataKey="prevClassNet"
                                            stroke="#f97316"
                                            strokeDasharray="6 4"
                                            strokeWidth={1.5}
                                            name="Gecen Yil Sinif Ort."
                                            dot={false}
                                        />
                                    )}
                                    {includePreviousYear && previousYearAverages?.schoolNet !== null && (
                                        <Line
                                            type="monotone"
                                            dataKey="prevSchoolNet"
                                            stroke="#0284c7"
                                            strokeDasharray="6 4"
                                            strokeWidth={1.5}
                                            name="Gecen Yil Okul Ort."
                                            dot={false}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                {includePreviousYear && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Gecen yil karsilastirmasi ayni tarih araligindaki
                        {` ${previousYearAverages?.examCount ?? 0} `}
                        denemenin ortalamasina gore hesaplandi.
                    </p>
                )}
            </div>

            {/* Missed Exams */}
            {data.missedExams.length > 0 && (
                <Card className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Girilmeyen Denemeler ({data.missedExams.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {data.missedExams.map(exam => (
                                <div
                                    key={exam.id}
                                    className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800"
                                >
                                    <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                                        {exam.title}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(exam.date).toLocaleDateString('tr-TR')}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                            {exam.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function StudentResultsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <StudentResultsContent />
        </Suspense>
    );
}

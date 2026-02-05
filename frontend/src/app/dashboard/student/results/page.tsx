"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

type ExamType = 'TYT' | 'AYT' | 'LGS';

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
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedExamType, setSelectedExamType] = useState<ExamType | 'ALL'>('ALL');
    const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                // If studentId is provided in URL, use it (for admin/teacher view)
                // Otherwise use /me/exams (for student's own view)
                const endpoint = studentId 
                    ? `http://localhost:3001/students/${studentId}/exams`
                    : "http://localhost:3001/students/me/exams";
                    
                const response = await fetch(endpoint, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                const result = await response.json();
                console.log('Student exam data:', result);
                if (result.examHistory && result.examHistory.length > 0) {
                    console.log('First exam sample:', result.examHistory[0]);
                }
                setData(result);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching exam history:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId]);

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
    }, [data, selectedExamType, searchTerm]);

    // Progress chart data
    const progressData = useMemo(() => {
        if (!data || !filteredExams) return [];
        return filteredExams
            .slice()
            .reverse()
            .map((exam, idx) => {
                const primaryScore = exam.scores.length > 0 ? exam.scores[0].score : 0;
                const schoolRank = exam.scores.length > 0 ? exam.scores[0].rankSchool : null;
                return {
                    name: `${idx + 1}`,
                    date: new Date(exam.examDate).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
                    puan: primaryScore,
                    net: exam.totalNet,
                    sıralama: schoolRank,
                };
            });
    }, [data, selectedExamType, searchTerm]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center p-10 gap-4">
                <p className="text-slate-600 dark:text-slate-400">Veri yüklenemedi.</p>
                <Button onClick={() => router.push('/dashboard')}>Ana Sayfaya Dön</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 min-h-screen -mx-4 sm:-mx-8 px-4 sm:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Deneme Sonuçlarım <span className="filter-none">🎯</span>
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="filter-none">📚</span> Ders Ortalamaları
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                                className={`cursor-pointer transition-all hover:scale-105 hover:shadow-xl transform relative overflow-hidden group ${
                                    selectedLesson === lesson.name
                                        ? 'ring-4 ring-indigo-500 scale-105 shadow-xl'
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
                                <CardHeader className="pb-3 pt-4">
                                    <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                                        {lesson.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pb-4 pt-0">
                                    <div className={`text-3xl font-bold text-center bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                                        {lesson.avgNet.toFixed(1)}
                                    </div>
                                    <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
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
                                ✕
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
                                    <Tooltip formatter={(value: any) => Number(value).toFixed(2)} />
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
                                                window.open(`http://localhost:3001${exam.answerKeyUrl}`, '_blank');
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

            {/* Progress Charts - Deneme listesinin altında */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Puan Gelişimi</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" style={{ fontSize: '10px' }} />
                                <YAxis style={{ fontSize: '10px' }} />
                                <Tooltip formatter={(value: any) => Number(value).toFixed(2)} />
                                <Legend />
                                <Line type="monotone" dataKey="puan" stroke="#4f46e5" strokeWidth={2} name="Puan" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Net Gelişimi</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" style={{ fontSize: '10px' }} />
                                <YAxis style={{ fontSize: '10px' }} />
                                <Tooltip formatter={(value: any) => Number(value).toFixed(2)} />
                                <Legend />
                                <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} name="Net" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
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

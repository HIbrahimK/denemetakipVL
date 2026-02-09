"use client";

import { useEffect, useState, Suspense } from "react";
import { API_BASE_URL } from "@/lib/auth";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChevronLeft,
    Loader2,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

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

interface ExamDetail {
    attemptId: string;
    examId: string;
    examTitle: string;
    examDate: string;
    examType: string;
    publisher: string | null;
    totalNet: number;
    lessonResults: LessonResult[];
    scores: ExamScore[];
    schoolParticipantCount: number | null;
    districtParticipantCount: number | null;
    cityParticipantCount: number | null;
    generalParticipantCount: number | null;
}

interface ExamStats {
    schoolAverage: number;
    classAverage: number;
    lessonAverages: {
        lessonName: string;
        schoolAvg: number;
        classAvg: number;
    }[];
}

function ExamDetailContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const studentId = searchParams.get('studentId');
    const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
    const [examStats, setExamStats] = useState<ExamStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExamDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                
                // If studentId is provided, use it (for admin/teacher view)
                // Otherwise use /me/exams (for student's own view)
                const endpoint = studentId 
                    ? `${API_BASE_URL}/students/${studentId}/exams`
                    : `${API_BASE_URL}/students/me/exams`;
                
                // Fetch all exams to find this specific exam
                const response = await fetch(endpoint, {
                });
                const data = await response.json();
                
                if (!data || !data.examHistory) {
                    console.error("No exam history data received");
                    setLoading(false);
                    return;
                }
                
                const exam = data.examHistory.find((e: any) => e.examId === params.id);
                if (exam) {
                    console.log('Exam detail with participation counts:', exam);
                    setExamDetail(exam);
                }

                // Fetch exam statistics for comparison
                const statsResponse = await fetch(`${API_BASE_URL}/exams/${params.id}/statistics`, {
                });
                const statsData = await statsResponse.json();
                
                // Get student's class name to calculate class average
                const studentClassName = data.studentInfo?.className || '';
                
                // Calculate school average
                const schoolAverage = statsData.averageScore || 0;
                
                // Calculate class (branch) average
                const classBranch = statsData.branchStats?.find((b: any) => b.name === studentClassName);
                const classAverage = classBranch?.avgScore || schoolAverage;

                // Calculate lesson averages (school and class)
                const lessonAverages = statsData.lessonStats?.map((lesson: any) => {
                    // Calculate class average for this lesson
                    const studentsInClass = statsData.students?.filter((s: any) => s.className === studentClassName) || [];
                    const classLessonNets = studentsInClass
                        .map((s: any) => {
                            const lessonData = s.lessons?.[lesson.name];
                            return typeof lessonData === 'object' ? lessonData?.net : lessonData;
                        })
                        .filter((n: any) => n !== undefined && n !== null);
                    
                    const classAvgNet = classLessonNets.length > 0
                        ? classLessonNets.reduce((a: number, b: number) => a + Number(b), 0) / classLessonNets.length
                        : lesson.avgNet;

                    return {
                        lessonName: lesson.name,
                        schoolAvg: lesson.avgNet,
                        classAvg: classAvgNet,
                    };
                }) || [];

                setExamStats({
                    schoolAverage,
                    classAverage,
                    lessonAverages,
                });

                setLoading(false);
            } catch (err) {
                console.error("Error fetching exam detail:", err);
                setLoading(false);
            }
        };

        if (params.id) {
            fetchExamDetail();
        }
    }, [params.id, studentId]);

    const getComparisonIcon = (studentValue: number, average: number) => {
        if (studentValue > average) {
            return <TrendingUp className="h-4 w-4 text-emerald-600" />;
        } else if (studentValue < average) {
            return <TrendingDown className="h-4 w-4 text-red-500" />;
        }
        return <Minus className="h-4 w-4 text-slate-400" />;
    };

    const getComparisonColor = (studentValue: number, average: number) => {
        if (studentValue > average) {
            return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950";
        } else if (studentValue < average) {
            return "text-red-600 bg-red-50 dark:bg-red-950";
        }
        return "text-slate-600 bg-slate-50 dark:bg-slate-800";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!examDetail) {
        return (
            <div className="flex flex-col items-center justify-center p-10 gap-4">
                <p className="text-slate-600 dark:text-slate-400">Deneme bulunamadı.</p>
                <Button onClick={() => {
                    const url = studentId 
                        ? `/dashboard/student/results?studentId=${studentId}`
                        : '/dashboard/student/results';
                    router.push(url);
                }}>Geri Dön</Button>
            </div>
        );
    }

    const primaryScore = examDetail.scores.length > 0 ? examDetail.scores[0] : null;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        const url = studentId 
                            ? `/dashboard/student/results?studentId=${studentId}`
                            : '/dashboard/student/results';
                        router.push(url);
                    }}
                    className="flex-shrink-0"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {examDetail.examTitle}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(examDetail.examDate).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                        {examDetail.publisher && ` • ${examDetail.publisher}`}
                    </p>
                </div>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Puan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {primaryScore?.score.toFixed(2) || '-'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Toplam Net
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {examDetail.totalNet.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Sınıf Sırası
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {primaryScore?.rankClass ?? '-'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Okul Sırası
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {primaryScore?.rankSchool || '-'}
                            {examDetail.schoolParticipantCount && primaryScore?.rankSchool && (
                                <span className="text-sm font-normal text-slate-500">/{examDetail.schoolParticipantCount}</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            İlçe Sırası
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                            {primaryScore?.rankDistrict || '-'}
                            {examDetail.districtParticipantCount && primaryScore?.rankDistrict && (
                                <span className="text-sm font-normal text-slate-500">/{examDetail.districtParticipantCount}</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            İl Sırası
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                            {primaryScore?.rankCity || '-'}
                            {examDetail.cityParticipantCount && primaryScore?.rankCity && (
                                <span className="text-sm font-normal text-slate-500">/{examDetail.cityParticipantCount}</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Genel Sıralama
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {primaryScore?.rankGen || '-'}
                            {examDetail.generalParticipantCount && primaryScore?.rankGen && (
                                <span className="text-sm font-normal text-slate-500">/{examDetail.generalParticipantCount}</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lesson Results Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Ders Bazlı Sonuçlar</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="p-3 text-left">Ders</th>
                                    <th className="p-3 text-center">Doğru</th>
                                    <th className="p-3 text-center">Yanlış</th>
                                    <th className="p-3 text-center">Boş</th>
                                    <th className="p-3 text-center">Net</th>
                                    <th className="p-3 text-center hidden md:table-cell">Şube Ort.</th>
                                    <th className="p-3 text-center hidden md:table-cell">Okul Ort.</th>
                                    <th className="p-3 text-center hidden md:table-cell">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {examDetail.lessonResults.map(lesson => {
                                    const avg = examStats?.lessonAverages.find(
                                        a => a.lessonName === lesson.lessonName
                                    );
                                    const schoolAvg = avg?.schoolAvg || 0;
                                    const classAvg = avg?.classAvg || 0;
                                    const differenceSchool = lesson.net - schoolAvg;
                                    const differenceClass = lesson.net - classAvg;

                                    return (
                                        <tr key={lesson.lessonName} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                            <td className="p-3 font-medium">{lesson.lessonName}</td>
                                            <td className="p-3 text-center">
                                                <span className="text-emerald-600 font-semibold">{lesson.correct}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="text-red-500">{lesson.incorrect}</span>
                                            </td>
                                            <td className="p-3 text-center text-slate-500">{lesson.empty}</td>
                                            <td className="p-3 text-center">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                    {lesson.net.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center hidden md:table-cell text-slate-600 dark:text-slate-400">
                                                {classAvg.toFixed(2)}
                                            </td>
                                            <td className="p-3 text-center hidden md:table-cell text-slate-600 dark:text-slate-400">
                                                {schoolAvg.toFixed(2)}
                                            </td>
                                            <td className="p-3 text-center hidden md:table-cell">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center gap-1">
                                                        {getComparisonIcon(lesson.net, classAvg)}
                                                        <span className={`text-xs font-medium ${
                                                            differenceClass > 0 ? 'text-emerald-600' : differenceClass < 0 ? 'text-red-500' : 'text-slate-500'
                                                        }`}>
                                                            {differenceClass > 0 ? '+' : ''}{differenceClass.toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-slate-400">(Şube)</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {getComparisonIcon(lesson.net, schoolAvg)}
                                                        <span className={`text-xs font-medium ${
                                                            differenceSchool > 0 ? 'text-emerald-600' : differenceSchool < 0 ? 'text-red-500' : 'text-slate-500'
                                                        }`}>
                                                            {differenceSchool > 0 ? '+' : ''}{differenceSchool.toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-slate-400">(Okul)</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Comparison with Averages */}
            {examStats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Puan Karşılaştırması</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={[
                                        {
                                            name: 'Benim',
                                            puan: primaryScore?.score || 0,
                                        },
                                        {
                                            name: 'Şube Ort.',
                                            puan: examStats.classAverage,
                                        },
                                        {
                                            name: 'Okul Ort.',
                                            puan: examStats.schoolAverage,
                                        },
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                                    <YAxis style={{ fontSize: '10px' }} />
                                    <Tooltip formatter={(value: any) => Number(value).toFixed(2)} />
                                    <Bar dataKey="puan" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Ders Netlerinin Karşılaştırması</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={examDetail.lessonResults.map(lesson => {
                                        const avg = examStats.lessonAverages.find(
                                            a => a.lessonName === lesson.lessonName
                                        );
                                        return {
                                            name: lesson.lessonName,
                                            benim: lesson.net,
                                            subeOrt: avg?.classAvg || 0,
                                            okulOrt: avg?.schoolAvg || 0,
                                        };
                                    })}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" style={{ fontSize: '8px' }} angle={-45} textAnchor="end" height={80} />
                                    <YAxis style={{ fontSize: '10px' }} />
                                    <Tooltip formatter={(value: any) => Number(value).toFixed(2)} />
                                    <Bar dataKey="benim" fill="#4f46e5" name="Benim" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="subeOrt" fill="#10b981" name="Şube Ort." radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="okulOrt" fill="#94a3b8" name="Okul Ort." radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* All Rankings */}
            {examDetail.scores.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Sıralamalar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {examDetail.scores.map(score => (
                                <div key={score.type}>
                                    <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                        {score.type}
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Puan:</span>
                                            <span className="font-bold">{score.score.toFixed(2)}</span>
                                        </div>
                                        {score.rankClass && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">Sınıf:</span>
                                                <span className="font-semibold">
                                                    {score.rankClass}
                                                </span>
                                            </div>
                                        )}
                                        {score.rankSchool && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">Okul:</span>
                                                <span className="font-semibold">
                                                    {score.rankSchool}
                                                    {examDetail.schoolParticipantCount && (
                                                        <span className="text-xs font-normal text-slate-500">/{examDetail.schoolParticipantCount}</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {score.rankDistrict && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">İlçe:</span>
                                                <span className="font-semibold">
                                                    {score.rankDistrict}
                                                    {examDetail.districtParticipantCount && (
                                                        <span className="text-xs font-normal text-slate-500">/{examDetail.districtParticipantCount}</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {score.rankCity && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">İl:</span>
                                                <span className="font-semibold">
                                                    {score.rankCity}
                                                    {examDetail.cityParticipantCount && (
                                                        <span className="text-xs font-normal text-slate-500">/{examDetail.cityParticipantCount}</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {score.rankGen && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">Genel:</span>
                                                <span className="font-semibold">
                                                    {score.rankGen}
                                                    {examDetail.generalParticipantCount && (
                                                        <span className="text-xs font-normal text-slate-500">/{examDetail.generalParticipantCount}</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
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

export default function ExamDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        }>
            <ExamDetailContent />
        </Suspense>
    );
}

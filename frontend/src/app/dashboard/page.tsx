"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BookCheck,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Layers,
  Loader2,
  FileSpreadsheet,
  Plus,
  Users,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
} from "recharts";

type DashboardUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  schoolId?: string;
  school?: {
    name?: string;
  };
};

type StudentItem = {
  id: string;
  classId?: string;
  class?: {
    id: string;
    name?: string;
  };
};

type ExamItem = {
  id: string;
  title: string;
  type: string;
  date: string;
  gradeLevel?: number | null;
  isArchived?: boolean;
  isPublished?: boolean;
  _count?: {
    attempts?: number;
  };
};

type GroupItem = {
  id: string;
  _count?: {
    memberships?: number;
  };
};

type PlanItem = {
  id: string;
  status?: string;
  isTemplate?: boolean;
};

type LessonAverage = {
  averageNet?: number;
};

type ExamSummaryItem = {
  examId: string;
  examTitle: string;
  examDate: string;
  participantCount?: number;
  lessonAverages?: LessonAverage[];
};

type PerformanceRow = {
  id: string;
  label: string;
  averageNet: number;
  participantCount: number;
  dateValue: number;
};

const chartColors = {
  TYT: "#2563eb",
  AYT: "#16a34a",
  LGS: "#f97316",
  OZEL: "#7c3aed",
};

function formatDateLabel(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

function asArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [examSummaries, setExamSummaries] = useState<ExamSummaryItem[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (!user?.schoolId) return;

    let cancelled = false;

    const fetchJson = async <T,>(url: string): Promise<T> => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      return res.json();
    };

    const fetchJsonSafe = async <T,>(url: string, fallback: T): Promise<T> => {
      try {
        return await fetchJson<T>(url);
      } catch {
        return fallback;
      }
    };

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [studentsRes, examsRes, groupsRes, plansRes, tytRes, aytRes, lgsRes] =
          await Promise.all([
            fetchJsonSafe<unknown>(`${API_BASE_URL}/students`, []),
            fetchJsonSafe<unknown>(`${API_BASE_URL}/exams?schoolId=${user.schoolId}`, []),
            fetchJsonSafe<unknown>(`${API_BASE_URL}/groups`, []),
            fetchJsonSafe<unknown>(`${API_BASE_URL}/study/plans?isTemplate=false`, []),
            fetchJsonSafe<unknown>(`${API_BASE_URL}/reports/exams/summary?examType=TYT`, []),
            fetchJsonSafe<unknown>(`${API_BASE_URL}/reports/exams/summary?examType=AYT`, []),
            fetchJsonSafe<unknown>(`${API_BASE_URL}/reports/exams/summary?examType=LGS`, []),
          ]);

        if (cancelled) return;

        setStudents(asArray<StudentItem>(studentsRes));
        setExams(asArray<ExamItem>(examsRes));
        setGroups(asArray<GroupItem>(groupsRes));
        setPlans(asArray<PlanItem>(plansRes));

        const mergedSummaries: ExamSummaryItem[] = [
          ...asArray<ExamSummaryItem>(tytRes),
          ...asArray<ExamSummaryItem>(aytRes),
          ...asArray<ExamSummaryItem>(lgsRes),
        ];
        setExamSummaries(mergedSummaries);
      } catch {
        if (!cancelled) {
          setError("Veriler yuklenirken bir hata olustu.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.schoolId]);

  const now = Date.now();

  const activeExams = useMemo(() => exams.filter((exam) => !exam.isArchived), [exams]);

  const archivedExamCount = exams.length - activeExams.length;

  const publishedExamCount = useMemo(
    () => activeExams.filter((exam) => exam.isPublished).length,
    [activeExams],
  );

  const upcomingExams = useMemo(() => {
    return [...activeExams]
      .filter((exam) => new Date(exam.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [activeExams, now]);

  const completedExams = useMemo(() => {
    return [...activeExams]
      .filter((exam) => new Date(exam.date).getTime() < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [activeExams, now]);

  const totalClasses = useMemo(() => {
    const classIds = new Set<string>();
    students.forEach((student) => {
      if (student.classId) classIds.add(student.classId);
      if (student.class?.id) classIds.add(student.class.id);
    });
    return classIds.size;
  }, [students]);

  const activePlanCount = useMemo(() => {
    return plans.filter((plan) => plan.status === "ACTIVE" || plan.status === "ASSIGNED").length;
  }, [plans]);

  const totalGroupMembers = useMemo(() => {
    return groups.reduce((sum, group) => sum + (group._count?.memberships ?? 0), 0);
  }, [groups]);

  const examTypeData = useMemo(() => {
    const counts = activeExams.reduce<Record<string, number>>((acc, exam) => {
      acc[exam.type] = (acc[exam.type] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        color: chartColors[name as keyof typeof chartColors] ?? "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, [activeExams]);

  const performanceData = useMemo<PerformanceRow[]>(() => {
    return examSummaries
      .map((summary) => {
        const date = new Date(summary.examDate);
        const dateValue = date.getTime();
        const netTotal = (summary.lessonAverages ?? []).reduce(
          (sum, lesson) => sum + (lesson.averageNet ?? 0),
          0,
        );

        return {
          id: summary.examId,
          label: `${formatDateLabel(date)} - ${summary.examTitle}`,
          averageNet: Number(netTotal.toFixed(2)),
          participantCount: summary.participantCount ?? 0,
          dateValue,
        };
      })
      .filter((item) => Number.isFinite(item.dateValue))
      .sort((a, b) => a.dateValue - b.dateValue)
      .slice(-8);
  }, [examSummaries]);

  const averageRecentParticipant = useMemo(() => {
    if (!performanceData.length) return 0;
    const total = performanceData.reduce((sum, row) => sum + row.participantCount, 0);
    return Math.round(total / performanceData.length);
  }, [performanceData]);

  const schoolName = user?.school?.name || "Okul";

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Genel bakis verileri yukleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Genel Bakis</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">CANLI</span>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{schoolName} icin guncel istatistikler.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/students">
              <GraduationCap className="mr-2 h-4 w-4" />
              Ogrenciler
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/reports">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Raporlar
            </Link>
          </Button>
          <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
            <Link href="/dashboard/exams">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Sinav
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="py-3 text-sm text-red-700 dark:text-red-200">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Toplam Ogrenci
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
            <p className="text-xs text-slate-500 mt-1">{totalClasses} aktif sinif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Aktif Deneme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeExams.length}</div>
            <p className="text-xs text-slate-500 mt-1">{archivedExamCount} arsivde</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              Mentor Gruplari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{groups.length}</div>
            <p className="text-xs text-slate-500 mt-1">{totalGroupMembers} toplam uye</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <BookCheck className="h-4 w-4" />
              Aktif Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activePlanCount}</div>
            <p className="text-xs text-slate-500 mt-1">{plans.length} toplam plan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Son denemelerde ortalama net</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "#F1F5F9", radius: 8 }}
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    />
                    <Bar dataKey="averageNet" radius={[8, 8, 0, 0]} fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-slate-500">Grafik icin yeterli deneme raporu bulunamadi.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Sinav tur dagilimi</CardTitle>
          </CardHeader>
          <CardContent>
            {examTypeData.length > 0 ? (
              <>
                <div className="h-[220px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                    <RechartsPieChart>
                      <Pie
                        data={examTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {examTypeData.map((entry, index) => (
                          <Cell key={`type-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {examTypeData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-slate-500">Dagilim verisi yok.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Yaklasan denemeler</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {upcomingExams.map((exam) => (
                  <Link
                    href="/dashboard/exams"
                    key={exam.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{exam.title}</p>
                      <p className="text-xs text-slate-500">{new Date(exam.date).toLocaleDateString("tr-TR")} - {exam.type}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">Yaklasan deneme bulunmuyor.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Kisa istatistikler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Activity className="h-4 w-4" />
                Sonlanan deneme
              </div>
              <span className="font-semibold">{completedExams.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Layers className="h-4 w-4" />
                Yayinlanan deneme orani
              </div>
              <span className="font-semibold">
                {activeExams.length > 0 ? `${Math.round((publishedExamCount / activeExams.length) * 100)}%` : "0%"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Users className="h-4 w-4" />
                Son raporlarda ort. katilim
              </div>
              <span className="font-semibold">{averageRecentParticipant}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <BookOpen className="h-4 w-4" />
                Toplam plan
              </div>
              <span className="font-semibold">{plans.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100">Son tamamlanan denemeler</CardTitle>
        </CardHeader>
        <CardContent>
          {completedExams.length > 0 ? (
            <div className="space-y-2">
              {completedExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{exam.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(exam.date).toLocaleDateString("tr-TR")} - {exam.type}
                      {exam.gradeLevel ? ` - ${exam.gradeLevel}. Sinif` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Katilim: {exam._count?.attempts ?? 0}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">Tamamlanmis deneme bulunmuyor.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

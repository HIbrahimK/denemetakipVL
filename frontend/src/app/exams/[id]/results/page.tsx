"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    BarChart3,
    Calendar,
    ChevronLeft,
    Download,
    FileSpreadsheet,
    LayoutDashboard,
    Loader2,
    Search,
    Users
} from "lucide-react";
import Link from "next/link";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from "recharts";

export default function ExamResultsPage() {
    const params = useParams();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (params.id) {
            fetch(`http://localhost:3001/exams/${params.id}/statistics`)
                .then(res => res.json())
                .then(data => {
                    setStats(data);
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
                <p className="text-slate-600 dark:text-slate-400">Sonuç bulunamadı.</p>
                <Button onClick={() => router.back()}>Geri Dön</Button>
            </div>
        );
    }

    const filteredStudents = stats.students.filter((s: any) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentNumber?.includes(searchTerm) ||
        s.className?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {stats.examTitle}
                                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                                    {new Date(stats.examDate).toLocaleDateString("tr-TR")}
                                </span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button variant="outline" size="sm" className="hidden sm:flex" disabled>
                            <Download className="mr-2 h-4 w-4" /> PDF İndir
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* 1. Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Katılım</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.participantCount}</div>
                            <p className="text-xs text-muted-foreground">Toplam Öğrenci</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Okul Ortalaması (Puan)</CardTitle>
                            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600">{stats.averageScore.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">Ortalama Puan</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Okul Ortalaması (Net)</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.averageNet.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">Ortalama Net</p>
                        </CardContent>
                    </Card>
                    {/* Add more cards if needed, e.g. Rank 1 Student */}
                </div>

                {/* 2. Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lesson Performance Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ders Başarısı (Net Ortalamaları)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.lessonStats} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Bar dataKey="avgNet" name="Ortalama Net" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Branch Comparison Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Şube Karşılaştırması (Puan)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.branchStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                                        itemStyle={{ color: 'var(--foreground)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="avgScore" name="Ortalama Puan" fill="#ea580c" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Detailed Student List Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Öğrenci Listesi</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Öğrenci ara..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-3 text-left font-medium text-slate-500 dark:text-slate-400">Sıra</th>
                                        <th className="p-3 text-left font-medium text-slate-500 dark:text-slate-400">No</th>
                                        <th className="p-3 text-left font-medium text-slate-500 dark:text-slate-400">İsim</th>
                                        <th className="p-3 text-left font-medium text-slate-500 dark:text-slate-400">Sınıf</th>
                                        {stats.lessonStats.map((l: any) => (
                                            <th key={l.name} className="p-3 text-center font-medium text-slate-500 dark:text-slate-400 hidden md:table-cell">{l.name}</th>
                                        ))}
                                        <th className="p-3 text-right font-medium text-slate-500 dark:text-slate-400">Toplam Net</th>
                                        <th className="p-3 text-right font-medium text-slate-500 dark:text-slate-400">Puan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredStudents.map((student: any, idx: number) => (
                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                            <td className="p-3 font-medium">{idx + 1}</td>
                                            <td className="p-3 text-slate-500 dark:text-slate-400">{student.studentNumber}</td>
                                            <td className="p-3 font-medium">{student.name}</td>
                                            <td className="p-3 text-slate-500 dark:text-slate-400">{student.className}</td>
                                            {stats.lessonStats.map((l: any) => (
                                                <td key={l.name} className="p-3 text-center text-slate-600 dark:text-slate-300 hidden md:table-cell">
                                                    {student.lessons[l.name] ? Number(student.lessons[l.name]).toFixed(2) : '-'}
                                                </td>
                                            ))}
                                            <td className="p-3 text-right font-bold text-emerald-600">{student.net.toFixed(2)}</td>
                                            <td className="p-3 text-right font-bold text-indigo-600">{student.score.toFixed(3)}</td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="p-8 text-center text-slate-500">Kayıt bulunamadı.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                            Toplam {filteredStudents.length} öğrenci listeleniyor. (Toplam Katılım: {stats.participantCount})
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

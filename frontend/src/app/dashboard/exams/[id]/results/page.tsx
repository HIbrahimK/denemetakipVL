"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    BarChart3,
    ChevronLeft,
    Download,
    LayoutDashboard,
    Loader2,
    Printer,
    Search,
    Table as TableIcon,
    Users,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    FileSpreadsheet,
    StretchHorizontal,
    Filter
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from '@/lib/auth';

export default function ExamResultsPage() {
    const params = useParams();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedBranches, setSelectedBranches] = useState<string[]>([]);

    useEffect(() => {
        if (params.id) {
            const token = localStorage.getItem('token');
            fetch(`${API_BASE_URL}/exams/${params.id}/statistics`, {
                headers: {
                }
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch statistics');
                    }
                    return res.json();
                })
                .then(data => {
                    // Sınav tipini belirle
                    const updatedData = { ...data, examType: data.examType || 'TYT' };
                    setStats(updatedData);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [params.id]);

    const branches = useMemo(() => {
        if (!stats?.branchStats) return [];
        return stats.branchStats.map((b: any) => b.name).sort();
    }, [stats]);

    const lessonNames = useMemo(() => {
        if (!stats?.lessonStats) return [];
        return stats.lessonStats.map((l: any) => l.name);
    }, [stats]);

    const filteredStudents = useMemo(() => {
        if (!stats || !stats.students || !Array.isArray(stats.students)) return [];
        let students = [...stats.students];

        if (searchTerm) {
            students = students.filter((s: any) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.studentNumber?.includes(searchTerm) ||
                s.className?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedBranches.length > 0) {
            students = students.filter((s: any) => selectedBranches.includes(s.className));
        }

        if (sortConfig) {
            students.sort((a: any, b: any) => {
                let aValue, bValue;
                
                // AYT puan türlerine göre değerleri al
                if (sortConfig.key === 'sayScore') {
                    aValue = a.scores?.find((s: any) => s.type === 'SAY')?.score || 0;
                    bValue = b.scores?.find((s: any) => s.type === 'SAY')?.score || 0;
                } else if (sortConfig.key === 'eaScore') {
                    aValue = a.scores?.find((s: any) => s.type === 'EA')?.score || 0;
                    bValue = b.scores?.find((s: any) => s.type === 'EA')?.score || 0;
                } else if (sortConfig.key === 'sozScore') {
                    aValue = a.scores?.find((s: any) => s.type === 'SÖZ')?.score || 0;
                    bValue = b.scores?.find((s: any) => s.type === 'SÖZ')?.score || 0;
                } else {
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
                    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
                    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
                }
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return students;
    }, [stats, searchTerm, sortConfig, selectedBranches]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="h-4 w-4 ml-1 inline opacity-50" />;
        }
        return sortConfig.direction === 'asc' ? 
            <ArrowUp className="h-4 w-4 ml-1 inline" /> : 
            <ArrowDown className="h-4 w-4 ml-1 inline" />;
    };

    const isBranchActive = (branchName: string) => selectedBranches.length === 0 || selectedBranches.includes(branchName);

    const toggleBranch = (branchName: string) => {
        setSelectedBranches(prev => {
            // Empty selection means "hepsi" açık; uncheck ederken mevcut listedeki diğerlerini koru
            if (prev.length === 0) {
                return branches.filter((b: string) => b !== branchName);
            }
            if (prev.includes(branchName)) {
                return prev.filter(b => b !== branchName);
            }
            return [...prev, branchName];
        });
    };

    const toggleAllBranches = () => {
        setSelectedBranches(prev => (prev.length === 0 || prev.length === branches.length ? [] : branches));
    };

    const getPrimaryScore = (student: any, examType: string) => {
        if (examType === 'AYT') {
            const order = ['SAY', 'EA', 'SÖZ'];
            for (const type of order) {
                const found = student.scores?.find((s: any) => s.type === type)?.score;
                if (found !== undefined && found !== null) return found;
            }
        }
        return student.scores?.[0]?.score ?? student.score ?? 0;
    };

    const selectedStudentsForAverages = useMemo(() => {
        if (!stats) return [];
        if (selectedBranches.length === 0) return stats.students;
        return stats.students.filter((s: any) => selectedBranches.includes(s.className));
    }, [stats, selectedBranches]);

    const branchAverages = useMemo(() => {
        if (!stats) return [];
        const map = new Map<string, any>();

        stats.students.forEach((student: any) => {
            const branchName = student.className || 'Şube Yok';
            const current = map.get(branchName) || {
                name: branchName,
                count: 0,
                totalNet: 0,
                totalScore: 0,
                lessonTotals: {} as Record<string, number>,
            };

            current.count += 1;
            current.totalNet += student.net || 0;
            current.totalScore += getPrimaryScore(student, stats.examType);

            lessonNames.forEach((lesson: string) => {
                const raw = student.lessons?.[lesson];
                const net = typeof raw === 'object' ? raw?.net : raw;
                if (net !== undefined && net !== null) {
                    current.lessonTotals[lesson] = (current.lessonTotals[lesson] || 0) + Number(net);
                }
            });

            map.set(branchName, current);
        });

        return Array.from(map.values())
            .map((entry: any) => ({
                name: entry.name,
                participant: entry.count,
                avgTotalNet: entry.count ? entry.totalNet / entry.count : 0,
                avgScore: entry.count ? entry.totalScore / entry.count : 0,
                lessonAverages: lessonNames.reduce((acc: any, lesson: string) => ({
                    ...acc,
                    [lesson]: entry.count ? (entry.lessonTotals?.[lesson] || 0) / entry.count : 0,
                }), {}),
            }))
            .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }, [stats, lessonNames]);

    const overallSelectedAverages = useMemo(() => {
        if (!stats) return null;
        const count = selectedStudentsForAverages.length;
        if (count === 0) return null;

        let totalNet = 0;
        let totalScore = 0;
        const lessonTotals: Record<string, number> = {};

        selectedStudentsForAverages.forEach((student: any) => {
            totalNet += student.net || 0;
            totalScore += getPrimaryScore(student, stats.examType);

            lessonNames.forEach((lesson: string) => {
                const raw = student.lessons?.[lesson];
                const net = typeof raw === 'object' ? raw?.net : raw;
                if (net !== undefined && net !== null) {
                    lessonTotals[lesson] = (lessonTotals[lesson] || 0) + Number(net);
                }
            });
        });

        return {
            participant: count,
            avgTotalNet: totalNet / count,
            avgScore: totalScore / count,
            lessonAverages: lessonNames.reduce((acc: any, lesson: string) => ({
                ...acc,
                [lesson]: count ? (lessonTotals?.[lesson] || 0) / count : 0,
            }), {}),
        };
    }, [stats, lessonNames, selectedStudentsForAverages]);

    const handlePrint = () => {
        const style = document.createElement('style');
        style.id = 'print-style';
        style.innerHTML = `
            @media print {
                @page {
                    size: ${viewMode === 'detailed' ? 'landscape' : 'portrait'};
                    margin: 10mm;
                }
                .no-print {
                    display: none !important;
                }
                body, html, main, #printable-content {
                    background: white !important;
                    color: black !important;
                    overflow: visible !important;
                    height: auto !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .print-card {
                    border: 1px solid #000 !important;
                    box-shadow: none !important;
                    margin-bottom: 10px !important;
                }
                .recharts-responsive-container {
                    width: 100% !important;
                    height: 300px !important;
                }
                table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                }
                th, td {
                    border: 1px solid #000 !important;
                    padding: 4px !important;
                }
                .print-header {
                    display: block !important;
                }
            }
        `;
        document.head.appendChild(style);
        setTimeout(() => {
            window.print();
            const el = document.getElementById('print-style');
            if (el) el.remove();
        }, 300);
    };

    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/exams/${params.id}/export/excel`, {
                headers: {
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${stats.examTitle} - Sonuçlar.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Excel indirme başarısız');
            }
        } catch (error) {
            console.error('Excel indirme hatası:', error);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/exams/${params.id}/export/pdf`, {
                headers: {
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${stats.examTitle} - Sonuçlar.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                console.error('PDF indirme başarısız');
            }
        } catch (error) {
            console.error('PDF indirme hatası:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center p-10 gap-4">
                <p className="text-slate-600 dark:text-slate-400">Sonuç bulunamadı.</p>
                <Button onClick={() => router.push('/dashboard/exams')}>Geri Dön</Button>
            </div>
        );
    }

    return (
        <div id="printable-content" className="space-y-6 pb-20">
            {/* 1. Print Header (HIDDEN ON SCREEN) */}
            <div className="hidden print-header mb-6">
                <h1 className="text-2xl font-bold">{stats.examTitle} - Sonuç Listesi</h1>
                <p className="text-sm">Tarih: {new Date(stats.examDate).toLocaleDateString("tr-TR")} | Katılım: {stats.participantCount}</p>
            </div>

            {/* Sticky Bar */}
            <div className="no-print sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-sm border-y border-slate-200 dark:border-slate-800 py-3 -mx-4 px-4 sm:-mx-8 sm:px-8 transition-all duration-300">
                <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center">

                    {/* Left: Title & Back */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/exams')} className="text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center">
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {stats.examTitle}
                                <span className="hidden md:inline-flex text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                                    {new Date(stats.examDate).toLocaleDateString("tr-TR")}
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* Right: Filters & Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="relative w-full sm:w-61 order-last sm:order-first">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Öğrenci ara..."
                                className="pl-8 h-9 bg-white dark:bg-slate-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Branch Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 w-9 sm:w-auto border-dashed text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 px-0 sm:px-3 flex items-center justify-center">
                                    <Filter className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Şube</span>
                                    {selectedBranches.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 sm:ml-2 rounded-sm px-1 font-normal h-5">
                                            {selectedBranches.length}
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                <DropdownMenuLabel>Şube Filtrele</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {branches.map((branch: string) => (
                                    <DropdownMenuCheckboxItem key={branch} checked={isBranchActive(branch)} onCheckedChange={() => toggleBranch(branch)}>
                                        {branch}
                                    </DropdownMenuCheckboxItem>
                                ))}
                                {selectedBranches.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuCheckboxItem checked={false} onCheckedChange={() => setSelectedBranches([])} className="justify-center text-red-500">
                                            Temizle
                                        </DropdownMenuCheckboxItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

                        {/* View Toggle */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'summary' ? 'detailed' : 'summary')}
                            className="h-9 w-9 sm:w-auto border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-0 sm:px-3 flex items-center justify-center"
                        >
                            {viewMode === 'summary' ? <StretchHorizontal className="h-4 w-4 sm:mr-2" /> : <TableIcon className="h-4 w-4 sm:mr-2" />}
                            <span className="hidden sm:inline">{viewMode === 'summary' ? 'Ayrıntılı' : 'Özet'}</span>
                        </Button>

                        <Button variant="outline" size="icon" className="h-9 w-9 flex items-center justify-center sm:hidden text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700" onClick={handleDownloadExcel}>
                            <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 hidden sm:flex text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700" onClick={handleDownloadExcel}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                        </Button>

                        <Button variant="outline" size="icon" className="h-9 w-9 flex items-center justify-center sm:hidden text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700" onClick={handleDownloadPDF}>
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 hidden sm:flex text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700" onClick={handleDownloadPDF}>
                            <Download className="mr-2 h-4 w-4" /> PDF
                        </Button>

                        <Button variant="outline" size="icon" className="h-9 w-9 flex items-center justify-center text-indigo-700 dark:text-indigo-400 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/30" onClick={handlePrint}>
                            <Printer className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className={`grid ${stats.examType === 'AYT' ? 'grid-cols-3 lg:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'} gap-4`}>
                <Card className="print-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-medium">Katılım</CardTitle>
                        <Users className="h-3 w-3 text-muted-foreground no-print" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">{stats.participantCount}</div>
                    </CardContent>
                </Card>
                
                {stats.examType === 'AYT' ? (
                    <>
                        <Card className="print-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-xs font-medium">Ort. SAY</CardTitle>
                                <LayoutDashboard className="h-3 w-3 text-muted-foreground no-print" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 print:text-black">
                                    {(stats.students.reduce((acc: number, s: any) => acc + (s.scores?.find((sc: any) => sc.type === 'SAY')?.score || 0), 0) / Math.max(stats.students.length, 1)).toFixed(2)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="print-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-xs font-medium">Ort. EA</CardTitle>
                                <LayoutDashboard className="h-3 w-3 text-muted-foreground no-print" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                                    {(stats.students.reduce((acc: number, s: any) => acc + (s.scores?.find((sc: any) => sc.type === 'EA')?.score || 0), 0) / Math.max(stats.students.length, 1)).toFixed(2)}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="print-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-xs font-medium">Ort. SÖZ</CardTitle>
                                <LayoutDashboard className="h-3 w-3 text-muted-foreground no-print" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-orange-600 dark:text-orange-400 print:text-black">
                                    {(stats.students.reduce((acc: number, s: any) => acc + (s.scores?.find((sc: any) => sc.type === 'SÖZ')?.score || 0), 0) / Math.max(stats.students.length, 1)).toFixed(2)}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        <Card className="print-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-xs font-medium">Ort. Puan</CardTitle>
                                <LayoutDashboard className="h-3 w-3 text-muted-foreground no-print" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 print:text-black">{stats.averageScore.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card className="print-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-xs font-medium">Ort. Net</CardTitle>
                                <BarChart3 className="h-3 w-3 text-muted-foreground no-print" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 print:text-black">{stats.averageNet.toFixed(2)}</div>
                            </CardContent>
                        </Card>
                        <Card className="print-card">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                <CardTitle className="text-xs font-medium">1. Öğrenci</CardTitle>
                                <Users className="h-3 w-3 text-muted-foreground no-print" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-bold truncate">{filteredStudents.length > 0 ? filteredStudents[0].name : '-'}</div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Branch Averages */}
            <Card className="print-card overflow-hidden border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Şube Ortalamaları</CardTitle>
                        <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={selectedBranches.length === 0 || selectedBranches.length === branches.length}
                                onChange={toggleAllBranches}
                            />
                            <span>Tümünü seç</span>
                        </label>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-xs md:text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="w-10 p-3 text-center"></th>
                                <th className="p-3 text-left">Şube</th>
                                {lessonNames.map((lesson: string) => (
                                    <th key={lesson} className="p-3 text-center whitespace-nowrap">{lesson}</th>
                                ))}
                                <th className="p-3 text-center whitespace-nowrap">Toplam Net</th>
                                <th className="p-3 text-center whitespace-nowrap">Puan Ortalaması</th>
                                <th className="p-3 text-center">Katılım</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {branchAverages.map((branch) => {
                                const active = isBranchActive(branch.name);
                                return (
                                    <tr key={branch.name} className={active ? '' : 'opacity-60'}>
                                        <td className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={active}
                                                onChange={() => toggleBranch(branch.name)}
                                            />
                                        </td>
                                        <td className="p-3 font-medium text-slate-800 dark:text-slate-100">{branch.name}</td>
                                        {lessonNames.map((lesson: string) => (
                                            <td key={lesson} className="p-3 text-center font-mono text-xs md:text-sm">
                                                {branch.lessonAverages?.[lesson] !== undefined ? branch.lessonAverages[lesson].toFixed(2) : '-'}
                                            </td>
                                        ))}
                                        <td className="p-3 text-center font-semibold text-indigo-600 dark:text-indigo-300">{branch.avgTotalNet.toFixed(2)}</td>
                                        <td className="p-3 text-center font-semibold text-emerald-600 dark:text-emerald-300">{branch.avgScore.toFixed(2)}</td>
                                        <td className="p-3 text-center">{branch.participant}</td>
                                    </tr>
                                );
                            })}

                            {overallSelectedAverages && (
                                <tr className="bg-slate-50 dark:bg-slate-900/40 font-semibold">
                                    <td className="p-3 text-center"></td>
                                    <td className="p-3">Ortalama</td>
                                    {lessonNames.map((lesson: string) => (
                                        <td key={lesson} className="p-3 text-center font-mono text-xs md:text-sm">
                                            {overallSelectedAverages.lessonAverages?.[lesson] !== undefined
                                                ? overallSelectedAverages.lessonAverages[lesson].toFixed(2)
                                                : '-'}
                                        </td>
                                    ))}
                                    <td className="p-3 text-center text-indigo-700 dark:text-indigo-200">{overallSelectedAverages.avgTotalNet.toFixed(2)}</td>
                                    <td className="p-3 text-center text-emerald-700 dark:text-emerald-200">{overallSelectedAverages.avgScore.toFixed(2)}</td>
                                    <td className="p-3 text-center">{overallSelectedAverages.participant}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="print-card overflow-hidden border-slate-200 dark:border-slate-800">
                <CardContent className="p-0">
                    <div className="max-h-[70vh] overflow-auto relative print:max-h-none print:overflow-visible">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800 shadow-sm print:bg-slate-100 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 text-left w-12 cursor-pointer" onClick={() => handleSort('idx')}>
                                        <div className="flex items-center gap-1">Sıra {getSortIcon('idx')}</div>
                                    </th>
                                    <th className="p-3 text-left w-20 cursor-pointer" onClick={() => handleSort('studentNumber')}>
                                        <div className="flex items-center gap-1">No {getSortIcon('studentNumber')}</div>
                                    </th>
                                    <th className="p-3 text-left min-w-[150px] cursor-pointer" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-1">İsim {getSortIcon('name')}</div>
                                    </th>
                                    <th className="p-3 text-left w-20 cursor-pointer" onClick={() => handleSort('className')}>
                                        <div className="flex items-center gap-1">Sınıf {getSortIcon('className')}</div>
                                    </th>
                                    {stats.lessonStats.map((l: any) => (
                                        viewMode === 'detailed' ? (
                                            <th key={l.name} className="p-3 text-center border-l dark:border-slate-700 min-w-[100px]">
                                                <div className="text-[10px] uppercase mb-1">{l.name}</div>
                                                <div className="flex justify-center gap-1 text-[10px]">
                                                    <span className="text-emerald-600 font-bold">D</span>
                                                    <span className="text-red-500 font-bold">Y</span>
                                                    <span className="text-indigo-600 font-bold">N</span>
                                                </div>
                                            </th>
                                        ) : (
                                            <th key={l.name} className="p-3 text-center hidden md:table-cell">{l.name}</th>
                                        )
                                    ))}
                                    <th className="p-3 text-right cursor-pointer border-l dark:border-slate-700" onClick={() => handleSort('net')}>
                                        <div className="flex items-center justify-end gap-1">Net {getSortIcon('net')}</div>
                                    </th>
                                    
                                    {/* Puan Türleri */}
                                    {stats.examType === 'AYT' ? (
                                        <>
                                            <th className="p-3 text-center border-l dark:border-slate-700 min-w-[100px] cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('sayScore')}>
                                                <div className="text-[10px] uppercase font-bold">SAY {getSortIcon('sayScore')}</div>
                                                <div className="text-[8px] text-slate-500">Puan</div>
                                            </th>
                                            {viewMode === 'detailed' && (
                                                <>
                                                    <th className="p-3 text-center hidden md:table-cell border-l dark:border-slate-700 min-w-[80px]">
                                                        <div className="text-[8px] uppercase">İlçe</div>
                                                    </th>
                                                    <th className="p-3 text-center hidden lg:table-cell border-l dark:border-slate-700 min-w-[80px]">
                                                        <div className="text-[8px] uppercase">İl</div>
                                                    </th>
                                                    <th className="p-3 text-center border-l dark:border-slate-700 min-w-[80px]">
                                                        <div className="text-[8px] uppercase">Genel</div>
                                                    </th>
                                                </>
                                            )}
                                            
                                            <th className="p-3 text-center border-l dark:border-slate-700 min-w-[100px] cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('eaScore')}>
                                                <div className="text-[10px] uppercase font-bold">EA {getSortIcon('eaScore')}</div>
                                                <div className="text-[8px] text-slate-500">Puan</div>
                                            </th>
                                            {viewMode === 'detailed' && (
                                                <>
                                                    <th className="p-3 text-center hidden md:table-cell border-l dark:border-slate-700 min-w-[80px]">
                                                        <div className="text-[8px] uppercase">İlçe</div>
                                                    </th>
                                                    <th className="p-3 text-center hidden lg:table-cell border-l dark:border-slate-700 min-w-[80px]">
                                                        <div className="text-[8px] uppercase">İl</div>
                                                    </th>
                                                    <th className="p-3 text-center border-l dark:border-slate-700 min-w-[80px]">
                                                        <div className="text-[8px] uppercase">Genel</div>
                                                    </th>
                                                </>
                                            )}
                                            
                                            <th className="p-3 text-center border-l dark:border-slate-700 min-w-[100px] cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('sozScore')}>
                                                <div className="text-[10px] uppercase font-bold">SÖZ {getSortIcon('sozScore')}</div>
                                                <div className="text-[8px] text-slate-500">Puan</div>
                                            </th>
                                            {viewMode === 'detailed' && (
                                                <>
                                                    <th className="p-3 text-center hidden md:table-cell border-l dark:border-slate-700 min-w-[80px]">
                                                        <div className="text-[8px] uppercase">İlçe</div>
                                                    </th>
                                                    <th className="p-3 text-center hidden lg:table-cell border-l dark:border-slate-700 min-w-[80px]">
                                                        <div className="text-[8px] uppercase">İl</div>
                                                    </th>
                                                    <th className="p-3 text-center border-l dark:border-slate-700 min-w-[80px]">
                                                        <div className="text-[8px] uppercase">Genel</div>
                                                    </th>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-3 text-right cursor-pointer border-l dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700" onClick={() => handleSort('score')}>
                                                <div>Puan {getSortIcon('score')}</div>
                                            </th>
                                            {viewMode === 'detailed' && (
                                                <>
                                                    <th className="p-3 text-center hidden md:table-cell border-l dark:border-slate-700">İlçe</th>
                                                    <th className="p-3 text-center hidden lg:table-cell border-l dark:border-slate-700">İl</th>
                                                    <th className="p-3 text-center border-l dark:border-slate-700">Genel</th>
                                                </>
                                            )}
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredStudents.map((student: any, idx: number) => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group print:break-inside-avoid">
                                        <td className="p-3 text-center">{idx + 1}</td>
                                        <td className="p-3 font-mono text-xs">{student.studentNumber}</td>
                                        <td className="p-3 font-medium">
                                            <a 
                                                href={`/dashboard/student/results?studentId=${student.id}`}
                                                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    router.push(`/dashboard/student/results?studentId=${student.id}`);
                                                }}
                                            >
                                                {student.name}
                                            </a>
                                        </td>
                                        <td className="p-3 text-xs">{student.className}</td>
                                        {stats.lessonStats.map((l: any) => {
                                            const lessonData = student.lessons?.[l.name];
                                            const net = typeof lessonData === 'object' ? lessonData?.net : lessonData;
                                            const correct = typeof lessonData === 'object' ? lessonData?.correct : '-';
                                            const incorrect = typeof lessonData === 'object' ? lessonData?.incorrect : '-';
                                            return viewMode === 'detailed' ? (
                                                <td key={l.name} className="p-2 text-center border-l dark:border-slate-800">
                                                    <div className="flex justify-center gap-1 text-[11px]">
                                                        <span className="w-4 text-emerald-600 font-bold">{correct}</span>
                                                        <span className="w-4 text-red-500">{incorrect}</span>
                                                        <span className="w-6 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/20 rounded">{net !== undefined ? Number(net).toFixed(2) : '-'}</span>
                                                    </div>
                                                </td>
                                            ) : (
                                                <td key={l.name} className="p-3 text-center hidden md:table-cell">{net !== undefined ? Number(net).toFixed(2) : '-'}</td>
                                            );
                                        })}
                                        <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-500 border-l dark:border-slate-800">{student.net.toFixed(2)}</td>
                                        
                                        {/* Puanlar ve Sıralamalar */}
                                        {stats.examType === 'AYT' ? (
                                            <>
                                                {/* SAY Puanı ve Sıralamaları */}
                                                <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400 border-l dark:border-slate-800">
                                                    {student.scores?.find((s: any) => s.type === 'SAY')?.score.toFixed(3) || '-'}
                                                </td>
                                                {viewMode === 'detailed' && (
                                                    <>
                                                        <td className="p-3 text-center hidden md:table-cell text-sm border-l dark:border-slate-800">
                                                            {student.scores?.find((s: any) => s.type === 'SAY')?.rankDistrict || '-'}
                                                        </td>
                                                        <td className="p-3 text-center hidden lg:table-cell text-sm border-l dark:border-slate-800">
                                                            {student.scores?.find((s: any) => s.type === 'SAY')?.rankCity || '-'}
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-sm border-l dark:border-slate-800">
                                                            {student.scores?.find((s: any) => s.type === 'SAY')?.rankGen || '-'}
                                                        </td>
                                                    </>
                                                )}

                                                {/* EA Puanı ve Sıralamaları */}
                                                <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400 border-l dark:border-slate-800">
                                                    {student.scores?.find((s: any) => s.type === 'EA')?.score.toFixed(3) || '-'}
                                                </td>
                                                {viewMode === 'detailed' && (
                                                    <>
                                                        <td className="p-3 text-center hidden md:table-cell text-sm border-l dark:border-slate-800">
                                                            {student.scores?.find((s: any) => s.type === 'EA')?.rankDistrict || '-'}
                                                        </td>
                                                        <td className="p-3 text-center hidden lg:table-cell text-sm border-l dark:border-slate-800">
                                                            {student.scores?.find((s: any) => s.type === 'EA')?.rankCity || '-'}
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-sm border-l dark:border-slate-800">
                                                            {student.scores?.find((s: any) => s.type === 'EA')?.rankGen || '-'}
                                                        </td>
                                                    </>
                                                )}

                                                {/* SÖZ Puanı ve Sıralamaları */}
                                                <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400 border-l dark:border-slate-800">
                                                    {student.scores?.find((s: any) => s.type === 'SÖZ')?.score.toFixed(3) || '-'}
                                                </td>
                                                {viewMode === 'detailed' && (
                                                    <>
                                                        <td className="p-3 text-center hidden md:table-cell text-sm border-l dark:border-slate-800">
                                                            {student.scores?.find((s: any) => s.type === 'SÖZ')?.rankDistrict || '-'}
                                                        </td>
                                                        <td className="p-3 text-center hidden lg:table-cell text-sm border-l dark:border-slate-800">
                                                            {student.scores?.find((s: any) => s.type === 'SÖZ')?.rankCity || '-'}
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-sm border-l dark:border-slate-800">
                                                            {student.scores?.find((s: any) => s.type === 'SÖZ')?.rankGen || '-'}
                                                        </td>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400 border-l dark:border-slate-800">
                                                    {student.scores?.[0]?.score.toFixed(3) || student.score?.toFixed(3) || '-'}
                                                </td>
                                                {viewMode === 'detailed' && (
                                                    <>
                                                        <td className="p-3 text-center hidden md:table-cell text-sm border-l dark:border-slate-800">
                                                            {student.scores?.[0]?.rankDistrict || '-'}
                                                        </td>
                                                        <td className="p-3 text-center hidden lg:table-cell text-sm border-l dark:border-slate-800">
                                                            {student.scores?.[0]?.rankCity || '-'}
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-sm border-l dark:border-slate-800">
                                                            {student.scores?.[0]?.rankGen || '-'}
                                                        </td>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid">
                <Card className="print-card">
                    <CardHeader><CardTitle className="text-sm">Ders Başarısı</CardTitle></CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.lessonStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '10px' }} />
                                <Tooltip formatter={(value: any) => Number(value).toFixed(2)} />
                                <Bar dataKey="avgNet" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="print-card">
                    <CardHeader><CardTitle className="text-sm">Şube Karşılaştırması</CardTitle></CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.branchStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" style={{ fontSize: '10px' }} />
                                <YAxis style={{ fontSize: '10px' }} />
                                <Tooltip formatter={(value: any) => Number(value).toFixed(2)} />
                                <Bar dataKey="avgScore" fill="#ea580c" radius={[4, 4, 0, 0]} maxBarSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

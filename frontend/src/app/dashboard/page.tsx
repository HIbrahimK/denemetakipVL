"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    BarChart3,
    BookOpen,
    ChevronRight,
    Clock,
    FileSpreadsheet,
    MoreHorizontal,
    PieChart,
    Plus,
    TrendingUp,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart as RePieChart,
    Pie
} from "recharts";

// Mock Data
const examPerformanceData = [
    { name: "TYT-1", avg: 45 },
    { name: "TYT-2", avg: 52 },
    { name: "TYT-3", avg: 49 },
    { name: "AYT-1", avg: 38 },
    { name: "LGS-1", avg: 65 },
];

const examTypeData = [
    { name: "TYT", value: 12, color: "#6366f1" }, // Indigo
    { name: "AYT", value: 8, color: "#8b5cf6" },  // Violet
    { name: "LGS", value: 4, color: "#10b981" },  // Emerald
];

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    return (
        <div className="space-y-8">
            {/* Welcome & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                        Ynetim Paneli
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">CANLI</span>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Sistem durumu aktif ve gncel.
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button asChild className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 shadow-lg shadow-slate-900/20">
                        <Link href="/dashboard/exams">
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni Snav Ekle
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Modern Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 - Green Theme */}
                <div className="bg-[#a3b18a] bg-gradient-to-br from-[#a3b18a] to-[#588157] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl group cursor-pointer transition-transform hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
                        <Users className="h-32 w-32" />
                    </div>
                    <div className="flex justify-between items-start mb-8">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">renciler</span>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold mb-1">1,248</h3>
                        <p className="text-white/80 font-medium">Toplam Kaytl renci</p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-xl">
                        <TrendingUp className="h-4 w-4" />
                        <span>Geen aya gre +%12</span>
                    </div>
                </div>

                {/* Card 2 - Indigo Theme */}
                <div className="bg-[#4a4e69] bg-gradient-to-br from-[#4a4e69] to-[#22223b] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl group cursor-pointer transition-transform hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
                        <BookOpen className="h-32 w-32" />
                    </div>
                    <div className="flex justify-between items-start mb-8">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">Snavlar</span>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold mb-1">24</h3>
                        <p className="text-white/80 font-medium">Bu Yl Yaplan Snav</p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-xl">
                        <Clock className="h-4 w-4" />
                        <span>Son snav 2 gn nce</span>
                    </div>
                </div>

                {/* Card 3 - Image/Custom Theme */}
                <div className="bg-[#e9c46a] bg-gradient-to-br from-[#e9c46a] to-[#e76f51] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl group cursor-pointer transition-transform hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-32 w-32" />
                    </div>
                    <div className="flex justify-between items-start mb-8">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">Baar</span>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold mb-1">%68.4</h3>
                        <p className="text-white/80 font-medium">Genel Okul Ortalamas</p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-xl">
                        <ArrowUpRight className="h-4 w-4" />
                        <span>Hedefin %2 zerindeyiz</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Charts Section */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Analizler & Raporlar</h2>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Snav Performans</h3>
                                <p className="text-sm text-slate-500">Son 5 snavn net ortalamalar</p>
                            </div>
                            <select className="bg-slate-50 dark:bg-slate-800 border-none text-sm rounded-lg px-3 py-2 outline-none">
                                <option>Son 5 Snav</option>
                                <option>Son 10 Snav</option>
                            </select>
                        </div>
                        <ResponsiveContainer width="100%" height={300} minHeight={220}>
                            <BarChart data={examPerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#F1F5F9', radius: 8 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="avg" radius={[8, 8, 8, 8]} barSize={40}>
                                    {examPerformanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#818CF8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side Widgets */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Dalm</h2>

                    {/* Pie Chart Widget */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Snav Trleri</h3>
                        <div className="h-[200px] w-full relative">
                            <ResponsiveContainer width="100%" height={180} minHeight={160}>
                                <RePieChart>
                                    <Pie
                                        data={examTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {examTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RePieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-3xl font-bold text-slate-800 dark:text-white">24</span>
                                <span className="text-xs text-slate-500">Toplam</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {examTypeData.map((type) => (
                                <div key={type.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{type.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Action List */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-white">Son Snavlar</h3>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Link href="/dashboard/exams" key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/40 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">zdebir TG-{i}</h4>
                                        <p className="text-xs text-slate-500">24 Ocak 2026</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

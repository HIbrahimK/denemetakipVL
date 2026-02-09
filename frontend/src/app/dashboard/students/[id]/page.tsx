"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, BookOpen, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE_URL } from '@/lib/auth';

interface StudentDetail {
    id: string;
    studentNumber: string;
    tcNo?: string;
    user: {
        firstName: string;
        lastName: string;
        email?: string | null;
        avatarSeed?: string;
    };
    class: {
        name: string;
        grade: {
            name: string;
        };
    };
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudent();
    }, [resolvedParams.id]);

    const fetchStudent = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/students/${resolvedParams.id}`, {
                headers: {
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStudent(data);
            } else {
                router.push('/dashboard/students');
            }
        } catch (error) {
            console.error("Failed to fetch student:", error);
            router.push('/dashboard/students');
        } finally {
            setLoading(false);
        }
    };

    const getAvatarUrl = () => {
        if (!student?.user.avatarSeed) {
            return `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.user.firstName || 'User'}`;
        }

        const parts = student.user.avatarSeed.split(':');
        if (parts.length === 2) {
            return `https://api.dicebear.com/7.x/${parts[0]}/svg?seed=${parts[1]}`;
        }

        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.user.firstName || 'User'}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!student) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Geri
                </Button>
                <h1 className="text-2xl font-bold">Öğrenci Detayı</h1>
            </div>

            {/* Student Info Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-6">
                        <Avatar className="h-24 w-24 border-4 border-slate-200 dark:border-slate-700">
                            <AvatarImage src={getAvatarUrl()} />
                            <AvatarFallback className="bg-indigo-500 text-white text-2xl">
                                {student.user.firstName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-3xl font-bold">
                                    {student.user.firstName} {student.user.lastName}
                                </h2>
                                <p className="text-slate-500 mt-1">
                                    {student.class.grade.name}-{student.class.name} Sınıfı
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">Okul No</div>
                                    <div className="text-lg font-semibold mt-1">
                                        {student.studentNumber || '-'}
                                    </div>
                                </div>

                                {student.tcNo && (
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                        <div className="text-sm text-slate-500 dark:text-slate-400">TC No</div>
                                        <div className="text-lg font-semibold mt-1">
                                            {student.tcNo}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                    variant="outline" 
                    className="h-auto py-6 flex-col gap-2"
                    onClick={() => router.push(`/dashboard/students`)}
                >
                    <User className="h-6 w-6" />
                    <span>Öğrenci Listesi</span>
                </Button>

                <Button 
                    variant="outline" 
                    className="h-auto py-6 flex-col gap-2"
                    onClick={() => router.push(`/dashboard/exams`)}
                >
                    <BookOpen className="h-6 w-6" />
                    <span>Sınavlar</span>
                </Button>

                <Button 
                    variant="outline" 
                    className="h-auto py-6 flex-col gap-2"
                    onClick={() => router.push(`/dashboard/reports`)}
                >
                    <TrendingUp className="h-6 w-6" />
                    <span>Raporlar</span>
                </Button>
            </div>

            {/* Exam History - Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Deneme Geçmişi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-500 text-center py-8">
                        Öğrencinin deneme geçmişi burada görüntülenecek.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

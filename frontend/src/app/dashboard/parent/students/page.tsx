"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, UserCircle, ChevronRight, TrendingUp } from "lucide-react";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
    className: string;
    gradeName: string;
    tcNo?: string;
}

interface ParentData {
    students: Student[];
}

export default function ParentStudentsPage() {
    const [loading, setLoading] = useState(true);
    const [parentData, setParentData] = useState<ParentData | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchParentData = async () => {
            const token = localStorage.getItem("token");

            try {
                const res = await fetch("http://localhost:3001/parents/me/students", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setParentData(data);
                } else {
                    console.error("Failed to fetch parent data");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchParentData();
    }, []);

    const handleStudentClick = (studentId: string) => {
        router.push(`/dashboard/student/results?studentId=${studentId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!parentData || !parentData.students || parentData.students.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <UserCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Kayıtlı Öğrenci Bulunamadı</h3>
                        <p className="text-slate-500 text-sm">
                            Hesabınıza bağlı öğrenci kaydı bulunmuyor. Lütfen okul yönetimine başvurun.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Öğrencilerim
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {parentData.students.length} öğrenci kaydı bulundu
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {parentData.students.map((student) => (
                    <Card
                        key={student.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer group"
                        onClick={() => handleStudentClick(student.id)}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                            <UserCircle className="w-8 h-8" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-xl">
                                            {student.firstName} {student.lastName}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {student.studentNumber}
                                            </Badge>
                                        </CardDescription>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                    <GraduationCap className="w-4 h-4 text-slate-400 mr-2" />
                                    <span className="text-slate-600 dark:text-slate-300">
                                        {student.gradeName} - {student.className}
                                    </span>
                                </div>
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStudentClick(student.id);
                                    }}
                                >
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Sonuçları Görüntüle
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                Öğrenci Takibi
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Öğrencilerinizin sınav sonuçlarını, gelişim raporlarını ve mesajlarını bu
                                panelden takip edebilirsiniz. Her öğrenciye tıklayarak detaylı bilgilere
                                ulaşabilirsiniz.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

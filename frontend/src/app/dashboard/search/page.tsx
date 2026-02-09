"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, BookOpen, Users, ArrowLeft, Loader2 } from "lucide-react";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
    className: string;
}

interface Exam {
    id: string;
    title: string;
    date: string;
    type: string;
    gradeLevel: number;
}

interface ClassResult {
    className: string;
    studentCount: number;
}

interface SearchResults {
    students: (Student & { type: string; label: string; subtitle: string })[];
    exams: (Exam & { type: string; label: string; subtitle: string })[];
    classes: (ClassResult & { type: string; label: string; subtitle: string })[];
}

function SearchPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const className = searchParams.get('name');

    const [results, setResults] = useState<SearchResults | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (type === 'student' && id) {
            // Single student view
            fetchStudent(id);
        } else if (type === 'class' && className) {
            // Class students view
            fetchClassStudents(className);
        } else if (query) {
            // Global search results
            fetchSearchResults(query);
        }
    }, [query, type, id, className]);

    const fetchStudent = async (studentId: string) => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
                headers: {
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Transform data to match expected format
                const transformedStudent = {
                    id: data.id,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    studentNumber: data.studentNumber,
                    className: `${data.class.grade.name}-${data.class.name}`
                };
                setStudents([transformedStudent]);
            }
        } catch (error) {
            console.error("Failed to fetch student:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassStudents = async (classNameParam: string) => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const schoolId = user?.schoolId || "";
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(
                `${API_BASE_URL}/students?schoolId=${schoolId}&className=${encodeURIComponent(classNameParam)}`,
                {
                    headers: {
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                // Transform data to match expected format
                const transformedData = data.map((s: any) => ({
                    id: s.id,
                    firstName: s.user.firstName,
                    lastName: s.user.lastName,
                    studentNumber: s.studentNumber,
                    className: `${s.class.grade.name}-${s.class.name}`
                }));
                setStudents(transformedData);
            }
        } catch (error) {
            console.error("Failed to fetch class students:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSearchResults = async (searchQuery: string) => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const schoolId = user?.schoolId || "";
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(
                `${API_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}&schoolId=${schoolId}`,
                {
                    headers: {
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setResults(data);
            }
        } catch (error) {
            console.error("Failed to fetch search results:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    // Single student or class view
    if (students.length > 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Geri
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {type === 'class' ? `${className} Sınıfı` : 'Öğrenci Detayı'}
                    </h1>
                </div>

                <div className="grid gap-4">
                    {students.map((student) => (
                        <Card key={student.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                        <User className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">
                                            {student.firstName} {student.lastName}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Okul No: {student.studentNumber} – Sınıf: {student.className}
                                        </p>
                                    </div>
                                    <Button onClick={() => router.push(`/dashboard/student/results?studentId=${student.id}`)}>
                                        Detayları Gör
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // Global search results
    if (results) {
        const hasResults = results.students.length > 0 || results.exams.length > 0 || results.classes.length > 0;

        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Geri
                    </Button>
                    <h1 className="text-2xl font-bold">
                        &quot;{query}&quot; için arama sonuçları
                    </h1>
                </div>

                {!hasResults && (
                    <Card>
                        <CardContent className="pt-6 text-center text-slate-500">
                            Sonuç bulunamadı. Farklı bir arama terimi deneyin.
                        </CardContent>
                    </Card>
                )}

                {/* Students */}
                {results.students.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Öğrenciler ({results.students.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {results.students.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {student.firstName} {student.lastName}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {student.studentNumber} – {student.className}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/student/results?studentId=${student.id}`)}
                                        >
                                            Detay
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Exams */}
                {results.exams.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Sınavlar ({results.exams.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {results.exams.map((exam) => (
                                    <div
                                        key={exam.id}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div>
                                            <div className="font-medium">{exam.title}</div>
                                            <div className="text-sm text-slate-500">
                                                {exam.type} – {exam.gradeLevel}. Sınıf
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/exams/${exam.id}/results`)}
                                        >
                                            Sonuçlar
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Classes */}
                {results.classes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Sınıflar ({results.classes.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {results.classes.map((cls) => (
                                    <div
                                        key={cls.className}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div>
                                            <div className="font-medium">{cls.className}</div>
                                            <div className="text-sm text-slate-500">
                                                {cls.studentCount} öğrenci
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/search?type=class&name=${encodeURIComponent(cls.className)}`)}
                                        >
                                            Öğrenciler
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }

    return null;
}

import { API_BASE_URL } from '@/lib/auth';

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}

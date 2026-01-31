'use client';

import React, { useState, useEffect } from 'react';
import { format, isBefore, isAfter, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, FileText, CheckCircle, XCircle, Trophy, Table as TableIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';

interface Exam {
    id: string;
    title: string;
    type: string;
    publisher?: string;
    gradeLevel: number;
    date: string;
    scheduledDateTime?: string;
    applicationDateTime?: string;
    color?: string;
    isPublisherVisible: boolean;
    isAnswerKeyPublic: boolean;
    answerKeyUrl?: string;
    schoolParticipantCount?: number;
    districtParticipantCount?: number;
    cityParticipantCount?: number;
    generalParticipantCount?: number;
    hasAttempted: boolean;
}

export default function StudentExamCalendarPage() {
    const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
    const [pastExams, setPastExams] = useState<Exam[]>([]);
    const [allExams, setAllExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [view, setView] = useState<'table' | 'calendar'>('table');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [settings, setSettings] = useState({
        showPublisher: false,
        showParticipantCounts: true,
    });
    const router = useRouter();

    const getSchoolIdAndUser = () => {
        if (typeof window === 'undefined') return { schoolId: null, user: null };
        const userStr = localStorage.getItem('user');
        if (!userStr) return { schoolId: null, user: null };
        try {
            const user = JSON.parse(userStr);
            return { schoolId: user.schoolId, user };
        } catch {
            return { schoolId: null, user: null };
        }
    };

    useEffect(() => {
        const { user: userData } = getSchoolIdAndUser();
        setUser(userData);
        fetchSettings();
        fetchExams();
    }, []);

    const fetchSettings = async () => {
        const { schoolId } = getSchoolIdAndUser();
        if (!schoolId) return;

        try {
            const response = await fetch(
                `http://localhost:3001/exams/calendar/settings?schoolId=${schoolId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSettings({
                    showPublisher: data.showPublisher,
                    showParticipantCounts: data.showParticipantCounts,
                });
            }
            // Silently ignore 403 errors for students
        } catch (error) {
            // Silently ignore errors - use default settings
        }
    };

    const fetchExams = async () => {
        const { schoolId, user } = getSchoolIdAndUser();
        
        setLoading(true);
        
        if (!schoolId || !user?.student?.class?.grade?.name) {
            console.error('Missing required data:', { schoolId, hasStudent: !!user?.student, hasClass: !!user?.student?.class, hasGrade: !!user?.student?.class?.grade });
            setLoading(false);
            return;
        }

        try {
            const gradeLevel = parseInt(user.student.class.grade.name);
            const currentYear = new Date().getFullYear();

            const params = new URLSearchParams({
                schoolId,
                year: currentYear.toString(),
                gradeLevel: gradeLevel.toString(),
                includeArchived: 'false',
            });

            const response = await fetch(`http://localhost:3001/exams/calendar/view?${params}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const now = new Date();

                const upcoming = data.filter((exam: Exam) => {
                    const examDate = new Date(exam.scheduledDateTime || exam.date);
                    return isAfter(examDate, now);
                });

                const past = data.filter((exam: Exam) => {
                    const examDate = new Date(exam.scheduledDateTime || exam.date);
                    return isBefore(examDate, now);
                });

                setUpcomingExams(upcoming.sort((a: Exam, b: Exam) => 
                    new Date(a.scheduledDateTime || a.date).getTime() - 
                    new Date(b.scheduledDateTime || b.date).getTime()
                ));

                setPastExams(past.sort((a: Exam, b: Exam) => 
                    new Date(b.scheduledDateTime || b.date).getTime() - 
                    new Date(a.scheduledDateTime || a.date).getTime()
                ));

                setAllExams(data.sort((a: Exam, b: Exam) => 
                    new Date(b.scheduledDateTime || b.date).getTime() - 
                    new Date(a.scheduledDateTime || a.date).getTime()
                ));
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            TYT: 'bg-blue-500',
            AYT: 'bg-purple-500',
            LGS: 'bg-green-500',
            OZEL: 'bg-orange-500',
        };
        return colors[type] || 'bg-gray-500';
    };

    const canViewAnswerKey = (exam: Exam) => {
        if (!exam.isAnswerKeyPublic || !exam.answerKeyUrl) return false;
        if (!exam.applicationDateTime) return true;
        return isAfter(new Date(), new Date(exam.applicationDateTime));
    };

    const getExamsForDay = (day: Date) => {
        return allExams.filter((exam) => {
            const examDate = new Date(exam.scheduledDateTime || exam.date);
            return isSameDay(examDate, day);
        });
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleToday = () => {
        setCurrentMonth(new Date());
    };

    const renderExamCard = (exam: Exam, isPast: boolean) => {
        const examDate = new Date(exam.scheduledDateTime || exam.date);
        const showAnswerKey = canViewAnswerKey(exam);

        return (
            <Card
                key={exam.id}
                className="p-4 hover:shadow-lg transition-shadow"
                style={{ borderLeft: `4px solid ${exam.color || '#3b82f6'}` }}
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTypeColor(exam.type)}>{exam.type}</Badge>
                            {exam.hasAttempted ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Girildi
                                </Badge>
                            ) : isPast ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Girilmedi
                                </Badge>
                            ) : null}
                        </div>

                        <h3 className="font-semibold text-lg mb-1">{exam.title}</h3>

                        {settings.showPublisher && exam.isPublisherVisible && exam.publisher && (
                            <p className="text-sm text-muted-foreground mb-2">
                                Yayın: {exam.publisher}
                            </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {format(examDate, 'dd MMMM yyyy', { locale: tr })}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {format(examDate, 'HH:mm')}
                            </div>
                        </div>

                        {settings.showParticipantCounts && (
                            <div className="mt-3 flex flex-wrap gap-2 text-sm">
                                {exam.schoolParticipantCount !== undefined && (
                                    <span className="text-muted-foreground">
                                        Okul: {exam.schoolParticipantCount}
                                    </span>
                                )}
                                {exam.districtParticipantCount !== undefined && (
                                    <span className="text-muted-foreground">
                                        İlçe: {exam.districtParticipantCount}
                                    </span>
                                )}
                                {exam.cityParticipantCount !== undefined && (
                                    <span className="text-muted-foreground">
                                        İl: {exam.cityParticipantCount}
                                    </span>
                                )}
                                {exam.generalParticipantCount !== undefined && (
                                    <span className="text-muted-foreground">
                                        Genel: {exam.generalParticipantCount}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    {exam.hasAttempted && (
                        <Button
                            onClick={() => router.push(`/dashboard/student/results/${exam.id}`)}
                            size="sm"
                        >
                            <Trophy className="w-4 h-4 mr-2" />
                            Sonucumu Gör
                        </Button>
                    )}

                    {showAnswerKey && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                window.open(`http://localhost:3001${exam.answerKeyUrl}`, '_blank')
                            }
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Cevap Anahtarı
                        </Button>
                    )}
                </div>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Yükleniyor...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Deneme Takvimi</h1>
                <p className="text-muted-foreground mt-1">
                    Sınıf: {user?.student?.class?.grade?.name || '-'}
                </p>
            </div>

            <Tabs value={view} onValueChange={(v) => setView(v as 'table' | 'calendar')}>
                <TabsList>
                    <TabsTrigger value="table">
                        <TableIcon className="w-4 h-4 mr-2" />
                        Tablo Görünümü
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Takvim Görünümü
                    </TabsTrigger>
                </TabsList>

                {/* Tablo Görünümü */}
                <TabsContent value="table">
                    {allExams.length === 0 ? (
                        <Card className="p-8 text-center">
                            <p className="text-muted-foreground">Henüz deneme bulunmuyor.</p>
                        </Card>
                    ) : (
                        <Card>
                            <div className="p-4 border-b">
                                <div className="text-sm text-muted-foreground">
                                    Toplam {allExams.length} deneme
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Deneme Adı</TableHead>
                                            {settings.showPublisher && <TableHead>Yayın</TableHead>}
                                            <TableHead>Tür</TableHead>
                                            <TableHead>Tarih</TableHead>
                                            <TableHead>Saat</TableHead>
                                            <TableHead>Durum</TableHead>
                                            {settings.showParticipantCounts && <TableHead>Katılım</TableHead>}
                                            <TableHead className="text-right">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allExams.map((exam) => {
                                            const examDate = new Date(exam.scheduledDateTime || exam.date);
                                            const isPast = isBefore(examDate, new Date());
                                            const showAnswerKey = canViewAnswerKey(exam);

                                            return (
                                                <TableRow
                                                    key={exam.id}
                                                    style={{
                                                        borderLeft: exam.color
                                                            ? `4px solid ${exam.color}`
                                                            : undefined,
                                                    }}
                                                >
                                                    <TableCell className="font-medium">
                                                        {exam.title}
                                                    </TableCell>
                                                    {settings.showPublisher && (
                                                        <TableCell>
                                                            {exam.isPublisherVisible && exam.publisher
                                                                ? exam.publisher
                                                                : '-'}
                                                        </TableCell>
                                                    )}
                                                    <TableCell>
                                                        <Badge className={getTypeColor(exam.type)}>
                                                            {exam.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(examDate, 'dd MMM yyyy', { locale: tr })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {format(examDate, 'HH:mm')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {exam.hasAttempted ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-green-50 text-green-700 border-green-200"
                                                            >
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Girildi
                                                            </Badge>
                                                        ) : isPast ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="bg-red-50 text-red-700 border-red-200"
                                                            >
                                                                <XCircle className="w-3 h-3 mr-1" />
                                                                Girilmedi
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">Beklemede</Badge>
                                                        )}
                                                    </TableCell>
                                                    {settings.showParticipantCounts && (
                                                        <TableCell>
                                                            <div className="text-sm space-y-1">
                                                                {exam.schoolParticipantCount !== undefined && (
                                                                    <div>Okul: {exam.schoolParticipantCount}</div>
                                                                )}
                                                                {exam.districtParticipantCount !== undefined && (
                                                                    <div className="text-muted-foreground">
                                                                        İlçe: {exam.districtParticipantCount}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            {exam.hasAttempted && (
                                                                <Button
                                                                    onClick={() =>
                                                                        router.push(
                                                                            `/dashboard/student/results/${exam.id}`
                                                                        )
                                                                    }
                                                                    size="sm"
                                                                >
                                                                    <Trophy className="w-4 h-4 mr-2" />
                                                                    Sonucumu Gör
                                                                </Button>
                                                            )}
                                                            {showAnswerKey && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        window.open(
                                                                            `http://localhost:3001${exam.answerKeyUrl}`,
                                                                            '_blank'
                                                                        )
                                                                    }
                                                                >
                                                                    <FileText className="w-4 h-4 mr-2" />
                                                                    Cevap Anahtarı
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    )}
                </TabsContent>

                {/* Takvim Görünümü */}
                <TabsContent value="calendar">
                    <Card className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">
                                {format(currentMonth, 'MMMM yyyy', { locale: tr })}
                            </h2>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handleToday}>
                                    Bugün
                                </Button>
                                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Yükleniyor...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2">
                                {/* Gün başlıkları */}
                                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                                    <div
                                        key={day}
                                        className="text-center font-semibold text-sm text-muted-foreground py-2"
                                    >
                                        {day}
                                    </div>
                                ))}

                                {/* Boş günler (önceki aydan) */}
                                {(() => {
                                    const monthStart = startOfMonth(currentMonth);
                                    const startDay = monthStart.getDay();
                                    const paddingDays = startDay === 0 ? 6 : startDay - 1;
                                    return Array.from({ length: paddingDays }).map((_, i) => (
                                        <div
                                            key={`padding-${i}`}
                                            className="min-h-[120px] bg-muted/20 rounded-lg"
                                        />
                                    ));
                                })()}

                                {/* Günler */}
                                {(() => {
                                    const monthStart = startOfMonth(currentMonth);
                                    const monthEnd = endOfMonth(currentMonth);
                                    const daysInMonth = eachDayOfInterval({
                                        start: monthStart,
                                        end: monthEnd,
                                    });

                                    return daysInMonth.map((day) => {
                                        const dayExams = getExamsForDay(day);
                                        const isCurrentDay = isToday(day);

                                        return (
                                            <div
                                                key={day.toString()}
                                                className={`min-h-[120px] border rounded-lg p-2 ${
                                                    isCurrentDay
                                                        ? 'border-blue-500 bg-blue-50/50'
                                                        : 'border-border'
                                                } hover:shadow-md transition-shadow`}
                                            >
                                                <div
                                                    className={`text-sm font-medium mb-2 ${
                                                        isCurrentDay
                                                            ? 'text-blue-600 font-bold'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {format(day, 'd')}
                                                </div>

                                                <div className="space-y-1">
                                                    {dayExams.slice(0, 3).map((exam) => (
                                                        <button
                                                            key={exam.id}
                                                            onClick={() =>
                                                                exam.hasAttempted
                                                                    ? router.push(
                                                                          `/dashboard/student/results/${exam.id}`
                                                                      )
                                                                    : null
                                                            }
                                                            className="w-full text-left"
                                                        >
                                                            <div
                                                                className={`text-xs px-2 py-1 rounded truncate ${
                                                                    exam.hasAttempted
                                                                        ? 'hover:opacity-80 cursor-pointer'
                                                                        : 'cursor-default'
                                                                } transition-opacity`}
                                                                style={{
                                                                    backgroundColor: exam.color || '#3b82f6',
                                                                    color: 'white',
                                                                }}
                                                                title={exam.title}
                                                            >
                                                                {exam.title}
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {dayExams.length > 3 && (
                                                        <div className="text-xs text-center text-muted-foreground">
                                                            +{dayExams.length - 3} daha
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

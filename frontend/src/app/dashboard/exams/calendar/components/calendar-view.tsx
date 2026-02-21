'use client';

import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface CalendarViewProps {
    year: number;
    type?: string;
    gradeLevel?: number;
    includeArchived: boolean;
    refreshTrigger: number;
    onRefresh: () => void;
    onDayClick?: (day: Date) => void;
}

interface Exam {
    id: string;
    title: string;
    type: string;
    gradeLevel: number;
    date: string;
    scheduledDateTime?: string;
    color?: string;
    isArchived: boolean;
    _count?: { attempts: number };
}

export function CalendarView({
    year,
    type,
    gradeLevel,
    includeArchived,
    refreshTrigger,
    onDayClick,
}: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date(year, new Date().getMonth()));
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const getSchoolId = () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            const user = JSON.parse(userStr);
            return user.schoolId;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        fetchExams();
    }, [currentMonth, type, gradeLevel, includeArchived, refreshTrigger]);

    const fetchExams = async () => {
        const schoolId = getSchoolId();
        if (!schoolId) return;

        setLoading(true);
        try {
            const params = new URLSearchParams({
                schoolId,
                year: currentMonth.getFullYear().toString(),
                month: (currentMonth.getMonth() + 1).toString(),
                includeArchived: includeArchived.toString(),
            });

            if (type) params.append('type', type);
            if (gradeLevel) params.append('gradeLevel', gradeLevel.toString());

            const response = await fetch(`${API_BASE_URL}/exams/calendar/view?${params}`);
            if (response.ok) {
                const data = await response.json();
                setExams(data);
            }
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Ayın başladığı gün (0 = Pazar). Takvimi pazartesi başlatıyoruz.
    const startDay = monthStart.getDay();
    const paddingDays = startDay === 0 ? 6 : startDay - 1;

    const getExamsForDay = (day: Date) => {
        return exams.filter((exam) => {
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

    return (
        <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy', { locale: tr })}</h2>
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
                        <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                            {day}
                        </div>
                    ))}

                    {/* Boş günler (önceki aydan) */}
                    {Array.from({ length: paddingDays }).map((_, i) => (
                        <div key={`padding-${i}`} className="min-h-[120px] bg-muted/20 rounded-lg" />
                    ))}

                    {/* Günler */}
                    {daysInMonth.map((day) => {
                        const dayExams = getExamsForDay(day);
                        const isCurrentDay = isToday(day);

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => onDayClick?.(day)}
                                className={`min-h-[120px] border rounded-lg p-2 cursor-pointer ${
                                    isCurrentDay ? 'border-blue-500 bg-blue-50/50' : 'border-border'
                                } hover:shadow-md transition-shadow`}
                            >
                                <div
                                    className={`text-sm font-medium mb-2 ${
                                        isCurrentDay ? 'text-blue-600 font-bold' : 'text-muted-foreground'
                                    }`}
                                >
                                    {format(day, 'd')}
                                </div>

                                <div className="space-y-1">
                                    {dayExams.slice(0, 3).map((exam) => (
                                        <button
                                            key={exam.id}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                router.push(`/dashboard/exams/${exam.id}/results`);
                                            }}
                                            className="w-full text-left"
                                        >
                                            <div
                                                className="text-xs px-2 py-1 rounded truncate hover:opacity-80 transition-opacity"
                                                style={{
                                                    backgroundColor: exam.color || '#3b82f6',
                                                    color: 'white',
                                                    opacity: exam.isArchived ? 0.5 : 1,
                                                }}
                                                title={`${exam.title} - ${exam.gradeLevel}. Sınıf`}
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
                    })}
                </div>
            )}
        </Card>
    );
}

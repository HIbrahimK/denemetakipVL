'use client';

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/auth';
import { Plus, Calendar as CalendarIcon, List, Archive, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ExamCalendarTable } from './components/exam-calendar-table';
import { CreateExamModal } from './components/create-exam-modal';
import { CalendarView } from './components/calendar-view';
import { ExamCalendarSettings } from './components/exam-calendar-settings';

interface ExportExam {
    title?: string;
    type?: string;
    gradeLevel?: number;
    date: string;
    scheduledDateTime?: string;
    publisher?: string;
    broughtBy?: string;
    quantity?: number;
    fee?: number;
    isArchived?: boolean;
}

export default function ExamCalendarPage() {
    const [activeTab, setActiveTab] = useState<'table' | 'calendar'>('table');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [prefillDate, setPrefillDate] = useState<Date | null>(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedType, setSelectedType] = useState<string>('ALL');
    const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
    const [includeArchived, setIncludeArchived] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [canCreateExam, setCanCreateExam] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            setCanCreateExam(false);
            return;
        }

        try {
            const user = JSON.parse(userStr);
            setCanCreateExam(['SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN'].includes(user?.role));
        } catch {
            setCanCreateExam(false);
        }
    }, []);

    // Akademik yıl hesaplama (Haziran başlangıç)
    const currentMonth = new Date().getMonth() + 1;
    const academicYear = currentMonth >= 6 ? selectedYear : selectedYear - 1;
    const academicYearLabel = `${academicYear}-${academicYear + 1}`;

    const handleRefresh = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleOpenCreateModal = (date?: Date) => {
        setPrefillDate(date || null);
        setShowCreateModal(true);
    };

    const handleExport = async () => {
        if (activeTab === 'calendar') {
            window.print();
            return;
        }

        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        try {
            const user = JSON.parse(userStr);
            const schoolId = user?.schoolId;
            if (!schoolId) return;

            const params = new URLSearchParams({
                schoolId,
                year: selectedYear.toString(),
                includeArchived: includeArchived.toString(),
            });

            if (selectedType !== 'ALL') params.append('type', selectedType);
            if (selectedGrade !== 'ALL') params.append('gradeLevel', selectedGrade);

            const response = await fetch(`${API_BASE_URL}/exams/calendar/view?${params}`);
            if (!response.ok) return;

            const exams: ExportExam[] = await response.json();
            const headers = [
                'Deneme Adı',
                'Tür',
                'Sınıf',
                'Tarih',
                'Saat',
                'Yayın',
                'Getiren',
                'Adet',
                'Ücret',
                'Arşiv',
            ];

            const rows = exams.map((exam) => {
                const examDate = new Date(exam.scheduledDateTime || exam.date);
                return [
                    exam.title || '',
                    exam.type || '',
                    `${exam.gradeLevel || ''}. Sınıf`,
                    examDate.toLocaleDateString('tr-TR'),
                    examDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    exam.publisher || '',
                    exam.broughtBy || '',
                    exam.quantity ?? '',
                    exam.fee ?? '',
                    exam.isArchived ? 'Evet' : 'Hayır',
                ];
            });

            const csvContent = [headers, ...rows]
                .map((row) =>
                    row
                        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
                        .join(',')
                )
                .join('\n');

            const blob = new Blob([`\ufeff${csvContent}`], {
                type: 'text/csv;charset=utf-8;',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `deneme-takvimi-${selectedYear}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Deneme Takvimi</h1>
                    <p className="text-muted-foreground mt-1">Akademik Yıl: {academicYearLabel}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        ℹ️ &quot;Sınavlar&quot; sayfasından eklenen tüm sınavlar ve cevap anahtarları burada görünür
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ExamCalendarSettings />
                    {canCreateExam && (
                        <Button onClick={() => handleOpenCreateModal()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Yeni Deneme Ekle
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v, 10))}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[2024, 2025, 2026, 2027, 2028].map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}-{year + 1}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Deneme Türü" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tüm Türler</SelectItem>
                            <SelectItem value="LGS">LGS</SelectItem>
                            <SelectItem value="TYT">TYT</SelectItem>
                            <SelectItem value="AYT">AYT</SelectItem>
                            <SelectItem value="OZEL">Özel</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sınıf Seviyesi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tüm Sınıflar</SelectItem>
                            {[5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                                <SelectItem key={grade} value={grade.toString()}>
                                    {grade}. Sınıf
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant={includeArchived ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIncludeArchived(!includeArchived)}
                    >
                        <Archive className="w-4 h-4 mr-2" />
                        Arşiv
                    </Button>

                    <div className="ml-auto">
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="w-4 h-4 mr-2" />
                            {activeTab === 'calendar' ? 'Yazdır' : 'Excel İndir'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'table' | 'calendar')}>
                <TabsList>
                    <TabsTrigger value="table">
                        <List className="w-4 h-4 mr-2" />
                        Tablo Görünümü
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Takvim Görünümü
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="table" className="mt-4">
                    <ExamCalendarTable
                        year={selectedYear}
                        type={selectedType !== 'ALL' ? selectedType : undefined}
                        gradeLevel={selectedGrade !== 'ALL' ? parseInt(selectedGrade, 10) : undefined}
                        includeArchived={includeArchived}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="calendar" className="mt-4">
                    <CalendarView
                        year={selectedYear}
                        type={selectedType !== 'ALL' ? selectedType : undefined}
                        gradeLevel={selectedGrade !== 'ALL' ? parseInt(selectedGrade, 10) : undefined}
                        includeArchived={includeArchived}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                        onDayClick={(date) => {
                            if (canCreateExam) {
                                handleOpenCreateModal(date);
                            }
                        }}
                    />
                </TabsContent>
            </Tabs>

            {showCreateModal && (
                <CreateExamModal
                    open={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleRefresh}
                    initialDate={prefillDate}
                />
            )}
        </div>
    );
}

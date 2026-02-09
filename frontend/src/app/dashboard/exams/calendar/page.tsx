'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, List, Archive, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {  Card } from '@/components/ui/card';
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

export default function ExamCalendarPage() {
    const [activeTab, setActiveTab] = useState<'table' | 'calendar'>('table');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedType, setSelectedType] = useState<string>('ALL');
    const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
    const [includeArchived, setIncludeArchived] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Akademik yıl hesaplama (Haziran başlangıç)
    const currentMonth = new Date().getMonth() + 1;
    const academicYear = currentMonth >= 6 ? selectedYear : selectedYear - 1;
    const academicYearLabel = `${academicYear}-${academicYear + 1}`;

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Deneme Takvimi</h1>
                    <p className="text-muted-foreground mt-1">
                        Akademik Yıl: {academicYearLabel}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        ℹ️ "Sınavlar" sayfasından eklenen tüm sınavlar ve cevap anahtarları burada görünür
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ExamCalendarSettings />
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Deneme Ekle
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
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
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
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
                        gradeLevel={selectedGrade !== 'ALL' ? parseInt(selectedGrade) : undefined}
                        includeArchived={includeArchived}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>

                <TabsContent value="calendar" className="mt-4">
                    <CalendarView
                        year={selectedYear}
                        type={selectedType !== 'ALL' ? selectedType : undefined}
                        gradeLevel={selectedGrade !== 'ALL' ? parseInt(selectedGrade) : undefined}
                        includeArchived={includeArchived}
                        refreshTrigger={refreshTrigger}
                        onRefresh={handleRefresh}
                    />
                </TabsContent>
            </Tabs>

            {showCreateModal && (
                <CreateExamModal
                    open={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleRefresh}
                />
            )}
        </div>
    );
}

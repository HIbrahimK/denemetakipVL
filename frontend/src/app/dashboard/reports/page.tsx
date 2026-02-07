'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileSpreadsheet, FileText, Loader2, BarChart3, TrendingUp, Users, LayoutDashboard, Award, Printer, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RankingMatrixReport from '@/components/reports/ranking-matrix-report';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface LessonAverage {
  lessonName: string;
  averageNet: number;
  averageCorrect: number;
  averageIncorrect: number;
  averageEmpty: number;
}

interface ScoreAverage {
  type: string;
  averageScore: number;
}

interface BranchAverage {
  branchId: string;
  branchName: string;
  participantCount: number;
  lessonAverages: LessonAverage[];
  scoreAverages: ScoreAverage[];
}

interface ExamReport {
  examId: string;
  examTitle: string;
  examDate: string;
  participantCount: number;
  lessonAverages: LessonAverage[];
  scoreAverages: ScoreAverage[];
  branchAverages?: BranchAverage[];
  lessonDetails?: LessonAverage[];
}

interface SubjectExam {
  examId: string;
  examTitle: string;
  examDate: string;
  participantCount: number;
  averageNet: number;
  averageCorrect: number;
  averageIncorrect: number;
  averageEmpty: number;
  averageScore?: number;
}

interface SubjectReport {
  lessonName: string;
  exams: SubjectExam[];
}

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [examType, setExamType] = useState<string>('TYT');
  const [gradeLevel, setGradeLevel] = useState<string>('');
  const [lessonName, setLessonName] = useState<string>('');
  const [reportType, setReportType] = useState<'exam' | 'subject' | 'ranking-matrix'>('exam');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');

  const [examReports, setExamReports] = useState<ExamReport[]>([]);
  const [subjectReport, setSubjectReport] = useState<SubjectReport | null>(null);
  const [availableLessons, setAvailableLessons] = useState<string[]>([]);

  const examTypes = [
    { value: 'TYT', label: 'TYT' },
    { value: 'AYT', label: 'AYT' },
    { value: 'LGS', label: 'LGS' },
    { value: 'OZEL', label: 'ÖZEL' },
  ];

  const gradeLevels = [
    { value: '5', label: '5. Sınıf' },
    { value: '6', label: '6. Sınıf' },
    { value: '7', label: '7. Sınıf' },
    { value: '8', label: '8. Sınıf' },
    { value: '9', label: '9. Sınıf' },
    { value: '10', label: '10. Sınıf' },
    { value: '11', label: '11. Sınıf' },
    { value: '12', label: '12. Sınıf' },
  ];

  useEffect(() => {
    // Fetch available lessons based on exam type
    fetchAvailableLessons();
  }, [examType]);

  const fetchAvailableLessons = async () => {
    // Sınav türüne göre dersleri ayarla
    if (examType === 'LGS') {
      setAvailableLessons(['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce', 'Din Kültürü']);
    } else if (examType === 'TYT') {
      setAvailableLessons(['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilimler']);
    } else if (examType === 'AYT') {
      setAvailableLessons(['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Edebiyat', 'Tarih', 'Coğrafya']);
    }
  };

  const fetchExamReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = viewMode === 'summary' ? 'summary' : 'detailed';
      const url = `http://localhost:3001/reports/exams/${endpoint}?examType=${examType}${gradeLevel ? `&gradeLevel=${gradeLevel}` : ''}`;

      const response = await fetch(url, {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExamReports(data);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectReport = async () => {
    if (!lessonName) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:3001/reports/subject?examType=${examType}&lessonName=${lessonName}${gradeLevel ? `&gradeLevel=${gradeLevel}` : ''}`;

      const response = await fetch(url, {
        headers: {
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubjectReport(data);
      } else {
        console.error('Failed to fetch subject report');
      }
    } catch (error) {
      console.error('Error fetching subject report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (reportType === 'exam') {
      fetchExamReports();
    } else {
      fetchSubjectReport();
    }
  };

  const handleDownload = async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '';

      if (reportType === 'exam') {
        const endpoint = viewMode === 'summary' ? 'summary' : 'detailed';
        url = `http://localhost:3001/reports/exams/${endpoint}/${format}?examType=${examType}${gradeLevel ? `&gradeLevel=${gradeLevel}` : ''}`;
      } else {
        url = `http://localhost:3001/reports/subject/${format}?examType=${examType}&lessonName=${lessonName}${gradeLevel ? `&gradeLevel=${gradeLevel}` : ''}`;
      }

      const response = await fetch(url, {
        headers: {
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `rapor-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    } finally {
      setExportLoading(false);
    }
  };

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
        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        th, td {
          border: 1px solid #000 !important;
          padding: 4px !important;
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

  const handleDownloadExamsList = async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = viewMode === 'summary' ? 'summary' : 'detailed';
      const url = `http://localhost:3001/reports/exams/${endpoint}/${format}?examType=${examType}${gradeLevel ? `&gradeLevel=${gradeLevel}` : ''}`;

      const response = await fetch(url, {
        headers: {
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `deneme-ozet-bilgileri-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (error) {
      console.error('Error downloading exams list:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrintExamsList = () => {
    const style = document.createElement('style');
    style.id = 'print-exams-list-style';
    style.innerHTML = `
      @media print {
        @page {
          size: landscape;
          margin: 10mm;
        }
        .no-print {
          display: none !important;
        }
        body * {
          visibility: hidden;
        }
        #exams-list-printable, #exams-list-printable * {
          visibility: visible;
        }
        #exams-list-printable {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 10px !important;
        }
        th, td {
          border: 1px solid #000 !important;
          padding: 4px !important;
        }
        th {
          background-color: #f0f0f0 !important;
          font-weight: bold !important;
        }
      }
    `;
    document.head.appendChild(style);
    setTimeout(() => {
      window.print();
      const el = document.getElementById('print-exams-list-style');
      if (el) el.remove();
    }, 300);
  };

  // Calculate chart data for exam reports
  const examChartData = useMemo(() => {
    if (!examReports.length) return [];

    return examReports.map(report => {
      const totalNet = report.lessonAverages.reduce((acc, lesson) => acc + lesson.averageNet, 0);
      const avgScore = report.scoreAverages.length > 0
        ? report.scoreAverages.reduce((acc, score) => acc + score.averageScore, 0) / report.scoreAverages.length
        : 0;

      return {
        name: report.examTitle.length > 20 ? report.examTitle.substring(0, 20) + '...' : report.examTitle,
        fullName: report.examTitle,
        totalNet: Number(totalNet.toFixed(2)),
        avgScore: Number(avgScore.toFixed(2)),
        participantCount: report.participantCount,
        date: new Date(report.examDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
      };
    });
  }, [examReports]);

  // Calculate chart data for subject report
  const subjectChartData = useMemo(() => {
    if (!subjectReport) return [];

    return subjectReport.exams.map(exam => ({
      name: exam.examTitle.length > 20 ? exam.examTitle.substring(0, 20) + '...' : exam.examTitle,
      fullName: exam.examTitle,
      net: Number(exam.averageNet.toFixed(2)),
      correct: Number(exam.averageCorrect.toFixed(2)),
      incorrect: Number(exam.averageIncorrect.toFixed(2)),
      empty: Number(exam.averageEmpty.toFixed(2)),
      participantCount: exam.participantCount,
      date: new Date(exam.examDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
    }));
  }, [subjectReport]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Raporlar</h1>
          <p className="text-muted-foreground">Okul deneme sonuçları ve istatistikler</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapor Oluştur</CardTitle>
          <CardDescription>Görüntülemek istediğiniz rapor türünü seçin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rapor Türü</label>
              <Select value={reportType} onValueChange={(value: 'exam' | 'subject' | 'ranking-matrix') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exam">Sınav Raporu</SelectItem>
                  <SelectItem value="subject">Ders Bazlı Rapor</SelectItem>
                  <SelectItem value="ranking-matrix">Öğrenci Sıralama Matrisi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sınav Türü</label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sınıf Seviyesi</label>
              <div className="flex gap-2">
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm Sınıflar" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {gradeLevel && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setGradeLevel('')}
                    title="Temizle"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {reportType === 'subject' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Ders</label>
                <Select value={lessonName} onValueChange={setLessonName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLessons.map((lesson) => (
                      <SelectItem key={lesson} value={lesson}>
                        {lesson}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleGenerateReport} disabled={loading || (reportType === 'subject' && !lessonName)}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rapor Oluştur
            </Button>
            {reportType === 'exam' && (
              <div className="flex gap-1 bg-muted p-1 rounded-md ml-auto">
                <Button
                  variant={viewMode === 'summary' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('summary')}
                >
                  Özet
                </Button>
                <Button
                  variant={viewMode === 'detailed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('detailed')}
                >
                  Ayrıntılı
                </Button>
              </div>
            )}
            {reportType === 'exam' && examReports.length > 0 && (
              <Button variant="outline" size="icon" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exam Reports */}
      {reportType === 'exam' && examReports.length > 0 && (
        <div id="printable-content" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Toplam Deneme</CardTitle>
                <BarChart3 className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{examReports.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Ortalama Katılım</CardTitle>
                <Users className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {(examReports.reduce((acc, r) => acc + r.participantCount, 0) / examReports.length).toFixed(0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Ort. Net</CardTitle>
                <LayoutDashboard className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">
                  {(examReports.reduce((acc, r) => {
                    const totalNet = r.lessonAverages.reduce((sum, l) => sum + l.averageNet, 0);
                    return acc + totalNet;
                  }, 0) / examReports.length).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Ort. Puan</CardTitle>
                <Award className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  {(examReports.reduce((acc, r) => {
                    const avgScore = r.scoreAverages.length > 0
                      ? r.scoreAverages.reduce((sum, s) => sum + s.averageScore, 0) / r.scoreAverages.length
                      : 0;
                    return acc + avgScore;
                  }, 0) / examReports.length).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lesson Averages Table - Okul/Deneme Ortalamaları */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Okul Deneme Özet Bilgileri</CardTitle>
                <div className="flex gap-2 no-print">
                  <Button variant="outline" size="sm" onClick={() => handleDownload('excel')} disabled={exportLoading}>
                    {exportLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')} disabled={exportLoading}>
                    {exportLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {viewMode === 'summary' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Şube</TableHead>
                      {examReports[0]?.lessonAverages.map((lesson) => (
                        <TableHead key={lesson.lessonName} className="text-center">{lesson.lessonName}</TableHead>
                      ))}
                      <TableHead className="text-center">Toplam Net</TableHead>
                      <TableHead className="text-center">Puan Ortalaması</TableHead>
                      <TableHead className="text-center">Katılım</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examReports[0]?.branchAverages && examReports[0].branchAverages.length > 0 ? (
                      <>
                        {examReports[0].branchAverages.map((branch) => {
                          const totalNet = branch.lessonAverages.reduce((sum, l) => sum + l.averageNet, 0);
                          const avgScore = branch.scoreAverages.length > 0
                            ? branch.scoreAverages.reduce((sum, s) => sum + s.averageScore, 0) / branch.scoreAverages.length
                            : 0;

                          return (
                            <TableRow key={branch.branchId}>
                              <TableCell className="font-medium">{branch.branchName}</TableCell>
                              {branch.lessonAverages.map((lesson) => (
                                <TableCell key={lesson.lessonName} className="text-center">
                                  {lesson.averageNet.toFixed(2)}
                                </TableCell>
                              ))}
                              <TableCell className="text-center font-semibold text-blue-600">
                                {totalNet.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-center font-semibold text-green-600">
                                {avgScore.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-center">
                                {branch.participantCount}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {/* Ortalama Row */}
                        <TableRow className="bg-muted/50 font-medium">
                          <TableCell>Ortalama</TableCell>
                          {examReports[0].lessonAverages.map((lesson) => (
                            <TableCell key={lesson.lessonName} className="text-center">
                              {lesson.averageNet.toFixed(2)}
                            </TableCell>
                          ))}
                          <TableCell className="text-center text-blue-600">
                            {examReports[0].lessonAverages.reduce((sum, l) => sum + l.averageNet, 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center text-green-600">
                            {(examReports[0].scoreAverages.length > 0
                              ? examReports[0].scoreAverages.reduce((sum, s) => sum + s.averageScore, 0) / examReports[0].scoreAverages.length
                              : 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {examReports[0].participantCount}
                          </TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={100} className="text-center text-muted-foreground">
                          Veri bulunamadı
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead rowSpan={2}>Şube</TableHead>
                      {examReports[0]?.lessonAverages.map((lesson) => (
                        <React.Fragment key={lesson.lessonName}>
                          <TableHead className="text-center">
                            {lesson.lessonName}<br />D
                          </TableHead>
                          <TableHead className="text-center">
                            {lesson.lessonName}<br />Y
                          </TableHead>
                          <TableHead className="text-center">
                            {lesson.lessonName}<br />N
                          </TableHead>
                        </React.Fragment>
                      ))}
                      <TableHead rowSpan={2} className="text-center">Toplam<br />Doğru</TableHead>
                      <TableHead rowSpan={2} className="text-center">Toplam<br />Yanlış</TableHead>
                      <TableHead rowSpan={2} className="text-center">Toplam<br />Net</TableHead>
                      <TableHead rowSpan={2} className="text-center">Puan<br />Ort.</TableHead>
                      <TableHead rowSpan={2} className="text-center">Katılım</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examReports[0]?.branchAverages && examReports[0].branchAverages.length > 0 ? (
                      <>
                        {examReports[0].branchAverages.map((branch) => {
                          const totalCorrect = branch.lessonAverages.reduce((sum, l) => sum + l.averageCorrect, 0);
                          const totalIncorrect = branch.lessonAverages.reduce((sum, l) => sum + l.averageIncorrect, 0);
                          const totalNet = branch.lessonAverages.reduce((sum, l) => sum + l.averageNet, 0);
                          const avgScore = branch.scoreAverages.length > 0
                            ? branch.scoreAverages.reduce((sum, s) => sum + s.averageScore, 0) / branch.scoreAverages.length
                            : 0;

                          return (
                            <TableRow key={branch.branchId}>
                              <TableCell className="font-medium">{branch.branchName}</TableCell>
                              {branch.lessonAverages.map((lesson) => (
                                <React.Fragment key={lesson.lessonName}>
                                  <TableCell className="text-center text-green-600">
                                    {lesson.averageCorrect.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-center text-red-600">
                                    {lesson.averageIncorrect.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {lesson.averageNet.toFixed(2)}
                                  </TableCell>
                                </React.Fragment>
                              ))}
                              <TableCell className="text-center text-green-600">{totalCorrect.toFixed(2)}</TableCell>
                              <TableCell className="text-center text-red-600">{totalIncorrect.toFixed(2)}</TableCell>
                              <TableCell className="text-center font-semibold text-blue-600">{totalNet.toFixed(2)}</TableCell>
                              <TableCell className="text-center font-semibold text-green-600">{avgScore.toFixed(2)}</TableCell>
                              <TableCell className="text-center">{branch.participantCount}</TableCell>
                            </TableRow>
                          );
                        })}
                        {/* Ortalama Row */}
                        <TableRow className="bg-muted/50 font-medium">
                          <TableCell>Ortalama</TableCell>
                          {examReports[0].lessonAverages.map((lesson) => (
                            <React.Fragment key={lesson.lessonName}>
                              <TableCell className="text-center text-green-600">
                                {lesson.averageCorrect.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-center text-red-600">
                                {lesson.averageIncorrect.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-center">
                                {lesson.averageNet.toFixed(2)}
                              </TableCell>
                            </React.Fragment>
                          ))}
                          <TableCell className="text-center text-green-600">
                            {examReports[0].lessonAverages.reduce((sum, l) => sum + l.averageCorrect, 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center text-red-600">
                            {examReports[0].lessonAverages.reduce((sum, l) => sum + l.averageIncorrect, 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center text-blue-600">
                            {examReports[0].lessonAverages.reduce((sum, l) => sum + l.averageNet, 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center text-green-600">
                            {(examReports[0].scoreAverages.length > 0
                              ? examReports[0].scoreAverages.reduce((sum, s) => sum + s.averageScore, 0) / examReports[0].scoreAverages.length
                              : 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {examReports[0].participantCount}
                          </TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={100} className="text-center text-muted-foreground">
                          Veri bulunamadı
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Deneme Sonuçları Tablosu - All Exams List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Deneme Özet Bilgileri</CardTitle>
                  <CardDescription>Tüm denemelerin detaylı sonuçları</CardDescription>
                </div>
                <div className="flex gap-2 no-print">
                  <Button variant="outline" size="sm" onClick={() => handleDownloadExamsList('excel')} disabled={exportLoading}>
                    {exportLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                    Excel
                  </Button>
                  <Button variant="outline" size="icon" onClick={handlePrintExamsList}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent id="exams-list-printable" className="overflow-x-auto">
              {viewMode === 'summary' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sınav Adı</TableHead>
                      <TableHead>Sınav Tarihi</TableHead>
                      {examReports[0]?.lessonAverages.map((lesson) => (
                        <TableHead key={lesson.lessonName} className="text-center">{lesson.lessonName}</TableHead>
                      ))}
                      <TableHead className="text-center">Toplam Net</TableHead>
                      <TableHead className="text-center">Puan Ortalaması</TableHead>
                      <TableHead className="text-center">Katılım</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examReports.map((report) => {
                      const totalNet = report.lessonAverages.reduce((sum, l) => sum + l.averageNet, 0);
                      const avgScore = report.scoreAverages.length > 0
                        ? report.scoreAverages.reduce((sum, s) => sum + s.averageScore, 0) / report.scoreAverages.length
                        : 0;

                      return (
                        <TableRow key={report.examId}>
                          <TableCell className="font-medium">{report.examTitle}</TableCell>
                          <TableCell>{new Date(report.examDate).toLocaleDateString('tr-TR')}</TableCell>
                          {report.lessonAverages.map((lesson) => (
                            <TableCell key={lesson.lessonName} className="text-center">{lesson.averageNet.toFixed(2)}</TableCell>
                          ))}
                          <TableCell className="text-center font-semibold text-blue-600">{totalNet.toFixed(2)}</TableCell>
                          <TableCell className="text-center font-semibold text-green-600">{avgScore.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{report.participantCount}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sınav Adı</TableHead>
                      <TableHead>Sınav Tarihi</TableHead>
                      {examReports[0]?.lessonAverages.map((lesson) => (
                        <React.Fragment key={lesson.lessonName}>
                          <TableHead className="text-center">
                            {lesson.lessonName}<br />D
                          </TableHead>
                          <TableHead className="text-center">
                            {lesson.lessonName}<br />Y
                          </TableHead>
                          <TableHead className="text-center">
                            {lesson.lessonName}<br />N
                          </TableHead>
                        </React.Fragment>
                      ))}
                      <TableHead className="text-center">Toplam<br />Doğru</TableHead>
                      <TableHead className="text-center">Toplam<br />Yanlış</TableHead>
                      <TableHead className="text-center">Toplam<br />Net</TableHead>
                      <TableHead className="text-center">Puan<br />Ort.</TableHead>
                      <TableHead className="text-center">Katılım</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examReports.map((report) => {
                      const totalCorrect = report.lessonAverages.reduce((sum, l) => sum + l.averageCorrect, 0);
                      const totalIncorrect = report.lessonAverages.reduce((sum, l) => sum + l.averageIncorrect, 0);
                      const totalNet = report.lessonAverages.reduce((sum, l) => sum + l.averageNet, 0);
                      const avgScore = report.scoreAverages.length > 0
                        ? report.scoreAverages.reduce((sum, s) => sum + s.averageScore, 0) / report.scoreAverages.length
                        : 0;

                      return (
                        <TableRow key={report.examId}>
                          <TableCell className="font-medium">{report.examTitle}</TableCell>
                          <TableCell>{new Date(report.examDate).toLocaleDateString('tr-TR')}</TableCell>
                          {report.lessonAverages.map((lesson) => (
                            <React.Fragment key={lesson.lessonName}>
                              <TableCell className="text-center text-green-600">
                                {lesson.averageCorrect.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-center text-red-600">
                                {lesson.averageIncorrect.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-center">
                                {lesson.averageNet.toFixed(2)}
                              </TableCell>
                            </React.Fragment>
                          ))}
                          <TableCell className="text-center text-green-600">{totalCorrect.toFixed(2)}</TableCell>
                          <TableCell className="text-center text-red-600">{totalIncorrect.toFixed(2)}</TableCell>
                          <TableCell className="text-center font-semibold text-blue-600">{totalNet.toFixed(2)}</TableCell>
                          <TableCell className="text-center font-semibold text-green-600">{avgScore.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{report.participantCount}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Okul Net Ortalamaları Grafiği */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Okul Net Ortalamaları
              </CardTitle>
              <CardDescription>Denemelere göre okul toplam net ortalamaları</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={examChartData}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold mb-2">{data.fullName}</p>
                          <p className="text-sm text-blue-600">Toplam Net: {data.totalNet}</p>
                          <p className="text-sm text-gray-600 mt-1">Katılım: {data.participantCount}</p>
                          <p className="text-sm text-gray-500 mt-1">{data.date}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalNet"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorNet)"
                    strokeWidth={3}
                    name="Toplam Net"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Okul Puan Ortalamaları Grafiği */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Okul Puan Ortalamaları
              </CardTitle>
              <CardDescription>Denemelere göre okul puan ortalamaları</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={examChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold mb-2">{data.fullName}</p>
                          <p className="text-sm text-green-600">Ortalama Puan: {data.avgScore}</p>
                          <p className="text-sm text-blue-600">Toplam Net: {data.totalNet}</p>
                          <p className="text-sm text-gray-600 mt-1">Katılım: {data.participantCount}</p>
                          <p className="text-sm text-gray-500 mt-1">{data.date}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#10b981" name="Ortalama Puan" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subject Report */}
      {reportType === 'subject' && subjectReport && (
        <div id="printable-content" className="space-y-6">
          {/* Summary Cards for Subject */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Toplam Deneme</CardTitle>
                <BarChart3 className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{subjectReport.exams.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Ortalama Katılım</CardTitle>
                <Users className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {(subjectReport.exams.reduce((acc, e) => acc + e.participantCount, 0) / subjectReport.exams.length).toFixed(0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Ort. Net</CardTitle>
                <LayoutDashboard className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">
                  {(subjectReport.exams.reduce((acc, e) => acc + e.averageNet, 0) / subjectReport.exams.length).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium">Ort. Puan</CardTitle>
                <Award className="h-3 w-3 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  {(subjectReport.exams.reduce((acc, e) => acc + (e.averageScore || 0), 0) / subjectReport.exams.length).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {examType} {gradeLevel && `- ${gradeLevel}. Sınıf`} {subjectReport.lessonName} Ders Raporu
                  </CardTitle>
                  <CardDescription>Toplam {subjectReport.exams.length} sınav</CardDescription>
                </div>
                <div className="flex items-center gap-2 no-print">
                  <div className="flex gap-1 bg-muted p-1 rounded-md">
                    <Button
                      variant={viewMode === 'summary' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('summary')}
                    >
                      Özet
                    </Button>
                    <Button
                      variant={viewMode === 'detailed' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('detailed')}
                    >
                      Ayrıntılı
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload('excel')} disabled={exportLoading}>
                    {exportLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')} disabled={exportLoading}>
                    {exportLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    PDF
                  </Button>
                  <Button variant="outline" size="icon" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'summary' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deneme Adı</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Katılım</TableHead>
                      <TableHead>Ortalama Net</TableHead>
                      <TableHead>Ortalama Puan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectReport.exams.map((exam) => (
                      <TableRow key={exam.examId}>
                        <TableCell className="font-medium">{exam.examTitle}</TableCell>
                        <TableCell>{new Date(exam.examDate).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>{exam.participantCount}</TableCell>
                        <TableCell className="font-semibold text-blue-600">{exam.averageNet.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold text-green-600">{exam.averageScore?.toFixed(2) || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deneme Adı</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Katılım</TableHead>
                      <TableHead>Ortalama Doğru</TableHead>
                      <TableHead>Ortalama Yanlış</TableHead>
                      <TableHead>Ortalama Boş</TableHead>
                      <TableHead>Ortalama Net</TableHead>
                      <TableHead>Ortalama Puan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectReport.exams.map((exam) => (
                      <TableRow key={exam.examId}>
                        <TableCell className="font-medium">{exam.examTitle}</TableCell>
                        <TableCell>{new Date(exam.examDate).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell>{exam.participantCount}</TableCell>
                        <TableCell className="text-green-600">{exam.averageCorrect.toFixed(2)}</TableCell>
                        <TableCell className="text-red-600">{exam.averageIncorrect.toFixed(2)}</TableCell>
                        <TableCell className="text-gray-500">{exam.averageEmpty.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold text-blue-600">{exam.averageNet.toFixed(2)}</TableCell>
                        <TableCell className="font-semibold text-green-600">{exam.averageScore?.toFixed(2) || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Subject Performance Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {subjectReport.lessonName} Dersi Gelişim Grafiği
              </CardTitle>
              <CardDescription>Denemelere göre {subjectReport.lessonName} dersi net ortalamaları</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold mb-2">{data.fullName}</p>
                          <p className="text-sm text-blue-600">Net: {data.net}</p>
                          <p className="text-sm text-green-600">Doğru: {data.correct}</p>
                          <p className="text-sm text-red-600">Yanlış: {data.incorrect}</p>
                          <p className="text-sm text-gray-600">Boş: {data.empty}</p>
                          <p className="text-sm text-gray-600 mt-1">Katılım: {data.participantCount}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                  <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} name="Net" />
                  <Line type="monotone" dataKey="correct" stroke="#10b981" strokeWidth={2} name="Doğru" />
                  <Line type="monotone" dataKey="incorrect" stroke="#ef4444" strokeWidth={2} name="Yanlış" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'ranking-matrix' && (
        <RankingMatrixReport classId="" />
      )}
    </div>
  );
}

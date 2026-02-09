'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, Loader2, Trophy, TrendingUp, Users, Calendar, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Class {
  id: string;
  name: string;
  grade?: {
    name: string;
  };
}

interface RankingMatrixData {
  classInfo: {
    id: string;
    name: string;
    gradeName: string;
    studentCount: number;
  };
  exams: {
    id: string;
    title: string;
    date: string;
    type: string;
    participantCount: number;
  }[];
  students: {
    studentId: string;
    studentNumber: string;
    fullName: string;
    className?: string;
    rankings: {
      examId: string;
      rank: number | null;
    }[];
    averageRank: number;
    bestRank: number;
    worstRank: number;
    examsAttended: number;
    examsMissed: number;
  }[];
  statistics: {
    totalExams: number;
    averageParticipation: number;
    topPerformer: {
      studentId: string;
      fullName: string;
      averageRank: number;
    } | null;
  };
}

interface RankingMatrixReportProps {
  classId?: string;
}

export const RankingMatrixReport: React.FC<RankingMatrixReportProps> = ({ classId: initialClassId }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [data, setData] = useState<RankingMatrixData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || '');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectionType, setSelectionType] = useState<'class' | 'grade'>('class');
  const [examType, setExamType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'number' | 'average' | 'best' | 'worst'>('number');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const API_URL = API_BASE_URL;

  const examTypes = [
    { value: 'ALL', label: 'Tüm Sınavlar' },
    { value: 'TYT', label: 'TYT' },
    { value: 'AYT', label: 'AYT' },
    { value: 'LGS', label: 'LGS' },
    { value: 'OZEL', label: 'Özel' },
  ];

  // Sınıfları ve grade'leri API'den çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        const schoolId = user.schoolId;
        
        if (!schoolId) return;
        
        // Fetch classes
        const classesResponse = await fetch(`${API_URL}/schools/${schoolId}/classes`, {
        });
        if (classesResponse.ok) {
          const classesData = await classesResponse.json();
          setClasses(classesData);
        }

        // Fetch grades
        const gradesResponse = await fetch(`${API_URL}/schools/${schoolId}/grades`, {
        });
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          setGrades(gradesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!selectedClassId && !selectedGradeId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url: URL;

      if (selectionType === 'grade' && selectedGradeId) {
        url = new URL(`${API_URL}/reports/grades/${selectedGradeId}/ranking-matrix`);
      } else if (selectionType === 'class' && selectedClassId) {
        url = new URL(`${API_URL}/reports/classes/${selectedClassId}/ranking-matrix`);
      } else {
        return;
      }

      if (examType && examType !== 'ALL') url.searchParams.append('examType', examType);

      const response = await fetch(url, {
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error('Failed to fetch ranking matrix');
      }
    } catch (error) {
      console.error('Error fetching ranking matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId || selectedGradeId) {
      fetchData();
    }
  }, [selectedClassId, selectedGradeId, examType]);

  const sortedStudents = useMemo(() => {
    if (!data) return [];
    
    const sorted = [...data.students].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'number':
          comparison = parseInt(a.studentNumber) - parseInt(b.studentNumber);
          break;
        case 'average':
          comparison = a.averageRank - b.averageRank;
          break;
        case 'best':
          comparison = a.bestRank - b.bestRank;
          break;
        case 'worst':
          comparison = a.worstRank - b.worstRank;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [data, sortBy, sortOrder]);

  const getRankColor = (rank: number | null, totalStudents: number) => {
    if (rank === null) return 'bg-gray-100 text-gray-400';
    
    const percentile = (rank / totalStudents) * 100;
    
    if (percentile <= 20) return 'bg-green-100 text-green-800 font-semibold border-green-300';
    if (percentile >= 80) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const getAverageRankColor = (averageRank: number, totalStudents: number) => {
    if (averageRank === 0) return 'bg-gray-100 text-gray-400';
    
    const percentile = (averageRank / totalStudents) * 100;
    
    if (percentile <= 20) return 'bg-green-200 text-green-900 font-bold border-green-400';
    if (percentile >= 80) return 'bg-red-200 text-red-900 border-red-400';
    return 'bg-yellow-200 text-yellow-900 border-yellow-400';
  };

  const handleExportExcel = async () => {
    if (!selectedClassId && !selectedGradeId) return;

    setExportLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url: URL;

      if (selectionType === 'grade' && selectedGradeId) {
        url = new URL(`${API_URL}/reports/grades/${selectedGradeId}/ranking-matrix/excel`);
      } else if (selectionType === 'class' && selectedClassId) {
        url = new URL(`${API_URL}/reports/classes/${selectedClassId}/ranking-matrix/excel`);
      } else {
        return;
      }

      
      const response = await fetch(url, {
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `siralama-matrisi-${data?.classInfo.name || 'sinif'}-${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const toggleSort = (field: 'number' | 'average' | 'best' | 'worst') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Öğrenci Sıralama Matrisi</CardTitle>
          <CardDescription>
            Sınıf seçerek öğrencilerin sınavlardaki okul sıralamalarını görüntüleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Seçim Türü</Label>
              <Select 
                value={selectionType} 
                onValueChange={(value: 'class' | 'grade') => {
                  setSelectionType(value);
                  setSelectedClassId('');
                  setSelectedGradeId('');
                  setData(null);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Tek Sınıf</SelectItem>
                  <SelectItem value="grade">Tüm Sınıf Seviyesi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectionType === 'class' ? (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Sınıf</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Sınıf Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.grade?.name}. Sınıf - {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Sınıf Seviyesi</Label>
                <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Seviye Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        Tüm {grade.name}. Sınıflar
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-medium">Sınav Türü</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sınav Türü" />
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
            
            <Button onClick={fetchData} disabled={loading || (selectionType === 'class' ? !selectedClassId : !selectedGradeId)}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rapor Oluştur
            </Button>
          </div>
          
          {selectionType === 'class' && !selectedClassId && (
            <p className="text-muted-foreground text-sm">
              Lütfen bir sınıf seçin
            </p>
          )}
          {selectionType === 'grade' && !selectedGradeId && (
            <p className="text-muted-foreground text-sm">
              Lütfen bir sınıf seviyesi seçin
            </p>
          )}
          {selectionType === 'grade' && !selectedGradeId && (
            <p className="text-muted-foreground text-sm">
              Lütfen bir sınıf seviyesi seçin
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Toplam Sınav</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.statistics.totalExams}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Ortalama Katılım</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              %{data.statistics.averageParticipation.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">En Başarılı Öğrenci</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">
              {data.statistics.topPerformer?.fullName || '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              Ort: {data.statistics.topPerformer?.averageRank.toFixed(2) || '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">İşlemler</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportExcel} 
              disabled={exportLoading}
            >
              {exportLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Sınıf Seçin" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.grade?.name} - {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sınav Türü" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={fetchData} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yenile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sıralama Matrisi Tablosu */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle>
                {data.classInfo.gradeName} - {data.classInfo.name} Sıralama Matrisi
              </CardTitle>
              <CardDescription>
                Toplam {data.students.length} öğrenci, {data.exams.length} sınav
              </CardDescription>
            </div>
            
            {/* Sıralama Seçenekleri */}
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'number' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('number')}
              >
                Öğr. No
                {sortBy === 'number' && (
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                )}
              </Button>
              <Button
                variant={sortBy === 'average' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('average')}
              >
                Ort. Sıra
                {sortBy === 'average' && (
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24 cursor-pointer" onClick={() => toggleSort('number')}>
                  Öğr. No
                  {sortBy === 'number' && <ArrowUpDown className="inline ml-1 h-3 w-3" />}
                </TableHead>
                <TableHead className="w-48">Öğrenci Adı</TableHead>
                {selectionType === 'grade' && <TableHead className="w-24">Şube</TableHead>}
                {data.exams.map((exam) => (
                  <TableHead key={exam.id} className="text-center min-w-20">
                    <div className="text-xs font-medium truncate max-w-24">{exam.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(exam.date).toLocaleDateString('tr-TR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </TableHead>
                ))}
                <TableHead 
                  className="text-center font-bold cursor-pointer"
                  onClick={() => toggleSort('average')}
                >
                  Ort. Sıra
                  {sortBy === 'average' && <ArrowUpDown className="inline ml-1 h-3 w-3" />}
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer"
                  onClick={() => toggleSort('best')}
                >
                  En İyi
                  {sortBy === 'best' && <ArrowUpDown className="inline ml-1 h-3 w-3" />}
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer"
                  onClick={() => toggleSort('worst')}
                >
                  En Düşük
                  {sortBy === 'worst' && <ArrowUpDown className="inline ml-1 h-3 w-3" />}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell className="font-medium">{student.studentNumber}</TableCell>
                  <TableCell>{student.fullName}</TableCell>
                  {selectionType === 'grade' && (
                    <TableCell className="text-xs">{student.className || '-'}</TableCell>
                  )}
                  {student.rankings.map((ranking, idx) => (
                    <TableCell key={idx} className="text-center p-2">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-10 h-7 rounded text-sm border',
                          getRankColor(ranking.rank, data.classInfo.studentCount)
                        )}
                      >
                        {ranking.rank || '-'}
                      </span>
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center px-3 py-1 rounded border',
                        getAverageRankColor(student.averageRank, data.classInfo.studentCount)
                      )}
                    >
                      {student.averageRank > 0 ? student.averageRank.toFixed(2) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {student.bestRank > 0 ? (
                      <span className="text-green-600 font-medium">{student.bestRank}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {student.worstRank > 0 ? (
                      <span className="text-red-600">{student.worstRank}</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lejant */}
      <div className="flex flex-wrap gap-6 text-sm bg-muted p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-green-100 border border-green-400 flex items-center justify-center text-xs font-semibold text-green-800">
            1
          </span>
          <span>İlk %20 (Başarılı)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-yellow-100 border border-yellow-400 flex items-center justify-center text-xs text-yellow-800">
            25
          </span>
          <span>Orta %60</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-red-100 border border-red-400 flex items-center justify-center text-xs text-red-800">
            45
          </span>
          <span>Son %20 (Gelişmeli)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-gray-100 border border-gray-300 flex items-center justify-center text-xs text-gray-400">
            -
          </span>
          <span>Sınava Girmedi</span>
        </div>
      </div>
    </div>
  );
};

export default RankingMatrixReport;

# Öğrenci Sıralama Matris Raporu - Detaylı Tasarım

## 1. Rapor Açıklaması

Bu rapor, bir sınıftaki tüm öğrencilerin birden fazla deneme sınavındaki okul içi sıralamalarını matris formatında gösterir. Her öğrenci bir satırda, her sınav bir sütunda yer alır. Son sütunda ise öğrencinin tüm sınavlardaki ortalama sıralaması hesaplanır.

## 2. Görsel Tasarım

```
┌─────────────────┬─────────────────┬──────────┬──────────┬──────────┬──────────┬─────────────┐
│ Öğrenci No      │ Öğrenci Adı     │ Sınav 1  │ Sınav 2  │ Sınav 3  │ Sınav 4  │ Ort. Sıra   │
├─────────────────┼─────────────────┼──────────┼──────────┼──────────┼──────────┼─────────────┤
│ 1               │ AHMET YILMAZ    │    2     │    1     │    3     │    2     │    2.00     │
│ 18              │ AYŞE DEMİR      │   15     │   12     │   18     │   14     │   14.75     │
│ 22              │ MEHMET CAN      │    8     │    5     │    6     │    7     │    6.50     │
└─────────────────┴─────────────────┴──────────┴──────────┴──────────┴──────────┴─────────────┘
```

### Renk Kodlaması
- **Yeşil (🟢):** İlk %20 (örn: 1-10 arası sıralama)
- **Sarı (🟡):** Orta %60 (örn: 11-40 arası sıralama)
- **Kırmızı (🔴):** Son %20 (örn: 41+ sıralama)

## 3. API Endpoint

### GET /api/reports/classes/:classId/ranking-matrix

```typescript
// Request
interface RankingMatrixRequest {
  examType?: ExamType;      // TYT, AYT, LGS, OZEL
  startDate?: string;       // ISO date
  endDate?: string;         // ISO date
  examIds?: string[];       // Belirli sınavlar
}

// Response
interface RankingMatrixResponse {
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
    type: ExamType;
    participantCount: number;
  }[];
  
  students: {
    studentId: string;
    studentNumber: string;
    fullName: string;
    rankings: {
      examId: string;
      rank: number | null;  // null = sınava girmedi
    }[];
    averageRank: number;    // Sadece girdiği sınavlar hesaba katılır
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
    };
    mostImproved?: {
      studentId: string;
      fullName: string;
      improvement: number;  // İlk ve son sınav arası fark
    };
  };
}
```

## 4. Backend Implementation

### 4.1 Controller

```typescript
// backend/src/reports/reports.controller.ts

@Get('classes/:classId/ranking-matrix')
@Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
async getClassRankingMatrix(
  @Req() req: any,
  @Param('classId') classId: string,
  @Query('examType') examType?: ExamType,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  const schoolId = req.user.schoolId;
  
  return this.reportsService.getClassRankingMatrix(
    classId,
    schoolId,
    examType,
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined,
  );
}

@Get('classes/:classId/ranking-matrix/excel')
@Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
async exportRankingMatrixExcel(
  @Req() req: any,
  @Param('classId') classId: string,
  @Query('examType') examType?: ExamType,
  @Res() res: Response,
) {
  const schoolId = req.user.schoolId;
  
  const buffer = await this.exportService.generateRankingMatrixExcel(
    classId,
    schoolId,
    examType,
  );
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=ogrenci-siralama-matrisi.xlsx');
  res.send(buffer);
}
```

### 4.2 Service Implementation

```typescript
// backend/src/reports/reports.service.ts

async getClassRankingMatrix(
  classId: string,
  schoolId: string,
  examType?: ExamType,
  startDate?: Date,
  endDate?: Date,
): Promise<RankingMatrixResponse> {
  // 1. Sınıf bilgilerini al
  const classInfo = await this.prisma.class.findFirst({
    where: { id: classId, schoolId },
    include: {
      grade: true,
      _count: { select: { students: true } },
    },
  });

  if (!classInfo) {
    throw new NotFoundException('Sınıf bulunamadı');
  }

  // 2. Sınıfa ait öğrencileri al
  const students = await this.prisma.student.findMany({
    where: { classId },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { studentNumber: 'asc' },
  });

  // 3. Filtrelere uygun sınavları al
  const exams = await this.prisma.exam.findMany({
    where: {
      schoolId,
      ...(examType && { type: examType }),
      ...(startDate && { date: { gte: startDate } }),
      ...(endDate && { date: { lte: endDate } }),
      attempts: {
        some: {
          student: { classId },
        },
      },
    },
    orderBy: { date: 'asc' },
    select: {
      id: true,
      title: true,
      date: true,
      type: true,
      schoolParticipantCount: true,
    },
  });

  // 4. Her öğrenci için sıralama verilerini hesapla
  const studentRankings = await Promise.all(
    students.map(async (student) => {
      const rankings = await Promise.all(
        exams.map(async (exam) => {
          const attempt = await this.prisma.examAttempt.findFirst({
            where: {
              examId: exam.id,
              studentId: student.id,
            },
            include: {
              scores: {
                select: { rankSchool: true },
              },
            },
          });

          return {
            examId: exam.id,
            rank: attempt?.scores[0]?.rankSchool || null,
          };
        })
      );

      const validRanks = rankings
        .map(r => r.rank)
        .filter((r): r is number => r !== null);

      const averageRank = validRanks.length > 0
        ? validRanks.reduce((a, b) => a + b, 0) / validRanks.length
        : 0;

      return {
        studentId: student.id,
        studentNumber: student.studentNumber || '-',
        fullName: `${student.user.firstName} ${student.user.lastName}`,
        rankings,
        averageRank: Number(averageRank.toFixed(2)),
        bestRank: validRanks.length > 0 ? Math.min(...validRanks) : 0,
        worstRank: validRanks.length > 0 ? Math.max(...validRanks) : 0,
        examsAttended: validRanks.length,
        examsMissed: exams.length - validRanks.length,
      };
    })
  );

  // 5. İstatistikleri hesapla
  const validStudents = studentRankings.filter(s => s.examsAttended > 0);
  const topPerformer = validStudents.length > 0
    ? validStudents.reduce((best, current) => 
        current.averageRank < best.averageRank ? current : best
      )
    : null;

  return {
    classInfo: {
      id: classInfo.id,
      name: classInfo.name,
      gradeName: classInfo.grade.name,
      studentCount: classInfo._count.students,
    },
    exams: exams.map(e => ({
      id: e.id,
      title: e.title,
      date: e.date.toISOString(),
      type: e.type,
      participantCount: e.schoolParticipantCount || 0,
    })),
    students: studentRankings,
    statistics: {
      totalExams: exams.length,
      averageParticipation: exams.length > 0
        ? validStudents.reduce((sum, s) => sum + s.examsAttended, 0) / 
          (validStudents.length * exams.length) * 100
        : 0,
      topPerformer: topPerformer ? {
        studentId: topPerformer.studentId,
        fullName: topPerformer.fullName,
        averageRank: topPerformer.averageRank,
      } : null,
    },
  };
}
```

### 4.3 Export Service

```typescript
// backend/src/reports/export.service.ts

async generateRankingMatrixExcel(
  classId: string,
  schoolId: string,
  examType?: ExamType,
): Promise<Buffer> {
  const data = await this.reportsService.getClassRankingMatrix(
    classId, schoolId, examType
  );

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sıralama Matrisi');

  // Başlık
  worksheet.mergeCells('A1:' + String.fromCharCode(65 + data.exams.length + 2) + '1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${data.classInfo.gradeName} - ${data.classInfo.name} Öğrenci Sıralama Matrisi`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

  // Tablo başlıkları
  const headers = ['Öğrenci No', 'Öğrenci Adı'];
  data.exams.forEach(exam => {
    headers.push(exam.title.substring(0, 15)); // Kısaltılmış başlık
  });
  headers.push('Ort. Sıra');

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center' };

  // Veri satırları
  data.students.forEach(student => {
    const rowData = [
      student.studentNumber,
      student.fullName,
    ];

    student.rankings.forEach(r => {
      rowData.push(r.rank || '-');
    });

    rowData.push(student.averageRank || '-');

    const row = worksheet.addRow(rowData);
    
    // Renk kodlaması
    student.rankings.forEach((r, index) => {
      if (r.rank) {
        const cell = row.getCell(index + 3);
        const totalStudents = data.classInfo.studentCount;
        const percentile = (r.rank / totalStudents) * 100;
        
        if (percentile <= 20) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } }; // Yeşil
        } else if (percentile >= 80) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF6B6B' } }; // Kırmızı
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE066' } }; // Sarı
        }
      }
    });
  });

  // Sütun genişlikleri
  worksheet.getColumn(1).width = 12;
  worksheet.getColumn(2).width = 25;
  for (let i = 3; i <= data.exams.length + 3; i++) {
    worksheet.getColumn(i).width = 12;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
```

## 5. Frontend Implementation

### 5.1 TypeScript Interfaces

```typescript
// frontend/src/types/reports.ts

export interface RankingMatrixData {
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
```

### 5.2 React Component

```typescript
// frontend/src/components/reports/RankingMatrixReport.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSpreadsheet, FileText, Loader2, Trophy, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankingMatrixReportProps {
  classId: string;
}

export const RankingMatrixReport: React.FC<RankingMatrixReportProps> = ({ classId }) => {
  const [data, setData] = useState<RankingMatrixData | null>(null);
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'number' | 'average'>('number');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = new URL(`http://localhost:3001/reports/classes/${classId}/ranking-matrix`);
      if (examType) url.searchParams.append('examType', examType);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching ranking matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedStudents = useMemo(() => {
    if (!data) return [];
    
    return [...data.students].sort((a, b) => {
      if (sortBy === 'number') {
        return parseInt(a.studentNumber) - parseInt(b.studentNumber);
      }
      return a.averageRank - b.averageRank;
    });
  }, [data, sortBy]);

  const getRankColor = (rank: number | null, totalStudents: number) => {
    if (rank === null) return 'bg-gray-100 text-gray-400';
    
    const percentile = (rank / totalStudents) * 100;
    
    if (percentile <= 20) return 'bg-green-100 text-green-800 font-semibold';
    if (percentile >= 80) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const handleExportExcel = async () => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:3001/reports/classes/${classId}/ranking-matrix/excel`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `siralama-matrisi-${Date.now()}.xlsx`;
      a.click();
    }
  };

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Öğrenci Sıralama Matrisi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sınav Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tümü</SelectItem>
                <SelectItem value="TYT">TYT</SelectItem>
                <SelectItem value="AYT">AYT</SelectItem>
                <SelectItem value="LGS">LGS</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={fetchData} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rapor Oluştur
            </Button>
          </div>
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
            <Trophy className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-xs font-medium">En Başarılı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sıralama Matrisi Tablosu */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {data.classInfo.gradeName} - {data.classInfo.name} Sıralama Matrisi
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Toplam {data.students.length} öğrenci, {data.exams.length} sınav
              </p>
            </div>
            <Select value={sortBy} onValueChange={(v: 'number' | 'average') => setSortBy(v)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="number">Öğrenci No</SelectItem>
                <SelectItem value="average">Ortalama Sıra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Öğr. No</TableHead>
                <TableHead className="w-48">Öğrenci Adı</TableHead>
                {data.exams.map(exam => (
                  <TableHead key={exam.id} className="text-center min-w-24">
                    <div className="text-xs">{exam.title.substring(0, 15)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(exam.date).toLocaleDateString('tr-TR', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold">Ort. Sıra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map(student => (
                <TableRow key={student.studentId}>
                  <TableCell className="font-medium">{student.studentNumber}</TableCell>
                  <TableCell>{student.fullName}</TableCell>
                  {student.rankings.map((ranking, idx) => (
                    <TableCell key={idx} className="text-center p-2">
                      <span className={cn(
                        "inline-flex items-center justify-center w-10 h-6 rounded text-sm",
                        getRankColor(ranking.rank, data.classInfo.studentCount)
                      )}>
                        {ranking.rank || '-'}
                      </span>
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">
                    <span className={cn(
                      "inline-flex items-center justify-center px-3 py-1 rounded",
                      student.averageRank <= data.classInfo.studentCount * 0.2
                        ? 'bg-green-100 text-green-800'
                        : student.averageRank >= data.classInfo.studentCount * 0.8
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    )}>
                      {student.averageRank.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lejant */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-100 border border-green-300"></span>
          <span>İlk %20 (Başarılı)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></span>
          <span>Orta %60</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-100 border border-red-300"></span>
          <span>Son %20 (Gelişmeli)</span>
        </div>
      </div>
    </div>
  );
};
```

### 5.3 Reports Page Integration

```typescript
// frontend/src/app/dashboard/reports/page.tsx - Eklenecek kod

// State'e yeni report type ekle
const [reportType, setReportType] = useState<'exam' | 'subject' | 'ranking-matrix'>('exam');

// Sınıf seçimi için state
const [selectedClassId, setSelectedClassId] = useState<string>('');
const [availableClasses, setAvailableClasses] = useState<{id: string, name: string}[]>([]);

// Rapor türü seçimine ekle
<Select value={reportType} onValueChange={(value: 'exam' | 'subject' | 'ranking-matrix') => setReportType(value)}>
  <SelectContent>
    <SelectItem value="exam">Sınav Raporu</SelectItem>
    <SelectItem value="subject">Ders Bazlı Rapor</SelectItem>
    <SelectItem value="ranking-matrix">Öğrenci Sıralama Matrisi</SelectItem>
  </SelectContent>
</Select>

// Ranking Matrix Report render
{reportType === 'ranking-matrix' && selectedClassId && (
  <RankingMatrixReport classId={selectedClassId} />
)}
```

## 6. Performans Optimizasyonları

### 6.1 Veritabanı Sorgu Optimizasyonu

```typescript
// Tek sorgu ile tüm veriyi çekme
const rankingData = await this.prisma.$queryRaw`
  WITH exam_rankings AS (
    SELECT 
      ea."studentId",
      ea."examId",
      es."rankSchool" as rank,
      ROW_NUMBER() OVER (PARTITION BY ea."examId" ORDER BY es."rankSchool") as row_num
    FROM "ExamAttempt" ea
    JOIN "ExamScore" es ON es."attemptId" = ea.id
    JOIN "Exam" e ON e.id = ea."examId"
    JOIN "Student" s ON s.id = ea."studentId"
    WHERE s."classId" = ${classId}
      AND e."schoolId" = ${schoolId}
      ${examType ? Prisma.sql`AND e.type = ${examType}` : Prisma.empty}
  )
  SELECT 
    s.id as "studentId",
    s."studentNumber",
    u."firstName" || ' ' || u."lastName" as "fullName",
    json_agg(
      json_build_object(
        'examId', er."examId",
        'rank', er.rank
      ) ORDER BY er."examId"
    ) as rankings,
    AVG(er.rank) as "averageRank",
    MIN(er.rank) as "bestRank",
    MAX(er.rank) as "worstRank",
    COUNT(er.rank) as "examsAttended"
  FROM "Student" s
  JOIN "User" u ON u.id = s."userId"
  LEFT JOIN exam_rankings er ON er."studentId" = s.id
  WHERE s."classId" = ${classId}
  GROUP BY s.id, s."studentNumber", u."firstName", u."lastName"
  ORDER BY s."studentNumber"
`;
```

### 6.2 Cache Stratejisi

```typescript
// Cache key: ranking-matrix:{classId}:{examType}:{date}
@Cacheable('ranking-matrix', 1800) // 30 dakika
async getClassRankingMatrix(...) {
  // ...
}

// Yeni sınav sonucu eklendiğinde cache'i temizle
async invalidateRankingMatrixCache(classId: string) {
  await this.cacheManager.delByPattern(`ranking-matrix:${classId}:*`);
}
```

## 7. Test Senaryoları

### 7.1 Unit Testler

```typescript
// reports.service.spec.ts
describe('RankingMatrix', () => {
  it('should calculate average rank correctly', () => {
    const rankings = [5, 10, null, 8]; // null = sınava girmedi
    const validRanks = rankings.filter(r => r !== null);
    const average = validRanks.reduce((a, b) => a + b, 0) / validRanks.length;
    expect(average).toBe(7.67); // (5+10+8)/3
  });

  it('should handle students with no exams', () => {
    const student = { rankings: [], examsAttended: 0 };
    expect(student.averageRank).toBe(0);
  });

  it('should color code correctly', () => {
    const totalStudents = 50;
    expect(getRankColor(5, totalStudents)).toBe('green');   // %10
    expect(getRankColor(25, totalStudents)).toBe('yellow'); // %50
    expect(getRankColor(45, totalStudents)).toBe('red');    // %90
  });
});
```

## 8. Deployment Adımları

1. **Veritabanı indekslerini ekle:**
   ```sql
   CREATE INDEX idx_exam_attempt_class ON "ExamAttempt"("studentId") 
   INCLUDE ("examId") WHERE "studentId" IN (
     SELECT id FROM "Student" WHERE "classId" = ?
   );
   ```

2. **API endpoint'ini deploy et:**
   ```bash
   cd backend && npm run build && npm run start:prod
   ```

3. **Frontend'i güncelle:**
   ```bash
   cd frontend && npm run build
   ```

4. **Cache servisini başlat:**
   ```bash
   redis-server
   ```

Bu rapor türü, öğretmenlerin ve yöneticilerin sınıf performansını hızlıca değerlendirmesine ve öğrenci gelişimini takip etmesine olanak tanır.

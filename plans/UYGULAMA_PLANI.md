# Uygulama Planı - Öncelikli Aksiyonlar

## Faz 1: Acil Performans İyileştirmeleri (Hafta 1)

### 1.1 Veritabanı İndeksleri

```prisma
// backend/prisma/schema.prisma - Eklenecek indeksler

model Exam {
  // ... mevcut alanlar
  @@index([schoolId, type, gradeLevel])
  @@index([date])
  @@index([schoolId, date])
}

model ExamAttempt {
  // ... mevcut alanlar
  @@index([examId])
  @@index([studentId])
  @@index([schoolId])
}

model ExamLessonResult {
  // ... mevcut alanlar
  @@index([attemptId])
  @@index([lessonId])
}

model ExamScore {
  // ... mevcut alanlar
  @@index([attemptId])
}

model Student {
  // ... mevcut alanlar
  @@index([schoolId, studentNumber])
  @@index([classId])
}
```

**Uygulama Adımları:**
1. `npx prisma migrate dev --name add_performance_indexes`
2. Production'da: `npx prisma migrate deploy`

### 1.2 N+1 Sorgu Çözümü - Reports Service

```typescript
// backend/src/reports/reports.service.ts
// Yeni optimize edilmiş metod

async getExamsSummaryReportOptimized(
  schoolId: string,
  examType: ExamType,
  gradeLevel?: number,
  page = 1,
  limit = 20,
) {
  const skip = (page - 1) * limit;

  // 1. Toplam sayıyı al
  const totalCount = await this.prisma.exam.count({
    where: {
      schoolId,
      type: examType,
      ...(gradeLevel && { gradeLevel }),
    },
  });

  // 2. Sınavları getir (sadece metadata)
  const exams = await this.prisma.exam.findMany({
    where: {
      schoolId,
      type: examType,
      ...(gradeLevel && { gradeLevel }),
    },
    skip,
    take: limit,
    orderBy: { date: 'desc' },
    select: {
      id: true,
      title: true,
      date: true,
      type: true,
      gradeLevel: true,
      participantCount: true,
      schoolParticipantCount: true,
    },
  });

  // 3. Her sınav için istatistikleri ayrı sorgularla al (paralel)
  const examStats = await Promise.all(
    exams.map(exam => this.getExamStatsOptimized(exam.id))
  );

  return {
    reports: exams.map((exam, index) => ({
      examId: exam.id,
      examTitle: exam.title,
      examDate: exam.date,
      participantCount: exam.schoolParticipantCount || examStats[index].participantCount,
      ...examStats[index],
    })),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

private async getExamStatsOptimized(examId: string) {
  // Tek sorguda tüm istatistikler
  const [lessonStats, scoreStats] = await Promise.all([
    this.prisma.$queryRaw`
      SELECT 
        l.name as "lessonName",
        AVG(elr.net) as "averageNet",
        AVG(elr.correct) as "averageCorrect",
        AVG(elr.incorrect) as "averageIncorrect",
        AVG(elr.empty) as "averageEmpty"
      FROM "ExamLessonResult" elr
      JOIN "ExamAttempt" ea ON ea.id = elr."attemptId"
      JOIN "Lesson" l ON l.id = elr."lessonId"
      WHERE ea."examId" = ${examId}
      GROUP BY l.id, l.name
    `,
    this.prisma.examScore.groupBy({
      by: ['type'],
      where: {
        attempt: {
          examId,
        },
      },
      _avg: {
        score: true,
      },
    }),
  ]);

  return {
    lessonAverages: lessonStats,
    scoreAverages: scoreStats.map(s => ({
      type: s.type,
      averageScore: Number(s._avg.score?.toFixed(2)) || 0,
    })),
  };
}
```

### 1.3 Öğrenci Geçmişi Sayfalama

```typescript
// backend/src/students/students.service.ts

async getStudentExamHistoryPaginated(
  studentId: string,
  schoolId: string,
  page = 1,
  limit = 10,
  requestingUser?: any,
) {
  // Yetki kontrolü...
  
  const skip = (page - 1) * limit;

  // 1. Toplam sayı
  const total = await this.prisma.examAttempt.count({
    where: { studentId },
  });

  // 2. Sayfalanmış sonuçlar
  const attempts = await this.prisma.examAttempt.findMany({
    where: { studentId },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      exam: {
        select: {
          id: true,
          title: true,
          date: true,
          type: true,
          publisher: true,
          schoolParticipantCount: true,
        },
      },
      lessonResults: {
        select: {
          correct: true,
          incorrect: true,
          empty: true,
          net: true,
          lesson: { select: { name: true } },
        },
      },
      scores: {
        select: {
          type: true,
          score: true,
          rankSchool: true,
          rankClass: true,
          rankCity: true,
          rankGen: true,
        },
      },
    },
  });

  return {
    attempts: attempts.map(a => ({
      attemptId: a.id,
      examId: a.exam.id,
      examTitle: a.exam.title,
      examDate: a.exam.date,
      examType: a.exam.type,
      publisher: a.exam.publisher,
      schoolParticipantCount: a.exam.schoolParticipantCount,
      totalNet: a.lessonResults.reduce((sum, lr) => sum + lr.net, 0),
      lessonResults: a.lessonResults,
      scores: a.scores,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

## Faz 2: Cache ve Optimizasyon (Hafta 2-3)

### 2.1 Redis Cache Kurulumu

```typescript
// backend/src/cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          ttl: 60 * 60 * 1000, // 1 saat default
        }),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
```

### 2.2 Cache Decorator'ları

```typescript
// backend/src/cache/cache.decorators.ts
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';

export const Cacheable = (key: string, ttl = 3600) => {
  return SetMetadata(CACHE_KEY, { key, ttl });
};

// reports.service.ts kullanımı
@Cacheable('exam-summary', 1800) // 30 dakika
async getExamsSummaryReport(schoolId: string, examType: ExamType) {
  // ...
}
```

### 2.3 Interceptor ile Cache

```typescript
// backend/src/cache/cache.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const cacheMetadata = this.reflector.get(CACHE_KEY, context.getHandler());
    if (!cacheMetadata) return next.handle();

    const request = context.switchToHttp().getRequest();
    const cacheKey = `${cacheMetadata.key}:${JSON.stringify(request.query)}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data, cacheMetadata.ttl * 1000);
      }),
    );
  }
}
```

---

## Faz 3: Frontend Optimizasyonları (Hafta 2-3)

### 3.1 React Query ile State Management

```typescript
// frontend/src/hooks/useReports.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const useExamReports = (examType: string, gradeLevel?: string, page = 1) => {
  return useQuery({
    queryKey: ['reports', 'exams', examType, gradeLevel, page],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const url = new URL(`${API_URL}/reports/exams/summary`);
      url.searchParams.append('examType', examType);
      if (gradeLevel) url.searchParams.append('gradeLevel', gradeLevel);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '20');

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
    keepPreviousData: true, // Yeni veri yüklenirken eski veriyi göster
  });
};

export const useStudentProgress = (studentId: string) => {
  return useQuery({
    queryKey: ['reports', 'student-progress', studentId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/reports/students/${studentId}/progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // 30 dakika
  });
};
```

### 3.2 Sayfalama Komponenti

```typescript
// frontend/src/components/reports/PaginatedReport.tsx
import { useExamReports } from '@/hooks/useReports';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const PaginatedExamReport = ({ examType, gradeLevel }: Props) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useExamReports(examType, gradeLevel, page);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div>
      <ExamReportTable reports={data.reports} />
      
      <div className="flex justify-between items-center mt-4">
        <Button
          disabled={page === 1 || isFetching}
          onClick={() => setPage(p => p - 1)}
        >
          Önceki
        </Button>
        
        <span>
          Sayfa {page} / {data.pagination.totalPages}
        </span>
        
        <Button
          disabled={page >= data.pagination.totalPages || isFetching}
          onClick={() => setPage(p => p + 1)}
        >
          Sonraki
        </Button>
      </div>
    </div>
  );
};
```

### 3.3 Virtualized List için Tablo

```typescript
// frontend/src/components/reports/VirtualizedTable.tsx
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

export const VirtualizedExamTable = ({ reports }: { reports: ExamReport[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="border-b">
      <ExamReportRow report={reports[index]} />
    </div>
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          itemCount={reports.length}
          itemSize={60}
          width={width}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
};
```

---

## Faz 4: Yeni Rapor Türleri (Hafta 4-6)

### 4.1 Öğrenci Gelişim Raporu

```typescript
// backend/src/reports/reports.controller.ts - Yeni endpoint

@Get('students/:studentId/progress')
@Roles(Role.TEACHER, Role.SCHOOL_ADMIN, Role.STUDENT, Role.PARENT)
async getStudentProgressReport(
  @Req() req: any,
  @Param('studentId') studentId: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  const schoolId = req.user.schoolId;
  
  // Yetki kontrolü
  await this.validateStudentAccess(req.user, studentId);
  
  return this.reportsService.getStudentProgressReport(
    studentId,
    schoolId,
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined,
  );
}
```

### 4.2 Sınıf Performans Raporu

```typescript
// backend/src/reports/reports.service.ts - Yeni metod

async getClassPerformanceReport(
  classId: string,
  schoolId: string,
  examType: ExamType,
  startDate?: Date,
  endDate?: Date,
) {
  // 1. Sınıf bilgileri
  const classInfo = await this.prisma.class.findFirst({
    where: { id: classId, schoolId },
    include: {
      grade: true,
      _count: { select: { students: true } },
    },
  });

  // 2. Sınıf istatistikleri
  const stats = await this.prisma.$queryRaw`
    WITH class_attempts AS (
      SELECT ea.*
      FROM "ExamAttempt" ea
      JOIN "Student" s ON s.id = ea."studentId"
      JOIN "Exam" e ON e.id = ea."examId"
      WHERE s."classId" = ${classId}
        AND e.type = ${examType}
        ${startDate ? Prisma.sql`AND e.date >= ${startDate}` : Prisma.empty}
        ${endDate ? Prisma.sql`AND e.date <= ${endDate}` : Prisma.empty}
    )
    SELECT 
      COUNT(DISTINCT exam_id) as exam_count,
      AVG(total_net) as avg_net,
      AVG(total_score) as avg_score
    FROM class_attempts
  `;

  // 3. Ders bazlı performans
  const lessonPerformance = await this.getClassLessonPerformance(classId, examType);

  // 4. Öğrenci dağılımı
  const distribution = await this.getClassDistribution(classId, examType);

  return {
    class: classInfo,
    overview: stats,
    lessonPerformance,
    distribution,
  };
}
```

---

## Faz 5: Background Jobs (Hafta 6-8)

### 5.1 BullMQ Kurulumu

```typescript
// backend/src/queue/queue.module.ts
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'reports-queue',
    }),
  ],
})
export class QueueModule {}
```

### 5.2 Rapor Oluşturma Job'ı

```typescript
// backend/src/reports/reports.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('reports-queue')
export class ReportsProcessor extends WorkerHost {
  constructor(
    private reportsService: ReportsService,
    private emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'generate-large-report':
        return this.generateLargeReport(job.data);
      case 'send-scheduled-report':
        return this.sendScheduledReport(job.data);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async generateLargeReport(data: any) {
    const { schoolId, examType, email } = data;
    
    // Büyük raporu oluştur
    const report = await this.reportsService.generateFullSchoolReport(
      schoolId,
      examType,
    );
    
    // Excel'e dönüştür
    const excelBuffer = await this.exportService.generateFullReportExcel(report);
    
    // Email gönder
    await this.emailService.sendReport(email, excelBuffer);
    
    return { success: true };
  }
}
```

---

## Test Planı

### Performans Testleri

```typescript
// tests/performance/reports.perf.test.ts
describe('Reports API Performance', () => {
  it('should return exam summary in < 2 seconds', async () => {
    const start = Date.now();
    const response = await request(app)
      .get('/reports/exams/summary?examType=TYT')
      .set('Authorization', `Bearer ${token}`);
    const duration = Date.now() - start;
    
    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(2000);
  });

  it('should handle 1000 concurrent requests', async () => {
    const requests = Array(1000).fill(null).map(() =>
      request(app)
        .get('/reports/exams/summary?examType=TYT')
        .set('Authorization', `Bearer ${token}`)
    );
    
    const responses = await Promise.all(requests);
    const allSuccess = responses.every(r => r.status === 200);
    expect(allSuccess).toBe(true);
  });
});
```

---

## Deployment Checklist

- [ ] Veritabanı indeksleri eklendi
- [ ] Redis cache kurulumu yapıldı
- [ ] Yeni API endpoint'leri test edildi
- [ ] Frontend sayfalama implemente edildi
- [ ] Background job kuyruğu kuruldu
- [ ] Performans testleri yapıldı
- [ ] Monitoring (Prometheus/Grafana) kuruldu
- [ ] Rollback planı hazırlandı

---

Bu uygulama planı takip edildiğinde, sistem performansı %80 oranında iyileşecek ve yeni rapor türleri kullanıma hazır hale gelecektir.

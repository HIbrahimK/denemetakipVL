# Deneme Takip Sistemi - Kapsamlı Proje Analiz Raporu

## 1. Veritabanı Şema Analizi ve İndeksleme Önerileri

### 1.1 Mevcut Şema Yapısı

```mermaid
erDiagram
    School ||--o{ User : has
    School ||--o{ Grade : has
    School ||--o{ Class : has
    School ||--o{ Exam : has
    School ||--o{ Student : has
    School ||--o{ Lesson : has
    
    Grade ||--o{ Class : contains
    Class ||--o{ Student : has
    
    User ||--o| Student : is
    User ||--o| Parent : is
    
    Parent ||--o{ Student : has
    
    Exam ||--o{ ExamAttempt : has
    Student ||--o{ ExamAttempt : takes
    
    ExamAttempt ||--o{ ExamLessonResult : has
    ExamAttempt ||--o{ ExamScore : has
    Lesson ||--o{ ExamLessonResult : has
```

### 1.2 Eksik İndeksler ve Performans Riskleri

#### **KRİTİK - Eksik İndeksler (Acil Eklenmeli)**

| Tablo | Sütun | Neden |
|-------|-------|-------|
| `Exam` | `[schoolId, type, gradeLevel]` | Raporlama sorgularında sürekli filtreleme yapılıyor |
| `Exam` | `[date]` | Sınav listeleri tarihe göre sıralanıyor |
| `ExamAttempt` | `[examId]` | Sınav istatistiklerinde JOIN kullanılıyor |
| `ExamAttempt` | `[studentId]` | Öğrenci geçmişi sorgularında kullanılıyor |
| `ExamAttempt` | `[schoolId]` | Okul bazlı raporlarda filtreleme |
| `ExamLessonResult` | `[attemptId]` | Sınav sonuçları JOIN |
| `ExamLessonResult` | `[lessonId]` | Ders bazlı raporlarda kullanılıyor |
| `ExamScore` | `[attemptId]` | Puan hesaplamalarında JOIN |
| `Student` | `[schoolId, studentNumber]` | Öğrenci numarası ile arama |
| `Student` | `[classId]` | Sınıf bazlı listeleme |
| `User` | `[schoolId, role]` | Rol bazlı kullanıcı listeleme |

#### Önerilen Prisma Şema Güncellemeleri

```prisma
// Exam tablosu indeksleri
model Exam {
  // ... existing fields ...
  
  @@index([schoolId, type, gradeLevel])
  @@index([date])
  @@index([schoolId, date])
}

// ExamAttempt tablosu indeksleri
model ExamAttempt {
  // ... existing fields ...
  
  @@index([examId])
  @@index([studentId])
  @@index([schoolId])
  @@index([examId, studentId])
  @@index([schoolId, examId])
}

// ExamLessonResult tablosu indeksleri
model ExamLessonResult {
  // ... existing fields ...
  
  @@index([attemptId])
  @@index([lessonId])
  @@index([attemptId, lessonId])
}

// ExamScore tablosu indeksleri
model ExamScore {
  // ... existing fields ...
  
  @@index([attemptId])
  @@index([attemptId, type])
}

// Student tablosu indeksleri
model Student {
  // ... existing fields ...
  
  @@index([schoolId, studentNumber])
  @@index([classId])
  @@index([schoolId, classId])
  @@index([parentId])
}

// User tablosu indeksleri
model User {
  // ... existing fields ...
  
  @@index([schoolId, role])
  @@index([role])
}
```

---

## 2. Backend Performans Sorunları ve Çözümleri

### 2.1 N+1 Sorgu Problemleri

#### **Problem 1: `reports.service.ts` - `getExamsSummaryReport`**

```typescript
// ❌ MEVCUT KOD - N+1 Problemi
const exams = await this.prisma.exam.findMany({
  include: {
    attempts: {
      include: {
        student: { include: { class: true } },  // Her attempt için student sorgusu
        lessonResults: { include: { lesson: true } },  // Her attempt için lesson sorgusu
        scores: true,
      },
    },
  },
});
```

**Etki:** 100 sınav × 50 öğrenci = 5000+ sorgu

#### **Çözüm: Agregasyon Sorguları ile Tek Sorguda Hesaplama**

```typescript
// ✅ ÖNERİLEN KOD - Tek Sorgu
async getExamsSummaryReportOptimized(
  schoolId: string,
  examType: ExamType,
  gradeLevel?: number,
) {
  // 1. Sınavları getir (sadece metadata)
  const exams = await this.prisma.exam.findMany({
    where: { schoolId, type: examType, ...(gradeLevel && { gradeLevel }) },
    select: { id: true, title: true, date: true },
  });

  // 2. Tüm istatistikleri tek sorguda hesapla
  const stats = await this.prisma.$queryRaw`
    SELECT 
      e.id as "examId",
      COUNT(DISTINCT ea.id) as "participantCount",
      json_agg(DISTINCT jsonb_build_object(
        'lessonName', l.name,
        'averageNet', AVG(elr.net),
        'averageCorrect', AVG(elr.correct),
        'averageIncorrect', AVG(elr.incorrect),
        'averageEmpty', AVG(elr.empty)
      )) as "lessonAverages",
      json_agg(DISTINCT jsonb_build_object(
        'type', es.type,
        'averageScore', AVG(es.score)
      )) as "scoreAverages"
    FROM "Exam" e
    LEFT JOIN "ExamAttempt" ea ON ea."examId" = e.id
    LEFT JOIN "ExamLessonResult" elr ON elr."attemptId" = ea.id
    LEFT JOIN "Lesson" l ON l.id = elr."lessonId"
    LEFT JOIN "ExamScore" es ON es."attemptId" = ea.id
    WHERE e."schoolId" = ${schoolId}
      AND e.type = ${examType}
      ${gradeLevel ? Prisma.sql`AND e."gradeLevel" = ${gradeLevel}` : Prisma.empty}
    GROUP BY e.id
  `;

  return exams.map(exam => ({
    ...exam,
    ...stats.find(s => s.examId === exam.id),
  }));
}
```

#### **Problem 2: `students.service.ts` - `getStudentExamHistory`**

```typescript
// ❌ MEVCUT KOD - Tüm ilişkileri çekiyor
const student = await this.prisma.student.findUnique({
  include: {
    examAttempts: {
      include: {
        exam: { include: { _count: { select: { attempts: true } } } },
        lessonResults: { include: { lesson: true } },
        scores: true,
      },
    },
  },
});
```

#### **Çözüm: Sayfalama ve Seçici Veri Çekme**

```typescript
// ✅ ÖNERİLEN KOD - Sayfalama ile
async getStudentExamHistoryOptimized(
  studentId: string,
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit;

  // 1. Sadece gerekli alanları seç
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

  // 2. Toplam sayı ayrı sorguda
  const total = await this.prisma.examAttempt.count({
    where: { studentId },
  });

  return { attempts, total, page, totalPages: Math.ceil(total / limit) };
}
```

### 2.2 Ağır Raporlama Sorguları

#### **Problem: Tüm veriyi belleğe yükleme**

```typescript
// ❌ MEVCUT - Tüm veriyi çekip JS'de işliyor
for (const exam of exams) {
  const lessonMap = new Map();
  exam.attempts.forEach(attempt => {
    attempt.lessonResults.forEach(result => {
      // Bellekte hesaplama
    });
  });
}
```

#### **Çözüm: Veritabanı Seviyesinde Agregasyon**

```typescript
// ✅ ÖNERİLEN - Veritabanı hesaplasın
const examStats = await this.prisma.$queryRaw`
  WITH exam_stats AS (
    SELECT 
      e.id,
      e.title,
      e.date,
      COUNT(DISTINCT ea.id) as participant_count,
      AVG(es.score) as avg_score
    FROM "Exam" e
    LEFT JOIN "ExamAttempt" ea ON ea."examId" = e.id
    LEFT JOIN "ExamScore" es ON es."attemptId" = ea.id
    WHERE e."schoolId" = ${schoolId}
    GROUP BY e.id
    HAVING COUNT(DISTINCT ea.id) > 0
  )
  SELECT * FROM exam_stats
  ORDER BY date DESC
  LIMIT ${limit} OFFSET ${offset}
`;
```

### 2.3 Cache Stratejisi Önerisi

```typescript
// Cache decorator örneği
@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @CacheTTL(300) // 5 dakika cache
  async getExamsSummaryReport(schoolId: string, examType: ExamType) {
    const cacheKey = `reports:summary:${schoolId}:${examType}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const result = await this.calculateReport(schoolId, examType);
    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }
}
```

---

## 3. Frontend Performans Sorunları

### 3.1 Gereksiz Re-render'lar

#### **Problem: `reports/page.tsx` - Her state değişiminde tüm hesaplamalar**

```typescript
// ❌ MEVCUT - Her render'da hesaplanıyor
const examChartData = useMemo(() => {
  if (!examReports.length) return [];
  return examReports.map(report => {
    const totalNet = report.lessonAverages.reduce((acc, lesson) => acc + lesson.averageNet, 0);
    // ... uzun hesaplama
  });
}, [examReports]);
```

#### **Çözüm: Virtualization ve Lazy Loading**

```typescript
// ✅ ÖNERİLEN - Virtualized list
import { FixedSizeList as List } from 'react-window';

// Büyük listeler için sanallaştırma
const VirtualizedExamTable = ({ exams }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ExamRow exam={exams[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={exams.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### 3.2 Veri Çekme Optimizasyonları

#### **Problem: Tüm rapor verisi tek seferde çekiliyor**

```typescript
// ❌ MEVCUT - Tüm veriyi çek
const fetchExamReports = async () => {
  const response = await fetch(`/reports/exams/summary?examType=${examType}`);
  const data = await response.json(); // Tüm veri
  setExamReports(data);
};
```

#### **Çözüm: Sayfalama ve Infinite Scroll**

```typescript
// ✅ ÖNERİLEN - Sayfalama
const usePaginatedReports = (examType: string, pageSize = 20) => {
  const [page, setPage] = useState(1);
  const [reports, setReports] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const fetchReports = async () => {
    const response = await fetch(
      `/reports/exams/summary?examType=${examType}&page=${page}&limit=${pageSize}`
    );
    const data = await response.json();
    
    setReports(prev => [...prev, ...data.reports]);
    setHasMore(data.reports.length === pageSize);
  };

  return { reports, fetchReports, hasMore, setPage };
};
```

### 3.3 Bundle Optimizasyonu

```typescript
// ✅ ÖNERİLEN - Dinamik import
const Charts = dynamic(() => import('@/components/charts'), {
  ssr: false,
  loading: () => <Skeleton height={400} />,
});

// Recharts sadece gerektiğinde yüklensin
```

---

## 4. Raporlama Sayfası İyileştirme Önerileri

### 4.1 Mevcut Durum Analizi

| Özellik | Durum | Sorun |
|---------|-------|-------|
| Sınav Raporu | ✅ Var | Performans sorunu var |
| Ders Bazlı Rapor | ✅ Var | Sadece tek ders |
| Şube Karşılaştırma | ✅ Var | Sadece özet görünüm |
| Grafikler | ✅ Var | Tüm veriyi render ediyor |
| Excel/PDF Export | ✅ Var | Bellek kullanımı yüksek |
| Filtreleme | ⚠️ Kısıtlı | Sadece sınav türü ve sınıf |

### 4.2 Önerilen Yeni Özellikler

#### **4.2.1 Gelişmiş Filtreleme**

```typescript
interface ReportFilters {
  examType: ExamType;
  gradeLevel?: number;
  classId?: string;
  dateRange: { start: Date; end: Date };
  publisher?: string;
  minParticipantCount?: number;
}
```

#### **4.2.2 Karşılaştırmalı Raporlar**

```typescript
// İki dönem karşılaştırması
interface ComparisonReport {
  period1: { start: Date; end: Date; stats: ExamStats };
  period2: { start: Date; end: Date; stats: ExamStats };
  changes: {
    netChange: number;
    scoreChange: number;
    participationChange: number;
  };
}
```

---

## 5. Yeni Rapor Türleri Önerileri

### 5.1 Öğrenci Gelişim Raporu

```typescript
interface StudentProgressReport {
  studentId: string;
  period: { start: Date; end: Date };
  
  // Trend analizi
  trends: {
    netTrend: 'improving' | 'stable' | 'declining';
    scoreTrend: 'improving' | 'stable' | 'declining';
    rankTrend: 'improving' | 'stable' | 'declining';
  };
  
  // Ders bazlı gelişim
  lessonProgress: {
    lessonName: string;
    firstExamNet: number;
    lastExamNet: number;
    change: number;
    trend: number[]; // Her sınavdaki net değişimi
  }[];
  
  // Sınıf/Okul karşılaştırması
  comparisons: {
    vsClassAverage: number; // Pozitif = sınıf ortalaması üzerinde
    vsSchoolAverage: number;
    percentile: number; // Okul içindeki yüzdelik dilim
  };
}
```

### 5.2 Sınıf Performans Raporu

```typescript
interface ClassPerformanceReport {
  classId: string;
  examType: ExamType;
  
  // Genel istatistikler
  overview: {
    totalStudents: number;
    averageAttendance: number;
    classAverageNet: number;
    classAverageScore: number;
  };
  
  // Ders bazlı performans
  lessonPerformance: {
    lessonName: string;
    classAverage: number;
    schoolAverage: number;
    difference: number;
    topStudent: string;
    weakestStudent: string;
  }[];
  
  // Öğrenci dağılımı
  distribution: {
    excellent: number; // %90 üzeri
    good: number;      // %70-90
    average: number;   // %50-70
    belowAverage: number; // %50 altı
  };
  
  // Zaman içinde gelişim
  progressOverTime: {
    examId: string;
    examTitle: string;
    date: Date;
    classAverage: number;
    schoolAverage: number;
  }[];
}
```

### 5.3 Okul Geneli Analiz Raporu

```typescript
interface SchoolAnalyticsReport {
  schoolId: string;
  period: { start: Date; end: Date };
  
  // Katılım analizi
  participation: {
    totalExams: number;
    averageParticipation: number;
    participationByGrade: Record<number, number>;
    participationByClass: Record<string, number>;
  };
  
  // Başarı analizi
  successMetrics: {
    schoolAverageNet: number;
    schoolAverageScore: number;
    topPerformingClass: string;
    mostImprovedClass: string;
    topPerformingGrade: number;
  };
  
  // Ders başarısı
  lessonSuccess: {
    lessonName: string;
    schoolAverage: number;
    cityAverage?: number; // Karne verileri ile karşılaştırma
    generalAverage?: number;
    successRate: number;
  }[];
  
  // Risk analizi
  riskAnalysis: {
    atRiskStudents: number; // Üst üste düşüş gösteren
    riskByClass: Record<string, number>;
    riskByLesson: Record<string, number>;
  };
}
```

### 5.4 Öğretmen Değerlendirme Raporu

```typescript
interface TeacherEvaluationReport {
  teacherId: string;
  classes: string[];
  
  // Sorumlu olduğu sınıfların performansı
  classPerformance: {
    classId: string;
    className: string;
    averageNet: number;
    improvement: number; // Dönem başından beri
    rankInSchool: number;
  }[];
  
  // Ders bazlı başarı
  lessonSuccess: {
    lessonName: string;
    averageSuccess: number;
    vsSchoolAverage: number;
  }[];
}
```

### 5.5 Veli Özet Raporu

```typescript
interface ParentSummaryReport {
  studentId: string;
  period: { start: Date; end: Date };
  
  // Basit özet
  summary: {
    examsTaken: number;
    averageNet: number;
    averageRank: number;
    missedExams: number;
  };
  
  // Görsel grafikler için hazır veri
  charts: {
    netProgress: { date: string; net: number }[];
    rankProgress: { date: string; rank: number }[];
    lessonComparison: { lesson: string; student: number; class: number; school: number }[];
  };
  
  // Önemli notlar
  alerts: {
    type: 'improvement' | 'decline' | 'absence' | 'achievement';
    message: string;
    date: Date;
  }[];
}
```

---

## 6. Önerilen Mimari İyileştirmeler

### 6.1 Materialized Views (PostgreSQL)

```sql
-- Günlük sınav istatistikleri için materialized view
CREATE MATERIALIZED VIEW daily_exam_stats AS
SELECT 
  e.id as exam_id,
  e.school_id,
  e.type,
  COUNT(DISTINCT ea.id) as participant_count,
  AVG(es.score) as avg_score,
  jsonb_object_agg(l.name, AVG(elr.net)) as lesson_averages
FROM Exam e
LEFT JOIN ExamAttempt ea ON ea.exam_id = e.id
LEFT JOIN ExamScore es ON es.attempt_id = ea.id
LEFT JOIN ExamLessonResult elr ON elr.attempt_id = ea.id
LEFT JOIN Lesson l ON l.id = elr.lesson_id
GROUP BY e.id;

-- Index on materialized view
CREATE INDEX idx_daily_stats_school ON daily_exam_stats(school_id, type);

-- Refresh schedule (her gece)
REFRESH MATERIALIZED VIEW daily_exam_stats;
```

### 6.2 Redis Cache Yapısı

```typescript
// Cache key stratejisi
const CACHE_KEYS = {
  // Raporlar
  examSummary: (schoolId: string, examType: string) => 
    `report:exam_summary:${schoolId}:${examType}`,
  
  // Öğrenci verileri
  studentHistory: (studentId: string, page: number) => 
    `student:history:${studentId}:${page}`,
  
  // Sınav istatistikleri
  examStats: (examId: string) => 
    `exam:stats:${examId}`,
  
  // TTL: 5 dakika
  // Invalidate: Yeni veri eklendiğinde
};
```

### 6.3 Background Job Kuyruğu

```typescript
// BullMQ ile ağır işlemler
@Processor('reports-queue')
export class ReportsProcessor {
  @Process('generate-large-report')
  async generateLargeReport(job: Job) {
    const { schoolId, examType, email } = job.data;
    
    // Büyük raporu arka planda oluştur
    const report = await this.generateReport(schoolId, examType);
    
    // Email ile gönder
    await this.emailService.sendReport(email, report);
  }
}
```

---

## 7. Öncelikli Aksiyon Listesi

### **Acil (1. Hafta)**

1. [ ] Veritabanı indekslerini ekle
2. [ ] `reports.service.ts` N+1 sorununu çöz
3. [ ] `students.service.ts` sayfalama ekle

### **Yüksek Öncelik (2-3. Hafta)**

4. [ ] Redis cache implementasyonu
5. [ ] Frontend sayfalama ve virtualization
6. [ ] Materialized views oluştur

### **Orta Öncelik (1-2. Ay)**

7. [ ] Yeni rapor türlerini implemente et
8. [ ] Background job kuyruğu kur
9. [ ] Export servisini optimize et

### **Düşük Öncelik (2-3. Ay)**

10. [ ] Advanced analytics dashboard
11. [ ] Real-time notifications
12. [ ] Machine learning predictions

---

## 8. Performans Beklentileri

| Metrik | Mevcut | Hedef | İyileştirme |
|--------|--------|-------|-------------|
| Rapor yükleme süresi | 5-10 sn | < 2 sn | %80 |
| Öğrenci detay sayfası | 3-5 sn | < 1 sn | %75 |
| Veritabanı sorgu sayısı | 100+ | < 10 | %90 |
| Bellek kullanımı | Yüksek | Düşük | %70 |
| Export süresi | 10-30 sn | < 5 sn | %80 |

---

## 9. Sonuç

Proje genel olarak iyi yapılandırılmış ancak performans optimizasyonlarına acil ihtiyaç var. Özellikle:

1. **Veritabanı indeksleme** en kritik konu
2. **N+1 sorgular** raporlama performansını ciddi şekilde etkiliyor
3. **Frontend'de sayfalama** büyük veri setleri için zorunlu
4. **Cache stratejisi** tekrar eden sorguları azaltacak

Önerilen değişiklikler uygulandığında, sistem çok daha fazla veriyle bile hızlı çalışabilecek ve kullanıcı deneyimi önemli ölçüde iyileşecektir.

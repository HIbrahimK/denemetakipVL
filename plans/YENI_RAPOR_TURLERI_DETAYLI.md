# Yeni Rapor Türleri - Detaylı Özellik ve API Tasarımı

## 1. Öğrenci Gelişim Raporu

### 1.1 Amaç
Öğrencinin belirli bir dönem içindeki akademik gelişimini, güçlü ve zayıf yönlerini analiz etmek.

### 1.2 API Endpoint

```typescript
// GET /api/reports/students/:studentId/progress
interface StudentProgressReportRequest {
  startDate: string; // ISO date
  endDate: string;
  examTypes?: ExamType[]; // ['TYT', 'AYT'] gibi
}

interface StudentProgressReportResponse {
  student: {
    id: string;
    name: string;
    className: string;
  };
  
  summary: {
    totalExams: number;
    averageNet: number;
    averageScore: number;
    bestExam: {
      id: string;
      title: string;
      net: number;
      date: string;
    };
    worstExam: {
      id: string;
      title: string;
      net: number;
      date: string;
    };
  };
  
  trends: {
    overall: 'improving' | 'stable' | 'declining';
    netChange: number; // İlk ve son sınav arası fark
    scoreChange: number;
    rankChange: number; // Sıralama değişimi (negatif = iyileşme)
  };
  
  lessonAnalysis: {
    lessonName: string;
    firstNet: number;
    lastNet: number;
    change: number;
    changePercent: number;
    trend: 'improving' | 'stable' | 'declining';
    examHistory: {
      examId: string;
      examTitle: string;
      date: string;
      net: number;
      classAverage: number;
      schoolAverage: number;
    }[];
  }[];
  
  comparisons: {
    vsClassAverage: number; // Pozitif = üstünde
    vsSchoolAverage: number;
    classPercentile: number; // 0-100 arası
    schoolPercentile: number;
  };
  
  recommendations: {
    type: 'strength' | 'weakness' | 'opportunity';
    lessonName?: string;
    message: string;
    actionItem: string;
  }[];
}
```

### 1.3 Frontend Görünümü

```typescript
// components/reports/StudentProgressReport.tsx
const StudentProgressReport = () => {
  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <ProgressSummaryCards summary={report.summary} trends={report.trends} />
      
      {/* Ders Bazlı Gelişim Grafiği */}
      <LessonProgressChart lessons={report.lessonAnalysis} />
      
      {/* Güçlü ve Zayıf Yönler */}
      <StrengthsWeaknesses lessons={report.lessonAnalysis} />
      
      {/* Öneriler */}
      <Recommendations items={report.recommendations} />
      
      {/* Detaylı Tablo */}
      <DetailedProgressTable lessons={report.lessonAnalysis} />
    </div>
  );
};
```

### 1.4 Veritabanı Sorgusu

```sql
-- Öğrenci gelişim istatistikleri
WITH student_exams AS (
  SELECT 
    ea.id as attempt_id,
    e.id as exam_id,
    e.title as exam_title,
    e.date as exam_date,
    SUM(elr.net) as total_net,
    AVG(es.score) as avg_score
  FROM "ExamAttempt" ea
  JOIN "Exam" e ON e.id = ea."examId"
  LEFT JOIN "ExamLessonResult" elr ON elr."attemptId" = ea.id
  LEFT JOIN "ExamScore" es ON es."attemptId" = ea.id
  WHERE ea."studentId" = $1
    AND e.date BETWEEN $2 AND $3
  GROUP BY ea.id, e.id, e.title, e.date
  ORDER BY e.date
),
lesson_progress AS (
  SELECT 
    l.name as lesson_name,
    FIRST_VALUE(elr.net) OVER (PARTITION BY l.id ORDER BY e.date) as first_net,
    LAST_VALUE(elr.net) OVER (PARTITION BY l.id ORDER BY e.date) as last_net,
    json_agg(json_build_object(
      'examTitle', e.title,
      'date', e.date,
      'net', elr.net
    )) as history
  FROM "ExamAttempt" ea
  JOIN "Exam" e ON e.id = ea."examId"
  JOIN "ExamLessonResult" elr ON elr."attemptId" = ea.id
  JOIN "Lesson" l ON l.id = elr."lessonId"
  WHERE ea."studentId" = $1
    AND e.date BETWEEN $2 AND $3
  GROUP BY l.id, l.name
)
SELECT * FROM student_exams, lesson_progress;
```

---

## 2. Sınıf Performans Raporu

### 2.1 Amaç
Bir sınıfın genel performansını, ders bazlı başarısını ve öğrenci dağılımını analiz etmek.

### 2.2 API Endpoint

```typescript
// GET /api/reports/classes/:classId/performance
interface ClassPerformanceReportRequest {
  examType: ExamType;
  startDate?: string;
  endDate?: string;
}

interface ClassPerformanceReportResponse {
  class: {
    id: string;
    name: string;
    gradeName: string;
    studentCount: number;
    advisorTeacher?: string;
  };
  
  overview: {
    examsTaken: number;
    averageAttendance: number; // Katılım oranı
    classAverageNet: number;
    classAverageScore: number;
    rankInSchool: number; // Okul içinde sıralama
  };
  
  lessonPerformance: {
    lessonName: string;
    classAverage: number;
    schoolAverage: number;
    difference: number;
    rankInSchool: number;
    topStudent: {
      id: string;
      name: string;
      net: number;
    };
    needsAttention: {
      id: string;
      name: string;
      net: number;
    }[]; // En düşük 3 öğrenci
  }[];
  
  studentDistribution: {
    excellent: { count: number; students: string[] }; // %90+
    good: { count: number; students: string[] };      // %70-90
    average: { count: number; students: string[] };   // %50-70
    belowAverage: { count: number; students: string[] }; // <%50
  };
  
  progressOverTime: {
    examId: string;
    examTitle: string;
    date: string;
    classAverage: number;
    schoolAverage: number;
    difference: number;
  }[];
  
  comparisonWithOtherClasses: {
    className: string;
    averageNet: number;
    difference: number; // Mevcut sınıf ile fark
  }[];
  
  atRiskStudents: {
    studentId: string;
    name: string;
    reason: 'low_performance' | 'declining' | 'absence';
    details: string;
  }[];
}
```

### 2.3 Frontend Görünümü

```typescript
const ClassPerformanceReport = () => {
  return (
    <div className="space-y-6">
      {/* Sınıf Özeti */}
      <ClassOverviewCard data={report.class} overview={report.overview} />
      
      {/* Ders Bazlı Karşılaştırma */}
      <LessonComparisonChart lessons={report.lessonPerformance} />
      
      {/* Öğrenci Dağılımı (Pasta Grafiği) */}
      <StudentDistributionChart distribution={report.studentDistribution} />
      
      {/* Zaman İçinde Gelişim */}
      <ProgressTimeline data={report.progressOverTime} />
      
      {/* Diğer Sınıflarla Karşılaştırma */}
      <ClassComparisonTable comparisons={report.comparisonWithOtherClasses} />
      
      {/* Risk Altındaki Öğrenciler */}
      <AtRiskStudentsList students={report.atRiskStudents} />
    </div>
  );
};
```

---

## 3. Okul Geneli Analiz Raporu

### 3.1 Amaç
Okulun genel akademik durumunu, sınıf ve ders bazlı analizlerini sunmak.

### 3.2 API Endpoint

```typescript
// GET /api/reports/schools/:schoolId/analytics
interface SchoolAnalyticsRequest {
  period: 'month' | 'semester' | 'year';
  examTypes?: ExamType[];
}

interface SchoolAnalyticsResponse {
  period: {
    start: string;
    end: string;
  };
  
  summary: {
    totalExams: number;
    totalStudents: number;
    totalAttempts: number;
    averageParticipation: number;
  };
  
  gradeLevelAnalysis: {
    gradeLevel: number;
    studentCount: number;
    examCount: number;
    averageNet: number;
    averageScore: number;
    participationRate: number;
    topPerformingClass: string;
  }[];
  
  lessonSuccess: {
    lessonName: string;
    schoolAverage: number;
    bestGrade: number;
    worstGrade: number;
    trend: 'up' | 'down' | 'stable';
    byGrade: Record<number, number>; // Her sınıf için ortalama
  }[];
  
  classRankings: {
    rank: number;
    className: string;
    gradeLevel: number;
    averageNet: number;
    averageScore: number;
    improvement: number; // Bir önceki döneme göre
  }[];
  
  participationAnalysis: {
    overall: number;
    byGrade: Record<number, number>;
    byClass: Record<string, number>;
    trend: { date: string; rate: number }[];
  };
  
  riskAnalysis: {
    atRiskCount: number;
    riskPercentage: number;
    byGrade: Record<number, number>;
    byClass: Record<string, number>;
    byLesson: Record<string, number>;
    details: {
      studentId: string;
      name: string;
      className: string;
      riskFactors: string[];
    }[];
  };
  
  achievements: {
    mostImprovedClass: { name: string; improvement: number };
    mostImprovedStudent: { name: string; className: string; improvement: number };
    highestScore: { student: string; score: number; exam: string };
    bestAttendance: { className: string; rate: number };
  };
}
```

### 3.3 Dashboard Görünümü

```typescript
const SchoolAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <SummaryCards data={report.summary} />
      
      {/* Sınıf Seviyesi Analizi */}
      <GradeLevelAnalysis data={report.gradeLevelAnalysis} />
      
      {/* Ders Başarısı Heatmap */}
      <LessonSuccessHeatmap lessons={report.lessonSuccess} />
      
      {/* Sınıf Sıralaması */}
      <ClassRankingsTable rankings={report.classRankings} />
      
      {/* Katılım Analizi */}
      <ParticipationChart data={report.participationAnalysis} />
      
      {/* Risk Analizi */}
      <RiskAnalysisPanel analysis={report.riskAnalysis} />
      
      {/* Başarılar */}
      <AchievementsPanel achievements={report.achievements} />
    </div>
  );
};
```

---

## 4. Karşılaştırmalı Dönem Raporu

### 4.1 Amaç
İki farklı dönemi karşılaştırarak gelişim veya gerilemeyi analiz etmek.

### 4.2 API Endpoint

```typescript
// GET /api/reports/comparison
interface PeriodComparisonRequest {
  schoolId: string;
  period1: { start: string; end: string };
  period2: { start: string; end: string };
  examType: ExamType;
  gradeLevel?: number;
  classId?: string;
}

interface PeriodComparisonResponse {
  period1: {
    label: string;
    start: string;
    end: string;
    stats: PeriodStats;
  };
  period2: {
    label: string;
    start: string;
    end: string;
    stats: PeriodStats;
  };
  
  comparison: {
    netChange: {
      value: number;
      percent: number;
      direction: 'up' | 'down' | 'same';
    };
    scoreChange: {
      value: number;
      percent: number;
      direction: 'up' | 'down' | 'same';
    };
    participationChange: {
      value: number;
      percent: number;
      direction: 'up' | 'down' | 'same';
    };
  };
  
  lessonComparisons: {
    lessonName: string;
    period1Avg: number;
    period2Avg: number;
    change: number;
    changePercent: number;
  }[];
  
  classComparisons?: {
    className: string;
    period1Avg: number;
    period2Avg: number;
    change: number;
  }[];
  
  studentComparisons?: {
    studentId: string;
    name: string;
    period1Avg: number;
    period2Avg: number;
    change: number;
    trend: 'improved' | 'declined' | 'stable';
  }[];
  
  insights: {
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    recommendation?: string;
  }[];
}

interface PeriodStats {
  examCount: number;
  averageNet: number;
  averageScore: number;
  participationRate: number;
  topLesson: string;
  weakLesson: string;
}
```

### 4.3 Görsel Karşılaştırma

```typescript
const PeriodComparisonReport = () => {
  return (
    <div className="space-y-6">
      {/* Yan Yana Dönem Özeti */}
      <PeriodComparisonCards p1={report.period1} p2={report.period2} />
      
      {/* Değişim Göstergeleri */}
      <ChangeIndicators comparison={report.comparison} />
      
      {/* Ders Bazlı Karşılaştırma (Bar Chart) */}
      <LessonComparisonChart lessons={report.lessonComparisons} />
      
      {/* Öğrenci Gelişim Tablosu */}
      <StudentProgressTable students={report.studentComparisons} />
      
      {/* AI/İnsight Özet */}
      <InsightsPanel insights={report.insights} />
    </div>
  );
};
```

---

## 5. Veli Özet Raporu

### 5.1 Amaç
Velilere basit, anlaşılır ve görsel ağırlıklı bir özet sunmak.

### 5.2 API Endpoint

```typescript
// GET /api/reports/parents/summary
interface ParentSummaryRequest {
  studentId: string;
  period?: 'last_month' | 'last_semester' | 'all';
}

interface ParentSummaryResponse {
  student: {
    id: string;
    name: string;
    className: string;
    schoolName: string;
  };
  
  quickStats: {
    examsTaken: number;
    averageNet: number;
    averageRank: number;
    missedExams: number;
  };
  
  performanceIndicators: {
    netProgress: 'up' | 'down' | 'stable';
    rankProgress: 'up' | 'down' | 'stable'; // Sıralama (down = iyileşme)
    attendance: 'good' | 'average' | 'poor';
    overall: 'excellent' | 'good' | 'average' | 'needs_attention';
  };
  
  charts: {
    // Net gelişimi çizgi grafiği
    netProgress: {
      labels: string[]; // Sınav tarihleri
      data: number[];
      classAverage: number[];
    };
    
    // Ders başarısı radar/pasta grafiği
    lessonSuccess: {
      lesson: string;
      student: number;
      class: number;
    }[];
    
    // Sıralama gelişimi
    rankProgress: {
      labels: string[];
      data: number[];
      totalStudents: number[];
    };
  };
  
  highlights: {
    bestLesson: { name: string; score: number };
    needsImprovement: { name: string; score: number };
    recentAchievement?: string;
  };
  
  alerts: {
    type: 'positive' | 'warning' | 'info';
    icon: string;
    title: string;
    message: string;
    action?: {
      label: string;
      link: string;
    };
  }[];
  
  upcomingExams: {
    id: string;
    title: string;
    date: string;
    type: string;
  }[];
}
```

### 5.3 Mobil Dostu Görünüm

```typescript
const ParentSummaryReport = () => {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Öğrenci Başlığı */}
      <StudentHeader student={report.student} />
      
      {/* Hızlı Durum Kartı */}
      <QuickStatusCard indicators={report.performanceIndicators} />
      
      {/* Ana Metrikler */}
      <QuickStatsGrid stats={report.quickStats} />
      
      {/* Basit Grafikler */}
      <SimpleNetChart data={report.charts.netProgress} />
      
      {/* Ders Başarısı */}
      <LessonSuccessBars lessons={report.charts.lessonSuccess} />
      
      {/* Öne Çıkanlar */}
      <HighlightsCard highlights={report.highlights} />
      
      {/* Bildirimler */}
      <AlertsList alerts={report.alerts} />
      
      {/* Yaklaşan Sınavlar */}
      <UpcomingExams exams={report.upcomingExams} />
    </div>
  );
};
```

---

## 6. Öğretmen Performans Raporu

### 6.1 Amaç
Öğretmenlerin sorumlu olduğu sınıfların performansını değerlendirmek.

### 6.2 API Endpoint

```typescript
// GET /api/reports/teachers/:teacherId/performance
interface TeacherPerformanceRequest {
  period: { start: string; end: string };
}

interface TeacherPerformanceResponse {
  teacher: {
    id: string;
    name: string;
    subjects: string[];
  };
  
  assignedClasses: {
    classId: string;
    className: string;
    gradeLevel: number;
    studentCount: number;
  }[];
  
  classPerformance: {
    classId: string;
    className: string;
    examsCount: number;
    averageNet: number;
    averageScore: number;
    rankInSchool: number;
    previousRank: number;
    improvement: number;
    vsSchoolAverage: number;
  }[];
  
  subjectPerformance: {
    subjectName: string;
    classesTaught: string[];
    averageSuccess: number;
    vsSchoolAverage: number;
    topClass: string;
  }[];
  
  studentProgress: {
    improved: number;
    stable: number;
    declined: number;
    details: {
      studentId: string;
      name: string;
      className: string;
      change: number;
    }[];
  };
  
  recommendations: {
    type: 'strength' | 'improvement';
    message: string;
    relatedClass?: string;
  }[];
}
```

---

## 7. Rapor Paylaşım ve Programlama Sistemi

### 7.1 Rapor Programlama

```typescript
// POST /api/reports/schedule
interface ScheduleReportRequest {
  reportType: 'student_progress' | 'class_performance' | 'school_analytics';
  parameters: Record<string, any>;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // "08:00"
  };
  recipients: {
    type: 'email' | 'in_app';
    target: string; // email or userId
  }[];
  format: 'pdf' | 'excel' | 'html';
}
```

### 7.2 Otomatik Rapor Örnekleri

```typescript
// Her pazartesi sınıf öğretmenlerine haftalık özet
const weeklyClassReport = {
  reportType: 'class_performance',
  parameters: { period: 'last_week' },
  schedule: { frequency: 'weekly', dayOfWeek: 1, time: '08:00' },
  recipients: [{ type: 'email', target: 'teacher@school.com' }],
  format: 'pdf',
};

// Her ay velilere öğrenci gelişim raporu
const monthlyParentReport = {
  reportType: 'student_progress',
  parameters: { period: 'last_month' },
  schedule: { frequency: 'monthly', dayOfMonth: 1, time: '09:00' },
  recipients: [{ type: 'email', target: 'parent@email.com' }],
  format: 'pdf',
};
```

---

## 8. Rapor Şablon Sistemi

### 8.1 Özelleştirilebilir Şablonlar

```typescript
interface ReportTemplate {
  id: string;
  name: string;
  type: 'student' | 'class' | 'school';
  sections: {
    id: string;
    type: 'summary' | 'chart' | 'table' | 'text';
    title: string;
    visible: boolean;
    order: number;
    config?: Record<string, any>;
  }[];
  branding: {
    logoUrl?: string;
    primaryColor: string;
    headerText?: string;
    footerText?: string;
  };
}

// Örnek şablon
const defaultStudentTemplate: ReportTemplate = {
  id: 'default-student',
  name: 'Varsayılan Öğrenci Raporu',
  type: 'student',
  sections: [
    { id: 'header', type: 'summary', title: 'Özet Bilgiler', visible: true, order: 1 },
    { id: 'net-chart', type: 'chart', title: 'Net Gelişimi', visible: true, order: 2 },
    { id: 'lesson-table', type: 'table', title: 'Ders Bazlı Sonuçlar', visible: true, order: 3 },
    { id: 'comparison', type: 'chart', title: 'Karşılaştırmalar', visible: true, order: 4 },
  ],
  branding: {
    primaryColor: '#3b82f6',
    headerText: 'Öğrenci Performans Raporu',
    footerText: 'Deneme Takip Sistemi',
  },
};
```

---

## 9. API Performans Optimizasyonları

### 9.1 Önbellek Stratejisi

```typescript
const CACHE_CONFIG = {
  // Öğrenci raporları - 1 saat
  'student:progress': { ttl: 3600, tags: ['student', 'exam'] },
  
  // Sınıf raporları - 30 dakika
  'class:performance': { ttl: 1800, tags: ['class', 'exam'] },
  
  // Okul raporları - 2 saat
  'school:analytics': { ttl: 7200, tags: ['school', 'exam'] },
  
  // Karşılaştırma raporları - 1 saat
  'comparison': { ttl: 3600, tags: ['exam'] },
};

// Cache invalidation
// Yeni sınav sonucu eklendiğinde ilgili cache'leri temizle
const invalidateExamCaches = async (schoolId: string) => {
  await cache.delByPattern(`school:${schoolId}:*`);
  await cache.delByPattern(`class:*:school:${schoolId}:*`);
};
```

### 9.2 Sayfalama ve Limitler

```typescript
// Tüm rapor endpoint'leri için varsayılan limitler
const REPORT_LIMITS = {
  studentProgress: { maxExams: 50, defaultExams: 20 },
  classPerformance: { maxStudents: 100, defaultStudents: 50 },
  schoolAnalytics: { maxClasses: 50, defaultClasses: 20 },
  comparison: { maxPeriods: 12, defaultPeriods: 6 },
};
```

---

## 10. Frontend State Management

### 10.1 React Query ile Cache

```typescript
// hooks/useReports.ts
export const useStudentProgressReport = (studentId: string, params: any) => {
  return useQuery({
    queryKey: ['reports', 'student-progress', studentId, params],
    queryFn: () => fetchStudentProgressReport(studentId, params),
    staleTime: 1000 * 60 * 30, // 30 dakika
    cacheTime: 1000 * 60 * 60, // 1 saat
  });
};

export const useClassPerformanceReport = (classId: string, params: any) => {
  return useQuery({
    queryKey: ['reports', 'class-performance', classId, params],
    queryFn: () => fetchClassPerformanceReport(classId, params),
    staleTime: 1000 * 60 * 15, // 15 dakika
  });
};
```

---

Bu detaylı rapor türleri sistemin veri analizi kapasitesini önemli ölçüde artıracak ve farklı kullanıcı rollerine (öğrenci, veli, öğretmen, yönetici) özel değerler sunacaktır.

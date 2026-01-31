# Plan: Comprehensive Learning Management - Study, Goals & Mentoring System

A complete transformation from exam tracking to intelligent learning management platform with three interconnected systems: AI-powered study tracking, goals & motivation framework, and collaborative mentoring groups. This creates a differentiated ecosystem where students receive guidance, teachers become mentors, and progress is measurable.

## Steps

### 1. Database Schema - Core Learning Models

Extend [schema.prisma](backend/prisma/schema.prisma) with:
- `StudyPlan`: Teacher-created or AI-generated study schedules with `teacherId`, `targetType` (INDIVIDUAL/GROUP/CLASS), `targetId`, `startDate`, `endDate`, `isTemplate`, `isPublic`
- `StudyTask`: Daily tasks with `planId`, `studentId`, `date`, `subjectId`, `topicId`, `questionCount`, `resourceReference` (book/page), `status` (PENDING/IN_PROGRESS/COMPLETED), `completedQuestions`, `correctAnswers`, `wrongAnswers`, `blankAnswers`, `timeSpent`, `teacherReviewed`, `parentVerified`
- `StudySession`: Time tracking with `studentId`, `subjectId`, `topicId`, `startTime`, `endTime`, `duration`, `isPomodoroMode`
- `StudyGoal`: Student and teacher goals with `userId`, `type` (STUDENT_NET/STUDENT_SCORE/STUDENT_UNIVERSITY/TEACHER_CLASS_AVERAGE), `targetData` (JSON), `deadline`, `progress`
- `StudyRecommendation`: AI-generated suggestions with `studentId`, `recommendationType` (WEAK_AREA/STUDY_GAP/DIFFICULTY_BALANCE/EXAM_PREP), `subjectId`, `topicId`, `reasoning`, `priority`, `createdAt`
- `Topic`: Hierarchical topic structure with `name`, `examType` (TYT/AYT/LGS), `subjectId`, `parentTopicId`, `order`, `difficulty`
- `Resource`: Books/materials with `name`, `type` (BOOK/VIDEO/ARTICLE), `publisherOrAuthor`, `examType`, `isPopular`
- `Achievement`: Badge definitions with `code`, `name`, `description`, `iconUrl`, `category` (STREAK/MILESTONE/IMPROVEMENT/GROUP), `criteria` (JSON)
- `StudentAchievement`: Unlocked achievements with `studentId`, `achievementId`, `unlockedAt`
- `MentorGroup`: Teacher-led groups with `teacherId`, `schoolId`, `name`, `description`, `gradeIds[]`, `maxStudents`, `isActive`, `coverImage`
- `GroupMembership`: Junction table with `groupId`, `studentId`, `role` (MEMBER/CO_LEADER), `joinedAt`, `leftAt`
- `GroupStudyPlan`: Links study plans to groups with `groupId`, `studyPlanId`, `assignedAt`
- `GroupGoal`: Collective goals with `groupId`, `goalType`, `targetData`, `deadline`

Create migration with seed data:
- 50-100 topics per exam type (TYT/AYT/LGS) in hierarchical structure
- Initial achievement definitions (7/30/100 day streaks, 100/500/1000/5000 question milestones)
- Common resources (Paraf, Limit, Bilfen, etc.)

### 2. Mentoring Groups Infrastructure

Add to database schema:
- Extend `Message` model with optional `groupId` field for group-specific messaging
- Add `MessageCategory.GROUP` enum value for group messages
- Create indexes on `groupId` for message queries

Features:
- Group creation with teacher as owner
- Student assignment via `GroupMembership` junction table
- Group isolation (messages visible only to group members)
- Group file sharing via existing [MessageAttachment](backend/prisma/schema.prisma#L354) pattern
- Group notifications using existing infrastructure

### 3. Backend Module - Study Management API

Create `/backend/src/study/` module with:

**Controllers & Routes:**
- `POST /api/study/plans` - Create study plan (teacher)
- `GET /api/study/plans` - List plans (filtered by role)
- `GET /api/study/plans/:id` - Get plan details
- `PUT /api/study/plans/:id` - Update plan
- `DELETE /api/study/plans/:id` - Delete plan
- `POST /api/study/plans/:id/assign` - Assign to students/groups/classes
- `POST /api/study/tasks/:id/complete` - Mark task complete (student)
- `PUT /api/study/tasks/:id/verify` - Parent verification
- `PUT /api/study/tasks/:id/review` - Teacher review
- `GET /api/study/sessions` - Get study sessions
- `POST /api/study/sessions` - Log study session
- `GET /api/study/recommendations` - Get AI recommendations (student)
- `GET /api/study/statistics` - Get study statistics

**Services:**
- `StudyPlanService`: CRUD operations, assignment logic, template management
- `StudyTaskService`: Task completion, verification workflow, progress tracking
- `StudySessionService`: Time tracking, Pomodoro session management, aggregation
- `StudyRecommendationService`: AI analysis engine

**AI Recommendation Engine Logic:**
1. Query last 10 `ExamLessonResult` entries per student
2. Identify topics with <50% correctness ratio (weak areas)
3. Detect study gaps: no `StudySession` in 7+ days for subject
4. Balance difficulty: avoid 3+ consecutive hard topics
5. Check exam proximity: increase tempo when exam <30 days away
6. Prioritize teacher-assigned tasks over AI suggestions
7. Generate 3-5 daily recommendations with reasoning

**Integration:**
- Use [queue/](backend/src/queue) for scheduled study reminders
- Leverage [ExamLessonResult](backend/prisma/schema.prisma) for weak area analysis
- Integrate with existing notification system

### 4. Backend Module - Goals & Motivation API

Create `/backend/src/goals/` module with:

**Controllers & Routes:**
- `POST /api/goals` - Create goal (student or teacher)
- `GET /api/goals` - List goals (filtered by user)
- `GET /api/goals/:id` - Get goal details with progress
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/goals/:id/progress` - Get detailed progress analysis
- `GET /api/achievements` - List all achievements
- `GET /api/achievements/student/:id` - Get student's unlocked achievements
- `POST /api/achievements/check` - Trigger achievement check

**Services:**
- `GoalService`: CRUD, progress calculation, comparison with actual exam results
- `AchievementService`: Achievement unlock logic, badge management, notification triggers
- `MotivationService`: Generate motivational messages based on progress trends

**Achievement Unlock Logic:**
- **Streak Achievements**: Check `StudySession` continuity (7/30/100 consecutive days)
- **Milestone Achievements**: Sum `StudyTask.completedQuestions` (100/500/1000/5000)
- **Improvement Achievements**: Compare recent vs older `ExamLessonResult` (20%+ improvement in weak subject)
- **Consistency Achievements**: Track weekly patterns (5+ days/week for 4 weeks)
- **Group Achievements**: Check if all `GroupMembership` members completed weekly tasks

**Progress Calculation:**
- Student Net Goals: Compare `targetData.nets` with actual `ExamScore.totalNet`
- Student Score Goals: Compare `targetData.score` with `ExamScore.totalScore`
- Teacher Class Average Goals: Aggregate class `ExamScore` averages vs target
- Display progress percentage, trend (improving/declining), projected outcome

### 5. Backend Module - Mentoring Groups API

Create `/backend/src/mentoring/` module with:

**Controllers & Routes:**
- `POST /api/mentoring/groups` - Create group (teacher)
- `GET /api/mentoring/groups` - List groups (filtered by role)
- `GET /api/mentoring/groups/:id` - Get group details
- `PUT /api/mentoring/groups/:id` - Update group
- `DELETE /api/mentoring/groups/:id` - Delete/archive group
- `POST /api/mentoring/groups/:id/members` - Add students to group
- `DELETE /api/mentoring/groups/:id/members/:studentId` - Remove student
- `POST /api/mentoring/groups/:id/bulk-assign` - Bulk student assignment
- `GET /api/mentoring/groups/:id/statistics` - Get group statistics
- `POST /api/mentoring/groups/:id/messages` - Send group message
- `GET /api/mentoring/groups/:id/messages` - Get group message feed
- `POST /api/mentoring/groups/:id/study-plans` - Assign study plan to group
- `GET /api/mentoring/groups/:id/progress` - Get all members' progress

**Services:**
- `MentoringGroupService`: Group CRUD, membership management, statistics
- `GroupMessagingService`: Extends [MessagesService](backend/src/messages/messages.service.ts) with group-specific logic
- `GroupStudyPlanService`: Assign plans to groups, track collective progress

**Extend MessagesService:**
Add `sendGroupMessage()` method:
```typescript
async sendGroupMessage(groupId: string, createMessageDto: CreateMessageDto, userId: string) {
  // Validate user is group member or teacher
  // Get all group members via GroupMembership
  // Create Message with groupId
  // Create MessageRecipient for each member
  // Send notifications
}
```

**Group Statistics Aggregation:**
- Average study time per member
- Task completion rates (individual and collective)
- Exam performance trends
- Top performers and at-risk students
- Group goal progress

**School Admin Bulk Assignment:**
- Multi-select interface for students
- Drag-drop or checkbox assignment
- Filter students by class, grade, unassigned status
- Automatic group balancing (distribute evenly)
- CSV import for group assignments
- Audit log of all assignment changes

### 6. Teacher Planning Interface - Study Planner

Build at `/dashboard/study/planner`:

**Features:**
- Drag-drop calendar interface (weekly/monthly view)
- Create tasks with:
  - Date picker
  - Subject selector (from existing `Lesson` model)
  - Topic selector (hierarchical tree from `Topic` model)
  - Question count input
  - Resource reference (book name, page range, test number)
  - Estimated time
- Multi-target assignment:
  - Select individual student(s)
  - Select mentoring group(s)
  - Select entire class(es)
- Template functionality:
  - Save current plan as template
  - Mark template as public (share with other schools)
  - Clone existing template and customize
- Bulk operations:
  - Copy week to next week
  - Repeat pattern (e.g., "every Monday")
  - Bulk edit tasks

**UI Components:**
- Calendar grid with task cards
- Topic tree selector with search
- Resource autocomplete (from `Resource` model)
- Assignment target selector with chips
- Save as template modal

### 7. Teacher Group Management Dashboard

Create at `/dashboard/mentoring`:

**Features:**
- **Group List View:**
  - Card grid showing all groups
  - Member count, active status
  - Quick actions (view, edit, message)
  
- **Group Creation Wizard:**
  - Step 1: Basic info (name, description, grade levels)
  - Step 2: Student selection (multi-select with filters)
  - Step 3: Settings (max students, visibility)
  
- **Group Detail View (`/dashboard/mentoring/[groupId]`):**
  - Member roster with individual progress cards
  - Quick stats (average study time, completion rate, exam averages)
  - Recent activity feed
  - Message composer (group announcements)
  - Study plan assignment interface
  
- **Group-Specific Message Composer:**
  - Uses existing [CreateMessageDto](backend/src/messages/dto/create-message.dto.ts)
  - Adds `groupId` field
  - Recipients auto-populated from `GroupMembership`
  - File attachment support
  - Announcement vs discussion toggle

**Group Statistics Dashboard:**
- Collective progress charts (study hours over time)
- Individual comparison matrix
- Top performers showcase (optional privacy toggle)
- At-risk students alerts (no activity in 7+ days)
- Goal progress indicators

### 8. School Admin - Bulk Group Assignment

Add to `/dashboard/school-settings/mentoring`:

**Features:**
- **Teacher-Group Management:**
  - List all teachers with group count
  - Create new groups for teachers
  - Set group capacity limits (default 20-25 students)
  - Alert when teacher has >100 total students
  
- **Student Assignment Interface:**
  - Split view: unassigned students | groups
  - Filters: class, grade, assigned status
  - Search by name/number
  - Drag-drop assignment
  - Bulk checkbox selection → assign to group
  
- **Automatic Balancing:**
  - "Auto-balance" button distributes students evenly
  - Respects group capacity limits
  - Considers class/grade preferences
  
- **CSV Import:**
  - Upload CSV with columns: StudentNumber, GroupName
  - Validate and preview assignments
  - Bulk import with error handling
  
- **Audit Log:**
  - Track all assignment changes
  - Show who assigned which students when
  - Revert functionality

### 9. Student Study Dashboard - Daily Guidance

Build at `/dashboard/study`:

**Layout:**
```
┌─────────────────────────────────────────────┐
│  🎯 What Should I Study Today?              │
│  ┌─────────────────────────────────────┐   │
│  │ 1. Matematik - Çarpanlara Ayırma    │   │
│  │    📊 3 denemede %40 başarı         │   │
│  │    💡 Konu tekrarı önerilir         │   │
│  │    ⏱️  45 dakika                     │   │
│  ├─────────────────────────────────────┤   │
│  │ 2. Türkçe - Sözcükte Anlam          │   │
│  │    📊 Son 7 günde çalışılmadı       │   │
│  │    💡 Düzenli pratik gerekli        │   │
│  ├─────────────────────────────────────┤   │
│  │ 3. Fizik - Hareket (Öğretmen Görevi)│   │
│  │    👨‍🏫 Öğretmen tarafından atandı    │   │
│  │    📚 Limit Fizik, Sayfa 45-55      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  📋 Bugünün Görevleri                       │
│  ┌─────────────────────────────────────┐   │
│  │ ☐ Matematik - 30 soru               │   │
│  │   📚 Paraf Matematik, S.45-55       │   │
│  │   ✔ Çalıştım | ✔ Bitirdim          │   │
│  │   Doğru: [ ] Yanlış: [ ] Boş: [ ]  │   │
│  └─────────────────────────────────────┘   │
│  Timer: ⏱️  [Start] [Pause] [Stop]         │
│  Today: 2h 15m / 4h goal (56%)              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  📊 İlerleme                                │
│  Matematik:  ████████░░ 80%                 │
│  Türkçe:     ██████░░░░ 60%                 │
│  Fizik:      ███████░░░ 70%                 │
│                                             │
│  🔥 Seri: 7 gün                             │
│  🏆 Rozetler: [5/20]                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  👥 Gruplarım                               │
│  • TYT Yıldızlar - 3 görev bekliyor         │
│  • 11-A Matematik Grubu - 1 yeni mesaj      │
└─────────────────────────────────────────────┘
```

**Features:**
- AI recommendation widget (top 3 suggestions)
- Daily task list grouped by subject
- Task completion flow:
  1. Click "✔ Çalıştım" to mark started
  2. Input question stats (correct/wrong/blank)
  3. Click "✔ Bitirdim" to complete
  4. Awaits parent verification (optional yellow badge)
- Pomodoro timer with session tracking
- Real-time progress updates
- Streak counter and achievement notifications
- Group tasks and messages preview
- Resource tracking (book/page references visible on tasks)

### 10. Student Goal Setting Interface

Create at `/dashboard/goals`:

**Goal Creation Wizard:**
- Step 1: Select goal type
  - Net hedefi (per subject)
  - Puan hedefi (TYT/AYT total)
  - Üniversite/Bölüm hedefi (dream school)
- Step 2: Set targets
  - Subject-wise net inputs
  - Target score input
  - University/department selector
- Step 3: Set deadline
  - Exam date picker
  - Milestone dates
- Step 4: Review and save

**Progress Dashboard:**
- **Current vs Target Cards:**
  - Visual comparison (speedometer-style gauge)
  - Color-coded (green=on track, yellow=behind, red=urgent)
  
- **Trend Analysis Charts:**
  - Line chart showing exam results over time
  - Target line overlay
  - Projection to deadline
  
- **Subject Breakdown:**
  - Table comparing current nets vs target nets
  - Progress percentage per subject
  - Recommendations for focus areas
  
- **Motivational Messages:**
  - Dynamic based on progress: "Harika gidiyorsun! 3 denemede 5 net arttırdın!"
  - Encouragement when behind: "Biraz daha çaba! Haftalık 2 saat ek çalışma hedefine ulaştırabilir."
  - Celebration on milestones: "🎉 Matematik hedefine ulaştın!"

**Achievement Showcase:**
- Badge display grid
- Unlock animations
- Progress bars toward next achievements
- Sharing to group feed (optional)

### 11. Group Collaboration Interface

Add at `/dashboard/groups/[groupId]`:

**Group Feed View:**
```
┌─────────────────────────────────────────────┐
│  👥 TYT Yıldızlar                           │
│  🟢 24 üye · 👨‍🏫 Ahmet Yılmaz Öğretmen      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  📢 Son Aktiviteler                         │
│  ┌─────────────────────────────────────┐   │
│  │ 📝 Öğretmen yeni çalışma planı ekledi │   │
│  │    "11. Hafta - TYT Mix"             │   │
│  │    2 saat önce                       │   │
│  ├─────────────────────────────────────┤   │
│  │ 🎯 Mehmet Ali görevi tamamladı      │   │
│  │    Matematik - 30 soru (25D 5Y)     │   │
│  │    5 saat önce                       │   │
│  ├─────────────────────────────────────┤   │
│  │ 💬 3 yeni mesaj                      │   │
│  │    "Yarın kütüphanede buluşalım"    │   │
│  │    Dün                               │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  💬 Grup Sohbeti                            │
│  [Message thread using MessageReply]        │
│  + File attachment area                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  📋 Grup Çalışma Planı                      │
│  Hafta 11: TYT Mix                          │
│  ┌─────────────────────────────────────┐   │
│  │ Pazartesi - Mat: 30s | Türk: 25s    │   │
│  │ ✔ 18/24 üye tamamladı                │   │
│  ├─────────────────────────────────────┤   │
│  │ Salı - Fizik: 20s | Kimya: 15s      │   │
│  │ ⏳ 5/24 üye tamamladı                │   │
│  └─────────────────────────────────────┘   │
│  [Kendi ilerlememizi gör]                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🎯 Grup Hedefleri                          │
│  • Haftalık tamamlanma: 85% (Hedef: 90%)   │
│  • Ortalama çalışma süresi: 3.2h/gün       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  📊 Grup Sıralaması (İsteğe Bağlı)         │
│  1. 🥇 Mehmet Ali - 42 saat                 │
│  2. 🥈 Ayşe Yılmaz - 38 saat                │
│  3. 🥉 Can Demir - 35 saat                  │
│  ... gizlilik ayarından açılabilir          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  📁 Paylaşılan Dosyalar                     │
│  • Konu özetleri.pdf (Öğretmen)            │
│  • Soru bankası.xlsx (Mehmet Ali)          │
└─────────────────────────────────────────────┘
```

**Features:**
- Activity feed showing all group events
- Group chat using existing [MessageReply](backend/prisma/schema.prisma#L340) pattern
- Shared study plan view with completion tracking
- Individual task list filtered for group assignments
- Group goal progress displays
- Optional leaderboard (privacy toggle in settings)
- File sharing area (uses [MessageAttachment](backend/prisma/schema.prisma#L354))
- Member list with status indicators (online/offline, last active)

**Group Message Integration:**
- Teacher can post announcements (pinned messages)
- Members can reply and discuss
- File attachments supported
- Notification for new group messages

### 12. Parent Verification & Progress Monitoring

Extend parent dashboard at `/dashboard/parent`:

**Weekly Summary View:**
```
┌─────────────────────────────────────────────┐
│  📊 Bu Hafta - Mehmet Ali                   │
│  ┌─────────────────────────────────────┐   │
│  │ ⏱️  Toplam Çalışma: 18 saat 30 dk    │   │
│  │ ✅ Tamamlanan Görev: 28/32 (%88)     │   │
│  │ 🎯 Hedef İlerlemesi: +3 net (Mat)    │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ✅ Doğrulanmayı Bekleyen (3)               │
│  ┌─────────────────────────────────────┐   │
│  │ Matematik - 30 soru                  │   │
│  │ 25 doğru, 5 yanlış, 0 boş            │   │
│  │ Süre: 45 dakika                      │   │
│  │ [✔ Onayla]  [❌ Reddet]              │   │
│  ├─────────────────────────────────────┤   │
│  │ Türkçe - 25 soru                     │   │
│  │ ...                                  │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  👥 Grup Aktivitesi                         │
│  • TYT Yıldızlar: 28/32 görev tamamlandı   │
│  • Grup ortalaması: 3.2 saat/gün           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  📈 Son Deneme Performansı                  │
│  TYT Deneme #12: 105 net (+5)               │
│  Matematik: 25 net (Hedef: 28 net)          │
│  Türkçe: 32 net ✅ (Hedef: 30 net)          │
└─────────────────────────────────────────────┘
```

**Features:**
- **Verification Queue:**
  - List of completed tasks pending approval
  - Simple ✔ confirm or ❌ reject buttons
  - Optional comment field
  - Batch approve option
  
- **Weekly Summary Cards:**
  - Total study hours
  - Task completion percentage
  - Goal progress highlights
  - Not overwhelming with detail
  
- **Group Visibility:**
  - Show child's groups
  - Collective progress (not individual comparison)
  - Encourages collaborative learning
  
- **Email Digest:**
  - Weekly summary email via [EmailService](backend/src/email/email.service.ts)
  - Highlights: hours studied, tasks completed, goals progress
  - Link to pending verifications
  - Sent every Sunday evening

**Verification Workflow:**
1. Student marks task "Bitirdim"
2. Status becomes "Pending Parent Verification" (yellow badge)
3. Parent sees in queue
4. Parent approves → status becomes "Verified" (green checkmark)
5. Parent rejects → status returns to "Pending" with note
6. After 48 hours without parent action, auto-approve (configurable)

### 13. AI Recommendation Engine - Smart Analysis

Build `StudyRecommendationService` with analysis logic:

**Data Sources:**
- `ExamLessonResult`: Last 10 attempts per student for weak area detection
- `StudySession`: Last 30 days to detect study gaps
- `StudyTask`: Completion rates and difficulty patterns
- `Exam`: Upcoming exams for tempo adjustment
- `StudyPlan`: Teacher-assigned tasks for prioritization

**Recommendation Algorithm:**

```typescript
async generateRecommendations(studentId: string): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  
  // 1. Teacher-assigned tasks (HIGHEST PRIORITY)
  const pendingTeacherTasks = await this.getPendingTeacherTasks(studentId);
  for (const task of pendingTeacherTasks.slice(0, 2)) {
    recommendations.push({
      type: 'TEACHER_ASSIGNMENT',
      priority: 1,
      subject: task.subject,
      topic: task.topic,
      reasoning: `👨‍🏫 Öğretmen tarafından atandı`,
      resource: task.resourceReference,
      estimatedTime: task.estimatedTime,
    });
  }
  
  // 2. Weak areas from exam results
  const weakAreas = await this.analyzeWeakAreas(studentId);
  for (const weak of weakAreas.slice(0, 2)) {
    if (weak.correctnessRatio < 0.5) {
      recommendations.push({
        type: 'WEAK_AREA',
        priority: 2,
        subject: weak.subject,
        topic: weak.topic,
        reasoning: `📊 ${weak.attemptCount} denemede %${Math.round(weak.correctnessRatio * 100)} başarı, konu tekrarı önerilir`,
        estimatedTime: 45,
      });
    }
  }
  
  // 3. Study gaps (not studied in 7+ days)
  const studyGaps = await this.detectStudyGaps(studentId, 7);
  for (const gap of studyGaps.slice(0, 1)) {
    recommendations.push({
      type: 'STUDY_GAP',
      priority: 3,
      subject: gap.subject,
      reasoning: `📅 Son ${gap.daysSinceLastStudy} günde çalışılmadı, düzenli pratik gerekli`,
      estimatedTime: 30,
    });
  }
  
  // 4. Exam proximity adjustment
  const upcomingExam = await this.getNextExam(studentId);
  if (upcomingExam && upcomingExam.daysUntilExam < 30) {
    recommendations.push({
      type: 'EXAM_PREP',
      priority: 2,
      reasoning: `⚠️ ${upcomingExam.daysUntilExam} gün sonra deneme, tempo artırılmalı`,
      suggestion: 'Günlük çalışma süresini 30 dakika artır',
    });
  }
  
  // 5. Difficulty balancing
  const recentDifficulties = await this.getRecentTaskDifficulties(studentId, 3);
  if (recentDifficulties.every(d => d === 'HARD')) {
    // Suggest easier topic for confidence boost
    const easyTopic = await this.suggestEasierTopic(studentId);
    recommendations.push({
      type: 'DIFFICULTY_BALANCE',
      priority: 4,
      subject: easyTopic.subject,
      topic: easyTopic.topic,
      reasoning: `🎯 Üst üste zor konular çalışıldı, motivasyon için orta zorlukta konu önerilir`,
      estimatedTime: 30,
    });
  }
  
  // Sort by priority and return top 5
  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5);
}
```

**Weak Area Analysis:**
```typescript
async analyzeWeakAreas(studentId: string) {
  const lessonResults = await prisma.examLessonResult.findMany({
    where: { attempt: { studentId } },
    orderBy: { createdAt: 'desc' },
    take: 50, // Last 50 lesson results
    include: { lesson: { include: { topics: true } } },
  });
  
  // Group by topic, calculate correctness ratio
  const topicStats = {};
  for (const result of lessonResults) {
    for (const topic of result.lesson.topics) {
      if (!topicStats[topic.id]) {
        topicStats[topic.id] = { correct: 0, total: 0, topic };
      }
      topicStats[topic.id].correct += result.correctCount;
      topicStats[topic.id].total += result.correctCount + result.wrongCount;
    }
  }
  
  // Return topics with low correctness ratio
  return Object.values(topicStats)
    .map(stat => ({
      topic: stat.topic,
      subject: stat.topic.subject,
      correctnessRatio: stat.correct / stat.total,
      attemptCount: Math.floor(stat.total / 10), // Approximate attempt count
    }))
    .filter(stat => stat.correctnessRatio < 0.6)
    .sort((a, b) => a.correctnessRatio - b.correctnessRatio);
}
```

**Study Gap Detection:**
```typescript
async detectStudyGaps(studentId: string, daysThreshold: number) {
  const subjects = await prisma.lesson.findMany({ where: { /* school's subjects */ } });
  const gaps = [];
  
  for (const subject of subjects) {
    const lastSession = await prisma.studySession.findFirst({
      where: { studentId, subjectId: subject.id },
      orderBy: { startTime: 'desc' },
    });
    
    const daysSinceLastStudy = lastSession
      ? Math.floor((Date.now() - lastSession.startTime.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysSinceLastStudy >= daysThreshold) {
      gaps.push({ subject, daysSinceLastStudy });
    }
  }
  
  return gaps.sort((a, b) => b.daysSinceLastStudy - a.daysSinceLastStudy);
}
```

**Integration with Frontend:**
- API endpoint returns recommendations JSON
- Frontend displays in "What Should I Study Today?" widget
- Each recommendation shows: icon, subject/topic, reasoning, estimated time
- Click to create task or start session immediately

### 14. Template Marketplace - Plan Sharing

Create at `/dashboard/templates`:

**Template Library View:**
```
┌─────────────────────────────────────────────┐
│  🔍 Çalışma Planı Şablonları               │
│  Filtreler: [TYT] [AYT] [LGS] [Haftalık]   │
│                                             │
│  📚 Önceden Hazır Şablonlar                │
│  ┌─────────────────────────────────────┐   │
│  │ TYT 12 Haftalık Plan - Sayısal      │   │
│  │ ⭐ 4.8 | 156 kullanım               │   │
│  │ [Önizle] [Kullan]                   │   │
│  ├─────────────────────────────────────┤   │
│  │ LGS Son 8 Hafta Sprint              │   │
│  │ ⭐ 4.9 | 243 kullanım               │   │
│  │ [Önizle] [Kullan]                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  👥 Diğer Okulların Paylaştığı             │
│  ┌─────────────────────────────────────┐   │
│  │ AYT Matematik Derinlemesine          │   │
│  │ 📍 Ankara Fen Lisesi                │   │
│  │ ⭐ 4.7 | 89 kullanım                │   │
│  │ [Önizle] [Kullan]                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ➕ [Yeni Şablon Oluştur]                  │
└─────────────────────────────────────────────┘
```

**Features:**

**1. Pre-built Templates (Seeded in Database):**
- LGS Plans:
  - "LGS 32 Haftalık Tam Plan" (8th grade full year)
  - "LGS Son 12 Hafta Sprint"
  - "LGS Konu Tekrar Planı"
  
- TYT Plans:
  - "TYT 12 Haftalık Plan - Sayısal" (Math/Science focused)
  - "TYT 12 Haftalık Plan - Eşit Ağırlık" (Balanced)
  - "TYT 12 Haftalık Plan - Sözel" (Verbal focused)
  
- AYT Plans:
  - "AYT-SAY 10 Haftalık Derinlemesine"
  - "AYT-EA Tarih & Coğrafya Yoğun"
  - "AYT-SÖZ Edebiyat & Tarih"

**2. Template Publishing:**
- Teacher creates study plan
- "Save as Template" button in planner
- Fill template metadata:
  - Name & description
  - Tags (exam type, subjects, duration)
  - Visibility: Private / School-only / Public
- Public templates go to marketplace

**3. Browse & Search:**
- Filter by exam type, grade, duration, subject
- Sort by rating, usage count, date
- Search by keywords
- Preview without applying

**4. Import/Clone:**
- "Use Template" button clones plan
- Customize wizard:
  - Adjust dates (shift all tasks)
  - Modify question counts
  - Add/remove subjects
  - Assign to students/groups/classes
  
**5. Rating & Feedback:**
- After using template, teachers can rate (1-5 stars)
- Optional comment
- Usage count displayed

**6. Export Options:**
- Export as Excel spreadsheet
- Export as PDF (printable calendar)
- Export as JSON (backup/sharing)
- Import from Excel/JSON

**Database Schema:**
```prisma
model StudyPlanTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  authorId    String   // Teacher who created
  schoolId    String
  examType    ExamType // TYT/AYT/LGS
  gradeId     String
  durationWeeks Int
  isPublic    Boolean  @default(false)
  isOfficial  Boolean  @default(false) // System-provided templates
  tags        Json     // ["matematik", "yoğun", "12-hafta"]
  planData    Json     // Serialized StudyPlan structure
  usageCount  Int      @default(0)
  averageRating Float  @default(0)
  
  ratings     TemplateRating[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TemplateRating {
  id         String @id @default(cuid())
  templateId String
  template   StudyPlanTemplate @relation(fields: [templateId], references: [id])
  userId     String
  rating     Int    // 1-5
  comment    String? @db.Text
  createdAt  DateTime @default(now())
  
  @@unique([templateId, userId])
}
```

### 15. Gamification & Achievement System

Implement achievement unlock logic:

**Achievement Definitions (Seeded):**

**Streak Achievements:**
- `STREAK_7`: "7 Günlük Ateş" - Study 7 consecutive days
- `STREAK_30`: "Aylık Kararlılık" - Study 30 consecutive days
- `STREAK_100`: "100 Gün Maratonu" - Study 100 consecutive days

**Milestone Achievements:**
- `QUESTIONS_100`: "İlk 100" - Solve 100 questions
- `QUESTIONS_500`: "Beş Yüzlük" - Solve 500 questions
- `QUESTIONS_1000`: "Binlik" - Solve 1000 questions
- `QUESTIONS_5000`: "5000 Soru Savaşçısı" - Solve 5000 questions

**Improvement Achievements:**
- `WEAK_TURNAROUND`: "Zayıf Noktayı Yendim" - Improve weak subject by 20%+
- `NET_BOOST`: "Net Canavarı" - Increase total net by 15+ in one exam
- `PERFECT_SUBJECT`: "Mükemmellik" - Score 100% in a subject

**Consistency Achievements:**
- `WEEKLY_WARRIOR`: "Haftalık Savaşçı" - Study 5+ days/week for 4 weeks
- `MORNING_PERSON`: "Sabah Kuşu" - Study before 8am for 10 days
- `NIGHT_OWL`: "Gece Baykuşu" - Study after 10pm for 10 days

**Group Achievements:**
- `GROUP_UNITY`: "Birlik Beraberlik" - All group members complete weekly plan
- `GROUP_MILESTONE`: "Takım Başarısı" - Group collectively solves 10,000 questions

**Achievement Check Service:**
```typescript
@Injectable()
export class AchievementService {
  async checkAndUnlockAchievements(studentId: string) {
    const achievements = await this.prisma.achievement.findMany();
    const unlocked = [];
    
    for (const achievement of achievements) {
      const alreadyUnlocked = await this.prisma.studentAchievement.findUnique({
        where: { studentId_achievementId: { studentId, achievementId: achievement.id } },
      });
      
      if (!alreadyUnlocked && await this.checkCriteria(studentId, achievement)) {
        const unlocked = await this.prisma.studentAchievement.create({
          data: { studentId, achievementId: achievement.id },
        });
        
        // Send notification
        await this.notifyAchievementUnlock(studentId, achievement);
        unlocked.push(achievement);
      }
    }
    
    return unlocked;
  }
  
  private async checkCriteria(studentId: string, achievement: Achievement): Promise<boolean> {
    const criteria = achievement.criteria as any;
    
    switch (achievement.code) {
      case 'STREAK_7':
      case 'STREAK_30':
      case 'STREAK_100':
        return await this.checkStreak(studentId, criteria.days);
      
      case 'QUESTIONS_100':
      case 'QUESTIONS_500':
      case 'QUESTIONS_1000':
      case 'QUESTIONS_5000':
        return await this.checkTotalQuestions(studentId, criteria.count);
      
      case 'WEAK_TURNAROUND':
        return await this.checkWeakImprovement(studentId, criteria.improvementPercent);
      
      case 'WEEKLY_WARRIOR':
        return await this.checkWeeklyConsistency(studentId, criteria.daysPerWeek, criteria.weeks);
      
      case 'GROUP_UNITY':
        return await this.checkGroupCompletion(studentId);
      
      default:
        return false;
    }
  }
  
  private async checkStreak(studentId: string, requiredDays: number): Promise<boolean> {
    const sessions = await this.prisma.studySession.findMany({
      where: { studentId },
      orderBy: { startTime: 'desc' },
      take: requiredDays * 2, // Buffer for gaps
    });
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < requiredDays; i++) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasSession = sessions.some(s =>
        s.startTime >= dayStart && s.startTime <= dayEnd
      );
      
      if (hasSession) {
        streak++;
      } else {
        break; // Streak broken
      }
      
      currentDate.setDate(currentDate.getDate() - 1); // Go back one day
    }
    
    return streak >= requiredDays;
  }
  
  private async checkTotalQuestions(studentId: string, requiredCount: number): Promise<boolean> {
    const result = await this.prisma.studyTask.aggregate({
      where: { studentId, status: 'COMPLETED' },
      _sum: { completedQuestions: true },
    });
    
    return (result._sum.completedQuestions || 0) >= requiredCount;
  }
  
  private async checkWeakImprovement(studentId: string, improvementPercent: number): Promise<boolean> {
    const lessonResults = await this.prisma.examLessonResult.findMany({
      where: { attempt: { studentId } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { lesson: true },
    });
    
    // Group by subject, compare first 5 vs last 5 attempts
    const subjectGroups = {};
    lessonResults.forEach(result => {
      if (!subjectGroups[result.lesson.name]) {
        subjectGroups[result.lesson.name] = [];
      }
      subjectGroups[result.lesson.name].push(result.correctCount);
    });
    
    for (const [subject, results] of Object.entries(subjectGroups) as any) {
      if (results.length >= 10) {
        const recentAvg = results.slice(0, 5).reduce((a: number, b: number) => a + b) / 5;
        const oldAvg = results.slice(-5).reduce((a: number, b: number) => a + b) / 5;
        const improvement = ((recentAvg - oldAvg) / oldAvg) * 100;
        
        if (improvement >= improvementPercent) {
          return true;
        }
      }
    }
    
    return false;
  }
}
```

**Frontend Display:**
- Achievement showcase on profile page
- Badge icons with unlock animations
- Progress bars toward next achievements
- Notification toast on unlock
- Share to group feed option

**Notification Integration:**
```typescript
// When achievement unlocked
await this.messagesQueue.add('send-achievement-notification', {
  studentId,
  achievementName: achievement.name,
  achievementIcon: achievement.iconUrl,
});
```

### 16. Reporting & Analytics Extensions

Extend [reports/](backend/src/reports) module:

**New Report Types:**

**1. Weekly Student Study Report:**
```typescript
GET /api/reports/study/weekly?studentId=...&startDate=...

Response:
{
  "studentId": "...",
  "weekStart": "2026-02-03",
  "weekEnd": "2026-02-09",
  "totalStudyHours": 18.5,
  "totalQuestionsSolved": 456,
  "taskCompletionRate": 0.88,
  "goalProgress": {
    "matematik": { target: 30, current: 28, progress: 0.93 },
    "türkçe": { target: 35, current: 37, progress: 1.06 }
  },
  "recommendations": [
    { subject: "Fizik", reasoning: "Son 7 günde çalışılmadı" }
  ],
  "subjectBreakdown": [
    { subject: "Matematik", hours: 6.5, questions: 180 },
    { subject: "Türkçe", hours: 5.0, questions: 150 }
  ]
}
```

**2. Teacher Review Dashboard:**
```typescript
GET /api/reports/study/teacher-review?teacherId=...&classId=...

Response:
{
  "studentsProgressMatrix": [
    {
      "studentId": "...",
      "studentName": "Mehmet Ali",
      "weeklyHours": 18.5,
      "completionRate": 0.88,
      "lastActivity": "2 saat önce",
      "atRisk": false
    }
  ],
  "groupComparisons": [
    {
      "groupName": "TYT Yıldızlar",
      "avgHours": 16.2,
      "avgCompletionRate": 0.85
    }
  ],
  "atRiskStudents": [
    {
      "studentId": "...",
      "reason": "7 günde aktivite yok",
      "lastSeen": "2026-02-01"
    }
  ]
}
```

**3. Parent Monthly Summary (PDF):**
- Generated monthly via cron job
- Emailed via [EmailService](backend/src/email/email.service.ts)
- Contains:
  - Total study hours chart
  - Task completion trend
  - Exam performance comparison
  - Goal progress summary
  - Highlights and achievements

**4. Study Time vs Exam Performance Correlation:**
```typescript
GET /api/reports/study/correlation?studentId=...

Response:
{
  "correlationCoefficient": 0.78,
  "dataPoints": [
    { weeklyHours: 15, examNet: 95 },
    { weeklyHours: 18, examNet: 102 },
    { weeklyHours: 20, examNet: 108 }
  ],
  "insight": "Her hafta 1 saat ek çalışma, ortalama 3 net artışı sağlıyor"
}
```

**5. Group Performance Report:**
```typescript
GET /api/reports/study/group?groupId=...

Response:
{
  "groupName": "TYT Yıldızlar",
  "memberCount": 24,
  "collectiveStats": {
    "totalHours": 432,
    "totalQuestions": 10824,
    "avgCompletionRate": 0.85
  },
  "topPerformers": [
    { studentName: "Mehmet Ali", hours: 22 },
    { studentName: "Ayşe Yılmaz", hours: 20 }
  ],
  "individualContributions": [
    { studentName: "...", hours: 18, completionRate: 0.88 }
  ]
}
```

**PDF Export:**
- Use existing PDF generation patterns from [reports/](backend/src/reports)
- Add study-specific templates
- Include charts and tables
- Branded with school logo

### 17. Time Tracking & Pomodoro Implementation

Build frontend timer component:

**Timer Component (`components/study/study-timer.tsx`):**
```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export function StudyTimer() {
  const [mode, setMode] = useState<'normal' | 'pomodoro'>('normal');
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const intervalRef = useRef<NodeJS.Timeout>();

  const startTimer = () => {
    if (!selectedSubject) {
      toast.error('Lütfen ders seçin');
      return;
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = async () => {
    setIsRunning(false);
    
    // Save session to database
    await fetch('/api/study/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: selectedSubject,
        topicId: selectedTopic,
        duration: seconds,
        isPomodoroMode: mode === 'pomodoro',
      }),
    });
    
    toast.success(`${formatTime(seconds)} çalışma kaydedildi!`);
    setSeconds(0);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          const newSeconds = s + 1;
          
          // Pomodoro mode checks
          if (mode === 'pomodoro') {
            if (pomodoroPhase === 'work' && newSeconds >= 25 * 60) {
              // Work phase done, start break
              setPomodoroPhase('break');
              toast.info('Mola zamanı! 5 dakika dinlen.');
              return 0;
            } else if (pomodoroPhase === 'break' && newSeconds >= 5 * 60) {
              // Break done, start work
              setPomodoroPhase('work');
              toast.info('Mola bitti! Tekrar başla.');
              return 0;
            }
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, pomodoroPhase]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 bg-card rounded-lg">
      <div className="flex items-center gap-4 mb-4">
        <Select value={mode} onValueChange={setMode}>
          <option value="normal">Normal</option>
          <option value="pomodoro">Pomodoro (25/5)</option>
        </Select>
        
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <option value="">Ders Seç</option>
          {/* Subject options */}
        </Select>
        
        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
          <option value="">Konu Seç (İsteğe Bağlı)</option>
          {/* Topic options */}
        </Select>
      </div>
      
      <div className="text-6xl font-bold text-center my-8">
        {formatTime(seconds)}
      </div>
      
      {mode === 'pomodoro' && (
        <div className="text-center text-muted-foreground mb-4">
          {pomodoroPhase === 'work' ? '🔥 Çalışma Zamanı' : '☕ Mola Zamanı'}
        </div>
      )}
      
      <div className="flex gap-2 justify-center">
        {!isRunning ? (
          <Button onClick={startTimer} size="lg">Başla</Button>
        ) : (
          <>
            <Button onClick={pauseTimer} variant="outline" size="lg">Duraklat</Button>
            <Button onClick={stopTimer} variant="destructive" size="lg">Bitir ve Kaydet</Button>
          </>
        )}
      </div>
    </div>
  );
}
```

**Daily/Weekly Time Display:**
```typescript
// components/study/time-statistics.tsx
export function TimeStatistics({ studentId }) {
  const { data: todayStats } = useSWR(`/api/study/statistics/today?studentId=${studentId}`);
  const { data: weekStats } = useSWR(`/api/study/statistics/week?studentId=${studentId}`);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Bugün</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatHours(todayStats?.totalSeconds)}</div>
          <Progress value={(todayStats?.totalSeconds / (4 * 3600)) * 100} />
          <p className="text-muted-foreground text-sm">
            Hedefin {Math.round((todayStats?.totalSeconds / (4 * 3600)) * 100)}%'si
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Bu Hafta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatHours(weekStats?.totalSeconds)}</div>
          <div className="mt-2">
            {weekStats?.subjectBreakdown.map(s => (
              <div key={s.subject} className="flex justify-between text-sm">
                <span>{s.subject}</span>
                <span>{formatHours(s.seconds)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Backend API:**
```typescript
// src/study/study.controller.ts
@Post('sessions')
async logSession(@Body() dto: LogSessionDto, @CurrentUser() user) {
  return this.studyService.logSession({
    studentId: user.student.id,
    subjectId: dto.subjectId,
    topicId: dto.topicId,
    startTime: new Date(Date.now() - dto.duration * 1000),
    endTime: new Date(),
    duration: dto.duration,
    isPomodoroMode: dto.isPomodoroMode,
  });
}

@Get('statistics/today')
async getTodayStatistics(@Query('studentId') studentId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sessions = await this.prisma.studySession.findMany({
    where: {
      studentId,
      startTime: { gte: today },
    },
  });
  
  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
  
  return { totalSeconds, sessionCount: sessions.length };
}

@Get('statistics/week')
async getWeekStatistics(@Query('studentId') studentId: string) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  
  const sessions = await this.prisma.studySession.findMany({
    where: {
      studentId,
      startTime: { gte: weekStart },
    },
    include: { subject: true },
  });
  
  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
  
  const subjectBreakdown = {};
  sessions.forEach(s => {
    if (!subjectBreakdown[s.subject.name]) {
      subjectBreakdown[s.subject.name] = 0;
    }
    subjectBreakdown[s.subject.name] += s.duration;
  });
  
  return {
    totalSeconds,
    subjectBreakdown: Object.entries(subjectBreakdown).map(([subject, seconds]) => ({
      subject,
      seconds,
    })),
  };
}
```

### 18. Group Messaging Integration

Extend [MessagesService](backend/src/messages/messages.service.ts):

**Add Group Message Support:**
```typescript
// src/messages/messages.service.ts

async sendGroupMessage(
  groupId: string,
  createMessageDto: CreateMessageDto,
  userId: string,
  schoolId: string
) {
  // Validate user is group member or teacher
  const group = await this.prisma.mentorGroup.findUnique({
    where: { id: groupId },
    include: {
      teacher: true,
      memberships: { include: { student: { include: { user: true } } } },
    },
  });
  
  if (!group) {
    throw new NotFoundException('Group not found');
  }
  
  const isTeacher = group.teacherId === userId;
  const isMember = group.memberships.some(m => m.student.userId === userId);
  
  if (!isTeacher && !isMember) {
    throw new ForbiddenException('You are not a member of this group');
  }
  
  // Create message with groupId
  const message = await this.prisma.message.create({
    data: {
      senderId: userId,
      subject: createMessageDto.subject,
      body: createMessageDto.body,
      type: MessageType.DIRECT, // Group messages are technically direct
      category: MessageCategory.GROUP,
      status: MessageStatus.SENT,
      schoolId,
      groupId, // Add groupId field to Message model
      sentAt: new Date(),
    },
  });
  
  // Create recipients for all group members + teacher
  const recipientIds = [
    group.teacherId,
    ...group.memberships.map(m => m.student.userId),
  ].filter(id => id !== userId); // Exclude sender
  
  await this.prisma.messageRecipient.createMany({
    data: recipientIds.map(recipientId => ({
      messageId: message.id,
      recipientId,
    })),
  });
  
  // Send notifications
  for (const recipientId of recipientIds) {
    await this.messagesQueue.add('send-message-notification', {
      messageId: message.id,
      recipientId,
    });
  }
  
  return message;
}

async getGroupMessages(groupId: string, userId: string) {
  // Validate user is group member
  const group = await this.prisma.mentorGroup.findUnique({
    where: { id: groupId },
    include: {
      memberships: { include: { student: true } },
    },
  });
  
  if (!group) {
    throw new NotFoundException('Group not found');
  }
  
  const isTeacher = group.teacherId === userId;
  const isMember = group.memberships.some(m => m.student.userId === userId);
  
  if (!isTeacher && !isMember) {
    throw new ForbiddenException('You are not a member of this group');
  }
  
  // Get all group messages
  const messages = await this.prisma.message.findMany({
    where: {
      groupId,
      deletedAt: null,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarSeed: true } },
      replies: {
        where: { deletedAt: null },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatarSeed: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      attachments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return messages;
}
```

**Update Message Model:**
```prisma
model Message {
  // ... existing fields
  
  groupId     String?
  group       MentorGroup? @relation(fields: [groupId], references: [id])
  
  // ... rest of model
}
```

**Group Message Controller:**
```typescript
// src/mentoring/mentoring.controller.ts

@Post('groups/:id/messages')
@UseGuards(JwtAuthGuard)
async sendGroupMessage(
  @Param('id') groupId: string,
  @Body() createMessageDto: CreateMessageDto,
  @CurrentUser() user,
) {
  return this.messagesService.sendGroupMessage(
    groupId,
    createMessageDto,
    user.id,
    user.schoolId,
  );
}

@Get('groups/:id/messages')
@UseGuards(JwtAuthGuard)
async getGroupMessages(
  @Param('id') groupId: string,
  @CurrentUser() user,
) {
  return this.messagesService.getGroupMessages(groupId, user.id);
}
```

**Frontend Group Chat Component:**
```typescript
// components/mentoring/group-chat.tsx
export function GroupChat({ groupId }) {
  const { data: messages, mutate } = useSWR(`/api/mentoring/groups/${groupId}/messages`);
  const [newMessage, setNewMessage] = useState('');
  
  const sendMessage = async () => {
    await fetch(`/api/mentoring/groups/${groupId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Grup Mesajı',
        body: newMessage,
      }),
    });
    
    setNewMessage('');
    mutate(); // Refresh messages
  };
  
  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map(msg => (
          <div key={msg.id} className="flex gap-3">
            <Avatar>
              <AvatarImage src={`/avatars/${msg.sender.avatarSeed}.png`} />
            </Avatar>
            <div>
              <div className="font-semibold">
                {msg.sender.firstName} {msg.sender.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(msg.createdAt))} önce
              </div>
              <div className="mt-1">{msg.body}</div>
              
              {/* Replies */}
              {msg.replies.map(reply => (
                <div key={reply.id} className="ml-4 mt-2 p-2 bg-muted rounded">
                  <div className="text-sm font-semibold">
                    {reply.sender.firstName}
                  </div>
                  <div className="text-sm">{reply.body}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t flex gap-2">
        <Input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Mesajınızı yazın..."
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage}>Gönder</Button>
      </div>
    </div>
  );
}
```

## Further Considerations

### 1. AI Provider Strategy
**Question:** Start with rule-based recommendations or integrate LLM from day one? Not necessary to implement now, but plan ahead.

**Options:**
- **Rule-Based Only:** Free, fast, deterministic. Analyze `ExamLessonResult` patterns with SQL queries. Generate recommendations with templates. Limited to predefined patterns.
- **Hybrid Approach (Recommended):** Use rules for analysis (weak areas, gaps, tempo), then LLM for natural language explanations. Example: "Matematik - Çarpanlara Ayırma konusunda 3 denemede %40 başarı var. Bu konuyu tekrar etmen önerilir çünkü temel çarpan kavramlarında eksiklik görülüyor."
- **LLM Only:** Rich, contextual, personalized. But costs ~$0.002 per recommendation, needs rate limiting, slower response.

**Recommendation:** Start hybrid. Rules handle heavy lifting, LLM adds personality. Switch to OpenAI API or Anthropic Claude for reasoning text.

### 2. Topic Taxonomy Depth
**Question:** How deep should topic hierarchy go?

**Proposed Structure:**
```
TYT
├── Matematik (Subject)
│   ├── Temel Kavramlar (Chapter)
│   │   ├── Çarpanlara Ayırma (Topic)
│   │   ├── Üslü Sayılar (Topic)
│   │   └── Köklü Sayılar (Topic)
│   ├── Denklemler (Chapter)
│   │   ├── Birinci Derece Denklem (Topic)
│   │   └── İkinci Derece Denklem (Topic)
```

**Depth:** 3 levels (Subject → Chapter → Topic) enough for granularity without complexity.
**Count:** 50-100 leaf topics per exam type
**Extensibility:** Allow teachers to add custom topics (school-specific) Yes, but keep core taxonomy standardized.
A panel for managing taxonomy in admin dashboard. I can set all Chapters and Topics first time. 
### 3. Mentoring Group Limits
**Question:** How many students per group? How many groups per teacher? Setting page limits.

**Recommendations:**
- Max students per group: **20-25** (effective mentoring size)
- Max groups per teacher: **5 groups** (manageable workload)
- Max total students per teacher: **100** (alert at this threshold)
- School admin can override limits for special cases
- Automatic balancing suggests even distribution
Ok.
### 4. Template Marketplace Moderation
**Question:** How to ensure quality of public templates?

**Options:**
- **Admin Approval:** All public templates require admin review before visible. Labor-intensive.
- **Community Moderation:** Allow reporting + rating system. Self-regulating.
- **Hybrid (Recommended):** First-time publishers need approval. After 3 approved templates, auto-publish with monitoring. Flagged templates reviewed.
Hybrid ok.
**Features:**
- Rating system (1-5 stars)
- Usage count (social proof)
- Report inappropriate content button
- Admin dashboard for moderation queue

### 5. Parent Verification Enforcement
**Question:** Should parent verification be mandatory for study credit?
No.
**Recommendation:** **Optional but highlighted**
- Without verification: Yellow badge "⏳ Veli Onayı Bekleniyor"
- With verification: Green checkmark "✅ Veli Onayladı"
- Auto-approve after 48 hours if parent inactive (configurable)
- High-value achievements (streaks, milestones) require verification
- Teacher can see verification status when reviewing

**Rationale:** Mandatory creates friction. Optional maintains accountability without blocking students with unavailable parents.
A lot of parents may not respond timely. Many parents will not approve. its better to keep it optional.
### 6. Group Privacy Settings
**Question:** Should groups be public within school or private?

**Recommendations:**
- **Default:** Private to members only
- **Teacher Toggle:** "Allow school-wide visibility" (opt-in)
- **Leaderboard:** Optional within group, requires member consent
- **Student Toggle:** "Hide my stats from group leaderboard" (privacy)

**Visibility Levels:**
- Private: Only members see group
- School: All school users see group name/description, not content
- Public: Other schools see in template marketplace (for shared plans)
all setup on admin panel settings page for this module.
### 7. Offline Study Logging
**Question:** Support offline mode with PWA?

**Options:**
- **Online Only (Phase 1):** Simpler to implement, requires internet
- **PWA with Offline (Phase 2):** Service worker caches, IndexedDB for offline sessions, sync when online

**Phase 1 Workaround:**
- "Add Past Session" button for manual entry
- Student inputs: date, subject, topic, duration, questions solved
- Less accurate but functional

**Phase 2 (Future):**
- Full PWA with offline timer
- Automatic sync when reconnected
- Background sync API for reliability

### 8. Study Plan Flexibility
**Question:** What happens when student misses daily task?

**Options:**
- **Rollover:** Auto-reschedule to next day (could accumulate backlog)
- **Grace Period:** Mark "⚠️ Late" for 2 days, then "❌ Missed"
- **Teacher Notification:** Alert teacher after 3 missed tasks
- **No Penalty:** Simply mark incomplete, doesn't affect streak

**Recommendation:** **Grace Period + Notification**
- Day 0: Task due
- Day 1: "⏰ Due today" reminder
- Day 2: "⚠️ Late" badge
- Day 3: "❌ Missed", teacher notified
- Doesn't break study streak (separate from session tracking)
Eklenmeli:

“Bugün izin al” butonu

Hedefi geçici askıya alma

Motivasyon mesajlarını kapatma

Grup leaderboard opt-out 
### 9. Resource Database
**Question:** Pre-populate book names or free-form input?

**Recommendation:** **Hybrid - Autocomplete + Free-form**
- Pre-populated common resources:
  - Paraf (Matematik, Türkçe, Fen, etc.)
  - Limit (Matematik, Fizik, Kimya)
  - Bilfen (Full range)
  - Endemik (AYT)
  - Hız ve Renk (LGS)
- Autocomplete with search
- "Add New Resource" button for custom entries
- Community contributions (teacher adds → available to all)
Hybrid is good.
**Benefits:**
- Structured data enables analytics ("Paraf Matematik users average 5 net higher")
- Flexibility for custom materials
- Over time, database grows organically

### 10. Group Study Plan Conflicts
**Question:** Student in 3 groups, all assign different tasks same day?

**Detection Logic:**
```typescript
async detectConflicts(studentId: string, date: Date) {
  const tasks = await prisma.studyTask.findMany({
    where: {
      studentId,
      date,
      status: 'PENDING',
    },
    include: {
      plan: { include: { group: true } },
    },
  });
  
  if (tasks.length > 5) { // Threshold: 5 tasks = conflict
    return {
      conflict: true,
      tasks,
      totalQuestions: tasks.reduce((sum, t) => sum + t.questionCount, 0),
      estimatedHours: tasks.reduce((sum, t) => sum + (t.estimatedTime / 60), 0),
    };
  }
  
  return { conflict: false };
}
```

**Teacher Warning:**
- When assigning group plan: "⚠️ 8 öğrenci zaten başka gruplardan görev almış, çakışma olabilir"
- Suggest alternative dates

**Student View:**
- Show all tasks grouped by source: "Öğretmen Ahmet", "TYT Yıldızlar Grubu", "11-A Sınıfı"
- Total estimated time visible
- Can request extension or skip (teacher approval)

**Merge Option:**
- If 2 groups assign same topic: Merge into single task
- Task shows multiple "Assigned by" tags
- Completion counts for both groups

---

## Implementation Priority (Recommended Order)

### Phase 1 - Foundation (Month 1)
1. Database schema extension (all models)
2. Study management backend API
3. Topic seed data (TYT/AYT/LGS)
4. Basic teacher planner interface
5. Basic student dashboard with task list

### Phase 2 - Core Features (Month 2)
6. Time tracking & Pomodoro
7. AI recommendation engine (rule-based)
8. Parent verification interface
9. Basic reports (weekly study report)
10. Achievement system implementation

### Phase 3 - Social & Collaboration (Month 3)
11. Mentoring groups infrastructure
12. Group messaging integration
13. Group collaboration interface
14. School admin bulk assignment
15. Group statistics dashboard

### Phase 4 - Polish & Marketplace (Month 4)
16. Template marketplace
17. Goal setting & progress tracking
18. Gamification display & notifications
19. Advanced reports & analytics
20. LLM integration for rich recommendations

---

## Success Metrics

**Student Engagement:**
- Daily active users (DAU)
- Average study hours per student
- Task completion rate (>80% target)
- Streak retention (% maintaining 7+ day streaks)

**Learning Outcomes:**
- Correlation: study hours → exam net improvement
- Weak area turnaround rate (students improving <50% subjects)
- Goal achievement rate (students reaching net/score targets)

**Teacher Adoption:**
- % teachers creating study plans
- % teachers using mentoring groups
- Study plan distribution rate (plans assigned per week)

**Platform Differentiation:**
- Template marketplace growth (# templates, usage)
- Group collaboration activity (messages, file shares)
- Parent verification rate (engagement indicator)

**Competitive Advantages vs Existing Solutions:**
1. **Proactive vs Reactive:** Recommendations before exams, not just post-analysis
2. **Collaborative:** Group mentoring unique in market
3. **Complete Loop:** Plan → Study → Track → Verify → Analyze → Recommend
4. **AI-Powered:** Personalized daily guidance
5. **Template Marketplace:** Community-driven content scaling

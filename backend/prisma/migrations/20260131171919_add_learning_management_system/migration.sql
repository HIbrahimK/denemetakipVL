-- CreateEnum
CREATE TYPE "StudyTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'LATE');

-- CreateEnum
CREATE TYPE "StudyPlanTargetType" AS ENUM ('INDIVIDUAL', 'GROUP', 'CLASS');

-- CreateEnum
CREATE TYPE "StudyGoalType" AS ENUM ('STUDENT_NET', 'STUDENT_SCORE', 'STUDENT_UNIVERSITY', 'TEACHER_CLASS_AVERAGE');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('TEACHER_ASSIGNMENT', 'WEAK_AREA', 'STUDY_GAP', 'DIFFICULTY_BALANCE', 'EXAM_PREP');

-- CreateEnum
CREATE TYPE "TopicDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('BOOK', 'VIDEO', 'ARTICLE', 'ONLINE_COURSE');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('STREAK', 'MILESTONE', 'IMPROVEMENT', 'GROUP', 'CONSISTENCY');

-- CreateEnum
CREATE TYPE "GroupMemberRole" AS ENUM ('MEMBER', 'CO_LEADER');

-- AlterEnum
ALTER TYPE "MessageCategory" ADD VALUE 'GROUP';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL,
    "subjectName" TEXT NOT NULL,
    "parentTopicId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "difficulty" "TopicDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'BOOK',
    "publisherOrAuthor" TEXT,
    "examType" "ExamType",
    "subjectName" TEXT,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetType" "StudyPlanTargetType" NOT NULL,
    "targetId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyTask" (
    "id" TEXT NOT NULL,
    "planId" TEXT,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "subjectName" TEXT NOT NULL,
    "topicId" TEXT,
    "questionCount" INTEGER NOT NULL,
    "resourceReference" TEXT,
    "estimatedTime" INTEGER,
    "status" "StudyTaskStatus" NOT NULL DEFAULT 'PENDING',
    "completedQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "blankAnswers" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER,
    "teacherReviewed" BOOLEAN NOT NULL DEFAULT false,
    "teacherComment" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "parentVerified" BOOLEAN NOT NULL DEFAULT false,
    "parentComment" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "topicId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "isPomodoroMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "type" "StudyGoalType" NOT NULL,
    "targetData" JSONB NOT NULL,
    "deadline" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyRecommendation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "recommendationType" "RecommendationType" NOT NULL,
    "subjectName" TEXT,
    "topicId" TEXT,
    "reasoning" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "estimatedTime" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "StudyRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "category" "AchievementCategory" NOT NULL,
    "criteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAchievement" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorGroup" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gradeIds" JSONB NOT NULL,
    "maxStudents" INTEGER NOT NULL DEFAULT 25,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "role" "GroupMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "GroupMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupStudyPlan" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "studyPlanId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupStudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupGoal" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "goalType" TEXT NOT NULL,
    "targetData" JSONB NOT NULL,
    "deadline" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyPlanTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "authorId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "durationWeeks" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB NOT NULL,
    "planData" JSONB NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlanTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateRating" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Topic_examType_subjectName_idx" ON "Topic"("examType", "subjectName");

-- CreateIndex
CREATE INDEX "Topic_parentTopicId_idx" ON "Topic"("parentTopicId");

-- CreateIndex
CREATE INDEX "Resource_examType_subjectName_idx" ON "Resource"("examType", "subjectName");

-- CreateIndex
CREATE INDEX "Resource_isPopular_idx" ON "Resource"("isPopular");

-- CreateIndex
CREATE INDEX "StudyPlan_teacherId_schoolId_idx" ON "StudyPlan"("teacherId", "schoolId");

-- CreateIndex
CREATE INDEX "StudyPlan_targetType_targetId_idx" ON "StudyPlan"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "StudyTask_studentId_date_idx" ON "StudyTask"("studentId", "date");

-- CreateIndex
CREATE INDEX "StudyTask_planId_idx" ON "StudyTask"("planId");

-- CreateIndex
CREATE INDEX "StudyTask_status_idx" ON "StudyTask"("status");

-- CreateIndex
CREATE INDEX "StudyTask_schoolId_idx" ON "StudyTask"("schoolId");

-- CreateIndex
CREATE INDEX "StudySession_studentId_startTime_idx" ON "StudySession"("studentId", "startTime");

-- CreateIndex
CREATE INDEX "StudySession_schoolId_idx" ON "StudySession"("schoolId");

-- CreateIndex
CREATE INDEX "StudyGoal_userId_isActive_idx" ON "StudyGoal"("userId", "isActive");

-- CreateIndex
CREATE INDEX "StudyGoal_schoolId_idx" ON "StudyGoal"("schoolId");

-- CreateIndex
CREATE INDEX "StudyRecommendation_studentId_isCompleted_idx" ON "StudyRecommendation"("studentId", "isCompleted");

-- CreateIndex
CREATE INDEX "StudyRecommendation_schoolId_idx" ON "StudyRecommendation"("schoolId");

-- CreateIndex
CREATE INDEX "StudyRecommendation_createdAt_idx" ON "StudyRecommendation"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE INDEX "Achievement_category_idx" ON "Achievement"("category");

-- CreateIndex
CREATE INDEX "StudentAchievement_studentId_idx" ON "StudentAchievement"("studentId");

-- CreateIndex
CREATE INDEX "StudentAchievement_unlockedAt_idx" ON "StudentAchievement"("unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAchievement_studentId_achievementId_key" ON "StudentAchievement"("studentId", "achievementId");

-- CreateIndex
CREATE INDEX "MentorGroup_teacherId_schoolId_idx" ON "MentorGroup"("teacherId", "schoolId");

-- CreateIndex
CREATE INDEX "MentorGroup_isActive_idx" ON "MentorGroup"("isActive");

-- CreateIndex
CREATE INDEX "GroupMembership_studentId_idx" ON "GroupMembership"("studentId");

-- CreateIndex
CREATE INDEX "GroupMembership_groupId_leftAt_idx" ON "GroupMembership"("groupId", "leftAt");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMembership_groupId_studentId_key" ON "GroupMembership"("groupId", "studentId");

-- CreateIndex
CREATE INDEX "GroupStudyPlan_groupId_idx" ON "GroupStudyPlan"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupStudyPlan_groupId_studyPlanId_key" ON "GroupStudyPlan"("groupId", "studyPlanId");

-- CreateIndex
CREATE INDEX "GroupGoal_groupId_isActive_idx" ON "GroupGoal"("groupId", "isActive");

-- CreateIndex
CREATE INDEX "StudyPlanTemplate_examType_isPublic_idx" ON "StudyPlanTemplate"("examType", "isPublic");

-- CreateIndex
CREATE INDEX "StudyPlanTemplate_schoolId_idx" ON "StudyPlanTemplate"("schoolId");

-- CreateIndex
CREATE INDEX "StudyPlanTemplate_authorId_idx" ON "StudyPlanTemplate"("authorId");

-- CreateIndex
CREATE INDEX "TemplateRating_templateId_idx" ON "TemplateRating"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateRating_templateId_userId_key" ON "TemplateRating"("templateId", "userId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MentorGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGoal" ADD CONSTRAINT "StudyGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGoal" ADD CONSTRAINT "StudyGoal_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRecommendation" ADD CONSTRAINT "StudyRecommendation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRecommendation" ADD CONSTRAINT "StudyRecommendation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyRecommendation" ADD CONSTRAINT "StudyRecommendation_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAchievement" ADD CONSTRAINT "StudentAchievement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAchievement" ADD CONSTRAINT "StudentAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorGroup" ADD CONSTRAINT "MentorGroup_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorGroup" ADD CONSTRAINT "MentorGroup_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MentorGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupStudyPlan" ADD CONSTRAINT "GroupStudyPlan_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MentorGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupStudyPlan" ADD CONSTRAINT "GroupStudyPlan_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupGoal" ADD CONSTRAINT "GroupGoal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MentorGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTemplate" ADD CONSTRAINT "StudyPlanTemplate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanTemplate" ADD CONSTRAINT "StudyPlanTemplate_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateRating" ADD CONSTRAINT "TemplateRating_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StudyPlanTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateRating" ADD CONSTRAINT "TemplateRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

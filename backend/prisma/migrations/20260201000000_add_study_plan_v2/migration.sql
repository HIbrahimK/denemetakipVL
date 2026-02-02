-- CreateSubject table
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "gradeLevels" INTEGER[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateEnum for StudyPlanStatus
DO $$ BEGIN
    CREATE TYPE "StudyPlanStatus" AS ENUM ('DRAFT', 'ASSIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable StudyPlan
ALTER TABLE "StudyPlan" DROP COLUMN IF EXISTS "startDate",
DROP COLUMN IF EXISTS "endDate",
DROP COLUMN IF EXISTS "isPublic",
ADD COLUMN IF NOT EXISTS "examType" TEXT,
ADD COLUMN IF NOT EXISTS "gradeLevels" INTEGER[],
ADD COLUMN IF NOT EXISTS "planData" JSONB,
ADD COLUMN IF NOT EXISTS "status" "StudyPlanStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN IF NOT EXISTS "templateName" TEXT,
ADD COLUMN IF NOT EXISTS "weekStartDate" TIMESTAMP(3);

-- AlterTable StudyTask - Drop old columns and add new ones
ALTER TABLE "StudyTask" DROP COLUMN IF EXISTS "date",
DROP COLUMN IF EXISTS "topicId",
DROP COLUMN IF EXISTS "questionCount",
DROP COLUMN IF EXISTS "resourceReference",
DROP COLUMN IF EXISTS "estimatedTime",
DROP COLUMN IF EXISTS "completedQuestions",
DROP COLUMN IF EXISTS "correctAnswers",
DROP COLUMN IF EXISTS "wrongAnswers",
DROP COLUMN IF EXISTS "blankAnswers",
DROP COLUMN IF EXISTS "timeSpent",
DROP COLUMN IF EXISTS "teacherReviewed",
DROP COLUMN IF EXISTS "reviewedAt",
DROP COLUMN IF EXISTS "parentVerified",
DROP COLUMN IF EXISTS "verifiedAt",
DROP COLUMN IF EXISTS "verifiedById",
DROP COLUMN IF EXISTS "isVerified";

-- Drop existing columns if they exist and add new structure
ALTER TABLE "StudyTask" 
ADD COLUMN IF NOT EXISTS "rowIndex" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "dayIndex" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "topicName" TEXT,
ADD COLUMN IF NOT EXISTS "targetQuestionCount" INTEGER,
ADD COLUMN IF NOT EXISTS "targetDuration" INTEGER,
ADD COLUMN IF NOT EXISTS "targetResource" TEXT,
ADD COLUMN IF NOT EXISTS "completedQuestionCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "actualDuration" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "correctCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "wrongCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "blankCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "actualResource" TEXT,
ADD COLUMN IF NOT EXISTS "studentNotes" TEXT,
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "parentApproved" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "parentApprovedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "parentId" TEXT,
ADD COLUMN IF NOT EXISTS "teacherApproved" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "teacherApprovedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "teacherApprovedById" TEXT;

-- Make rowIndex and dayIndex NOT NULL after adding with defaults
ALTER TABLE "StudyTask" ALTER COLUMN "rowIndex" SET NOT NULL;
ALTER TABLE "StudyTask" ALTER COLUMN "dayIndex" SET NOT NULL;
ALTER TABLE "StudyTask" ALTER COLUMN "completedQuestionCount" SET NOT NULL;
ALTER TABLE "StudyTask" ALTER COLUMN "actualDuration" SET NOT NULL;
ALTER TABLE "StudyTask" ALTER COLUMN "correctCount" SET NOT NULL;
ALTER TABLE "StudyTask" ALTER COLUMN "wrongCount" SET NOT NULL;
ALTER TABLE "StudyTask" ALTER COLUMN "blankCount" SET NOT NULL;
ALTER TABLE "StudyTask" ALTER COLUMN "parentApproved" SET NOT NULL;
ALTER TABLE "StudyTask" ALTER COLUMN "teacherApproved" SET NOT NULL;

-- AlterTable Topic
ALTER TABLE "Topic" DROP COLUMN IF EXISTS "examType",
DROP COLUMN IF EXISTS "subjectName",
DROP COLUMN IF EXISTS "difficulty",
ADD COLUMN IF NOT EXISTS "subjectId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subject_examType_idx" ON "Subject"("examType");
CREATE INDEX IF NOT EXISTS "Subject_isActive_idx" ON "Subject"("isActive");

-- CreateIndex StudyPlan
CREATE INDEX IF NOT EXISTS "StudyPlan_examType_gradeLevels_idx" ON "StudyPlan"("examType", "gradeLevels");
CREATE INDEX IF NOT EXISTS "StudyPlan_status_idx" ON "StudyPlan"("status");
CREATE INDEX IF NOT EXISTS "StudyPlan_isTemplate_idx" ON "StudyPlan"("isTemplate");

-- CreateIndex StudyTask
DROP INDEX IF EXISTS "StudyTask_studentId_date_idx";
DROP INDEX IF EXISTS "StudyTask_verifiedById_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "StudyTask_planId_studentId_rowIndex_dayIndex_key" ON "StudyTask"("planId", "studentId", "rowIndex", "dayIndex");
CREATE INDEX IF NOT EXISTS "StudyTask_studentId_status_idx" ON "StudyTask"("studentId", "status");

-- CreateIndex Topic
DROP INDEX IF EXISTS "Topic_examType_subjectName_idx";
DROP INDEX IF EXISTS "Topic_examType_subjectName_name_parentTopicId_key";
CREATE INDEX IF NOT EXISTS "Topic_subjectId_idx" ON "Topic"("subjectId");

-- AddForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT IF EXISTS "Topic_subjectId_fkey";
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" DROP CONSTRAINT IF EXISTS "StudyTask_teacherApprovedById_fkey";
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_teacherApprovedById_fkey" FOREIGN KEY ("teacherApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey (old Topic relation)
ALTER TABLE "StudyTask" DROP CONSTRAINT IF EXISTS "StudyTask_topicId_fkey";

-- Update StudyTask planId to be NOT NULL
ALTER TABLE "StudyTask" ALTER COLUMN "planId" SET NOT NULL;

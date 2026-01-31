-- Add missing fields to Achievement table
ALTER TABLE "Achievement" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "Achievement" ADD COLUMN IF NOT EXISTS "requiredPoints" INTEGER DEFAULT 0;
UPDATE "Achievement" SET "schoolId" = (SELECT id FROM "School" LIMIT 1) WHERE "schoolId" IS NULL;
ALTER TABLE "Achievement" ALTER COLUMN "schoolId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "Achievement_schoolId_idx" ON "Achievement"("schoolId");

-- Add foreign key constraint
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_schoolId_fkey" 
FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE;

-- Add missing fields to StudentAchievement table  
ALTER TABLE "StudentAchievement" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "StudentAchievement" ADD COLUMN IF NOT EXISTS "earnedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
UPDATE "StudentAchievement" SET "schoolId" = (SELECT "schoolId" FROM "Student" WHERE "Student"."id" = "StudentAchievement"."studentId") WHERE "schoolId" IS NULL;
ALTER TABLE "StudentAchievement" ALTER COLUMN "schoolId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "StudentAchievement_schoolId_idx" ON "StudentAchievement"("schoolId");
CREATE INDEX IF NOT EXISTS "StudentAchievement_earnedAt_idx" ON "StudentAchievement"("earnedAt");

-- Add foreign key constraint
ALTER TABLE "StudentAchievement" ADD CONSTRAINT "StudentAchievement_schoolId_fkey" 
FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE;

-- Fix StudyGoal to use studentId instead of userId
ALTER TABLE "StudyGoal" ADD COLUMN IF NOT EXISTS "studentId" TEXT;
ALTER TABLE "StudyGoal" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "StudyGoal" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "StudyGoal" ADD COLUMN IF NOT EXISTS "targetValue" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "StudyGoal" ADD COLUMN IF NOT EXISTS "targetUnit" TEXT;
ALTER TABLE "StudyGoal" ADD COLUMN IF NOT EXISTS "targetDate" TIMESTAMP(3);
ALTER TABLE "StudyGoal" ADD COLUMN IF NOT EXISTS "currentValue" DOUBLE PRECISION DEFAULT 0;
ALTER TABLE "StudyGoal" ADD COLUMN IF NOT EXISTS "topicId" TEXT;
ALTER TABLE "StudyGoal" ADD COLUMN IF NOT EXISTS "isCompleted" BOOLEAN DEFAULT false;
ALTER TABLE "StudyGoal" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- Migrate existing userId data to studentId
UPDATE "StudyGoal" SET "studentId" = (
  SELECT "studentId" FROM "Student" 
  INNER JOIN "User" ON "Student"."userId" = "User"."id"
  WHERE "User"."id" = "StudyGoal"."userId"
  LIMIT 1
) WHERE "studentId" IS NULL AND "userId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "StudyGoal_studentId_idx" ON "StudyGoal"("studentId");
CREATE INDEX IF NOT EXISTS "StudyGoal_topicId_idx" ON "StudyGoal"("topicId");

-- Add foreign key for topicId
ALTER TABLE "StudyGoal" ADD CONSTRAINT "StudyGoal_topicId_fkey" 
FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL;

-- Add foreign key for studentId
ALTER TABLE "StudyGoal" ADD CONSTRAINT "StudyGoal_studentId_fkey" 
FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE;

-- Add verification fields to StudyTask (already has some, adding missing ones)
ALTER TABLE "StudyTask" ADD COLUMN IF NOT EXISTS "verifiedById" TEXT;
ALTER TABLE "StudyTask" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS "StudyTask_verifiedById_idx" ON "StudyTask"("verifiedById");

-- Add schoolId to GroupMembership
ALTER TABLE "GroupMembership" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
UPDATE "GroupMembership" SET "schoolId" = (SELECT "schoolId" FROM "Student" WHERE "Student"."id" = "GroupMembership"."studentId") WHERE "schoolId" IS NULL;
ALTER TABLE "GroupMembership" ALTER COLUMN "schoolId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "GroupMembership_schoolId_idx" ON "GroupMembership"("schoolId");

-- Add schoolId to GroupGoal
ALTER TABLE "GroupGoal" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
UPDATE "GroupGoal" SET "schoolId" = (SELECT "schoolId" FROM "MentorGroup" WHERE "MentorGroup"."id" = "GroupGoal"."groupId") WHERE "schoolId" IS NULL;
ALTER TABLE "GroupGoal" ALTER COLUMN "schoolId" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "GroupGoal_schoolId_idx" ON "GroupGoal"("schoolId");

-- Add foreign key constraints
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_schoolId_fkey" 
FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT;

ALTER TABLE "GroupGoal" ADD CONSTRAINT "GroupGoal_schoolId_fkey" 
FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT;

ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_verifiedById_fkey" 
FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL;

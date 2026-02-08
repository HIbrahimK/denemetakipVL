-- Add new values to GroupPostType
ALTER TYPE "GroupPostType" ADD VALUE IF NOT EXISTS 'POLL';
ALTER TYPE "GroupPostType" ADD VALUE IF NOT EXISTS 'VIDEO';
ALTER TYPE "GroupPostType" ADD VALUE IF NOT EXISTS 'QUESTION';

-- Create GroupType enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GroupType') THEN
    CREATE TYPE "GroupType" AS ENUM ('MENTOR', 'CLASS', 'GRADE');
  END IF;
END$$;

-- Alter MentorGroup
ALTER TABLE "MentorGroup" ALTER COLUMN "teacherId" DROP NOT NULL;
ALTER TABLE "MentorGroup" ADD COLUMN IF NOT EXISTS "groupType" "GroupType" NOT NULL DEFAULT 'MENTOR';
ALTER TABLE "MentorGroup" ADD COLUMN IF NOT EXISTS "gradeId" TEXT;
ALTER TABLE "MentorGroup" ADD COLUMN IF NOT EXISTS "classId" TEXT;

ALTER TABLE "MentorGroup" ADD CONSTRAINT "MentorGroup_gradeId_fkey"
  FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MentorGroup" ADD CONSTRAINT "MentorGroup_classId_fkey"
  FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Alter GroupPost
ALTER TABLE "GroupPost" ADD COLUMN IF NOT EXISTS "data" JSONB;

-- Create GroupPostReply
CREATE TABLE IF NOT EXISTS "GroupPostReply" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GroupPostReply_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "GroupPostReply_postId_createdAt_idx" ON "GroupPostReply"("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "GroupPostReply_authorId_idx" ON "GroupPostReply"("authorId");

ALTER TABLE "GroupPostReply" ADD CONSTRAINT "GroupPostReply_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "GroupPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupPostReply" ADD CONSTRAINT "GroupPostReply_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create GroupPostResponse
CREATE TABLE IF NOT EXISTS "GroupPostResponse" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "selectedOption" TEXT NOT NULL,
  "isCorrect" BOOLEAN,
  "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupPostResponse_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GroupPostResponse_postId_studentId_key" ON "GroupPostResponse"("postId", "studentId");
CREATE INDEX IF NOT EXISTS "GroupPostResponse_postId_createdAt_idx" ON "GroupPostResponse"("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "GroupPostResponse_studentId_idx" ON "GroupPostResponse"("studentId");

ALTER TABLE "GroupPostResponse" ADD CONSTRAINT "GroupPostResponse_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "GroupPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupPostResponse" ADD CONSTRAINT "GroupPostResponse_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Student points
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "rewardPoints" INTEGER NOT NULL DEFAULT 0;

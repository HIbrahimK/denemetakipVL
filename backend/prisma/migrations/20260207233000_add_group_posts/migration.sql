-- Add GroupPost for mentor group board
CREATE TYPE "GroupPostType" AS ENUM ('ANNOUNCEMENT', 'FILE', 'GOAL', 'PLAN');

CREATE TABLE "GroupPost" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "GroupPostType" NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "filePath" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "goalId" TEXT,
    "planId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GroupPost_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GroupPost_groupId_createdAt_idx" ON "GroupPost"("groupId", "createdAt");
CREATE INDEX "GroupPost_schoolId_createdAt_idx" ON "GroupPost"("schoolId", "createdAt");

ALTER TABLE "GroupPost" ADD CONSTRAINT "GroupPost_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MentorGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupPost" ADD CONSTRAINT "GroupPost_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GroupPost" ADD CONSTRAINT "GroupPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GroupPost" ADD CONSTRAINT "GroupPost_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "GroupGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GroupPost" ADD CONSTRAINT "GroupPost_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

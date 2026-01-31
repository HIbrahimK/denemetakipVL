/*
  Warnings:

  - Made the column `requiredPoints` on table `Achievement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `earnedAt` on table `StudentAchievement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isCompleted` on table `StudyGoal` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isVerified` on table `StudyTask` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Achievement" DROP CONSTRAINT "Achievement_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "GroupGoal" DROP CONSTRAINT "GroupGoal_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMembership" DROP CONSTRAINT "GroupMembership_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAchievement" DROP CONSTRAINT "StudentAchievement_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGoal" DROP CONSTRAINT "StudyGoal_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGoal" DROP CONSTRAINT "StudyGoal_topicId_fkey";

-- DropForeignKey
ALTER TABLE "StudyTask" DROP CONSTRAINT "StudyTask_verifiedById_fkey";

-- AlterTable
ALTER TABLE "Achievement" ALTER COLUMN "requiredPoints" SET NOT NULL;

-- AlterTable
ALTER TABLE "MentorGroup" ALTER COLUMN "gradeIds" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "StudentAchievement" ALTER COLUMN "earnedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudyGoal" ALTER COLUMN "isCompleted" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudyTask" ALTER COLUMN "isVerified" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "branch" TEXT;

-- CreateTable
CREATE TABLE "TopicResource" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TopicResource_topicId_idx" ON "TopicResource"("topicId");

-- CreateIndex
CREATE INDEX "TopicResource_resourceId_idx" ON "TopicResource"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicResource_topicId_resourceId_key" ON "TopicResource"("topicId", "resourceId");

-- AddForeignKey
ALTER TABLE "TopicResource" ADD CONSTRAINT "TopicResource_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicResource" ADD CONSTRAINT "TopicResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGoal" ADD CONSTRAINT "StudyGoal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGoal" ADD CONSTRAINT "StudyGoal_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAchievement" ADD CONSTRAINT "StudentAchievement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMembership" ADD CONSTRAINT "GroupMembership_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupGoal" ADD CONSTRAINT "GroupGoal_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

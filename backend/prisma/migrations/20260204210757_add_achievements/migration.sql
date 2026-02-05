/*
  Warnings:

  - You are about to drop the column `code` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `criteria` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `iconUrl` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `requiredPoints` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `earnedAt` on the `StudentAchievement` table. All the data in the column will be lost.
  - You are about to drop the `StudyGoal` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `colorScheme` to the `Achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iconName` to the `Achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requirement` to the `Achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StudentAchievement` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Achievement" DROP CONSTRAINT "Achievement_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "StudentAchievement" DROP CONSTRAINT "StudentAchievement_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGoal" DROP CONSTRAINT "StudyGoal_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGoal" DROP CONSTRAINT "StudyGoal_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGoal" DROP CONSTRAINT "StudyGoal_topicId_fkey";

-- DropForeignKey
ALTER TABLE "StudyGoal" DROP CONSTRAINT "StudyGoal_userId_fkey";

-- DropIndex
DROP INDEX "Achievement_category_idx";

-- DropIndex
DROP INDEX "Achievement_code_key";

-- DropIndex
DROP INDEX "Achievement_schoolId_idx";

-- DropIndex
DROP INDEX "StudentAchievement_earnedAt_idx";

-- DropIndex
DROP INDEX "StudentAchievement_studentId_idx";

-- DropIndex
DROP INDEX "StudentAchievement_unlockedAt_idx";

-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "code",
DROP COLUMN "criteria",
DROP COLUMN "iconUrl",
DROP COLUMN "requiredPoints",
ADD COLUMN     "colorScheme" TEXT NOT NULL,
ADD COLUMN     "examType" "ExamType",
ADD COLUMN     "iconName" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requirement" JSONB NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "schoolId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudentAchievement" DROP COLUMN "earnedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "unlockedAt" DROP NOT NULL,
ALTER COLUMN "unlockedAt" DROP DEFAULT,
ALTER COLUMN "schoolId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "StudyGoal";

-- DropEnum
DROP TYPE "StudyGoalType";

-- CreateIndex
CREATE INDEX "Achievement_schoolId_isActive_idx" ON "Achievement"("schoolId", "isActive");

-- CreateIndex
CREATE INDEX "Achievement_category_isActive_idx" ON "Achievement"("category", "isActive");

-- CreateIndex
CREATE INDEX "StudentAchievement_studentId_unlockedAt_idx" ON "StudentAchievement"("studentId", "unlockedAt");

-- CreateIndex
CREATE INDEX "StudentAchievement_achievementId_idx" ON "StudentAchievement"("achievementId");

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAchievement" ADD CONSTRAINT "StudentAchievement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

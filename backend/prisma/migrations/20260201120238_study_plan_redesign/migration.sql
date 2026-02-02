/*
  Warnings:

  - The values [CLASS] on the enum `StudyPlanTargetType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[assignmentId,studentId,rowIndex,dayIndex]` on the table `StudyTask` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `examType` to the `StudyPlan` table without a default value. This is not possible if the table is not empty.
  - Made the column `planData` on table `StudyPlan` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `examType` on the `Subject` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `subjectId` on table `Topic` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AssignmentTargetType" AS ENUM ('STUDENT', 'GROUP', 'GRADE', 'CLASS');

-- AlterEnum
BEGIN;
CREATE TYPE "StudyPlanTargetType_new" AS ENUM ('INDIVIDUAL', 'GROUP');
ALTER TABLE "StudyPlan" ALTER COLUMN "targetType" TYPE "StudyPlanTargetType_new" USING ("targetType"::text::"StudyPlanTargetType_new");
ALTER TYPE "StudyPlanTargetType" RENAME TO "StudyPlanTargetType_old";
ALTER TYPE "StudyPlanTargetType_new" RENAME TO "StudyPlanTargetType";
DROP TYPE "StudyPlanTargetType_old";
COMMIT;

-- DropIndex
DROP INDEX "StudyPlan_targetType_targetId_idx";

-- DropIndex
DROP INDEX "StudyTask_planId_studentId_rowIndex_dayIndex_key";

-- DropIndex
DROP INDEX "StudyTask_status_idx";

-- AlterTable
ALTER TABLE "StudyPlan" ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sharedAt" TIMESTAMP(3),
ALTER COLUMN "targetType" DROP NOT NULL,
ALTER COLUMN "isTemplate" SET DEFAULT true,
ALTER COLUMN "planData" SET NOT NULL,
ALTER COLUMN "weekStartDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudyTask" ADD COLUMN     "assignmentId" TEXT,
ALTER COLUMN "planId" DROP NOT NULL;

-- Note: Subject.examType is already ExamType, no change needed
-- Note: Topic.subjectId is already required, no change needed

-- CreateTable
CREATE TABLE "StudyPlanAssignment" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "targetType" "AssignmentTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "customPlanData" JSONB,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "status" "StudyPlanStatus" NOT NULL DEFAULT 'ASSIGNED',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlanAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentPerformanceSummary" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "templateId" TEXT,
    "schoolId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "completedQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "blankCount" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "planName" TEXT,
    "examType" "ExamType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPerformanceSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyPlanAssignment_templateId_idx" ON "StudyPlanAssignment"("templateId");

-- CreateIndex
CREATE INDEX "StudyPlanAssignment_targetType_targetId_idx" ON "StudyPlanAssignment"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "StudyPlanAssignment_assignedById_idx" ON "StudyPlanAssignment"("assignedById");

-- CreateIndex
CREATE INDEX "StudyPlanAssignment_schoolId_idx" ON "StudyPlanAssignment"("schoolId");

-- CreateIndex
CREATE INDEX "StudyPlanAssignment_status_idx" ON "StudyPlanAssignment"("status");

-- CreateIndex
CREATE INDEX "StudyPlanAssignment_expiresAt_idx" ON "StudyPlanAssignment"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "StudyPlanAssignment_templateId_targetType_targetId_year_mon_key" ON "StudyPlanAssignment"("templateId", "targetType", "targetId", "year", "month", "weekNumber");

-- CreateIndex
CREATE INDEX "StudentPerformanceSummary_studentId_idx" ON "StudentPerformanceSummary"("studentId");

-- CreateIndex
CREATE INDEX "StudentPerformanceSummary_templateId_idx" ON "StudentPerformanceSummary"("templateId");

-- CreateIndex
CREATE INDEX "StudentPerformanceSummary_schoolId_idx" ON "StudentPerformanceSummary"("schoolId");

-- CreateIndex
CREATE INDEX "StudentPerformanceSummary_year_month_weekNumber_idx" ON "StudentPerformanceSummary"("year", "month", "weekNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPerformanceSummary_studentId_templateId_year_month_w_key" ON "StudentPerformanceSummary"("studentId", "templateId", "year", "month", "weekNumber");

-- CreateIndex (only if not exists)
CREATE INDEX IF NOT EXISTS "StudyPlan_isShared_idx" ON "StudyPlan"("isShared");

-- CreateIndex
CREATE INDEX "StudyTask_assignmentId_idx" ON "StudyTask"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyTask_assignmentId_studentId_rowIndex_dayIndex_key" ON "StudyTask"("assignmentId", "studentId", "rowIndex", "dayIndex");

-- AddForeignKey
ALTER TABLE "StudyPlanAssignment" ADD CONSTRAINT "StudyPlanAssignment_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanAssignment" ADD CONSTRAINT "StudyPlanAssignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlanAssignment" ADD CONSTRAINT "StudyPlanAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPerformanceSummary" ADD CONSTRAINT "StudentPerformanceSummary_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPerformanceSummary" ADD CONSTRAINT "StudentPerformanceSummary_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "StudyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPerformanceSummary" ADD CONSTRAINT "StudentPerformanceSummary_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "StudyPlanAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

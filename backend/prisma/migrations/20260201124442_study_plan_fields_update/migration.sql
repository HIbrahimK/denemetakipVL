/*
  Warnings:

  - You are about to drop the column `templateId` on the `StudyPlanAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `weekStartDate` on the `StudyPlanAssignment` table. All the data in the column will be lost.
  - Added the required column `planId` to the `StudyPlanAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StudyPlanAssignment" DROP CONSTRAINT "StudyPlanAssignment_templateId_fkey";

-- DropIndex
DROP INDEX "StudyPlanAssignment_templateId_idx";

-- DropIndex
DROP INDEX "StudyPlanAssignment_templateId_targetType_targetId_year_mon_key";

-- AlterTable
ALTER TABLE "StudyPlan" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "StudyPlanAssignment" DROP COLUMN "templateId",
DROP COLUMN "weekStartDate",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "planId" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3),
ALTER COLUMN "year" DROP NOT NULL,
ALTER COLUMN "month" DROP NOT NULL,
ALTER COLUMN "weekNumber" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StudyTask" ADD COLUMN     "dueDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "StudyPlan_deletedAt_idx" ON "StudyPlan"("deletedAt");

-- CreateIndex
CREATE INDEX "StudyPlanAssignment_planId_idx" ON "StudyPlanAssignment"("planId");

-- CreateIndex
CREATE INDEX "StudyTask_dueDate_idx" ON "StudyTask"("dueDate");

-- AddForeignKey
ALTER TABLE "StudyPlanAssignment" ADD CONSTRAINT "StudyPlanAssignment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

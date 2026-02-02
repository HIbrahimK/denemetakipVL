/*
  Warnings:

  - You are about to drop the column `templateId` on the `StudentPerformanceSummary` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,planId]` on the table `StudentPerformanceSummary` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "StudentPerformanceSummary" DROP CONSTRAINT "StudentPerformanceSummary_templateId_fkey";

-- DropIndex
DROP INDEX "StudentPerformanceSummary_studentId_templateId_year_month_w_key";

-- DropIndex
DROP INDEX "StudentPerformanceSummary_templateId_idx";

-- DropIndex
DROP INDEX "StudentPerformanceSummary_year_month_weekNumber_idx";

-- AlterTable
ALTER TABLE "StudentPerformanceSummary" DROP COLUMN "templateId",
ADD COLUMN     "planId" TEXT,
ALTER COLUMN "year" DROP NOT NULL,
ALTER COLUMN "month" DROP NOT NULL,
ALTER COLUMN "weekNumber" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "StudentPerformanceSummary_planId_idx" ON "StudentPerformanceSummary"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPerformanceSummary_studentId_planId_key" ON "StudentPerformanceSummary"("studentId", "planId");

-- AddForeignKey
ALTER TABLE "StudentPerformanceSummary" ADD CONSTRAINT "StudentPerformanceSummary_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

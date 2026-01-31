/*
  Warnings:

  - Made the column `gradeLevel` on table `Exam` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "applicationDateTime" TIMESTAMP(3),
ADD COLUMN     "broughtBy" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "fee" DOUBLE PRECISION,
ADD COLUMN     "isAnswerKeyPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPublisherVisible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quantity" INTEGER,
ADD COLUMN     "scheduledDateTime" TIMESTAMP(3),
ALTER COLUMN "gradeLevel" SET NOT NULL;

-- CreateTable
CREATE TABLE "ExamCalendarSettings" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "showPublisher" BOOLEAN NOT NULL DEFAULT false,
    "showBroughtBy" BOOLEAN NOT NULL DEFAULT false,
    "showFee" BOOLEAN NOT NULL DEFAULT false,
    "showParticipantCounts" BOOLEAN NOT NULL DEFAULT true,
    "notifyDaysBefore" INTEGER NOT NULL DEFAULT 3,
    "autoPublishDaysAfter" INTEGER NOT NULL DEFAULT 0,
    "defaultView" TEXT NOT NULL DEFAULT 'table',
    "academicYearStart" INTEGER NOT NULL DEFAULT 6,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamCalendarSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamNotification" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "messageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamCalendarSettings_schoolId_key" ON "ExamCalendarSettings"("schoolId");

-- CreateIndex
CREATE INDEX "ExamCalendarSettings_schoolId_idx" ON "ExamCalendarSettings"("schoolId");

-- CreateIndex
CREATE INDEX "ExamNotification_examId_isSent_idx" ON "ExamNotification"("examId", "isSent");

-- CreateIndex
CREATE INDEX "ExamNotification_scheduledFor_isSent_idx" ON "ExamNotification"("scheduledFor", "isSent");

-- CreateIndex
CREATE INDEX "Exam_schoolId_gradeLevel_date_idx" ON "Exam"("schoolId", "gradeLevel", "date");

-- CreateIndex
CREATE INDEX "Exam_schoolId_isArchived_isPublished_idx" ON "Exam"("schoolId", "isArchived", "isPublished");

-- AddForeignKey
ALTER TABLE "ExamNotification" ADD CONSTRAINT "ExamNotification_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

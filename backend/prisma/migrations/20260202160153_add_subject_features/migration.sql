-- AlterTable
ALTER TABLE "StudyTask" ADD COLUMN     "customContent" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "isSpecialActivity" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "autoCleanupEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cleanupMonthsToKeep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lastCleanupAt" TIMESTAMP(3);

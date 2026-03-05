-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('MANUAL', 'AUTO', 'GRADE_PROMOTION');

-- AlterTable
ALTER TABLE "Backup" ADD COLUMN     "note" TEXT,
ADD COLUMN     "type" "BackupType" NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX "Backup_type_idx" ON "Backup"("type");

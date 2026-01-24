/*
  Warnings:

  - The values [CUSTOM] on the enum `ExamType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExamType_new" AS ENUM ('TYT', 'AYT', 'LGS', 'OZEL');
ALTER TABLE "Lesson" ALTER COLUMN "examType" TYPE "ExamType_new" USING ("examType"::text::"ExamType_new");
ALTER TABLE "Exam" ALTER COLUMN "type" TYPE "ExamType_new" USING ("type"::text::"ExamType_new");
ALTER TYPE "ExamType" RENAME TO "ExamType_old";
ALTER TYPE "ExamType_new" RENAME TO "ExamType";
DROP TYPE "ExamType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "branchParticipantCount" JSONB,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "generalInfo" TEXT,
ADD COLUMN     "gradeLevel" INTEGER,
ADD COLUMN     "participantCount" INTEGER,
ADD COLUMN     "publisher" TEXT,
ADD COLUMN     "schoolParticipantCount" INTEGER;

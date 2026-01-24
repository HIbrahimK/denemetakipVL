/*
  Warnings:

  - A unique constraint covering the columns `[tcNo]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "tcNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_tcNo_key" ON "Student"("tcNo");

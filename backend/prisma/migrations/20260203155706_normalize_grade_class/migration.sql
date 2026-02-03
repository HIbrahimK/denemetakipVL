/*
  Warnings:

  - A unique constraint covering the columns `[schoolId,gradeId,name]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schoolId,name]` on the table `Grade` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "StudyPlanStatus" ADD VALUE 'ARCHIVED';

-- CreateIndex
CREATE UNIQUE INDEX "Class_schoolId_gradeId_name_key" ON "Class"("schoolId", "gradeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_schoolId_name_key" ON "Grade"("schoolId", "name");

/*
  Warnings:

  - A unique constraint covering the columns `[examType,subjectName,name]` on the table `Resource` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[examType,subjectName,name,parentTopicId]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Resource_examType_subjectName_name_key" ON "Resource"("examType", "subjectName", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_examType_subjectName_name_parentTopicId_key" ON "Topic"("examType", "subjectName", "name", "parentTopicId");

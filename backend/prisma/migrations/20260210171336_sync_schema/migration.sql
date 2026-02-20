/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `School` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `School` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "School" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "School_code_key" ON "School"("code");

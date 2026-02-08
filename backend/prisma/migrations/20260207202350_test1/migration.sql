-- DropForeignKey
ALTER TABLE IF EXISTS "GroupPost" DROP CONSTRAINT IF EXISTS "GroupPost_authorId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "GroupPost" DROP CONSTRAINT IF EXISTS "GroupPost_schoolId_fkey";

-- AlterTable
ALTER TABLE IF EXISTS "GroupPost" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE IF EXISTS "GroupPost" ADD CONSTRAINT "GroupPost_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE IF EXISTS "GroupPost" ADD CONSTRAINT "GroupPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

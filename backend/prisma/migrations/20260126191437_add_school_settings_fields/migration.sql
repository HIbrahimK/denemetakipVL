-- AlterTable
ALTER TABLE "School" ADD COLUMN     "address" TEXT,
ADD COLUMN     "isParentLoginActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "studentLoginType" TEXT NOT NULL DEFAULT 'studentNumber',
ADD COLUMN     "website" TEXT;

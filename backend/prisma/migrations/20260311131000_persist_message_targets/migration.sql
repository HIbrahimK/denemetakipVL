-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "recipientIds" JSONB,
ADD COLUMN     "targetClassIds" JSONB;
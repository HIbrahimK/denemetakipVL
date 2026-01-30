-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('DIRECT', 'BROADCAST', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "MessageCategory" AS ENUM ('GENERAL', 'EXAM', 'URGENT', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT', 'DELETED');

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'DIRECT',
    "category" "MessageCategory" NOT NULL DEFAULT 'GENERAL',
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "targetRoles" JSONB,
    "targetGradeId" TEXT,
    "targetClassId" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRecipient" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReply" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MessageReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT,
    "category" "MessageCategory" NOT NULL DEFAULT 'GENERAL',
    "targetRoles" JSONB,
    "targetGradeId" TEXT,
    "targetClassId" TEXT,
    "recipientIds" JSONB,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "MessageCategory" NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageSettings" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "maxCharacterLimit" INTEGER NOT NULL DEFAULT 1000,
    "autoDeleteDays" INTEGER NOT NULL DEFAULT 30,
    "requireTeacherApproval" BOOLEAN NOT NULL DEFAULT false,
    "enableEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enablePushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "reminderAfterDays" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_schoolId_sentAt_idx" ON "Message"("schoolId", "sentAt");

-- CreateIndex
CREATE INDEX "Message_senderId_status_idx" ON "Message"("senderId", "status");

-- CreateIndex
CREATE INDEX "Message_status_scheduledFor_idx" ON "Message"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "Message_deletedAt_idx" ON "Message"("deletedAt");

-- CreateIndex
CREATE INDEX "MessageRecipient_recipientId_isRead_idx" ON "MessageRecipient"("recipientId", "isRead");

-- CreateIndex
CREATE INDEX "MessageRecipient_recipientId_deletedAt_idx" ON "MessageRecipient"("recipientId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRecipient_messageId_recipientId_key" ON "MessageRecipient"("messageId", "recipientId");

-- CreateIndex
CREATE INDEX "MessageReply_messageId_createdAt_idx" ON "MessageReply"("messageId", "createdAt");

-- CreateIndex
CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");

-- CreateIndex
CREATE INDEX "MessageDraft_userId_schoolId_idx" ON "MessageDraft"("userId", "schoolId");

-- CreateIndex
CREATE INDEX "MessageTemplate_schoolId_idx" ON "MessageTemplate"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageSettings_schoolId_key" ON "MessageSettings"("schoolId");

-- CreateIndex
CREATE INDEX "MessageSettings_schoolId_idx" ON "MessageSettings"("schoolId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_targetGradeId_fkey" FOREIGN KEY ("targetGradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_targetClassId_fkey" FOREIGN KEY ("targetClassId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRecipient" ADD CONSTRAINT "MessageRecipient_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRecipient" ADD CONSTRAINT "MessageRecipient_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReply" ADD CONSTRAINT "MessageReply_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReply" ADD CONSTRAINT "MessageReply_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDraft" ADD CONSTRAINT "MessageDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

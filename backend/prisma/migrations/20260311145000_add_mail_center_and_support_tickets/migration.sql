ALTER TABLE "ContactMessage"
ADD COLUMN "targetInbox" TEXT NOT NULL DEFAULT 'info@denemetakip.net',
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'GENERAL_INFO',
ADD COLUMN "sourceChannel" TEXT NOT NULL DEFAULT 'CONTACT_FORM',
ADD COLUMN "sourcePage" TEXT;

ALTER TABLE "DemoRequest"
ADD COLUMN "targetInbox" TEXT NOT NULL DEFAULT 'info@denemetakip.net',
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'DEMO_REQUEST',
ADD COLUMN "sourceChannel" TEXT NOT NULL DEFAULT 'DEMO_FORM',
ADD COLUMN "sourcePage" TEXT;

CREATE INDEX "ContactMessage_targetInbox_createdAt_idx" ON "ContactMessage"("targetInbox", "createdAt");
CREATE INDEX "ContactMessage_category_createdAt_idx" ON "ContactMessage"("category", "createdAt");
CREATE INDEX "DemoRequest_targetInbox_createdAt_idx" ON "DemoRequest"("targetInbox", "createdAt");
CREATE INDEX "DemoRequest_category_createdAt_idx" ON "DemoRequest"("category", "createdAt");

CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'ANSWERED', 'CLOSED');
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE "SupportTicket" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "priority" "SupportTicketPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
  "closedAt" TIMESTAMP(3),
  "lastReplyAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportTicketReply" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SupportTicketReply_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupportTicket_schoolId_status_updatedAt_idx" ON "SupportTicket"("schoolId", "status", "updatedAt");
CREATE INDEX "SupportTicket_createdById_createdAt_idx" ON "SupportTicket"("createdById", "createdAt");
CREATE INDEX "SupportTicketReply_ticketId_createdAt_idx" ON "SupportTicketReply"("ticketId", "createdAt");
CREATE INDEX "SupportTicketReply_senderId_createdAt_idx" ON "SupportTicketReply"("senderId", "createdAt");

ALTER TABLE "SupportTicket"
ADD CONSTRAINT "SupportTicket_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "SupportTicket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "SupportTicket_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SupportTicketReply"
ADD CONSTRAINT "SupportTicketReply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "SupportTicketReply_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
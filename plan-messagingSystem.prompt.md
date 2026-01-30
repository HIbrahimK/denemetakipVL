# Plan: Add Comprehensive Messaging System

A complete messaging platform enabling admins and teachers to send individual or broadcast messages to students, parents, and class groups. Includes read receipts, notification system integration, auto-deletion, role-based permissions, and scheduled messaging capabilities.

## Steps

### 1. Create database schema
**File**: `backend/prisma/schema.prisma`

Add `Message` model with sender/recipient relations, `MessageRecipient` for broadcast tracking, read receipts, scheduling fields, and indexes for performance. Add `MessageDraft` and `MessageAttachment` models. Run migration.

### 2. Build backend messages module
**Location**: `backend/src/messages/`

Create `messages.service.ts` with send/broadcast/schedule logic, `messages.controller.ts` with role-guarded endpoints (`POST /send`, `GET /inbox`, `PATCH /:id/read`, `DELETE /:id`), DTOs for validation, and `messages.processor.ts` for scheduled sends and 30-day auto-deletion using BullMQ.

### 3. Implement notification integration
**Backend updates**

Add `/messages/unread-count` endpoint, create notification service to mark messages as delivered, integrate with existing `backend/src/email/email.service.ts` for email notifications on important messages, and optionally add SSE or WebSocket for real-time updates.

### 4. Create frontend messages UI
**Location**: `frontend/src/app/dashboard/messages/`

Build inbox page with filters (unread/read/sent), message composer with recipient selector (student/parent/class/grade), message detail view with read receipts, and broadcast modal for bulk targeting. Connect bell icon in `frontend/src/app/dashboard/layout.tsx` to show unread count and navigate to messages.

### 5. Implement role-based message features
**Role permissions**

Add admin-only message editing/deletion that removes messages from all recipients, teacher view limited to own messages, student read-only inbox with delete capability, parent inbox for school communications, and audit logging for admin actions.

### 6. Add advanced features
**Enhanced functionality**

Implement draft saving, message templates for common announcements, message categories/priorities (urgent/info/exam-related), search and filter functionality, attachment support for PDFs/images, scheduled send with preview, and message archiving before 30-day deletion.

## Further Considerations

### 1. Real-time delivery approach

- **Option B**: Server-Sent Events for push notifications (recommended) It sounds good for most use cases.

Which fits your infrastructure?

### 2. Broadcast targeting granularity
Should teachers send to entire grade levels or only their assigned classes? Should there be custom groups/tags (e.g., "exam participants", "low attendance")? 8. sınıf A şubesi  veya 12. sınıf C şubesi veya tüm 12 ler tüm 8 ler gibi.

### 3. Additional features to consider

- **Reply functionality**: Allow students/parents to reply to messages (creates thread). OK
- **Push notifications**: Integrate with `frontend/public/sw.js` service worker for browser push
- **Message templates**: Pre-defined templates for common scenarios (exam reminders, absence notifications) OK. deneme sınavı hatırlatması gibi. cınfigure message setting page.
- **Delivery reports**: CSV export of who read/didn't read important announcements.  Ok
- **Message approval**: Require admin approval for teacher broadcasts. Ok
- **Character limits**: Prevent extremely long messages. not necessary Only 1000 character limit is enough. maybe configure in message setting page.
- **Link preview**: Auto-generate previews for URLs in messages. ok.
- **Translation**: Multi-language support for parent communications. not necessary for now.
- **SMS integration**: Send critical messages via SMS gateway Not necessary for now.
- **Scheduled reminders**: Auto-remind unread recipients after 3 days. ok
- **Attachment support**: Allow PDFs/images to be attached to messages. ok. teacher and admin can attach files.
### 4. Data privacy
Should deleted messages be soft-deleted for audit trail or hard-deleted? Should admins see message content or just metadata when monitoring teacher messages? Soft delete is better for audit trail.

## Technical Context

### Database Schema Pattern
```prisma
model Message {
  id          String   @id @default(cuid())
  senderId    String
  sender      User     @relation("SentMessages", fields: [senderId], references: [id])
  recipientId String?  // Null for broadcasts
  recipient   User?    @relation("ReceivedMessages", fields: [recipientId], references: [id])
  
  subject     String
  body        String
  type        String   // "DIRECT", "BROADCAST", "SCHEDULED"
  category    String   // "EXAM", "GENERAL", "URGENT"
  
  isRead      Boolean  @default(false)
  readAt      DateTime?
  
  scheduledFor DateTime?
  sentAt      DateTime?
  
  schoolId    String
  school      School   @relation(fields: [schoolId], references: [id])
  
  // For broadcast targeting
  targetRoles Json?    // ["STUDENT", "PARENT"]
  targetClass String?  // Class ID for class-wide messages
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([recipientId, isRead])
  @@index([schoolId, sentAt])
}
```

### Backend Module Structure
```
messages/
├── messages.module.ts          # Import BullModule for scheduling
├── messages.controller.ts      # CRUD + /inbox, /sent, /mark-read
├── messages.service.ts         # Business logic + broadcast logic
├── messages.processor.ts       # Background job for scheduled sends
└── dto/
    ├── create-message.dto.ts
    ├── send-broadcast.dto.ts
    └── schedule-message.dto.ts
```

### API Endpoints
- `POST /messages` - Send message (check role permissions)
- `GET /messages/inbox` - Get user's received messages
- `GET /messages/sent` - Get user's sent messages
- `PATCH /messages/:id/read` - Mark as read
- `DELETE /messages/:id` - Delete message
- `POST /messages/broadcast` - Send to multiple recipients (SCHOOL_ADMIN only)
- `POST /messages/schedule` - Schedule future message (SCHOOL_ADMIN only)
- `GET /messages/unread-count` - For bell badge

### Frontend Components
```
components/messages/
├── inbox.tsx              # Message list with filters
├── message-composer.tsx   # Send/compose UI
├── message-detail.tsx     # Full message view
├── broadcast-modal.tsx    # Broadcast targeting UI
└── schedule-modal.tsx     # Date/time picker for scheduling
```

### Frontend Pages
```
dashboard/messages/
├── page.tsx               # Inbox view (replace bell icon click)
├── [id]/page.tsx          # Individual message
└── compose/page.tsx       # New message form
```

### Authorization Rules
- **SCHOOL_ADMIN**: Can send to anyone, broadcast, schedule, edit/delete any message
- **TEACHER**: Can send to students in their classes, parents
- **STUDENT**: Read-only inbox, can delete own received messages
- **PARENT**: Can send only to teachers/admins about their children

### Integration Points
1. **Bell icon click** → Navigate to `/dashboard/messages`
2. **Unread count** → Display on bell badge
3. **Toast notification** → When new message arrives (if real-time)
4. **Email notification** → Use existing EmailService for important messages
5. **Scheduled messages** → BullMQ job checks `scheduledFor` and sends
6. **Auto-deletion** → BullMQ cron job deletes messages older than 30 days

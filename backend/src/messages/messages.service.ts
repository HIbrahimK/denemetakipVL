import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { SaveDraftDto } from './dto/save-draft.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import {
  MessageType,
  MessageStatus,
  NotificationType,
  Role,
} from '@prisma/client';
import { EmailService } from '../email/email.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    @InjectQueue('messages') private messagesQueue: Queue,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    userId: string,
    schoolId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Students cannot send messages
    if (user.role === Role.STUDENT) {
      throw new ForbiddenException('Students cannot send messages');
    }

    // Get settings to check character limit
    const settings = await this.getOrCreateSettings(schoolId);
    if (createMessageDto.body.length > settings.maxCharacterLimit) {
      throw new BadRequestException(
        `Message exceeds maximum character limit of ${settings.maxCharacterLimit}`,
      );
    }

    // Check if teacher needs approval for broadcasts
    if (
      user.role === Role.TEACHER &&
      createMessageDto.type === MessageType.BROADCAST &&
      settings.requireTeacherApproval
    ) {
      createMessageDto.requiresApproval = true;
    }

    // Determine message status
    let status: any = MessageStatus.SENT;
    if (createMessageDto.requiresApproval) {
      status = 'SCHEDULED'; // Use SCHEDULED status for pending approval
    } else if (createMessageDto.scheduledFor) {
      status = 'SCHEDULED';
    }

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        subject: createMessageDto.subject,
        body: createMessageDto.body,
        category: createMessageDto.category || 'GENERAL',
        type: createMessageDto.type || MessageType.DIRECT,
        status,
        senderId: userId,
        schoolId,
        targetRoles: createMessageDto.targetRoles || undefined,
        targetGradeId: createMessageDto.targetGradeId,
        targetClassId: createMessageDto.targetClassId,
        scheduledFor: createMessageDto.scheduledFor
          ? new Date(createMessageDto.scheduledFor)
          : null,
        sentAt: status === MessageStatus.SENT ? new Date() : null,
        requiresApproval: createMessageDto.requiresApproval || false,
        allowReplies: createMessageDto.allowReplies ?? false,
      },
      include: {
        sender: true,
        targetGrade: true,
        targetClass: true,
      },
    });

    // Create attachments if provided
    if (
      createMessageDto.attachments &&
      createMessageDto.attachments.length > 0
    ) {
      await this.prisma.messageAttachment.createMany({
        data: createMessageDto.attachments.map((att) => ({
          messageId: message.id,
          filename: att.filename,
          fileUrl: att.fileUrl,
          fileSize: att.fileSize,
          mimeType: att.mimeType,
        })),
      });
    }

    // If not requiring approval and not scheduled, send immediately
    if (status === MessageStatus.SENT) {
      await this.sendMessageToRecipients(
        message.id,
        schoolId,
        createMessageDto.recipientIds,
        createMessageDto.targetClassIds,
      );
    } else if (createMessageDto.scheduledFor) {
      // Schedule the message
      await this.messagesQueue.add(
        'send-scheduled',
        {
          messageId: message.id,
          schoolId,
          recipientIds: createMessageDto.recipientIds,
          targetClassIds: createMessageDto.targetClassIds,
        },
        {
          delay: new Date(createMessageDto.scheduledFor).getTime() - Date.now(),
        },
      );
    }

    return message;
  }

  async sendMessageToRecipients(
    messageId: string,
    schoolId: string,
    directRecipientIds?: string[],
    targetClassIds?: string[],
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: true,
        targetGrade: {
          include: {
            classes: {
              include: {
                students: {
                  include: { user: true, parent: { include: { user: true } } },
                },
              },
            },
          },
        },
        targetClass: {
          include: {
            students: {
              include: { user: true, parent: { include: { user: true } } },
            },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Determine recipients based on message type
    let recipientIds: string[] = [];

    if (message.type === MessageType.DIRECT) {
      // Direct messages - use provided recipient IDs
      if (!directRecipientIds || directRecipientIds.length === 0) {
        throw new BadRequestException(
          'Direct messages must have recipients specified',
        );
      }
      recipientIds = directRecipientIds;
    } else if (message.type === MessageType.BROADCAST) {
      // Broadcast messages
      const targetRoles = (message.targetRoles as string[]) || [];

      // Çoklu şube seçimi varsa
      if (targetClassIds && targetClassIds.length > 0) {
        const classes = await this.prisma.class.findMany({
          where: {
            id: { in: targetClassIds },
            schoolId,
          },
          include: {
            students: {
              include: {
                user: true,
                parent: { include: { user: true } },
              },
            },
          },
        });

        classes.forEach((cls) => {
          cls.students.forEach((student) => {
            if (
              targetRoles.length === 0 ||
              targetRoles.includes(Role.STUDENT)
            ) {
              recipientIds.push(student.userId);
            }
            if (
              (targetRoles.length === 0 || targetRoles.includes(Role.PARENT)) &&
              student.parent
            ) {
              recipientIds.push(student.parent.userId);
            }
          });
        });
      } else if (message.targetClassId && message.targetClass) {
        // Class-wide message
        message.targetClass.students.forEach((student) => {
          if (targetRoles.length === 0 || targetRoles.includes(Role.STUDENT)) {
            recipientIds.push(student.userId);
          }
          if (
            (targetRoles.length === 0 || targetRoles.includes(Role.PARENT)) &&
            student.parent
          ) {
            recipientIds.push(student.parent.userId);
          }
        });
      } else if (message.targetGradeId && message.targetGrade) {
        // Grade-wide message
        message.targetGrade.classes.forEach((cls) => {
          cls.students.forEach((student) => {
            if (
              targetRoles.length === 0 ||
              targetRoles.includes(Role.STUDENT)
            ) {
              recipientIds.push(student.userId);
            }
            if (
              (targetRoles.length === 0 || targetRoles.includes(Role.PARENT)) &&
              student.parent
            ) {
              recipientIds.push(student.parent.userId);
            }
          });
        });
      } else if (targetRoles.length > 0) {
        // Role-based broadcast to entire school
        const users = await this.prisma.user.findMany({
          where: {
            schoolId,
            role: { in: targetRoles as Role[] },
          },
        });
        recipientIds = users.map((u) => u.id);
      }
    }

    // Remove duplicates
    recipientIds = [...new Set(recipientIds)];

    // Create recipient records
    await this.prisma.messageRecipient.createMany({
      data: recipientIds.map((recipientId) => ({
        messageId: message.id,
        recipientId,
      })),
      skipDuplicates: true,
    });

    // Update message status
    await this.prisma.message.update({
      where: { id: message.id },
      data: {
        status: MessageStatus.SENT,
        sentAt: new Date(),
      },
    });

    // Send email notifications if enabled
    const settings = await this.getSettings(schoolId);
    if (settings?.enableEmailNotifications) {
      await this.sendEmailNotifications(message, recipientIds);
    }

    try {
      await this.notificationsService.dispatchSystemNotification({
        schoolId,
        type: NotificationType.NEW_MESSAGE,
        title: `Yeni Mesaj: ${message.subject}`,
        body: `${message.sender.firstName} ${message.sender.lastName} bir mesaj gonderdi.`,
        targetUserIds: recipientIds,
        deeplink: `/dashboard/messages/${message.id}`,
        metadata: {
          messageId: message.id,
        },
      });
    } catch (error) {
      console.error('Push notification dispatch failed for message:', error);
    }

    return { success: true, recipientCount: recipientIds.length };
  }

  private async sendEmailNotifications(message: any, recipientIds: string[]) {
    try {
      const recipients = await this.prisma.user.findMany({
        where: {
          id: { in: recipientIds },
          // Sadece öğretmen ve yöneticilere email gönder
          role: { in: ['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'] },
        },
      });

      for (const recipient of recipients) {
        if (!recipient.email) continue;

        try {
          await this.emailService.sendEmail(
            recipient.email,
            `New Message: ${message.subject}`,
            `
              <h2>${message.subject}</h2>
              <p><strong>From:</strong> ${message.sender.firstName} ${message.sender.lastName}</p>
              <p>${message.body}</p>
              <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/messages/${message.id}">View Message</a></p>
            `,
          );
        } catch (error) {
          console.error(`Failed to send email to ${recipient.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error sending email notifications:', error);
    }
  }

  async findInbox(userId: string, schoolId: string) {
    const recipients = await this.prisma.messageRecipient.findMany({
      where: {
        recipientId: userId,
        deletedAt: null,
        message: {
          schoolId,
          status: MessageStatus.SENT,
          deletedAt: null,
        },
      },
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
            _count: {
              select: {
                replies: true,
                attachments: true,
              },
            },
          },
        },
      },
      orderBy: {
        message: {
          sentAt: 'desc',
        },
      },
    });

    return recipients;
  }

  async findSent(userId: string, schoolId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Admins can see all messages, teachers can see their own
    const where: any = {
      schoolId,
      status: MessageStatus.SENT,
      deletedAt: null,
    };

    if (user.role !== Role.SCHOOL_ADMIN && user.role !== Role.SUPER_ADMIN) {
      where.senderId = userId;
    }

    const messages = await this.prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        recipients: {
          select: {
            id: true,
            recipientId: true,
            isRead: true,
            readAt: true,
          },
        },
        _count: {
          select: {
            recipients: true,
            replies: true,
            attachments: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    return messages;
  }

  async findOne(messageId: string, userId: string, schoolId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is recipient or sender
    const recipient = await this.prisma.messageRecipient.findUnique({
      where: {
        messageId_recipientId: {
          messageId,
          recipientId: userId,
        },
      },
    });

    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        attachments: true,
        recipients: {
          include: {
            recipient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        replies: {
          where: {
            deletedAt: null,
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        targetGrade: true,
        targetClass: true,
      },
    });

    if (!message || message.schoolId !== schoolId) {
      throw new NotFoundException('Message not found');
    }

    // Check permissions
    const isRecipient = !!recipient;
    const isSender = message.senderId === userId;
    const isAdmin =
      user.role === Role.SCHOOL_ADMIN || user.role === Role.SUPER_ADMIN;

    if (!isRecipient && !isSender && !isAdmin) {
      throw new ForbiddenException('You do not have access to this message');
    }

    // Mark as read if user is recipient
    if (recipient && !recipient.isRead) {
      await this.markAsRead(messageId, userId);
    }

    return { message, isRecipient, isSender, isAdmin };
  }

  async markAsRead(messageId: string, userId: string) {
    const recipient = await this.prisma.messageRecipient.findUnique({
      where: {
        messageId_recipientId: {
          messageId,
          recipientId: userId,
        },
      },
    });

    if (!recipient) {
      throw new NotFoundException('Message recipient not found');
    }

    if (recipient.isRead) {
      return recipient;
    }

    return this.prisma.messageRecipient.update({
      where: {
        messageId_recipientId: {
          messageId,
          recipientId: userId,
        },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async toggleFavorite(messageId: string, userId: string) {
    const recipient = await this.prisma.messageRecipient.findUnique({
      where: {
        messageId_recipientId: {
          messageId,
          recipientId: userId,
        },
      },
    });

    if (!recipient) {
      throw new NotFoundException('Message recipient not found');
    }

    return this.prisma.messageRecipient.update({
      where: {
        messageId_recipientId: {
          messageId,
          recipientId: userId,
        },
      },
      data: {
        isFavorite: !recipient.isFavorite,
      },
    });
  }

  async getUnreadCount(userId: string, schoolId: string) {
    const count = await this.prisma.messageRecipient.count({
      where: {
        recipientId: userId,
        isRead: false,
        deletedAt: null,
        message: {
          schoolId,
          status: MessageStatus.SENT,
          deletedAt: null,
        },
      },
    });

    return { count };
  }

  async update(
    messageId: string,
    updateMessageDto: UpdateMessageDto,
    userId: string,
    schoolId: string,
  ) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.schoolId !== schoolId) {
      throw new NotFoundException('Message not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only admins can edit messages
    if (user.role !== Role.SCHOOL_ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only admins can edit messages');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        subject: updateMessageDto.subject,
        body: updateMessageDto.body,
        updatedAt: new Date(),
      },
    });
  }

  async remove(messageId: string, userId: string, schoolId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.schoolId !== schoolId) {
      throw new NotFoundException('Message not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isAdmin =
      user.role === Role.SCHOOL_ADMIN || user.role === Role.SUPER_ADMIN;
    const isSender = message.senderId === userId;

    // Check if user is trying to delete as recipient
    const recipient = await this.prisma.messageRecipient.findUnique({
      where: {
        messageId_recipientId: {
          messageId,
          recipientId: userId,
        },
      },
    });

    if (recipient) {
      // Soft delete for recipient only
      return this.prisma.messageRecipient.update({
        where: {
          messageId_recipientId: {
            messageId,
            recipientId: userId,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }

    // Only sender or admin can delete the message itself
    if (!isSender && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this message',
      );
    }

    // Soft delete the message
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        deletedAt: new Date(),
        status: MessageStatus.DELETED,
      },
    });
  }

  async createReply(
    messageId: string,
    createReplyDto: CreateReplyDto,
    userId: string,
    schoolId: string,
  ) {
    // Verify the message exists and user has access
    const messageData = await this.findOne(messageId, userId, schoolId);

    if (!messageData.isRecipient) {
      throw new ForbiddenException('Only recipients can reply to messages');
    }

    // Check if replies are allowed
    if (!messageData.message.allowReplies) {
      throw new ForbiddenException('Replies are not allowed for this message');
    }

    return this.prisma.messageReply.create({
      data: {
        messageId,
        senderId: userId,
        body: createReplyDto.body,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async saveDraft(
    saveDraftDto: SaveDraftDto,
    userId: string,
    schoolId: string,
  ) {
    return this.prisma.messageDraft.create({
      data: {
        userId,
        schoolId,
        subject: saveDraftDto.subject,
        body: saveDraftDto.body,
        category: saveDraftDto.category,
        targetRoles: saveDraftDto.targetRoles || undefined,
        targetGradeId: saveDraftDto.targetGradeId,
        targetClassId: saveDraftDto.targetClassId,
        recipientIds: saveDraftDto.recipientIds || undefined,
        allowReplies: saveDraftDto.allowReplies ?? false,
      },
    });
  }

  async getDrafts(userId: string, schoolId: string) {
    return this.prisma.messageDraft.findMany({
      where: {
        userId,
        schoolId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async deleteDraft(draftId: string, userId: string) {
    const draft = await this.prisma.messageDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft || draft.userId !== userId) {
      throw new NotFoundException('Draft not found');
    }

    return this.prisma.messageDraft.delete({
      where: { id: draftId },
    });
  }

  async createTemplate(createTemplateDto: CreateTemplateDto, schoolId: string) {
    return this.prisma.messageTemplate.create({
      data: {
        ...createTemplateDto,
        schoolId,
      },
    });
  }

  async getTemplates(schoolId: string) {
    return this.prisma.messageTemplate.findMany({
      where: { schoolId },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async deleteTemplate(templateId: string, schoolId: string) {
    const template = await this.prisma.messageTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template || template.schoolId !== schoolId) {
      throw new NotFoundException('Template not found');
    }

    return this.prisma.messageTemplate.delete({
      where: { id: templateId },
    });
  }

  async getSettings(schoolId: string) {
    return this.prisma.messageSettings.findUnique({
      where: { schoolId },
    });
  }

  async getOrCreateSettings(schoolId: string) {
    let settings = await this.getSettings(schoolId);

    if (!settings) {
      settings = await this.prisma.messageSettings.create({
        data: { schoolId },
      });
    }

    return settings;
  }

  async updateSettings(schoolId: string, updateSettingsDto: UpdateSettingsDto) {
    await this.getOrCreateSettings(schoolId);

    return this.prisma.messageSettings.update({
      where: { schoolId },
      data: updateSettingsDto,
    });
  }

  async approveMessage(messageId: string, userId: string, schoolId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.SCHOOL_ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only admins can approve messages');
    }

    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.schoolId !== schoolId) {
      throw new NotFoundException('Message not found');
    }

    if (!message.requiresApproval) {
      throw new BadRequestException('Message does not require approval');
    }

    // Update message and send it
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        approvedBy: userId,
        approvedAt: new Date(),
        requiresApproval: false,
      },
    });

    // Get the stored recipient IDs from message draft or determine from broadcast settings
    const recipientIds = await this.getMessageRecipientIds(messageId, schoolId);
    await this.sendMessageToRecipients(messageId, schoolId, recipientIds);

    return { success: true };
  }

  private async getMessageRecipientIds(
    messageId: string,
    schoolId: string,
  ): Promise<string[]> {
    // This is a helper method to retrieve recipient IDs
    // For direct messages, we'll need to query them separately
    // For now, returning empty array to be populated by sendMessageToRecipients logic
    return [];
  }

  async exportDeliveryReport(
    messageId: string,
    userId: string,
    schoolId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        recipients: {
          include: {
            recipient: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!message || message.schoolId !== schoolId) {
      throw new NotFoundException('Message not found');
    }

    // Check permissions
    const isAdmin =
      user.role === Role.SCHOOL_ADMIN || user.role === Role.SUPER_ADMIN;
    const isSender = message.senderId === userId;

    if (!isSender && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to view this report',
      );
    }

    // Format data for CSV export
    return message.recipients.map((r) => ({
      recipientName: `${r.recipient.firstName} ${r.recipient.lastName}`,
      recipientEmail: r.recipient.email,
      recipientRole: r.recipient.role,
      deliveredAt: r.deliveredAt,
      isRead: r.isRead,
      readAt: r.readAt,
    }));
  }
}

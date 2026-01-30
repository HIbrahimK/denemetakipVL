import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessageStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Processor('messages')
@Injectable()
export class MessagesProcessor extends WorkerHost {
  constructor(
    private messagesService: MessagesService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'send-scheduled':
        return this.handleScheduledMessage(job);
      case 'auto-delete-old-messages':
        return this.handleAutoDelete(job);
      case 'send-reminders':
        return this.handleReminders(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  async handleScheduledMessage(job: Job) {
    const { messageId, schoolId, recipientIds, targetClassIds } = job.data;
    
    try {
      await this.messagesService.sendMessageToRecipients(messageId, schoolId, recipientIds, targetClassIds);
      console.log(`Scheduled message ${messageId} sent successfully`);
    } catch (error) {
      console.error(`Failed to send scheduled message ${messageId}:`, error);
      throw error;
    }
  }

  async handleAutoDelete(job: Job) {
    try {
      // Get all schools and their settings
      const schools = await this.prisma.school.findMany({
        select: { id: true },
      });

      let totalDeleted = 0;

      for (const school of schools) {
        const settings = await this.messagesService.getOrCreateSettings(school.id);
        
        const deleteBeforeDate = new Date();
        deleteBeforeDate.setDate(deleteBeforeDate.getDate() - settings.autoDeleteDays);

        // Soft delete old messages
        const result = await this.prisma.message.updateMany({
          where: {
            schoolId: school.id,
            sentAt: {
              lt: deleteBeforeDate,
            },
            deletedAt: null,
            status: MessageStatus.SENT,
          },
          data: {
            deletedAt: new Date(),
            status: MessageStatus.DELETED,
          },
        });

        totalDeleted += result.count;
      }

      console.log(`Auto-deleted ${totalDeleted} old messages`);
      return { deleted: totalDeleted };
    } catch (error) {
      console.error('Failed to auto-delete old messages:', error);
      throw error;
    }
  }

  async handleReminders(job: Job) {
    try {
      // Get all schools and their settings
      const schools = await this.prisma.school.findMany({
        select: { id: true },
      });

      let totalReminders = 0;

      for (const school of schools) {
        const settings = await this.messagesService.getOrCreateSettings(school.id);
        
        if (settings.reminderAfterDays === 0) {
          continue; // Skip if reminders are disabled
        }

        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() - settings.reminderAfterDays);

        // Find unread messages older than reminder threshold
        const unreadMessages = await this.prisma.messageRecipient.findMany({
          where: {
            isRead: false,
            deletedAt: null,
            deliveredAt: {
              lt: reminderDate,
            },
            message: {
              schoolId: school.id,
              status: MessageStatus.SENT,
              deletedAt: null,
            },
          },
          include: {
            message: {
              include: {
                sender: true,
              },
            },
            recipient: true,
          },
          take: 100, // Limit to prevent overwhelming
        });

        // Send reminder emails
        for (const unreadMessage of unreadMessages) {
          try {
            // Here we would send a reminder email
            // For now, just log it
            console.log(`Reminder needed for message ${unreadMessage.messageId} to user ${unreadMessage.recipientId}`);
            totalReminders++;
          } catch (error) {
            console.error(`Failed to send reminder for message ${unreadMessage.messageId}:`, error);
          }
        }
      }

      console.log(`Processed ${totalReminders} reminders`);
      return { reminders: totalReminders };
    } catch (error) {
      console.error('Failed to send reminders:', error);
      throw error;
    }
  }
}

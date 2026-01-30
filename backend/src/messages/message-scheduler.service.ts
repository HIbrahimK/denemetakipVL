import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MessageSchedulerService implements OnModuleInit {
  constructor(
    @InjectQueue('messages') private messagesQueue: Queue,
  ) {}

  async onModuleInit() {
    // Schedule auto-delete job to run daily at 2 AM
    await this.messagesQueue.add(
      'auto-delete-old-messages',
      {},
      {
        repeat: {
          pattern: '0 2 * * *', // Daily at 2 AM
        },
        jobId: 'auto-delete-messages-cron',
      },
    );

    // Schedule reminder job to run daily at 9 AM
    await this.messagesQueue.add(
      'send-reminders',
      {},
      {
        repeat: {
          pattern: '0 9 * * *', // Daily at 9 AM
        },
        jobId: 'send-reminders-cron',
      },
    );

    console.log('Message scheduler initialized: Auto-delete and reminder jobs scheduled');
  }
}

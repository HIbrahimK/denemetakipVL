import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesProcessor } from './messages.processor';
import { MessageSchedulerService } from './message-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    BullModule.registerQueue({
      name: 'messages',
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesProcessor, MessageSchedulerService],
  exports: [MessagesService],
})
export class MessagesModule {}

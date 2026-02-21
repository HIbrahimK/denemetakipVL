import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { ExamNotificationTask } from './exam-notification.task';
import { ReportsModule } from '../reports/reports.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ReportsModule, NotificationsModule],
  controllers: [ExamsController],
  providers: [ExamsService, ExamNotificationTask],
  exports: [ExamsService],
})
export class ExamsModule {}

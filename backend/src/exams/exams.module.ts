import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { ExamNotificationTask } from './exam-notification.task';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [ReportsModule],
  controllers: [ExamsController],
  providers: [ExamsService, ExamNotificationTask],
  exports: [ExamsService],
})
export class ExamsModule {}

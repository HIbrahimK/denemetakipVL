import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExamsService } from '../exams/exams.service';

@Injectable()
export class ExamNotificationTask {
    private readonly logger = new Logger(ExamNotificationTask.name);

    constructor(private readonly examsService: ExamsService) {}

    // Her gün saat 09:00'da pending bildirimleri kontrol et ve gönder
    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async handleExamNotifications() {
        this.logger.log('Exam notifications task started');
        
        try {
            await this.examsService.processPendingNotifications();
            this.logger.log('Exam notifications processed successfully');
        } catch (error) {
            this.logger.error('Error processing exam notifications:', error);
        }
    }

    // Her saat başı kontrol et (opsiyonel - daha sık kontrol için)
    @Cron(CronExpression.EVERY_HOUR)
    async handleHourlyCheck() {
        this.logger.debug('Hourly notification check');
        
        try {
            await this.examsService.processPendingNotifications();
        } catch (error) {
            this.logger.error('Error in hourly notification check:', error);
        }
    }
}

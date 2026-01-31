import { Module } from '@nestjs/common';
import { StudyController } from './study.controller';
import { StudyPlanService } from './study-plan.service';
import { StudyTaskService } from './study-task.service';
import { StudySessionService } from './study-session.service';
import { StudyRecommendationService } from './study-recommendation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudyController],
  providers: [
    StudyPlanService,
    StudyTaskService,
    StudySessionService,
    StudyRecommendationService,
  ],
  exports: [
    StudyPlanService,
    StudyTaskService,
    StudySessionService,
    StudyRecommendationService,
  ],
})
export class StudyModule {}

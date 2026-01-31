import { Module } from '@nestjs/common';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { AchievementsService } from './achievements.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GoalsController],
  providers: [GoalsService, AchievementsService],
  exports: [GoalsService, AchievementsService],
})
export class GoalsModule {}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { ExcelParsingService } from './excel-parsing.service';
import { ImportProcessor } from './import.processor';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'import-queue',
    }),
    AchievementsModule,
  ],
  controllers: [ImportController],
  providers: [ImportService, ExcelParsingService, ImportProcessor],
})
export class ImportModule {}

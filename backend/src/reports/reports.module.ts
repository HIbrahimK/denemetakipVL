import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ExportService } from './export.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService, ExportService],
  exports: [ReportsService, ExportService],
})
export class ReportsModule {}

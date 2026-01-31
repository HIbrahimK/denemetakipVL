import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReportsModule } from '../reports/reports.module';

@Module({
    imports: [ReportsModule],
    controllers: [ExamsController],
    providers: [ExamsService, PrismaService],
    exports: [ExamsService],
})
export class ExamsModule { }

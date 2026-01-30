import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExportService } from '../reports/export.service';

@Module({
    controllers: [ExamsController],
    providers: [ExamsService, PrismaService, ExportService],
    exports: [ExamsService],
})
export class ExamsModule { }

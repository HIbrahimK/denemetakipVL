import { Controller, Get, Post, Body, Param, Query, Delete, Patch, UseInterceptors, UploadedFile, UseGuards, Res, HttpStatus, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExportService } from '../reports/export.service';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
    constructor(
        private readonly examsService: ExamsService,
        private readonly exportService: ExportService,
    ) { }

    @Post()
    @Roles('SCHOOL_ADMIN')
    create(@Body() createExamDto: CreateExamDto) {
        return this.examsService.create(createExamDto);
    }

    @Patch(':id')
    @Roles('SCHOOL_ADMIN')
    update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
        return this.examsService.update(id, updateExamDto);
    }

    @Get()
    @Roles('SCHOOL_ADMIN', 'TEACHER')
    findAll(@Query('schoolId') schoolId: string) {
        return this.examsService.findAll(schoolId);
    }

    @Get(':id')
    @Roles('SCHOOL_ADMIN', 'TEACHER')
    findOne(@Param('id') id: string) {
        return this.examsService.findOne(id);
    }

    @Post(':id/update-counts')
    @Roles('SCHOOL_ADMIN')
    updateCounts(@Param('id') id: string) {
        return this.examsService.updateParticipantCounts(id);
    }
    @Get(':id/statistics')
    @Roles('SCHOOL_ADMIN', 'TEACHER')
    getStatistics(@Param('id') id: string) {
        return this.examsService.getExamStatistics(id);
    }

    @Delete(':id')
    @Roles('SCHOOL_ADMIN')
    remove(@Param('id') id: string) {
        return this.examsService.delete(id);
    }

    @Delete(':id/results')
    @Roles('SCHOOL_ADMIN')
    clearResults(@Param('id') id: string) {
        return this.examsService.clearResults(id);
    }

    @Post(':id/upload-answer-key')
    @Roles('SCHOOL_ADMIN')
    @UseInterceptors(FileInterceptor('file'))
    uploadAnswerKey(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.examsService.uploadAnswerKey(id, file);
    }

    @Get(':id/export/excel')
    @Roles('SCHOOL_ADMIN', 'TEACHER')
    async exportExcel(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        try {
            const stats = await this.examsService.getExamStatistics(id);
            
            if (!stats) {
                throw new HttpException('Sınav bulunamadı', HttpStatus.NOT_FOUND);
            }

            const buffer = await this.exportService.generateSingleExamExcel(stats);
            
            const sanitizedFilename = encodeURIComponent(`${stats.examTitle} - Sonuçlar`);
            
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            );
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${sanitizedFilename}.xlsx"; filename*=UTF-8''${sanitizedFilename}.xlsx`,
            );
            res.send(buffer);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Excel dosyası oluşturulurken bir hata oluştu',
                error: error.message,
            });
        }
    }

    @Get(':id/export/pdf')
    @Roles('SCHOOL_ADMIN', 'TEACHER')
    async exportPDF(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        try {
            const stats = await this.examsService.getExamStatistics(id);
            
            if (!stats) {
                throw new HttpException('Sınav bulunamadı', HttpStatus.NOT_FOUND);
            }

            const buffer = await this.exportService.generateSingleExamPDF(stats);
            
            const sanitizedFilename = encodeURIComponent(`${stats.examTitle} - Sonuçlar`);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${sanitizedFilename}.pdf"; filename*=UTF-8''${sanitizedFilename}.pdf`,
            );
            res.send(buffer);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'PDF dosyası oluşturulurken bir hata oluştu',
                error: error.message,
            });
        }
    }
}

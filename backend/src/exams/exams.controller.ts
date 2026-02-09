import { Controller, Get, Post, Body, Param, Query, Delete, Patch, UseInterceptors, UploadedFile, UseGuards, Res, HttpStatus, HttpException, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import { DuplicateExamDto } from './dto/duplicate-exam.dto';
import { ExamCalendarSettingsDto } from './dto/calendar-settings.dto';
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
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 10 * 1024 * 1024, files: 1 },
        fileFilter: (req, file, cb) => {
            const allowedMimes = [
                'application/pdf',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Ge�f§ersiz dosya t�f¼r�f¼'), false);
            }
        },
    }))
    uploadAnswerKey(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.examsService.uploadAnswerKey(id, file);
    }

    @Get(':id/answer-key')
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'SUPER_ADMIN')
    async getAnswerKey(
        @Param('id') id: string,
        @Req() req: any,
        @Res() res: Response,
    ) {
        try {
            const { filePath, contentType } = await this.examsService.getAnswerKeyFile(id, req.user);
            res.setHeader('Content-Type', contentType);
            return res.sendFile(filePath);
        } catch (error) {
            throw new HttpException(error.message || 'Dosya bulunamad�"±', HttpStatus.NOT_FOUND);
        }
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
                message: 'Excel dosyası olu�Yturulurken bir hata olu�Ytu',
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
                message: 'PDF dosyası olu�Yturulurken bir hata olu�Ytu',
                error: error.message,
            });
        }
    }

    // ============ TAKVIM ENDPOINT'LERİ ============

    @Get('calendar/view')
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
    getCalendar(
        @Query() query: CalendarQueryDto,
        @Query('schoolId') schoolId: string,
        @Req() req: any,
    ) {
        const user = req.user;
        return this.examsService.getCalendarExams(
            schoolId,
            query,
            user?.id,
            user?.role
        );
    }

    @Get('calendar/upcoming')
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
    getUpcoming(
        @Query('schoolId') schoolId: string,
        @Query('gradeLevel') gradeLevel?: string,
        @Query('limit') limit?: string,
    ) {
        return this.examsService.getUpcomingExams(
            schoolId,
            gradeLevel ? parseInt(gradeLevel) : undefined,
            limit ? parseInt(limit) : 5,
        );
    }

    @Post(':id/duplicate')
    @Roles('SCHOOL_ADMIN')
    duplicateExam(
        @Param('id') id: string,
        @Body() dto: DuplicateExamDto,
    ) {
        return this.examsService.duplicateExam(id, dto);
    }

    @Patch(':id/toggle-archive')
    @Roles('SCHOOL_ADMIN')
    toggleArchive(@Param('id') id: string) {
        return this.examsService.toggleArchive(id);
    }

    @Patch(':id/toggle-publisher-visibility')
    @Roles('SCHOOL_ADMIN')
    togglePublisherVisibility(@Param('id') id: string) {
        return this.examsService.togglePublisherVisibility(id);
    }

    @Patch(':id/toggle-answer-key-public')
    @Roles('SCHOOL_ADMIN')
    toggleAnswerKeyPublic(@Param('id') id: string) {
        return this.examsService.toggleAnswerKeyPublic(id);
    }

    @Get('calendar/settings')
    @Roles('SCHOOL_ADMIN', 'TEACHER')
    getCalendarSettings(@Query('schoolId') schoolId: string) {
        return this.examsService.getCalendarSettings(schoolId);
    }

    @Patch('calendar/settings')
    @Roles('SCHOOL_ADMIN')
    updateCalendarSettings(
        @Query('schoolId') schoolId: string,
        @Body() dto: ExamCalendarSettingsDto,
    ) {
        return this.examsService.updateCalendarSettings(schoolId, dto);
    }
}

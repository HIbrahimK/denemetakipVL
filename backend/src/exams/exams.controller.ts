import { Controller, Get, Post, Body, Param, Query, Delete, Patch, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

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
}

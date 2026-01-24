import { Controller, Get, Post, Body, Param, Query, Delete, Patch } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Controller('exams')
export class ExamsController {
    constructor(private readonly examsService: ExamsService) { }

    @Post()
    create(@Body() createExamDto: CreateExamDto) {
        return this.examsService.create(createExamDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
        return this.examsService.update(id, updateExamDto);
    }

    @Get()
    findAll(@Query('schoolId') schoolId: string) {
        return this.examsService.findAll(schoolId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.examsService.findOne(id);
    }

    @Post(':id/update-counts')
    updateCounts(@Param('id') id: string) {
        return this.examsService.updateParticipantCounts(id);
    }
    @Get(':id/statistics')
    getStatistics(@Param('id') id: string) {
        return this.examsService.getExamStatistics(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.examsService.delete(id);
    }

    @Delete(':id/results')
    clearResults(@Param('id') id: string) {
        return this.examsService.clearResults(id);
    }
}

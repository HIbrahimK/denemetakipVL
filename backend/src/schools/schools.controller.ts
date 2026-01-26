import { Controller, Get, Param, Put, Body, Post, UseGuards, Request } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Controller('schools')
export class SchoolsController {
    constructor(private schoolsService: SchoolsService) { }

    @Get()
    async getDefaultSchool() {
        return this.schoolsService.getSchool();
    }

    @Get(':id')
    async getSchool(@Param('id') id: string) {
        return this.schoolsService.getSchool(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateSchool(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
        return this.schoolsService.updateSchool(id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/promote')
    async promoteGrades(@Param('id') id: string) {
        return this.schoolsService.promoteGrades(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/backup')
    async backupData(@Param('id') id: string) {
        return this.schoolsService.backupData(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/backups')
    async getBackups(@Param('id') id: string) {
        return this.schoolsService.getBackups(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/backups/:backupId/download')
    async downloadBackup(@Param('id') id: string, @Param('backupId') backupId: string) {
        return this.schoolsService.downloadBackup(id, backupId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/restore')
    async restoreData(@Param('id') id: string, @Body('backupId') backupId: string) {
        return this.schoolsService.restoreData(id, backupId);
    }
}

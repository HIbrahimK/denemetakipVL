import { Controller, Get, Param, Put, Body, Post, UseGuards, Request } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Controller('schools')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
    constructor(private schoolsService: SchoolsService) { }

    @Get()
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
    async getDefaultSchool() {
        return this.schoolsService.getSchool();
    }

    @Get(':id')
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
    async getSchool(@Param('id') id: string) {
        return this.schoolsService.getSchool(id);
    }

    @Put(':id')
    @Roles('SCHOOL_ADMIN')
    async updateSchool(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
        return this.schoolsService.updateSchool(id, dto);
    }

    @Post(':id/promote')
    @Roles('SCHOOL_ADMIN')
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

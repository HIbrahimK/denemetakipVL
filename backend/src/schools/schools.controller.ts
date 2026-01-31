import { Controller, Get, Param, Put, Body, Post, Delete, UseGuards, Request } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { CreateClassDto, UpdateClassDto, MergeClassesDto, TransferStudentsDto } from './dto/class.dto';

@Controller('schools')
export class SchoolsController {
    constructor(private schoolsService: SchoolsService) { }

    // Public endpoint for getting default school (for non-logged-in users)
    @Get()
    async getDefaultSchool() {
        return this.schoolsService.getSchool();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
    async getSchool(@Param('id') id: string) {
        return this.schoolsService.getSchool(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN')
    async updateSchool(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
        return this.schoolsService.updateSchool(id, dto);
    }

    @Post(':id/promote')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN')
    async promoteGrades(@Param('id') id: string) {
        return this.schoolsService.promoteGrades(id);
    }

    @Get(':id/grades')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'PARENT')
    async getGrades(@Param('id') id: string) {
        return this.schoolsService.getGrades(id);
    }

    @Get(':id/grades/:gradeId/classes')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'PARENT')
    async getClasses(@Param('id') id: string, @Param('gradeId') gradeId: string) {
        return this.schoolsService.getClasses(id, gradeId);
    }

    @Get(':id/classes')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'PARENT')
    async getAllClasses(@Param('id') id: string) {
        return this.schoolsService.getAllClasses(id);
    }

    @Post(':id/classes')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN')
    async createClass(@Param('id') id: string, @Body() dto: CreateClassDto) {
        return this.schoolsService.createClass(id, dto);
    }

    @Put(':id/classes/:classId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN')
    async updateClass(@Param('id') id: string, @Param('classId') classId: string, @Body() dto: UpdateClassDto) {
        return this.schoolsService.updateClass(id, classId, dto);
    }

    @Delete(':id/classes/:classId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN')
    async deleteClass(@Param('id') id: string, @Param('classId') classId: string) {
        return this.schoolsService.deleteClass(id, classId);
    }

    @Post(':id/classes/merge')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN')
    async mergeClasses(@Param('id') id: string, @Body() dto: MergeClassesDto) {
        return this.schoolsService.mergeClasses(id, dto);
    }

    @Post(':id/classes/:classId/transfer-students')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('SCHOOL_ADMIN')
    async transferStudents(@Param('id') id: string, @Param('classId') classId: string, @Body() dto: TransferStudentsDto) {
        return this.schoolsService.transferStudents(id, classId, dto);
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

    @UseGuards(JwtAuthGuard)
    @Delete(':id/backups/:backupId')
    async deleteBackup(@Param('id') id: string, @Param('backupId') backupId: string) {
        return this.schoolsService.deleteBackup(id, backupId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/restore-from-file')
    async restoreFromFile(@Param('id') id: string, @Body('backupData') backupData: any) {
        return this.schoolsService.restoreFromFile(id, backupData);
    }
}

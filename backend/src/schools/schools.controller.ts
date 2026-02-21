import {
  Controller,
  Get,
  Param,
  Put,
  Body,
  Post,
  Delete,
  UseGuards,
  Request,
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateSchoolDto } from './dto/update-school.dto';
import {
  CreateClassDto,
  UpdateClassDto,
  MergeClassesDto,
  TransferStudentsDto,
} from './dto/class.dto';

@Controller('schools')
export class SchoolsController {
  constructor(private schoolsService: SchoolsService) {}

  // Public endpoint for getting default school (for non-logged-in users)
  @Get()
  async getDefaultSchool() {
    return this.schoolsService.getSchool();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  async getSchool(@Request() req, @Param('id') id: string) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.getSchool(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN')
  async updateSchool(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSchoolDto,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.updateSchool(id, dto);
  }

  @Get(':id/promote/preview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN')
  async getPromotionPreview(@Request() req, @Param('id') id: string) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.getPromotionPreview(id);
  }

  @Post(':id/promote')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN')
  async promoteGrades(@Request() req, @Param('id') id: string) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.promoteGrades(id);
  }

  @Get(':id/grades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'PARENT')
  async getGrades(@Request() req, @Param('id') id: string) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.getGrades(id);
  }

  @Get(':id/grades/:gradeId/classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'PARENT')
  async getClasses(
    @Request() req,
    @Param('id') id: string,
    @Param('gradeId') gradeId: string,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.getClasses(id, gradeId);
  }

  @Get(':id/classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'PARENT')
  async getAllClasses(@Request() req, @Param('id') id: string) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.getAllClasses(id);
  }

  @Post(':id/classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN')
  async createClass(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateClassDto,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.createClass(id, dto);
  }

  @Put(':id/classes/:classId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN')
  async updateClass(
    @Request() req,
    @Param('id') id: string,
    @Param('classId') classId: string,
    @Body() dto: UpdateClassDto,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.updateClass(id, classId, dto);
  }

  @Delete(':id/classes/:classId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN')
  async deleteClass(
    @Request() req,
    @Param('id') id: string,
    @Param('classId') classId: string,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.deleteClass(id, classId);
  }

  @Post(':id/classes/merge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN')
  async mergeClasses(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: MergeClassesDto,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.mergeClasses(id, dto);
  }

  @Post(':id/classes/:classId/transfer-students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN')
  async transferStudents(
    @Request() req,
    @Param('id') id: string,
    @Param('classId') classId: string,
    @Body() dto: TransferStudentsDto,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.transferStudents(id, classId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Post(':id/backup')
  async backupData(@Request() req, @Param('id') id: string) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.backupData(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Get(':id/backups')
  async getBackups(@Request() req, @Param('id') id: string) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.getBackups(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Get(':id/backups/:backupId/download')
  async downloadBackup(
    @Request() req,
    @Param('id') id: string,
    @Param('backupId') backupId: string,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.downloadBackup(id, backupId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Post(':id/restore')
  async restoreData(
    @Request() req,
    @Param('id') id: string,
    @Body('backupId') backupId: string,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.restoreData(id, backupId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Delete(':id/backups/:backupId')
  async deleteBackup(
    @Request() req,
    @Param('id') id: string,
    @Param('backupId') backupId: string,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.deleteBackup(id, backupId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Post(':id/restore-from-file')
  async restoreFromFile(
    @Request() req,
    @Param('id') id: string,
    @Body('backupData') backupData: any,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.restoreFromFile(id, backupData);
  }

  private assertSchoolAccess(req: any, schoolId: string) {
    if (req?.user?.role === 'SUPER_ADMIN') {
      return;
    }

    if (req?.user?.schoolId !== schoolId) {
      throw new ForbiddenException('Bu okula erişim yetkiniz yok');
    }
  }
}

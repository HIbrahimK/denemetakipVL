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
  Query,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { CreateSchoolDto } from './dto/create-school.dto';
import { BackupType } from '@prisma/client';
import {
  CreateClassDto,
  UpdateClassDto,
  MergeClassesDto,
  TransferStudentsDto,
} from './dto/class.dto';

@Controller('schools')
export class SchoolsController {
  constructor(private schoolsService: SchoolsService) {}

  // Public endpoint - resolve school by hostname (subdomain or custom domain)
  @Get('resolve')
  async resolveSchool(@Query('host') host: string) {
    return this.schoolsService.resolveByHostname(host);
  }

  // Super Admin - list all schools with stats
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getAllSchools(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.schoolsService.getAllSchools({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
      status,
    });
  }

  // Public endpoint for getting default school (for non-logged-in users)
  @Get()
  async getDefaultSchool() {
    return this.schoolsService.getSchool();
  }

  // Super Admin - upload school logo
  @Post('upload-logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/public/logos',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `logo-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg|webp)$/)) {
          return cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new ForbiddenException('Dosya yüklenemedi');
    }
    return {
      url: `/uploads/logos/${file.filename}`,
      filename: file.filename,
    };
  }

  // Super Admin - create new school
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async createSchool(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.createSchool(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'SUPER_ADMIN')
  async getSchool(@Request() req, @Param('id') id: string) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.getSchool(id);
  }

  // Super Admin - get school stats
  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  async getSchoolStats(@Request() req, @Param('id') id: string) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.getSchoolStats(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  async updateSchool(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSchoolDto,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.updateSchool(id, dto);
  }

  // Super Admin - delete school (soft)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async deleteSchool(@Param('id') id: string) {
    return this.schoolsService.deleteSchool(id);
  }

  // Super Admin - update school license
  @Patch(':id/license')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async updateSchoolLicense(
    @Param('id') id: string,
    @Body() body: { planId?: string; endDate?: string; status?: string; autoRenew?: boolean },
  ) {
    return this.schoolsService.updateSchoolLicense(id, body);
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
  async backupData(
    @Request() req,
    @Param('id') id: string,
    @Body('note') note?: string,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.backupData(id, BackupType.MANUAL, note);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  @Get(':id/backups')
  async getBackups(
    @Request() req,
    @Param('id') id: string,
    @Query('type') type?: BackupType,
  ) {
    this.assertSchoolAccess(req, id);
    return this.schoolsService.getBackups(id, type);
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

  // ─── Super Admin: All backups across schools ────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @Get('admin/backups')
  async getAllBackups(@Query('type') type?: BackupType) {
    return this.schoolsService.getAllBackups(type);
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

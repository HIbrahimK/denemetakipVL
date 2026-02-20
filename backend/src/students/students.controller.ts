import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseGuards,
    Query,
    UseInterceptors,
    UploadedFile,
    Request,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Get('filters')
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Filtreleme için sınıf ve şubeleri getir' })
    getFilters(@Request() req) {
        return this.studentsService.getFilters(req.user.schoolId);
    }

    @Get(':id')
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Tek öğrenci getir' })
    findOne(@Request() req, @Param('id') id: string) {
        return this.studentsService.findOne(id, req.user.schoolId, req.user);
    }

    @Get()
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Tüm öğrencileri listele' })
    findAll(
        @Request() req,
        @Query('gradeId') gradeId?: string,
        @Query('classId') classId?: string,
        @Query('search') search?: string,
        @Query('schoolId') schoolId?: string,
        @Query('className') className?: string,
    ) {
        const targetSchoolId = req.user.role === 'SUPER_ADMIN' && schoolId
            ? schoolId
            : req.user.schoolId;
        return this.studentsService.findAll(targetSchoolId, { gradeId, classId, search, className });
    }

    @Post()
    @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Yeni öğrenci ekle' })
    create(@Request() req, @Body() createStudentDto: CreateStudentDto) {
        return this.studentsService.create(req.user.schoolId, createStudentDto);
    }

    @Put(':id')
    @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Öğrenci güncelle' })
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateStudentDto: UpdateStudentDto,
    ) {
        return this.studentsService.update(id, req.user.schoolId, updateStudentDto);
    }

    @Delete(':id')
    @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Öğrenci sil' })
    remove(@Request() req, @Param('id') id: string) {
        return this.studentsService.remove(id, req.user.schoolId);
    }

    @Post('bulk-delete')
    @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Toplu öğrenci sil' })
    bulkDelete(@Request() req, @Body('studentIds') studentIds: string[]) {
        return this.studentsService.bulkDelete(studentIds, req.user.schoolId);
    }

    @Post('bulk-transfer')
    @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Toplu sınıf değiştir' })
    bulkTransfer(
        @Request() req,
        @Body('studentIds') studentIds: string[],
        @Body('gradeName') gradeName: string,
        @Body('className') className: string,
    ) {
        return this.studentsService.bulkTransfer(studentIds, req.user.schoolId, gradeName, className);
    }

    @Post(':id/change-password')
    @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Öğrenci şifresini değiştir' })
    changePassword(
        @Request() req,
        @Param('id') id: string,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.studentsService.changePassword(id, req.user.schoolId, changePasswordDto);
    }

    @Post(':id/change-parent-password')
    @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Öğrencinin veli şifresini değiştir' })
    changeParentPassword(
        @Request() req,
        @Param('id') id: string,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.studentsService.changeParentPassword(id, req.user.schoolId, changePasswordDto);
    }

    @Post('import')
    @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Excelden toplu öğrenci içe aktar' })
    import(@Request() req, @UploadedFile() file: Express.Multer.File) {
        return this.studentsService.importFromExcel(req.user.schoolId, file.buffer);
    }

    @Get('me/exams')
    @Roles('STUDENT')
    @ApiOperation({ summary: 'Öğrencinin tüm deneme sonuçlarını getir' })
    getMyExams(@Request() req) {
        const studentId = req.user.student?.id;
        if (!studentId) {
            throw new Error('Student not found in user context');
        }
        return this.studentsService.getStudentExamHistory(studentId, req.user.schoolId, req.user);
    }

    @Get(':id/exams')
    @Roles('SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT', 'SUPER_ADMIN')
    @ApiOperation({ summary: 'Belirli bir öğrencinin deneme sonuçlarını getir (Admin/Öğretmen)' })
    getStudentExams(@Request() req, @Param('id') studentId: string) {
        return this.studentsService.getStudentExamHistory(studentId, req.user.schoolId, req.user);
    }
}

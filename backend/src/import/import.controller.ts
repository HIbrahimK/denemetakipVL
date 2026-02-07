import { Controller, Post, UploadedFile, UseInterceptors, Body, Query, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SCHOOL_ADMIN')
export class ImportController {
    constructor(private readonly importService: ImportService) { }

    @Post('validate')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 10 * 1024 * 1024, files: 1 },
        fileFilter: (req, file, cb) => {
            const allowedMimes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Sadece Excel dosyaları yüklenebilir'), false);
            }
        },
    }))
    async validateFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('examId') examId: string,
        @Body('examType') examType: string,
        @Query('schoolId') schoolId: string,
        @CurrentUser() user: any,
    ) {
        const effectiveSchoolId = schoolId || user?.schoolId;
        return this.importService.validateImport(file.buffer, examId, effectiveSchoolId, examType);
    }

    @Post('confirm')
    async confirmImport(
        @Body('data') data: any[],
        @Body('examId') examId: string,
        @Body('examType') examType: string,
        @Query('schoolId') schoolId: string,
        @CurrentUser() user: any,
    ) {
        const effectiveSchoolId = schoolId || user?.schoolId;
        return this.importService.confirmImport(data, examId, effectiveSchoolId, examType);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 10 * 1024 * 1024, files: 1 },
        fileFilter: (req, file, cb) => {
            const allowedMimes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Sadece Excel dosyaları yüklenebilir'), false);
            }
        },
    }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('examId') examId: string,
        @Body('examType') examType: string,
        @Query('schoolId') schoolId: string,
        @CurrentUser() user: any,
    ) {
        const effectiveSchoolId = schoolId || user?.schoolId;
        return this.importService.handleFileUpload(file.buffer, examId, effectiveSchoolId, examType);
    }
}

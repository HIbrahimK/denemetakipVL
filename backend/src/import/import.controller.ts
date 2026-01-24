import { Controller, Post, UploadedFile, UseInterceptors, Body, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';

@Controller('import')
export class ImportController {
    constructor(private readonly importService: ImportService) { }

    @Post('validate')
    @UseInterceptors(FileInterceptor('file'))
    async validateFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('examId') examId: string,
        @Body('examType') examType: string,
        @Query('schoolId') schoolId: string,
    ) {
        return this.importService.validateImport(file.buffer, examId, schoolId, examType);
    }

    @Post('confirm')
    async confirmImport(
        @Body('data') data: any[],
        @Body('examId') examId: string,
        @Body('examType') examType: string,
        @Query('schoolId') schoolId: string,
    ) {
        return this.importService.confirmImport(data, examId, schoolId, examType);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('examId') examId: string,
        @Body('examType') examType: string,
        @Query('schoolId') schoolId: string,
    ) {
        return this.importService.handleFileUpload(file.buffer, examId, schoolId, examType);
    }
}

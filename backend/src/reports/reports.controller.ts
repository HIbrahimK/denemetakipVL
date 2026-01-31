import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Res,
  HttpException,
  HttpStatus,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ExamType } from '@prisma/client';
import { Response } from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService,
  ) {}

  /**
   * Sınav özet raporunu getirir (JSON)
   * Öğretmen ve yöneticiler erişebilir
   */
  @Get('exams/summary')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async getExamsSummaryReport(
    @Req() req: any,
    @Query('examType') examType: ExamType,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    const schoolId = req.user.schoolId;

    if (!examType) {
      throw new HttpException(
        'examType parametresi gereklidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    const grade = gradeLevel ? parseInt(gradeLevel, 10) : undefined;

    return this.reportsService.getExamsSummaryReport(
      schoolId,
      examType,
      grade,
    );
  }

  /**
   * Sınav ayrıntılı raporunu getirir (JSON)
   * Öğretmen ve yöneticiler erişebilir
   */
  @Get('exams/detailed')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async getExamsDetailedReport(
    @Req() req: any,
    @Query('examType') examType: ExamType,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    const schoolId = req.user.schoolId;

    if (!examType) {
      throw new HttpException(
        'examType parametresi gereklidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    const grade = gradeLevel ? parseInt(gradeLevel, 10) : undefined;

    return this.reportsService.getExamsDetailedReport(
      schoolId,
      examType,
      grade,
    );
  }

  /**
   * Ders bazlı raporu getirir (JSON)
   * Öğretmen ve yöneticiler erişebilir
   */
  @Get('subject')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async getSubjectReport(
    @Req() req: any,
    @Query('examType') examType: ExamType,
    @Query('lessonName') lessonName: string,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    const schoolId = req.user.schoolId;

    if (!examType || !lessonName) {
      throw new HttpException(
        'examType ve lessonName parametreleri gereklidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    const grade = gradeLevel ? parseInt(gradeLevel, 10) : undefined;

    return this.reportsService.getSubjectReport(
      schoolId,
      examType,
      lessonName,
      grade,
    );
  }

  /**
   * Tekil sınav raporunu getirir (JSON)
   * Öğretmen ve yöneticiler erişebilir
   */
  @Get('exam/:id')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async getSingleExamReport(@Query('id') examId: string) {
    if (!examId) {
      throw new HttpException(
        'examId parametresi gereklidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.reportsService.getSingleExamReport(examId);
  }

  /**
   * Sınav özet raporunu Excel olarak indirir
   */
  @Get('exams/summary/excel')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async downloadExamsSummaryExcel(
    @Req() req: any,
    @Res() res: Response,
    @Query('examType') examType: ExamType,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    try {
      const schoolId = req.user.schoolId;

      if (!examType) {
        throw new HttpException(
          'examType parametresi gereklidir',
          HttpStatus.BAD_REQUEST,
        );
      }

      const grade = gradeLevel ? parseInt(gradeLevel, 10) : undefined;

      const reports = await this.reportsService.getExamsSummaryReport(
        schoolId,
        examType,
        grade,
      );

      const title = `${examType}${grade ? ` - ${grade}. Sınıf` : ''} Sınav Özet Raporu`;
      const buffer = await this.exportService.generateExamSummaryExcel(
        reports,
        title,
      );

      // Sanitize filename for HTTP header
      const sanitizedFilename = encodeURIComponent(title);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${sanitizedFilename}.xlsx"; filename*=UTF-8''${sanitizedFilename}.xlsx`,
      );
      res.send(buffer);
    } catch (error) {
      console.error('Error generating Excel summary:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Excel dosyası oluşturulurken bir hata oluştu',
        error: error.message,
      });
    }
  }

  /**
   * Sınav ayrıntılı raporunu Excel olarak indirir
   */
  @Get('exams/detailed/excel')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async downloadExamsDetailedExcel(
    @Req() req: any,
    @Res() res: Response,
    @Query('examType') examType: ExamType,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    try {
      const schoolId = req.user.schoolId;

      if (!examType) {
        throw new HttpException(
          'examType parametresi gereklidir',
          HttpStatus.BAD_REQUEST,
        );
      }

      const grade = gradeLevel ? parseInt(gradeLevel, 10) : undefined;

      const reports = await this.reportsService.getExamsDetailedReport(
        schoolId,
        examType,
        grade,
      );

      const title = `${examType}${grade ? ` - ${grade}. Sınıf` : ''} Sınav Ayrıntılı Raporu`;
      const buffer = await this.exportService.generateExamDetailedExcel(
        reports,
        title,
      );

      // Sanitize filename for HTTP header
      const sanitizedFilename = encodeURIComponent(title);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${sanitizedFilename}.xlsx"; filename*=UTF-8''${sanitizedFilename}.xlsx`,
      );
      res.send(buffer);
    } catch (error) {
      console.error('Error generating Excel detailed:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Ayrıntılı Excel dosyası oluşturulurken bir hata oluştu',
        error: error.message,
      });
    }
  }

  /**
   * Ders bazlı raporu Excel olarak indirir
   */
  @Get('subject/excel')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async downloadSubjectReportExcel(
    @Req() req: any,
    @Res() res: Response,
    @Query('examType') examType: ExamType,
    @Query('lessonName') lessonName: string,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    const schoolId = req.user.schoolId;

    if (!examType || !lessonName) {
      throw new HttpException(
        'examType ve lessonName parametreleri gereklidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    const grade = gradeLevel ? parseInt(gradeLevel, 10) : undefined;

    const report = await this.reportsService.getSubjectReport(
      schoolId,
      examType,
      lessonName,
      grade,
    );

    const title = `${examType}${grade ? ` - ${grade}. Sınıf` : ''} ${lessonName} Ders Raporu`;
    const buffer = await this.exportService.generateSubjectReportExcel(
      report,
      title,
    );

    // Sanitize filename for HTTP header
    const sanitizedFilename = encodeURIComponent(title);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${sanitizedFilename}.xlsx"; filename*=UTF-8''${sanitizedFilename}.xlsx`,
    );
    res.send(buffer);
  }

  /**
   * Sınav özet raporunu PDF olarak indirir
   */
  @Get('exams/summary/pdf')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async downloadExamsSummaryPDF(
    @Req() req: any,
    @Res() res: Response,
    @Query('examType') examType: ExamType,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    const schoolId = req.user.schoolId;

    if (!examType) {
      throw new HttpException(
        'examType parametresi gereklidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    const grade = gradeLevel ? parseInt(gradeLevel, 10) : undefined;

    const reports = await this.reportsService.getExamsSummaryReport(
      schoolId,
      examType,
      grade,
    );

    const title = `${examType}${grade ? ` - ${grade}. Sınıf` : ''} Sınav Özet Raporu`;
    const buffer = await this.exportService.generateExamSummaryPDF(
      reports,
      title,
    );

    // Sanitize filename for HTTP header
    const sanitizedFilename = encodeURIComponent(title);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${sanitizedFilename}.pdf"; filename*=UTF-8''${sanitizedFilename}.pdf`,
    );
    res.send(buffer);
  }

  /**
   * Sınav ayrıntılı raporunu PDF olarak indirir
   */
  @Get('exams/detailed/pdf')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async downloadExamsDetailedPDF(
    @Req() req: any,
    @Res() res: Response,
    @Query('examType') examType: ExamType,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    const schoolId = req.user.schoolId;

    if (!examType) {
      throw new HttpException(
        'examType parametresi gereklidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    const grade = gradeLevel ? parseInt(gradeLevel, 10) : undefined;

    const reports = await this.reportsService.getExamsDetailedReport(
      schoolId,
      examType,
      grade,
    );

    const title = `${examType}${grade ? ` - ${grade}. Sınıf` : ''} Sınav Ayrıntılı Raporu`;
    const buffer = await this.exportService.generateExamDetailedPDF(
      reports,
      title,
    );

    // Sanitize filename for HTTP header
    const sanitizedFilename = encodeURIComponent(title);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${sanitizedFilename}.pdf"; filename*=UTF-8''${sanitizedFilename}.pdf`,
    );
    res.send(buffer);
  }

  /**
   * Ders bazlı raporu PDF olarak indirir
   */
  @Get('subject/pdf')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async downloadSubjectReportPDF(
    @Req() req: any,
    @Res() res: Response,
    @Query('examType') examType: ExamType,
    @Query('lessonName') lessonName: string,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    const schoolId = req.user.schoolId;

    if (!examType || !lessonName) {
      throw new HttpException(
        'examType ve lessonName parametreleri gereklidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    const grade = gradeLevel ? parseInt(gradeLevel, 10) : undefined;

    const report = await this.reportsService.getSubjectReport(
      schoolId,
      examType,
      lessonName,
      grade,
    );

    const title = `${examType}${grade ? ` - ${grade}. Sınıf` : ''} ${lessonName} Ders Raporu`;
    const buffer = await this.exportService.generateSubjectReportPDF(
      report,
      title,
    );

    // Sanitize filename for HTTP header
    const sanitizedFilename = encodeURIComponent(title);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${sanitizedFilename}.pdf"; filename*=UTF-8''${sanitizedFilename}.pdf`,
    );
    res.send(buffer);
  }

  /**
   * Sınıf sıralama matris raporunu getirir (JSON)
   * Öğretmen ve yöneticiler erişebilir
   */
  @Get('classes/:classId/ranking-matrix')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async getClassRankingMatrix(
    @Req() req: any,
    @Param('classId') classId: string,
    @Query('examType') examType?: ExamType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const schoolId = req.user.schoolId;

    if (!classId) {
      throw new HttpException(
        'classId parametresi gereklidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.reportsService.getClassRankingMatrix(
      classId,
      schoolId,
      examType,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('grades/:gradeId/ranking-matrix')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async getGradeRankingMatrix(
    @Req() req: any,
    @Param('gradeId') gradeId: string,
    @Query('examType') examType?: ExamType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const schoolId = req.user.schoolId;

    if (!gradeId) {
      throw new HttpException(
        'gradeId parametresi gereklidir',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.reportsService.getGradeRankingMatrix(
      gradeId,
      schoolId,
      examType,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Sınıf sıralama matris raporunu Excel olarak indirir
   */
  @Get('classes/:classId/ranking-matrix/excel')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async downloadClassRankingMatrixExcel(
    @Req() req: any,
    @Res() res: Response,
    @Param('classId') classId: string,
    @Query('examType') examType?: ExamType,
  ) {
    try {
      const schoolId = req.user.schoolId;

      if (!classId) {
        throw new HttpException(
          'classId parametresi gereklidir',
          HttpStatus.BAD_REQUEST,
        );
      }

      const buffer = await this.exportService.generateRankingMatrixExcel(
        classId,
        schoolId,
        examType,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=ogrenci-siralama-matrisi.xlsx',
      );
      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Excel oluşturulurken hata oluştu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('grades/:gradeId/ranking-matrix/excel')
  @Roles(Role.TEACHER, Role.SCHOOL_ADMIN)
  async downloadGradeRankingMatrixExcel(
    @Req() req: any,
    @Res() res: Response,
    @Param('gradeId') gradeId: string,
    @Query('examType') examType?: ExamType,
  ) {
    try {
      const schoolId = req.user.schoolId;

      if (!gradeId) {
        throw new HttpException(
          'gradeId parametresi gereklidir',
          HttpStatus.BAD_REQUEST,
        );
      }

      const buffer = await this.exportService.generateGradeRankingMatrixExcel(
        gradeId,
        schoolId,
        examType,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=sinif-seviyesi-siralama-matrisi.xlsx',
      );
      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        error.message || 'Excel oluşturulurken hata oluştu',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

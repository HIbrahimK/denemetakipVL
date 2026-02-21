import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateMentorGroupDto,
  UpdateMentorGroupDto,
  AddGroupMemberDto,
  CreateGroupGoalDto,
  UpdateGroupGoalDto,
  CreateGroupPostDto,
  CreateGroupPostReplyDto,
  CreateGroupPostResponseDto,
  UpdateGroupPostDto,
  UpdateGroupPostReplyDto,
  ManageGroupTeachersDto,
} from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, basename } from 'path';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  createGroup(@Body() dto: CreateMentorGroupDto, @Request() req) {
    console.log('POST /groups - User:', req.user, 'DTO:', dto);
    return this.groupsService.create(dto, req.user.id, req.user.role, req.user.schoolId);
  }

  @Get()
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'STUDENT')
  findAllGroups(@Request() req) {
    // Use req.user.id (database ID) instead of req.user.userId
    return this.groupsService.findAll(req.user.id, req.user.role, req.user.schoolId);
  }

  @Get(':id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'STUDENT')
  findOneGroup(@Param('id') id: string, @Request() req) {
    return this.groupsService.findOne(id, req.user.id, req.user.role, req.user.schoolId);
  }

  @Patch(':id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  updateGroup(@Param('id') id: string, @Body() dto: UpdateMentorGroupDto, @Request() req) {
    return this.groupsService.update(id, dto, req.user.id, req.user.role, req.user.schoolId);
  }

  @Delete(':id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  removeGroup(@Param('id') id: string, @Request() req) {
    return this.groupsService.remove(id, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post(':id/members')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  addMember(@Param('id') id: string, @Body() dto: AddGroupMemberDto, @Request() req) {
    return this.groupsService.addMember(id, dto, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post(':id/members/bulk')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  addMembersBulk(
    @Param('id') id: string,
    @Body() dto: { studentIds: string[] },
    @Request() req,
  ) {
    return this.groupsService.addMembersBulk(id, dto.studentIds, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post(':id/transfer')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  transferMember(@Param('id') id: string, @Body('studentId') studentId: string, @Request() req) {
    return this.groupsService.transferMember(id, studentId, req.user.id, req.user.role, req.user.schoolId);
  }

  @Delete(':id/members/:studentId')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  removeMember(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
    @Query('removeBoardContent') removeBoardContent: string,
    @Request() req,
  ) {
    return this.groupsService.removeMember(
      id,
      studentId,
      req.user.id,
      req.user.role,
      req.user.schoolId,
      removeBoardContent === 'true',
    );
  }

  @Get(':id/teachers')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  getGroupTeachers(@Param('id') id: string, @Request() req) {
    return this.groupsService.getGroupTeachers(id, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post(':id/teachers')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  addGroupTeachers(
    @Param('id') id: string,
    @Body() dto: ManageGroupTeachersDto,
    @Request() req,
  ) {
    return this.groupsService.addGroupTeachers(id, dto.teacherIds, req.user.id, req.user.role, req.user.schoolId);
  }

  @Delete(':id/teachers/:teacherId')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  removeGroupTeacher(
    @Param('id') id: string,
    @Param('teacherId') teacherId: string,
    @Request() req,
  ) {
    return this.groupsService.removeGroupTeacher(id, teacherId, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post(':id/goals')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  createGroupGoal(@Param('id') id: string, @Body() dto: CreateGroupGoalDto, @Request() req) {
    return this.groupsService.createGroupGoal(id, dto, req.user.id, req.user.role, req.user.schoolId);
  }

  @Get(':id/stats')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'STUDENT')
  getGroupStats(@Param('id') id: string, @Request() req) {
    return this.groupsService.getGroupStats(id, req.user.id, req.user.role, req.user.schoolId);
  }

  @Get(':id/available-students')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  getAvailableStudents(
    @Param('id') id: string,
    @Query('gradeId') gradeId: string,
    @Query('classId') classId: string,
    @Request() req,
  ) {
    return this.groupsService.getAvailableStudents(id, req.user.id, req.user.role, req.user.schoolId, gradeId, classId);
  }

  @Get(':id/transfer-candidates')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  getTransferCandidates(
    @Param('id') id: string,
    @Query('gradeId') gradeId: string,
    @Query('classId') classId: string,
    @Request() req,
  ) {
    return this.groupsService.getTransferCandidates(id, req.user.id, req.user.role, req.user.schoolId, gradeId, classId);
  }

  @Get('grades')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  getGradesForGroup(@Request() req) {
    return this.groupsService.getGradesForGroup(req.user.schoolId);
  }

  @Get('grades/:gradeId/classes')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  getClassesByGrade(@Param('gradeId') gradeId: string, @Request() req) {
    return this.groupsService.getClassesByGrade(gradeId, req.user.schoolId);
  }

  @Post('auto/sync')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  syncAutoGroups(@Request() req) {
    return this.groupsService.syncAutoGroups(req.user.id, req.user.role, req.user.schoolId);
  }

  @Patch(':id/goals/:goalId')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  updateGroupGoal(
    @Param('id') id: string,
    @Param('goalId') goalId: string,
    @Body() dto: UpdateGroupGoalDto,
    @Request() req,
  ) {
    return this.groupsService.updateGroupGoal(id, goalId, dto, req.user.id, req.user.role, req.user.schoolId);
  }

  @Delete(':id/goals/:goalId')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  deleteGroupGoal(
    @Param('id') id: string,
    @Param('goalId') goalId: string,
    @Request() req,
  ) {
    return this.groupsService.deleteGroupGoal(id, goalId, req.user.id, req.user.role, req.user.schoolId);
  }

  @Get(':id/board')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'STUDENT')
  getBoardPosts(@Param('id') id: string, @Request() req) {
    return this.groupsService.getBoardPosts(id, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post(':id/board')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  createBoardPost(@Param('id') id: string, @Body() dto: CreateGroupPostDto, @Request() req) {
    return this.groupsService.createBoardPost(id, dto, req.user.id, req.user.role, req.user.schoolId);
  }

  @Patch(':id/board/:postId')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  updateBoardPost(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body() dto: UpdateGroupPostDto,
    @Request() req,
  ) {
    return this.groupsService.updateBoardPost(id, postId, dto, req.user.id, req.user.role, req.user.schoolId);
  }

  @Delete(':id/board/:postId')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  deleteBoardPost(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Request() req,
  ) {
    return this.groupsService.deleteBoardPost(id, postId, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post(':id/board/:postId/replies')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'STUDENT')
  createBoardReply(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body() dto: CreateGroupPostReplyDto,
    @Request() req,
  ) {
    return this.groupsService.createBoardReply(id, postId, dto.body, req.user.id, req.user.role, req.user.schoolId);
  }

  @Patch(':id/board/:postId/replies/:replyId')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  updateBoardReply(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Param('replyId') replyId: string,
    @Body() dto: UpdateGroupPostReplyDto,
    @Request() req,
  ) {
    return this.groupsService.updateBoardReply(id, postId, replyId, dto.body, req.user.id, req.user.role, req.user.schoolId);
  }

  @Delete(':id/board/:postId/replies/:replyId')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  deleteBoardReply(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Param('replyId') replyId: string,
    @Request() req,
  ) {
    return this.groupsService.deleteBoardReply(id, postId, replyId, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post(':id/board/:postId/respond')
  @Roles('STUDENT')
  respondToBoardPost(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body() dto: CreateGroupPostResponseDto,
    @Request() req,
  ) {
    return this.groupsService.respondToBoardPost(id, postId, dto.selectedOption, req.user.id, req.user.role, req.user.schoolId);
  }

  @Patch(':id/goals/:goalId/complete')
  @Roles('STUDENT')
  completeGoal(
    @Param('id') id: string,
    @Param('goalId') goalId: string,
    @Request() req,
  ) {
    return this.groupsService.completeGoalAsStudent(id, goalId, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post(':id/board/upload')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/group-board';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Sadece PDF, JPG, JPEG, PNG, DOCX ve XLSX dosyaları yüklenebilir'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  uploadBoardFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Dosya yüklenemedi');
    }
    return {
      filePath: file.filename,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  @Get(':id/board/:postId/file')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN', 'STUDENT')
  async getBoardFile(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Query('questionId') questionId: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const fileInfo = await this.groupsService.getBoardFile(
      id,
      postId,
      req.user.id,
      req.user.role,
      req.user.schoolId,
      questionId,
    );
    const safeFilename = basename(fileInfo.filePath || '');
    const filePath = join(process.cwd(), 'uploads', 'group-board', safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Dosya bulunamadı');
    }

    res.setHeader('Content-Type', fileInfo.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileInfo.fileName || 'dosya')}"`,
    );
    return res.sendFile(filePath);
  }
}

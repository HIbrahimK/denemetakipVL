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
} from '@nestjs/common';
import { StudyPlanService, DeleteMode } from './study-plan.service';
import { StudyTaskService } from './study-task.service';
import { StudySessionService } from './study-session.service';
import { StudyRecommendationService } from './study-recommendation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateStudyPlanDto,
  CreateStudyTaskDto,
  CompleteStudyTaskDto,
  VerifyStudyTaskDto,
  LogStudySessionDto,
  AssignStudyPlanDto,
} from './dto';

@Controller('study')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudyController {
  constructor(
    private readonly studyPlanService: StudyPlanService,
    private readonly studyTaskService: StudyTaskService,
    private readonly studySessionService: StudySessionService,
    private readonly studyRecommendationService: StudyRecommendationService,
  ) {}

  // Study Plans
  @Post('plans')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  async createPlan(@Body() dto: CreateStudyPlanDto, @Request() req) {
    console.log('[StudyController] POST /study/plans - User:', req.user, 'DTO:', dto);
    try {
      // Use req.user.id (database ID) instead of req.user.userId (JWT sub)
      const teacherId = req.user.id;
      const schoolId = req.user.schoolId;
      console.log('[StudyController] Using teacherId:', teacherId, 'schoolId:', schoolId);
      const result = await this.studyPlanService.create(dto, teacherId, schoolId);
      console.log('[StudyController] Study plan created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('[StudyController] Error creating study plan:', error);
      throw error;
    }
  }

  @Get('plans')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  findAllPlans(
    @Request() req,
    @Query('isTemplate') isTemplate?: string,
    @Query('status') status?: string,
    @Query('isShared') isShared?: string,
    @Query('examType') examType?: string,
  ) {
    const filters: any = {};
    if (isTemplate !== undefined) filters.isTemplate = isTemplate === 'true';
    if (status) filters.status = status;
    if (isShared !== undefined) filters.isShared = isShared === 'true';
    if (examType) filters.examType = examType;
    
    return this.studyPlanService.findAll(req.user.id, req.user.role, req.user.schoolId, filters);
  }

  @Get('plans/templates')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  findTemplates(
    @Request() req,
    @Query('examType') examType?: string,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('includeShared') includeShared?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('createdBy') createdBy?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.studyPlanService.findTemplates(
      req.user.schoolId,
      req.user.id,
      examType,
      gradeLevel ? parseInt(gradeLevel) : undefined,
      includeShared !== 'false',
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
      createdBy,
      sortBy,
    );
  }

  @Get('plans/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  findOnePlan(@Param('id') id: string, @Request() req) {
    return this.studyPlanService.findOne(id, req.user.id, req.user.role, req.user.schoolId);
  }

  @Patch('plans/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  updatePlan(@Param('id') id: string, @Body() dto: Partial<CreateStudyPlanDto>, @Request() req) {
    return this.studyPlanService.update(id, dto, req.user.id, req.user.schoolId);
  }

  @Delete('plans/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  removePlan(
    @Param('id') id: string, 
    @Request() req,
    @Query('mode') mode?: string,
  ) {
    const deleteMode = mode === 'delete' ? DeleteMode.DELETE_TEMPLATE : DeleteMode.CANCEL_ASSIGNMENTS;
    return this.studyPlanService.remove(id, req.user.id, req.user.schoolId, deleteMode);
  }

  @Post('plans/:id/assign')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  assignPlan(@Param('id') id: string, @Body() dto: AssignStudyPlanDto, @Request() req) {
    return this.studyPlanService.assign(id, dto, req.user.id, req.user.schoolId);
  }

  @Post('plans/:id/duplicate')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  duplicatePlan(
    @Param('id') id: string, 
    @Request() req,
    @Body('name') name?: string,
  ) {
    return this.studyPlanService.duplicate(id, req.user.id, req.user.schoolId, name);
  }

  @Post('plans/:id/share')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  sharePlan(
    @Param('id') id: string, 
    @Request() req,
    @Body('isPublic') isPublic?: boolean,
  ) {
    return this.studyPlanService.share(id, req.user.id, req.user.schoolId, isPublic ?? false);
  }

  @Get('plans/:id/assignments')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  getPlanAssignments(@Param('id') id: string, @Request() req) {
    return this.studyPlanService.getAssignments(id, req.user.id, req.user.schoolId);
  }

  @Post('plans/assignments/:assignmentId/cancel')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  cancelAssignment(@Param('assignmentId') assignmentId: string, @Request() req) {
    return this.studyPlanService.cancelAssignment(assignmentId, req.user.id, req.user.schoolId);
  }

  // Study Tasks
  @Post('tasks')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  createTask(@Body() dto: CreateStudyTaskDto, @Request() req) {
    return this.studyTaskService.create(dto, req.user.schoolId);
  }

  @Get('tasks')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  findAllTasks(@Request() req, @Query() filters) {
    return this.studyTaskService.findAll(req.user.id, req.user.role, req.user.schoolId, filters);
  }

  @Get('tasks/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  findOneTask(@Param('id') id: string, @Request() req) {
    return this.studyTaskService.findOne(id, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post('tasks/:id/complete')
  @Roles('STUDENT')
  completeTask(@Param('id') id: string, @Body() dto: CompleteStudyTaskDto, @Request() req) {
    return this.studyTaskService.complete(id, dto, req.user.id, req.user.schoolId);
  }

  @Post('tasks/:id/verify')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'PARENT')
  verifyTask(@Param('id') id: string, @Body() dto: VerifyStudyTaskDto, @Request() req) {
    return this.studyTaskService.verify(id, dto, req.user.id, req.user.schoolId, req.user.role);
  }

  @Patch('tasks/:id/status')
  @Roles('STUDENT')
  updateTaskStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @Request() req,
  ) {
    return this.studyTaskService.updateStatus(id, status, req.user.id, req.user.schoolId);
  }

  @Delete('tasks/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  removeTask(@Param('id') id: string, @Request() req) {
    return this.studyTaskService.remove(id, req.user.id, req.user.role, req.user.schoolId);
  }

  // Study Sessions
  @Post('sessions')
  @Roles('STUDENT')
  createSession(@Body() dto: LogStudySessionDto, @Request() req) {
    return this.studySessionService.create(dto, req.user.id, req.user.schoolId);
  }

  @Get('sessions')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT')
  findAllSessions(@Request() req, @Query() filters) {
    return this.studySessionService.findAll(req.user.id, req.user.role, req.user.schoolId, filters);
  }

  @Get('sessions/stats')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT')
  getSessionStats(@Request() req, @Query() filters) {
    return this.studySessionService.getStats(req.user.id, req.user.role, req.user.schoolId, filters);
  }

  @Get('sessions/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT')
  findOneSession(@Param('id') id: string, @Request() req) {
    return this.studySessionService.findOne(id, req.user.id, req.user.role, req.user.schoolId);
  }

  @Delete('sessions/:id')
  @Roles('STUDENT')
  removeSession(@Param('id') id: string, @Request() req) {
    return this.studySessionService.remove(id, req.user.id, req.user.schoolId);
  }

  // Recommendations
  @Post('recommendations/generate/:studentId')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  generateRecommendations(@Param('studentId') studentId: string, @Request() req) {
    return this.studyRecommendationService.generateForStudent(studentId, req.user.schoolId);
  }

  @Get('recommendations')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  findAllRecommendations(@Request() req) {
    return this.studyRecommendationService.findAll(req.user.id, req.user.role, req.user.schoolId);
  }

  @Post('recommendations/:id/apply')
  @Roles('STUDENT')
  applyRecommendation(@Param('id') id: string, @Request() req) {
    return this.studyRecommendationService.markAsApplied(id, req.user.id, req.user.schoolId);
  }

  @Post('recommendations/:id/dismiss')
  @Roles('STUDENT')
  dismissRecommendation(@Param('id') id: string, @Request() req) {
    return this.studyRecommendationService.dismiss(id, req.user.id, req.user.schoolId);
  }
}

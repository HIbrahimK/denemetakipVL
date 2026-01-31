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
import { StudyPlanService } from './study-plan.service';
import { StudyTaskService } from './study-task.service';
import { StudySessionService } from './study-session.service';
import { StudyRecommendationService } from './study-recommendation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateStudyPlanDto,
  UpdateStudyPlanDto,
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
  createPlan(@Body() dto: CreateStudyPlanDto, @Request() req) {
    return this.studyPlanService.create(dto, req.user.userId, req.user.schoolId);
  }

  @Get('plans')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  findAllPlans(@Request() req) {
    return this.studyPlanService.findAll(req.user.userId, req.user.role, req.user.schoolId);
  }

  @Get('plans/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  findOnePlan(@Param('id') id: string, @Request() req) {
    return this.studyPlanService.findOne(id, req.user.userId, req.user.role, req.user.schoolId);
  }

  @Patch('plans/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  updatePlan(@Param('id') id: string, @Body() dto: UpdateStudyPlanDto, @Request() req) {
    return this.studyPlanService.update(id, dto, req.user.userId, req.user.schoolId);
  }

  @Delete('plans/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  removePlan(@Param('id') id: string, @Request() req) {
    return this.studyPlanService.remove(id, req.user.userId, req.user.schoolId);
  }

  @Post('plans/:id/assign')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  assignPlan(@Param('id') id: string, @Body() dto: AssignStudyPlanDto, @Request() req) {
    return this.studyPlanService.assign(id, dto, req.user.userId, req.user.schoolId);
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
    return this.studyTaskService.findAll(req.user.userId, req.user.role, req.user.schoolId, filters);
  }

  @Get('tasks/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  findOneTask(@Param('id') id: string, @Request() req) {
    return this.studyTaskService.findOne(id, req.user.userId, req.user.role, req.user.schoolId);
  }

  @Post('tasks/:id/complete')
  @Roles('STUDENT')
  completeTask(@Param('id') id: string, @Body() dto: CompleteStudyTaskDto, @Request() req) {
    return this.studyTaskService.complete(id, dto, req.user.userId, req.user.schoolId);
  }

  @Post('tasks/:id/verify')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'PARENT')
  verifyTask(@Param('id') id: string, @Body() dto: VerifyStudyTaskDto, @Request() req) {
    return this.studyTaskService.verify(id, dto, req.user.userId, req.user.schoolId);
  }

  @Patch('tasks/:id/status')
  @Roles('STUDENT')
  updateTaskStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @Request() req,
  ) {
    return this.studyTaskService.updateStatus(id, status, req.user.userId, req.user.schoolId);
  }

  @Delete('tasks/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  removeTask(@Param('id') id: string, @Request() req) {
    return this.studyTaskService.remove(id, req.user.userId, req.user.role, req.user.schoolId);
  }

  // Study Sessions
  @Post('sessions')
  @Roles('STUDENT')
  createSession(@Body() dto: LogStudySessionDto, @Request() req) {
    return this.studySessionService.create(dto, req.user.userId, req.user.schoolId);
  }

  @Get('sessions')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT')
  findAllSessions(@Request() req, @Query() filters) {
    return this.studySessionService.findAll(req.user.userId, req.user.role, req.user.schoolId, filters);
  }

  @Get('sessions/stats')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT')
  getSessionStats(@Request() req, @Query() filters) {
    return this.studySessionService.getStats(req.user.userId, req.user.role, req.user.schoolId, filters);
  }

  @Get('sessions/:id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT')
  findOneSession(@Param('id') id: string, @Request() req) {
    return this.studySessionService.findOne(id, req.user.userId, req.user.role, req.user.schoolId);
  }

  @Delete('sessions/:id')
  @Roles('STUDENT')
  removeSession(@Param('id') id: string, @Request() req) {
    return this.studySessionService.remove(id, req.user.userId, req.user.schoolId);
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
    return this.studyRecommendationService.findAll(req.user.userId, req.user.role, req.user.schoolId);
  }

  @Post('recommendations/:id/apply')
  @Roles('STUDENT')
  applyRecommendation(@Param('id') id: string, @Request() req) {
    return this.studyRecommendationService.markAsApplied(id, req.user.userId, req.user.schoolId);
  }
}

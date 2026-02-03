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
import { GoalsService } from './goals.service';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateStudyGoalDto, UpdateStudyGoalDto, UpdateGoalProgressDto } from './dto';

@Controller('goals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GoalsController {
  constructor(
    private readonly goalsService: GoalsService,
    private readonly achievementsService: AchievementsService,
  ) {}

  // Study Goals
  @Post()
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  createGoal(@Body() dto: CreateStudyGoalDto, @Request() req) {
    return this.goalsService.create(dto, req.user.schoolId);
  }

  @Get()
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT')
  findAllGoals(@Request() req, @Query() filters) {
    return this.goalsService.findAll(req.user.id, req.user.role, req.user.schoolId, filters);
  }

  @Get(':id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT')
  findOneGoal(@Param('id') id: string, @Request() req) {
    return this.goalsService.findOne(id, req.user.id, req.user.role, req.user.schoolId);
  }

  @Patch(':id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  updateGoal(@Param('id') id: string, @Body() dto: UpdateStudyGoalDto, @Request() req) {
    return this.goalsService.update(id, dto, req.user.id, req.user.role, req.user.schoolId);
  }

  @Post(':id/progress')
  @Roles('STUDENT')
  updateProgress(@Param('id') id: string, @Body() dto: UpdateGoalProgressDto, @Request() req) {
    return this.goalsService.updateProgress(id, dto, req.user.id, req.user.schoolId);
  }

  @Delete(':id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  removeGoal(@Param('id') id: string, @Request() req) {
    return this.goalsService.remove(id, req.user.id, req.user.role, req.user.schoolId);
  }

  // Achievements
  @Get('achievements/all')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT', 'PARENT')
  findAllAchievements(@Request() req, @Query('category') category?: string) {
    return this.achievementsService.findAll(req.user.schoolId, category);
  }

  @Get('achievements/my')
  @Roles('STUDENT')
  findMyAchievements(@Request() req) {
    return this.achievementsService.findStudentAchievements(req.user.id, req.user.schoolId);
  }

  @Get('achievements/progress')
  @Roles('STUDENT')
  getAchievementProgress(@Request() req) {
    return this.achievementsService.getStudentProgress(req.user.id, req.user.schoolId);
  }
}

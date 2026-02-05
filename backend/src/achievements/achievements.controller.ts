import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AchievementsService } from './achievements.service';
import { AchievementCategory, ExamType } from '@prisma/client';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  async findAll(@Request() req, @Query('includeInactive') includeInactive?: string) {
    return this.achievementsService.findAll(
      req.user.schoolId,
      includeInactive === 'true',
    );
  }

  @Get('student/:studentId')
  async findStudentAchievements(@Param('studentId') studentId: string) {
    return this.achievementsService.findStudentAchievements(studentId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.achievementsService.findOneWithUnlockers(id, req.user.schoolId);
  }

  @Post()
  async create(
    @Body()
    data: {
      name: string;
      description: string;
      category: AchievementCategory;
      type: string;
      requirement: any;
      iconName: string;
      colorScheme: string;
      points?: number;
      examType?: ExamType;
    },
    @Request() req,
  ) {
    return this.achievementsService.create({
      ...data,
      schoolId: req.user.schoolId,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    data: Partial<{
      name: string;
      description: string;
      category: AchievementCategory;
      type: string;
      requirement: any;
      iconName: string;
      colorScheme: string;
      points: number;
      isActive: boolean;
      examType: ExamType;
    }>,
    @Request() req,
  ) {
    return this.achievementsService.update(id, req.user.schoolId, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.achievementsService.remove(id, req.user.schoolId);
  }

  @Post(':id/toggle')
  async toggleActive(@Param('id') id: string, @Request() req) {
    return this.achievementsService.toggleActive(id, req.user.schoolId);
  }

  @Post('seed')
  async seedDefault(@Request() req) {
    return this.achievementsService.seedDefaultAchievements(req.user.schoolId);
  }

  @Post('check-unlock')
  async checkUnlock(
    @Body() data: { studentId: string; achievementType: string },
  ) {
    return this.achievementsService.checkAndUnlock(
      data.studentId,
      data.achievementType,
    );
  }
}

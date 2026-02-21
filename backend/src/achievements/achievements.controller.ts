import {
  BadRequestException,
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
import { AchievementSeedBundle } from './achievement-seed-bundles';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  private parseBundle(bundle: string): AchievementSeedBundle {
    const allowed: AchievementSeedBundle[] = [
      'LGS',
      'TYT',
      'AYT',
      'CONSISTENCY',
    ];
    if (!allowed.includes(bundle as AchievementSeedBundle)) {
      throw new BadRequestException('Invalid bundle name');
    }
    return bundle as AchievementSeedBundle;
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('includeInactive') includeInactive?: string,
    @Query('examType') examType?: string,
  ) {
    const normalizedExamType = Object.values(ExamType).includes(
      examType as ExamType,
    )
      ? (examType as ExamType)
      : undefined;

    return this.achievementsService.findAll(
      req.user.schoolId,
      includeInactive === 'true',
      normalizedExamType,
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
    return this.achievementsService.seedAllBundles(req.user.schoolId);
  }

  @Post('seed-bundle')
  async seedBundle(@Body() data: { bundle: string }, @Request() req) {
    return this.achievementsService.seedAchievementBundle(
      req.user.schoolId,
      this.parseBundle(data.bundle),
    );
  }

  @Delete('seed-bundle/:bundle')
  async deleteBundle(@Param('bundle') bundle: string, @Request() req) {
    return this.achievementsService.deleteAchievementBundle(
      req.user.schoolId,
      this.parseBundle(bundle),
    );
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

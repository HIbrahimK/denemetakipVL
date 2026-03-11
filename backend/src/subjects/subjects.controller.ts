import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  SeedSubjectPresetDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  create(@Request() req, @Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto, req.user.schoolId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  findAll(
    @Request() req,
    @Query('examType') examType?: string,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    const gradeLevelNum = gradeLevel ? parseInt(gradeLevel) : undefined;
    return this.subjectsService.findAll(req.user.schoolId, examType, gradeLevelNum);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  findOne(@Request() req, @Param('id') id: string) {
    return this.subjectsService.findOne(id, req.user.schoolId);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(id, req.user.schoolId, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  remove(@Request() req, @Param('id') id: string) {
    return this.subjectsService.remove(id, req.user.schoolId);
  }

  // Topic endpoints
  @Post(':id/topics')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  createTopic(
    @Request() req,
    @Param('id') subjectId: string,
    @Body('name') name: string,
    @Body('parentTopicId') parentTopicId?: string,
    @Body('order') order?: number,
  ) {
    return this.subjectsService.createTopic(
      subjectId,
      req.user.schoolId,
      name,
      parentTopicId,
      order,
    );
  }

  @Get('topics/all')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  findTopics(
    @Request() req,
    @Query('subjectId') subjectId?: string,
    @Query('parentTopicId') parentTopicId?: string,
  ) {
    return this.subjectsService.findTopics(req.user.schoolId, subjectId, parentTopicId);
  }

  @Get('special-activities/all')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  findSpecialActivities(@Request() req) {
    return this.subjectsService.findSpecialActivities(req.user.schoolId);
  }

  @Patch('topics/:topicId')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  updateTopic(
    @Request() req,
    @Param('topicId') topicId: string,
    @Body('name') name: string,
    @Body('order') order?: number,
  ) {
    return this.subjectsService.updateTopic(topicId, req.user.schoolId, name, order);
  }

  @Delete('topics/:topicId')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  removeTopic(@Request() req, @Param('topicId') topicId: string) {
    return this.subjectsService.removeTopic(topicId, req.user.schoolId);
  }

  @Post('seed-preset')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  seedPreset(@Request() req, @Body() dto: SeedSubjectPresetDto) {
    return this.subjectsService.seedPreset(dto.preset, req.user.schoolId);
  }
}

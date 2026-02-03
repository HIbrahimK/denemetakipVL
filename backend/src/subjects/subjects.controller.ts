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
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(dto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  findAll(
    @Query('examType') examType?: string,
    @Query('gradeLevel') gradeLevel?: string,
  ) {
    const gradeLevelNum = gradeLevel ? parseInt(gradeLevel) : undefined;
    return this.subjectsService.findAll(examType, gradeLevelNum);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }

  // Topic endpoints
  @Post(':id/topics')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  createTopic(
    @Param('id') subjectId: string,
    @Body('name') name: string,
    @Body('parentTopicId') parentTopicId?: string,
    @Body('order') order?: number,
  ) {
    return this.subjectsService.createTopic(subjectId, name, parentTopicId, order);
  }

  @Get('topics/all')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  findTopics(
    @Query('subjectId') subjectId?: string,
    @Query('parentTopicId') parentTopicId?: string,
  ) {
    return this.subjectsService.findTopics(subjectId, parentTopicId);
  }

  @Get('special-activities/all')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  findSpecialActivities() {
    return this.subjectsService.findSpecialActivities();
  }

  @Patch('topics/:topicId')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  updateTopic(
    @Param('topicId') topicId: string,
    @Body('name') name: string,
    @Body('order') order?: number,
  ) {
    return this.subjectsService.updateTopic(topicId, name, order);
  }

  @Delete('topics/:topicId')
  @Roles('SUPER_ADMIN', 'SCHOOL_ADMIN')
  removeTopic(@Param('topicId') topicId: string) {
    return this.subjectsService.removeTopic(topicId);
  }
}

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
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateMentorGroupDto, UpdateMentorGroupDto, AddGroupMemberDto, CreateGroupGoalDto } from './dto';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  createGroup(@Body() dto: CreateMentorGroupDto, @Request() req) {
    console.log('POST /groups - User:', req.user, 'DTO:', dto);
    return this.groupsService.create(dto, req.user.id, req.user.schoolId);
  }

  @Get()
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  findAllGroups(@Request() req) {
    return this.groupsService.findAll(req.user.id, req.user.role, req.user.schoolId);
  }

  @Get(':id')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  findOneGroup(@Param('id') id: string, @Request() req) {
    return this.groupsService.findOne(id, req.user.id, req.user.schoolId);
  }

  @Patch(':id')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  updateGroup(@Param('id') id: string, @Body() dto: UpdateMentorGroupDto, @Request() req) {
    return this.groupsService.update(id, dto, req.user.id, req.user.schoolId);
  }

  @Delete(':id')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  removeGroup(@Param('id') id: string, @Request() req) {
    return this.groupsService.remove(id, req.user.id, req.user.schoolId);
  }

  @Post(':id/members')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  addMember(@Param('id') id: string, @Body() dto: AddGroupMemberDto, @Request() req) {
    return this.groupsService.addMember(id, dto, req.user.id, req.user.schoolId);
  }

  @Delete(':id/members/:studentId')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  removeMember(@Param('id') id: string, @Param('studentId') studentId: string, @Request() req) {
    return this.groupsService.removeMember(id, studentId, req.user.id, req.user.schoolId);
  }

  @Post(':id/goals')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  createGroupGoal(@Param('id') id: string, @Body() dto: CreateGroupGoalDto, @Request() req) {
    return this.groupsService.createGroupGoal(id, dto, req.user.id, req.user.schoolId);
  }

  @Get(':id/stats')
  @Roles('TEACHER', 'SCHOOL_ADMIN', 'STUDENT')
  getGroupStats(@Param('id') id: string, @Request() req) {
    return this.groupsService.getGroupStats(id, req.user.id, req.user.schoolId);
  }
}

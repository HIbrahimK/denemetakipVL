import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ParentsService } from './parents.service';

@Controller('parents')
export class ParentsController {
  constructor(private parentsService: ParentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/students')
  async getMyStudents(@Request() req) {
    return this.parentsService.getParentStudents(req.user.id);
  }
}

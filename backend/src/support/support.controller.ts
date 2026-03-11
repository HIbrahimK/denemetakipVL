import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { CreateSupportTicketReplyDto } from './dto/create-support-ticket-reply.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';

@Controller('support')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @Roles('SCHOOL_ADMIN')
  createTicket(
    @Body() dto: CreateSupportTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.supportService.createTicket(dto, user);
  }

  @Get('tickets/my-school')
  @Roles('SCHOOL_ADMIN')
  getSchoolTickets(@CurrentUser() user: any) {
    return this.supportService.getSchoolTickets(user);
  }

  @Get('tickets/admin')
  @Roles('SUPER_ADMIN')
  getAdminTickets(@Query('status') status?: string) {
    return this.supportService.getAdminTickets(status);
  }

  @Get('tickets/:id')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.supportService.findOne(id, user);
  }

  @Post('tickets/:id/replies')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  addReply(
    @Param('id') id: string,
    @Body() dto: CreateSupportTicketReplyDto,
    @CurrentUser() user: any,
  ) {
    return this.supportService.addReply(id, dto, user);
  }

  @Patch('tickets/:id/status')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSupportTicketStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.supportService.updateStatus(id, dto, user);
  }
}
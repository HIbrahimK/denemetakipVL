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
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact.dto';
import { CreateDemoRequestDto } from './dto/create-demo-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller()
export class ContactController {
  constructor(private contactService: ContactService) {}

  // ==========================================
  // Public Endpoints
  // ==========================================

  @Post('contact')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // Max 5 per minute
  async submitContactForm(@Body() dto: CreateContactMessageDto) {
    const message = await this.contactService.createContactMessage(dto);
    return {
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapılacaktır.',
      id: message.id,
    };
  }

  @Post('demo-requests')
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // Max 3 per minute
  async submitDemoRequest(@Body() dto: CreateDemoRequestDto) {
    const request = await this.contactService.createDemoRequest(dto);
    return {
      success: true,
      message: 'Demo başvurunuz alındı. 24 saat içinde sizinle iletişime geçilecektir.',
      id: request.id,
    };
  }

  // ==========================================
  // Super Admin Endpoints
  // ==========================================

  @Get('admin/contact')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getContactMessages(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.contactService.getAllContactMessages({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }

  @Patch('admin/contact/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async updateContactStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.contactService.updateContactMessageStatus(id, status);
  }

  @Delete('admin/contact/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async deleteContact(@Param('id') id: string) {
    return this.contactService.deleteContactMessage(id);
  }

  @Get('admin/demo-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getDemoRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.contactService.getAllDemoRequests({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }

  @Patch('admin/demo-requests/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async updateDemoRequestStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.contactService.updateDemoRequestStatus(id, status);
  }

  @Delete('admin/demo-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async deleteDemoRequest(@Param('id') id: string) {
    return this.contactService.deleteDemoRequest(id);
  }

  @Get('admin/contact-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  async getStats() {
    return this.contactService.getStats();
  }
}

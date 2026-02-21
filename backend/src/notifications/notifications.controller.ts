import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SubscribePushDto } from './dto/subscribe-push.dto';
import { UnsubscribePushDto } from './dto/unsubscribe-push.dto';
import { UpdateUserNotificationSettingsDto } from './dto/update-user-notification-settings.dto';
import { CreateNotificationCampaignDto } from './dto/create-notification-campaign.dto';
import { UpdateNotificationCampaignDto } from './dto/update-notification-campaign.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('public-key')
  getPublicKey() {
    return this.notificationsService.getPublicKey();
  }

  @Post('subscribe')
  subscribe(@Request() req, @Body() dto: SubscribePushDto) {
    return this.notificationsService.subscribe(req.user.id, req.user.schoolId, dto);
  }

  @Post('unsubscribe')
  unsubscribe(@Request() req, @Body() dto: UnsubscribePushDto) {
    return this.notificationsService.unsubscribe(req.user.id, dto);
  }

  @Get('my-settings')
  getMySettings(@Request() req) {
    return this.notificationsService.getMySettings(req.user.id, req.user.schoolId);
  }

  @Patch('my-settings')
  updateMySettings(
    @Request() req,
    @Body() dto: UpdateUserNotificationSettingsDto,
  ) {
    return this.notificationsService.updateMySettings(
      req.user.id,
      req.user.schoolId,
      dto,
    );
  }

  @Get('my-deliveries')
  getMyDeliveries(@Request() req) {
    return this.notificationsService.listMyDeliveries(
      req.user.id,
      req.user.schoolId,
    );
  }

  @Get('campaigns')
  @UseGuards(RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  listCampaigns(@Request() req) {
    return this.notificationsService.listCampaigns(req.user.schoolId);
  }

  @Post('campaigns')
  @UseGuards(RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  createCampaign(@Request() req, @Body() dto: CreateNotificationCampaignDto) {
    return this.notificationsService.createCampaign(
      dto,
      req.user.id,
      req.user.schoolId,
    );
  }

  @Patch('campaigns/:id')
  @UseGuards(RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  updateCampaign(
    @Request() req,
    @Param('id') campaignId: string,
    @Body() dto: UpdateNotificationCampaignDto,
  ) {
    return this.notificationsService.updateCampaign(
      campaignId,
      req.user.schoolId,
      dto,
    );
  }

  @Post('campaigns/:id/send-now')
  @UseGuards(RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  sendNow(@Request() req, @Param('id') campaignId: string) {
    return this.notificationsService.sendCampaignNow(
      campaignId,
      req.user.schoolId,
    );
  }

  @Post('campaigns/:id/cancel')
  @UseGuards(RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  cancelCampaign(@Request() req, @Param('id') campaignId: string) {
    return this.notificationsService.cancelCampaign(campaignId, req.user.schoolId);
  }

  @Delete('campaigns/:id')
  @UseGuards(RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  deleteCampaign(@Request() req, @Param('id') campaignId: string) {
    return this.notificationsService.deleteCampaign(campaignId, req.user.schoolId);
  }

  @Get('campaigns/:id/deliveries')
  @UseGuards(RolesGuard)
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  getDeliveries(@Request() req, @Param('id') campaignId: string) {
    return this.notificationsService.getCampaignDeliveries(
      campaignId,
      req.user.schoolId,
    );
  }
}


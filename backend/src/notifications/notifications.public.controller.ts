import { Controller, Get, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsPublicController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('home-feed')
  getHomeFeed(
    @Query('host') host: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = Number(limit);
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(12, parsedLimit))
      : 4;

    return this.notificationsService.getHomepageFeedByHost(host, safeLimit);
  }
}

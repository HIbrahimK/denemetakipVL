import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationCampaignDto } from './create-notification-campaign.dto';

export class UpdateNotificationCampaignDto extends PartialType(
  CreateNotificationCampaignDto,
) {}


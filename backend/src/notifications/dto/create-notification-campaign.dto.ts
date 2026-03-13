import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { NotificationTargetType, NotificationType, Role } from '@prisma/client';

export const HOMEPAGE_SECTION_VALUES = ['NONE', 'ANNOUNCEMENT', 'UPDATE'] as const;
export type HomepageSection = (typeof HOMEPAGE_SECTION_VALUES)[number];

export class CreateNotificationCampaignDto {
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsEnum(NotificationTargetType)
  @IsOptional()
  targetType?: NotificationTargetType;

  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  targetRoles?: Role[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetIds?: string[];

  @IsString()
  @MaxLength(120)
  title: string;

  @IsString()
  @MaxLength(4000)
  body: string;

  @IsString()
  @IsOptional()
  deeplink?: string;

  @IsDateString()
  @IsOptional()
  scheduledFor?: string;

  @IsIn(HOMEPAGE_SECTION_VALUES)
  @IsOptional()
  homepageSection?: HomepageSection;

  @IsDateString()
  @IsOptional()
  homepagePublishAt?: string;

  @IsBoolean()
  @IsOptional()
  sendNow?: boolean;
}


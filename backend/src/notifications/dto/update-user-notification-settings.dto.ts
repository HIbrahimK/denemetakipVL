import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserNotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  newMessage?: boolean;

  @IsBoolean()
  @IsOptional()
  examReminder?: boolean;

  @IsBoolean()
  @IsOptional()
  groupPost?: boolean;

  @IsBoolean()
  @IsOptional()
  achievementUnlocked?: boolean;

  @IsBoolean()
  @IsOptional()
  studyPlanAssigned?: boolean;

  @IsBoolean()
  @IsOptional()
  customNotification?: boolean;
}


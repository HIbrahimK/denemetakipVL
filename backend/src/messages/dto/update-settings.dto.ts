import { IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsInt()
  @Min(100)
  @IsOptional()
  maxCharacterLimit?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  autoDeleteDays?: number;

  @IsBoolean()
  @IsOptional()
  requireTeacherApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  enableEmailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  enablePushNotifications?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  reminderAfterDays?: number;
}

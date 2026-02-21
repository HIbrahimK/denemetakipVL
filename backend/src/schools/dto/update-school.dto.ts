import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class UpdateSchoolDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  appShortName?: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/i, {
    message: 'subdomainAlias sadece harf, rakam ve tire icerebilir',
  })
  @IsOptional()
  subdomainAlias?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  isParentLoginActive?: boolean;

  @IsString()
  @IsOptional()
  studentLoginType?: string;

  @IsBoolean()
  @IsOptional()
  autoCleanupEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNewMessageEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushExamReminderEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushGroupPostEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushAchievementEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushStudyPlanEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushCustomEnabled?: boolean;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  cleanupMonthsToKeep?: number;
}

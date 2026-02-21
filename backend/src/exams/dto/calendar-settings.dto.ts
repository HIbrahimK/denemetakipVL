import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export class ExamCalendarSettingsDto {
  @IsOptional()
  @IsBoolean()
  showPublisher?: boolean;

  @IsOptional()
  @IsBoolean()
  showBroughtBy?: boolean;

  @IsOptional()
  @IsBoolean()
  showFee?: boolean;

  @IsOptional()
  @IsBoolean()
  showParticipantCounts?: boolean;

  @IsOptional()
  @IsInt()
  notifyDaysBefore?: number;

  @IsOptional()
  @IsInt()
  autoPublishDaysAfter?: number;

  @IsOptional()
  @IsString()
  @IsEnum(['table', 'calendar', 'timeline'])
  defaultView?: string;

  @IsOptional()
  @IsInt()
  academicYearStart?: number;
}

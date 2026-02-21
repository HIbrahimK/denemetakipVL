import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { StudyPlanTargetType, ExamType, StudyPlanStatus } from '@prisma/client';

export class CreateStudyPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ExamType)
  @IsOptional()
  examType?: ExamType;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  gradeLevels?: number[];

  @IsEnum(StudyPlanTargetType)
  @IsOptional()
  targetType?: StudyPlanTargetType;

  @IsString()
  @IsOptional()
  targetId?: string;

  @IsDateString()
  @IsOptional()
  weekStartDate?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsOptional()
  planData?: any; // JSON data for plan structure

  @IsEnum(StudyPlanStatus)
  @IsOptional()
  status?: StudyPlanStatus;

  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean;

  @IsString()
  @IsOptional()
  templateName?: string;

  @IsBoolean()
  @IsOptional()
  isShared?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

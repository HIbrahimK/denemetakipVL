import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsInt, IsBoolean } from 'class-validator';
import { StudyPlanTargetType } from '@prisma/client';

export class CreateStudyPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(StudyPlanTargetType)
  targetType: StudyPlanTargetType;

  @IsString()
  @IsOptional()
  targetId?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isTemplate?: boolean;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

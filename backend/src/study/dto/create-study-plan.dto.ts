import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsInt, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { StudyPlanTargetType } from '@prisma/client';
import { Type } from 'class-transformer';

class CreateStudyTaskInPlanDto {
  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @IsString()
  @IsOptional()
  topicId?: string;

  @IsInt()
  questionCount: number;

  @IsDateString()
  date: string;
}

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudyTaskInPlanDto)
  @IsOptional()
  tasks?: CreateStudyTaskInPlanDto[];
}

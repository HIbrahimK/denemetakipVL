import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDateString, IsNumber, Min, IsObject } from 'class-validator';
import { StudyGoalType } from '@prisma/client';

export class CreateStudyGoalDto {
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsNotEmpty()
  @IsEnum(StudyGoalType)
  type: StudyGoalType;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsObject()
  targetData: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetValue?: number;

  @IsOptional()
  @IsString()
  targetUnit?: string;

  @IsNotEmpty()
  @IsDateString()
  targetDate: string;

  @IsOptional()
  @IsString()
  topicId?: string;
}

import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { StudyTaskStatus } from '@prisma/client';

export class CreateStudyTaskDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  // Hücre konumu
  @IsInt()
  @Min(0)
  rowIndex: number;

  @IsInt()
  @Min(0)
  @Max(6)
  dayIndex: number; // 0=Pzt, 1=Sal, ..., 6=Paz

  // Öğretmen ataması
  @IsString()
  @IsOptional()
  subjectName?: string;

  @IsString()
  @IsOptional()
  topicName?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  targetQuestionCount?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  targetDuration?: number; // dakika

  @IsString()
  @IsOptional()
  targetResource?: string;

  @IsEnum(StudyTaskStatus)
  @IsOptional()
  status?: StudyTaskStatus;
}

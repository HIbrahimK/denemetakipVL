import { IsString, IsNotEmpty, IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateStudyTaskDto {
  @IsString()
  @IsOptional()
  planId?: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @IsString()
  @IsOptional()
  topicId?: string;

  @IsInt()
  @Min(1)
  questionCount: number;

  @IsString()
  @IsOptional()
  resourceReference?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  estimatedTime?: number;
}

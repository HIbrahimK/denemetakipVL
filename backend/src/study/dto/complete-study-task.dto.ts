import { IsInt, IsOptional, Min, IsString } from 'class-validator';

export class CompleteStudyTaskDto {
  @IsInt()
  @Min(0)
  completedQuestionCount: number;

  @IsInt()
  @Min(0)
  correctCount: number;

  @IsInt()
  @Min(0)
  wrongCount: number;

  @IsInt()
  @Min(0)
  blankCount: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  actualDuration?: number; // dakika

  @IsString()
  @IsOptional()
  actualResource?: string;

  @IsString()
  @IsOptional()
  studentNotes?: string;
}

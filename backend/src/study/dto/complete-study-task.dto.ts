import { IsInt, IsOptional, Min, Max, IsString } from 'class-validator';

export class CompleteStudyTaskDto {
  @IsInt()
  @Min(0)
  completedQuestions: number;

  @IsInt()
  @Min(0)
  correctAnswers: number;

  @IsInt()
  @Min(0)
  wrongAnswers: number;

  @IsInt()
  @Min(0)
  blankAnswers: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  timeSpent?: number;
}

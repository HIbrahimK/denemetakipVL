import { PartialType } from '@nestjs/mapped-types';
import { CreateStudyGoalDto } from './create-study-goal.dto';
import { IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdateStudyGoalDto extends PartialType(CreateStudyGoalDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentValue?: number;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

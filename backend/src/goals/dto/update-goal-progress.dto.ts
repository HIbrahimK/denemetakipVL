import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateGoalProgressDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  currentValue: number;
}

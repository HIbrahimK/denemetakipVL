import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateGroupGoalDto {
  @IsNotEmpty()
  @IsString()
  goalType: string;

  @IsNotEmpty()
  @IsObject()
  targetData: any;

  @IsOptional()
  @IsString()
  deadline?: string;
}

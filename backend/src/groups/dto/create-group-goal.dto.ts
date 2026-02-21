import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
} from 'class-validator';

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

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

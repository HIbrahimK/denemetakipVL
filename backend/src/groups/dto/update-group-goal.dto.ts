import {
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class UpdateGroupGoalDto {
  @IsOptional()
  @IsString()
  goalType?: string;

  @IsOptional()
  @IsObject()
  targetData?: any;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

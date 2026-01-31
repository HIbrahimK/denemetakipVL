import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateMentorGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  gradeIds?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];
}

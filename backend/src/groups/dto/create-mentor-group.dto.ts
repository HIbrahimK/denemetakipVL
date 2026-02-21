import { IsNotEmpty, IsString, IsOptional, IsArray, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateMentorGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  gradeIds?: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudents?: number;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teacherIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];
}

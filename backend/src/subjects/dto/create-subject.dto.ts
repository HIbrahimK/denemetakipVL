import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ExamType } from '@prisma/client';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsEnum(ExamType)
  examType: ExamType;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  gradeLevels?: number[];

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

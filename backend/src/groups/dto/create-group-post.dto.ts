import { IsEnum, IsOptional, IsString, IsNumber, IsObject } from 'class-validator';
import { GroupPostType } from '@prisma/client';

export class CreateGroupPostDto {
  @IsEnum(GroupPostType)
  type: GroupPostType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  goalId?: string;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

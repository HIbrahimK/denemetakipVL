import { IsString, IsOptional, IsEnum, MaxLength, IsBoolean } from 'class-validator';
import { MessageCategory } from '@prisma/client';

export class SaveDraftDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  body?: string;

  @IsEnum(MessageCategory)
  @IsOptional()
  category?: MessageCategory;

  @IsOptional()
  targetRoles?: string[];

  @IsString()
  @IsOptional()
  targetGradeId?: string;

  @IsString()
  @IsOptional()
  targetClassId?: string;

  @IsOptional()
  recipientIds?: string[];

  @IsBoolean()
  @IsOptional()
  allowReplies?: boolean;
}

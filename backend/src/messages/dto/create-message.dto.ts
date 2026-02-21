import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsDateString,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { MessageCategory, MessageType } from '@prisma/client';

export class CreateMessageDto {
  @IsString()
  @MaxLength(200)
  subject: string;

  @IsString()
  @MaxLength(1000)
  body: string;

  @IsEnum(MessageCategory)
  @IsOptional()
  category?: MessageCategory;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  // For direct messages
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  recipientIds?: string[];

  // For broadcast messages
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetRoles?: string[];

  @IsString()
  @IsOptional()
  targetGradeId?: string;

  @IsString()
  @IsOptional()
  targetClassId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetClassIds?: string[];

  // For attachments
  @IsArray()
  @IsOptional()
  attachments?: Array<{
    filename: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;

  // For scheduling
  @IsDateString()
  @IsOptional()
  scheduledFor?: string;

  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @IsBoolean()
  @IsOptional()
  allowReplies?: boolean;
}

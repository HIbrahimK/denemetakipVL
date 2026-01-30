import { IsString, IsEnum, MaxLength } from 'class-validator';
import { MessageCategory } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(200)
  subject: string;

  @IsString()
  @MaxLength(1000)
  body: string;

  @IsEnum(MessageCategory)
  category: MessageCategory;
}

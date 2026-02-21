import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ExamType } from '@prisma/client';

export class CreateExamDto {
  @IsString()
  title: string;

  @IsEnum(ExamType)
  type: ExamType;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString()
  date?: string;

  @IsInt()
  gradeLevel: number; // Artık zorunlu - her deneme tek bir sınıfa ait

  // Takvim bilgileri
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString()
  scheduledDateTime?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString()
  applicationDateTime?: string;

  @IsOptional()
  @IsString()
  broughtBy?: string;

  @IsOptional()
  @IsInt()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  // Görünürlük ayarları
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublisherVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isAnswerKeyPublic?: boolean;

  // Katılım sayıları
  @IsOptional()
  @IsInt()
  participantCount?: number;

  @IsOptional()
  @IsInt()
  districtParticipantCount?: number;

  @IsOptional()
  @IsInt()
  cityParticipantCount?: number;

  @IsOptional()
  @IsInt()
  generalParticipantCount?: number;

  @IsOptional()
  @IsString()
  generalInfo?: string;

  @IsString()
  schoolId: string;
}

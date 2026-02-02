import { IsArray, IsString, IsOptional, IsInt, ValidateNested, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

// Assignment target type enum - Prisma schema ile aynı
export enum AssignmentTargetType {
  STUDENT = 'STUDENT',
  GROUP = 'GROUP',
  GRADE = 'GRADE',
  CLASS = 'CLASS',
}

// Tek bir hedef tanımı
export class AssignmentTargetDto {
  @IsEnum(AssignmentTargetType)
  type: AssignmentTargetType;

  @IsString()
  id: string;

  @IsOptional()
  customPlanData?: any; // Öğrenciye özel düzenlenmiş plan verisi
}

export class AssignStudyPlanDto {
  // Hedefler - yeni yapı
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentTargetDto)
  @IsOptional()
  targets?: AssignmentTargetDto[];

  // Eski yapı - geriye uyumluluk için
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  studentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  groupIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  classIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gradeIds?: string[];

  // Tarih bilgisi
  @IsInt()
  @IsOptional()
  year?: number;

  @IsInt()
  @IsOptional()
  month?: number; // 1-12

  @IsInt()
  @IsOptional()
  weekNumber?: number; // 1-5

  // Öğrenciye özel düzenlemeler
  @IsObject()
  @IsOptional()
  customizations?: Record<string, any>; // { [targetId]: planDataOverride }
}

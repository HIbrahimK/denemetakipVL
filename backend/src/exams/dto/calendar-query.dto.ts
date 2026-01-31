import { IsOptional, IsInt, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ExamType } from '@prisma/client';

export class CalendarQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    year?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    month?: number; // 1-12

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    gradeLevel?: number; // Filtreleme için

    @IsOptional()
    @IsEnum(ExamType)
    type?: ExamType;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    includeArchived?: boolean;
}

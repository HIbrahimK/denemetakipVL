import { IsEnum, IsInt, IsOptional, IsString, IsDateString } from 'class-validator';
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
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsInt()
    gradeLevel?: number;

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

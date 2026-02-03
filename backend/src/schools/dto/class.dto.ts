import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, IsInt } from 'class-validator';

export class CreateClassDto {
    // Yeni format: gradeLevel ve section
    @IsOptional()
    @IsInt()
    gradeLevel?: number;

    @IsOptional()
    @IsString()
    section?: string;

    // Eski format: name ve gradeId (geriye dönük uyumluluk için)
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    gradeId?: string;
}

export class UpdateClassDto {
    // Yeni format: gradeLevel ve section
    @IsOptional()
    @IsInt()
    gradeLevel?: number;

    @IsOptional()
    @IsString()
    section?: string;

    // Eski format: name ve gradeId (geriye dönük uyumluluk için)
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    gradeId?: string;
}

export class MergeClassesDto {
    @IsNotEmpty()
    @IsString()
    sourceClassId: string;

    @IsNotEmpty()
    @IsString()
    targetClassId: string;
}

export class TransferStudentsDto {
    @IsNotEmpty()
    @IsString()
    targetClassId: string;

    @IsOptional()
    @IsArray()
    studentIds?: string[]; // Boşsa tüm öğrenciler aktarılır
}

import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateClassDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    gradeId: string;
}

export class UpdateClassDto {
    @IsString()
    name?: string;

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
    @IsString({ each: true })
    studentIds?: string[]; // Boşsa tüm öğrenciler aktarılır
}

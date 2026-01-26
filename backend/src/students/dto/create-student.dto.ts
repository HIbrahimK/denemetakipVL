import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    studentNumber?: string;

    @IsString()
    @IsOptional()
    tcNo?: string;

    @IsString()
    @IsNotEmpty()
    gradeName: string; // e.g., "9"

    @IsString()
    @IsNotEmpty()
    className: string; // e.g., "A"

    @IsString()
    @IsOptional()
    password?: string;
}

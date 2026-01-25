import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class StudentLoginDto {
    @IsNotEmpty()
    @IsString()
    studentNumber: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(4)
    password: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    @IsEnum(Role)
    role: Role;

    @IsNotEmpty()
    @IsString()
    schoolId: string;

    @IsOptional()
    @IsString()
    classId?: string;

    @IsOptional()
    @IsString()
    studentNumber?: string;

    @IsOptional()
    @IsString()
    tcNo?: string;
}

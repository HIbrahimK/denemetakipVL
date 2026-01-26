import { IsString, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class UpdateSchoolDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsBoolean()
    @IsOptional()
    isParentLoginActive?: boolean;

    @IsString()
    @IsOptional()
    studentLoginType?: string;
}

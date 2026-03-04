import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  Matches,
  MinLength,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/i, {
    message: 'Okul kodu sadece harf, rakam ve tire içerebilir',
  })
  code: string;

  @IsString()
  @IsOptional()
  appShortName?: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/i, {
    message: 'Subdomain sadece harf, rakam ve tire içerebilir',
  })
  @IsOptional()
  subdomainAlias?: string;

  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  website?: string;

  // Admin user info
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @IsString()
  @IsNotEmpty()
  adminFirstName: string;

  @IsString()
  @IsNotEmpty()
  adminLastName: string;

  @IsString()
  @MinLength(4)
  @IsNotEmpty()
  adminPassword: string;

  // License info
  @IsString()
  @IsOptional()
  licensePlanId?: string;

  @IsDateString()
  @IsOptional()
  licenseStartDate?: string;

  @IsDateString()
  @IsOptional()
  licenseEndDate?: string;

  @IsBoolean()
  @IsOptional()
  licenseAutoRenew?: boolean;
}

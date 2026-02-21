import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsInt,
  Min,
  Max,
} from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  autoCleanupEnabled?: boolean;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  cleanupMonthsToKeep?: number;
}

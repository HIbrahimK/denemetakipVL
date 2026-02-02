import { IsBoolean, IsString, IsOptional, IsEnum } from 'class-validator';

export enum VerificationType {
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
}

export class VerifyStudyTaskDto {
  @IsEnum(VerificationType)
  verificationType: VerificationType;

  @IsBoolean()
  approved: boolean;

  @IsString()
  @IsOptional()
  comment?: string;
}

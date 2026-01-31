import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class VerifyStudyTaskDto {
  @IsBoolean()
  verified: boolean;

  @IsString()
  @IsOptional()
  comment?: string;
}

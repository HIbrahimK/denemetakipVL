import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  body?: string;
}

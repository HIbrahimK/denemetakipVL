import { IsString, IsOptional } from 'class-validator';

export class ApproveTaskDto {
  @IsOptional()
  @IsString()
  comment?: string;
}

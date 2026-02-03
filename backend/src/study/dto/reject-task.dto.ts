import { IsString, IsNotEmpty } from 'class-validator';

export class RejectTaskDto {
  @IsString()
  @IsNotEmpty()
  comment: string;
}

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSupportTicketReplyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message: string;
}
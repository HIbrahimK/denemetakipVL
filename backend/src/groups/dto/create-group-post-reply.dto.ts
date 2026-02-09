import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupPostReplyDto {
  @IsNotEmpty()
  @IsString()
  body: string;
}

import { IsString } from 'class-validator';

export class UpdateGroupPostReplyDto {
  @IsString()
  body: string;
}

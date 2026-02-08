import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupPostResponseDto {
  @IsNotEmpty()
  @IsString()
  selectedOption: string;
}

import { IsString, IsOptional } from 'class-validator';

export class UpdateAvatarDto {
  @IsString()
  avatarSeed: string;
}

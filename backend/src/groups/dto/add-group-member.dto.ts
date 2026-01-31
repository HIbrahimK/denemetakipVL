import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { GroupMemberRole } from '@prisma/client';

export class AddGroupMemberDto {
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsNotEmpty()
  @IsEnum(GroupMemberRole)
  role: GroupMemberRole;
}

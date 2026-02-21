import { IsArray, IsString } from 'class-validator';

export class ManageGroupTeachersDto {
  @IsArray()
  @IsString({ each: true })
  teacherIds: string[];
}

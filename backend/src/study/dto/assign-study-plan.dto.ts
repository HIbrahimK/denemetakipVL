import { IsArray, IsString } from 'class-validator';

export class AssignStudyPlanDto {
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];

  @IsArray()
  @IsString({ each: true })
  classIds?: string[];
}

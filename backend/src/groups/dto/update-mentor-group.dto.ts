import { PartialType } from '@nestjs/mapped-types';
import { CreateMentorGroupDto } from './create-mentor-group.dto';

export class UpdateMentorGroupDto extends PartialType(CreateMentorGroupDto) {}

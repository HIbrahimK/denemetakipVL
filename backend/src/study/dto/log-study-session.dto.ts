import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class LogStudySessionDto {
  @IsString()
  @IsOptional()
  taskId?: string;

  @IsString()
  @IsNotEmpty()
  subjectName: string;

  @IsString()
  @IsOptional()
  topicId?: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @Min(1)
  duration: number; // in seconds

  @IsBoolean()
  @IsOptional()
  isPomodoroMode?: boolean;
}

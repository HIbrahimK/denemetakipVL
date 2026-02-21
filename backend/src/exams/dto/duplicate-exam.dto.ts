import { IsArray, IsInt } from 'class-validator';

export class DuplicateExamDto {
  @IsArray()
  @IsInt({ each: true })
  gradeLevels: number[]; // Hangi sınıflara kopyalanacak (örn: [7, 8])
}

import { IsString, IsOptional, IsArray, IsIn, MinLength } from 'class-validator';

export class CreateBlogPostDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsString()
  author: string;
}

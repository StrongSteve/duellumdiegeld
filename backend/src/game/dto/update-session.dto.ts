import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  currentState?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  usedQuestions?: string[];
}

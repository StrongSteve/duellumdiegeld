import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayMinSize,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Category, QuestionStatus } from '@prisma/client';

export class ImportHintDto {
  @IsNumber()
  orderIndex: number;

  @IsString()
  @IsNotEmpty()
  hintText: string;
}

export class ImportQuestionItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Fragetext ist erforderlich' })
  questionText: string;

  @IsEnum(Category)
  category: Category;

  @IsNumber()
  answerValue: number;

  @IsString()
  @IsOptional()
  answerUnit?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsString()
  @IsOptional()
  contributorName?: string;

  @IsEnum(QuestionStatus)
  @IsOptional()
  status?: QuestionStatus;

  @IsArray()
  @ArrayMinSize(1, { message: 'Mindestens ein Hinweis ist erforderlich' })
  @ValidateNested({ each: true })
  @Type(() => ImportHintDto)
  hints: ImportHintDto[];
}

export class ImportQuestionsDto {
  @IsString()
  @IsOptional()
  exportedAt?: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Mindestens eine Frage ist erforderlich' })
  @ValidateNested({ each: true })
  @Type(() => ImportQuestionItemDto)
  questions: ImportQuestionItemDto[];
}

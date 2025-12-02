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

export enum Category {
  SCIENCE = 'SCIENCE',
  HISTORY = 'HISTORY',
  GEOGRAPHY = 'GEOGRAPHY',
  SPORTS = 'SPORTS',
  TECHNOLOGY = 'TECHNOLOGY',
  POP_CULTURE = 'POP_CULTURE',
  MISC = 'MISC',
}

export class UpdateHintDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'Hinweistext ist erforderlich' })
  hintText: string;
}

export class UpdateQuestionDto {
  @IsEnum(Category, { message: 'Ungültige Kategorie' })
  @IsOptional()
  category?: Category;

  @IsString()
  @IsNotEmpty({ message: 'Fragetext ist erforderlich' })
  @IsOptional()
  questionText?: string;

  @IsNumber({}, { message: 'Antwort muss eine Zahl sein' })
  @IsOptional()
  answerValue?: number;

  @IsString()
  @IsOptional()
  answerUnit?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Genau zwei Hinweise sind erforderlich' })
  @ValidateNested({ each: true })
  @Type(() => UpdateHintDto)
  @IsOptional()
  hints?: UpdateHintDto[];

  @IsString()
  @IsOptional()
  contributorName?: string;
}

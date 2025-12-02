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

export class HintDto {
  @IsString()
  @IsNotEmpty({ message: 'Hinweistext ist erforderlich' })
  hintText: string;
}

export class SubmitQuestionDto {
  @IsEnum(Category, { message: 'Ungültige Kategorie' })
  category: Category;

  @IsString()
  @IsNotEmpty({ message: 'Fragetext ist erforderlich' })
  questionText: string;

  @IsNumber({}, { message: 'Antwort muss eine Zahl sein' })
  answerValue: number;

  @IsString()
  @IsOptional()
  answerUnit?: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsString()
  @IsNotEmpty({ message: 'Quell-URL ist erforderlich' })
  sourceUrl: string;

  @IsArray()
  @ArrayMinSize(2, { message: 'Genau zwei Hinweise sind erforderlich' })
  @ValidateNested({ each: true })
  @Type(() => HintDto)
  hints: HintDto[];

  @IsString()
  @IsOptional()
  contributorName?: string;

  @IsString()
  @IsNotEmpty({ message: 'CAPTCHA-Token ist erforderlich' })
  captchaToken: string;
}

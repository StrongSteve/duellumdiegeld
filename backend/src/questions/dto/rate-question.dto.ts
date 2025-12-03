import { IsString, IsInt, Min, Max } from 'class-validator';

export class RateQuestionDto {
  @IsString()
  questionId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

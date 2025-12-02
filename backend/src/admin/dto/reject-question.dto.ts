import { IsString, IsOptional } from 'class-validator';

export class RejectQuestionDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

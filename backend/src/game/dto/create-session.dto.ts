import { IsNumber, IsOptional, IsArray, IsString, Min, Max, ArrayMinSize } from 'class-validator';

export class CreateSessionDto {
  @IsNumber()
  @Min(2, { message: 'Mindestens 2 Spieler erforderlich' })
  @Max(8, { message: 'Maximal 8 Spieler erlaubt' })
  playerCount: number;

  @IsArray()
  @ArrayMinSize(2, { message: 'Mindestens 2 Spielernamen erforderlich' })
  @IsString({ each: true })
  playerNames: string[];

  @IsNumber()
  @IsOptional()
  @Min(100, { message: 'Startgeld muss mindestens 100 sein' })
  startingMoney?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  timerDuration?: number; // in Sekunden, 0 = kein Timer
}

import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [QuestionsModule],
  providers: [GameService],
  controllers: [GameController],
})
export class GameModule {}

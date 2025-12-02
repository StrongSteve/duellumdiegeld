import { Controller, Post, Get, Put, Param, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('session')
  async createSession(@Body() dto: CreateSessionDto) {
    return this.gameService.createSession(dto);
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    return this.gameService.getSession(id);
  }

  @Put('session/:id')
  async updateSession(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.gameService.updateSession(id, dto);
  }

  @Get('session/:id/next-question')
  async getNextQuestion(@Param('id') id: string) {
    return this.gameService.getNextQuestion(id);
  }

  @Post('session/:id/end')
  async endSession(@Param('id') id: string) {
    return this.gameService.endSession(id);
  }
}

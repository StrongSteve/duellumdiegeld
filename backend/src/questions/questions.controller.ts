import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { QuestionsService } from './questions.service';
import { CaptchaService } from './captcha.service';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { RateQuestionDto } from './dto/rate-question.dto';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly captchaService: CaptchaService,
  ) {}

  @Post('submit')
  async submitQuestion(@Body() dto: SubmitQuestionDto) {
    return this.questionsService.submitQuestion(dto);
  }

  @Get('random')
  async getRandomQuestion(@Query('exclude') exclude?: string) {
    const excludeIds = exclude ? exclude.split(',').filter((id) => id.trim()) : [];
    const question = await this.questionsService.getRandomApprovedQuestion(excludeIds);

    if (!question) {
      return {
        success: false,
        message: 'Keine weiteren genehmigten Fragen verfügbar',
        question: null,
      };
    }

    return {
      success: true,
      question,
    };
  }

  @Get('count')
  async getQuestionsCount() {
    const count = await this.questionsService.getApprovedQuestionsCount();
    return { count };
  }

  @Get('captcha')
  getCaptchaChallenge() {
    return this.captchaService.generateChallenge();
  }

  @Post('rate')
  async rateQuestion(@Body() dto: RateQuestionDto, @Req() req: Request) {
    // Get IP from x-forwarded-for header (for proxied requests) or fall back to connection IP
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : req.ip || req.socket.remoteAddress || 'unknown';

    return this.questionsService.rateQuestion(dto.questionId, dto.rating, ip);
  }
}

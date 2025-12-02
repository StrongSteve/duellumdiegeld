import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CaptchaService } from './captcha.service';
import { SubmitQuestionDto } from './dto/submit-question.dto';

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
}

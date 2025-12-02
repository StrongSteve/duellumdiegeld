import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { CaptchaService } from './captcha.service';
import { QuestionStatus, Category } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly captchaService: CaptchaService,
  ) {}

  async submitQuestion(dto: SubmitQuestionDto) {
    // CAPTCHA überprüfen
    const isValidCaptcha = await this.captchaService.verifyCaptcha(dto.captchaToken);

    if (!isValidCaptcha) {
      throw new BadRequestException('CAPTCHA-Überprüfung fehlgeschlagen');
    }

    // Auf doppelte Fragen prüfen
    const existingQuestion = await this.prisma.question.findFirst({
      where: {
        questionText: {
          equals: dto.questionText,
          mode: 'insensitive',
        },
      },
    });

    if (existingQuestion) {
      throw new BadRequestException('Eine ähnliche Frage existiert bereits');
    }

    // Frage mit Hinweisen erstellen
    const question = await this.prisma.question.create({
      data: {
        category: dto.category as Category,
        questionText: dto.questionText,
        answerValue: dto.answerValue,
        answerUnit: dto.answerUnit,
        explanation: dto.explanation,
        sourceUrl: dto.sourceUrl,
        contributorName: dto.contributorName,
        status: QuestionStatus.PENDING,
        hints: {
          create: dto.hints.map((hint, index) => ({
            orderIndex: index + 1,
            hintText: hint.hintText,
          })),
        },
      },
      include: {
        hints: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return {
      success: true,
      message: 'Frage erfolgreich eingereicht! Sie wird von einem Admin überprüft.',
      questionId: question.id,
    };
  }

  async getRandomApprovedQuestion(excludeIds: string[] = []) {
    const whereClause: {
      status: QuestionStatus;
      id?: { notIn: string[] };
    } = {
      status: QuestionStatus.APPROVED,
    };

    if (excludeIds.length > 0) {
      whereClause.id = { notIn: excludeIds };
    }

    // Zähle verfügbare Fragen
    const count = await this.prisma.question.count({
      where: whereClause,
    });

    if (count === 0) {
      return null;
    }

    // Zufällige Frage auswählen
    const skip = Math.floor(Math.random() * count);

    const question = await this.prisma.question.findFirst({
      where: whereClause,
      skip: skip,
      include: {
        hints: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    // playedCount erhöhen
    if (question) {
      await this.prisma.question.update({
        where: { id: question.id },
        data: { playedCount: { increment: 1 } },
      });
    }

    return question;
  }

  async getApprovedQuestionsCount() {
    return this.prisma.question.count({
      where: { status: QuestionStatus.APPROVED },
    });
  }
}

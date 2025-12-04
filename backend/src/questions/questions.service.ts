import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { CaptchaService } from './captcha.service';
import { QuestionStatus, Category } from '@prisma/client';
import * as crypto from 'crypto';

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

    // Get all available questions with their ratings
    const questions = await this.prisma.question.findMany({
      where: whereClause,
      select: {
        id: true,
        ratingSum: true,
        ratingCount: true,
      },
    });

    if (questions.length === 0) {
      return null;
    }

    // Calculate weights based on average rating
    // Unrated questions get a neutral weight of 3 (middle of 1-5 scale)
    // Weight formula: avgRating + 2 (so weights range from 3 to 7)
    const questionsWithWeights = questions.map((q) => {
      const avgRating = q.ratingCount > 0 ? q.ratingSum / q.ratingCount : 3;
      const weight = avgRating + 2; // Shift to make all weights positive and meaningful
      return { id: q.id, weight };
    });

    // Calculate total weight
    const totalWeight = questionsWithWeights.reduce((sum, q) => sum + q.weight, 0);

    // Weighted random selection
    let random = Math.random() * totalWeight;
    let selectedId = questionsWithWeights[0].id;

    for (const q of questionsWithWeights) {
      random -= q.weight;
      if (random <= 0) {
        selectedId = q.id;
        break;
      }
    }

    // Fetch the full question
    const question = await this.prisma.question.findUnique({
      where: { id: selectedId },
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

  async rateQuestion(questionId: string, rating: number, ipAddress: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new BadRequestException('Frage nicht gefunden');
    }

    // Hash the IP address for privacy
    const ipHash = crypto.createHash('sha256').update(ipAddress).digest('hex');

    // Check if this IP already rated this question
    const existingRating = await this.prisma.questionRating.findUnique({
      where: {
        questionId_ipHash: {
          questionId,
          ipHash,
        },
      },
    });

    if (existingRating) {
      throw new BadRequestException('Du hast diese Frage bereits bewertet');
    }

    // Create rating record and update question in a transaction
    await this.prisma.$transaction([
      this.prisma.questionRating.create({
        data: {
          questionId,
          ipHash,
          rating,
        },
      }),
      this.prisma.question.update({
        where: { id: questionId },
        data: {
          ratingSum: { increment: rating },
          ratingCount: { increment: 1 },
        },
      }),
    ]);

    return { success: true, message: 'Bewertung gespeichert' };
  }
}

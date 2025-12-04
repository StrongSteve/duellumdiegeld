import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionsService } from '../questions/questions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionsService: QuestionsService,
  ) {}

  async createSession(dto: CreateSessionDto) {
    const session = await this.prisma.gameSession.create({
      data: {
        settings: {
          playerCount: dto.playerCount,
          playerNames: dto.playerNames,
          startingMoney: dto.startingMoney || 1000,
          timerDuration: dto.timerDuration || 0,
        },
        usedQuestions: [],
        currentState: 'QUESTION_INTRO',
        isActive: true,
      },
    });

    return session;
  }

  async getSession(id: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Spielsitzung nicht gefunden');
    }

    return session;
  }

  async updateSession(id: string, dto: UpdateSessionDto) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Spielsitzung nicht gefunden');
    }

    const updateData: {
      currentState?: string;
      usedQuestions?: string[];
    } = {};

    if (dto.currentState) {
      updateData.currentState = dto.currentState;
    }

    if (dto.usedQuestions) {
      updateData.usedQuestions = dto.usedQuestions;
    }

    return this.prisma.gameSession.update({
      where: { id },
      data: updateData,
    });
  }

  async getNextQuestion(sessionId: string) {
    const session = await this.getSession(sessionId);
    const usedQuestions = (session.usedQuestions as string[]) || [];

    const question = await this.questionsService.getRandomApprovedQuestion(usedQuestions);

    if (!question) {
      return {
        success: false,
        message: 'Keine weiteren genehmigten Fragen verfügbar',
        question: null,
      };
    }

    // Frage zu den verwendeten Fragen hinzufügen
    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        usedQuestions: [...usedQuestions, question.id],
      },
    });

    return {
      success: true,
      question,
    };
  }

  async endSession(id: string) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Spielsitzung nicht gefunden');
    }

    return this.prisma.gameSession.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }
}

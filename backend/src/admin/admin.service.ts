import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionStatus, Category } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [pending, approved, rejected, total] = await Promise.all([
      this.prisma.question.count({ where: { status: QuestionStatus.PENDING } }),
      this.prisma.question.count({ where: { status: QuestionStatus.APPROVED } }),
      this.prisma.question.count({ where: { status: QuestionStatus.REJECTED } }),
      this.prisma.question.count(),
    ]);

    return { pending, approved, rejected, total };
  }

  async getPendingQuestions() {
    return this.prisma.question.findMany({
      where: { status: QuestionStatus.PENDING },
      include: {
        hints: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllQuestions(filters?: {
    status?: QuestionStatus;
    category?: Category;
    search?: string;
  }) {
    const where: {
      status?: QuestionStatus;
      category?: Category;
      OR?: Array<{ questionText: { contains: string; mode: 'insensitive' } }>;
    } = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [{ questionText: { contains: filters.search, mode: 'insensitive' } }];
    }

    return this.prisma.question.findMany({
      where,
      include: {
        hints: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuestionById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        hints: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Frage nicht gefunden');
    }

    return question;
  }

  async approveQuestion(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Frage nicht gefunden');
    }

    return this.prisma.question.update({
      where: { id },
      data: {
        status: QuestionStatus.APPROVED,
        rejectionReason: null,
      },
      include: {
        hints: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  async rejectQuestion(id: string, reason?: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Frage nicht gefunden');
    }

    return this.prisma.question.update({
      where: { id },
      data: {
        status: QuestionStatus.REJECTED,
        rejectionReason: reason,
      },
      include: {
        hints: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { hints: true },
    });

    if (!question) {
      throw new NotFoundException('Frage nicht gefunden');
    }

    // Auf doppelte Fragen prüfen, wenn der Text geändert wird
    if (dto.questionText && dto.questionText !== question.questionText) {
      const existingQuestion = await this.prisma.question.findFirst({
        where: {
          questionText: {
            equals: dto.questionText,
            mode: 'insensitive',
          },
          id: { not: id },
        },
      });

      if (existingQuestion) {
        throw new BadRequestException('Eine ähnliche Frage existiert bereits');
      }
    }

    // Hinweise validieren
    if (dto.hints && dto.hints.length === 0) {
      throw new BadRequestException('Mindestens ein Hinweis ist erforderlich');
    }

    // Transaktion für das Update
    return this.prisma.$transaction(async (tx) => {
      // Frage aktualisieren
      await tx.question.update({
        where: { id },
        data: {
          category: dto.category as Category | undefined,
          questionText: dto.questionText,
          answerValue: dto.answerValue,
          answerUnit: dto.answerUnit,
          explanation: dto.explanation,
          sourceUrl: dto.sourceUrl,
          contributorName: dto.contributorName,
        },
      });

      // Hinweise aktualisieren, wenn angegeben
      if (dto.hints) {
        // Alte Hinweise löschen
        await tx.hint.deleteMany({
          where: { questionId: id },
        });

        // Neue Hinweise erstellen
        await tx.hint.createMany({
          data: dto.hints.map((hint, index) => ({
            questionId: id,
            orderIndex: index + 1,
            hintText: hint.hintText,
          })),
        });
      }

      // Aktualisierte Frage mit Hinweisen zurückgeben
      return tx.question.findUnique({
        where: { id },
        include: {
          hints: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    });
  }

  async deleteQuestion(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Frage nicht gefunden');
    }

    await this.prisma.question.delete({
      where: { id },
    });

    return { success: true, message: 'Frage erfolgreich gelöscht' };
  }

  async exportQuestions() {
    const questions = await this.prisma.question.findMany({
      include: {
        hints: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Transform to export format (without IDs for portability)
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      questions: questions.map((q) => ({
        questionText: q.questionText,
        category: q.category,
        answerValue: q.answerValue,
        answerUnit: q.answerUnit,
        explanation: q.explanation,
        sourceUrl: q.sourceUrl,
        contributorName: q.contributorName,
        status: q.status,
        hints: q.hints.map((h) => ({
          orderIndex: h.orderIndex,
          hintText: h.hintText,
        })),
      })),
    };

    return exportData;
  }

  async importQuestions(
    importData: {
      questions: Array<{
        questionText: string;
        category: Category;
        answerValue: number;
        answerUnit?: string;
        explanation?: string;
        sourceUrl?: string;
        contributorName?: string;
        status?: QuestionStatus;
        hints: Array<{ orderIndex: number; hintText: string }>;
      }>;
    },
    skipDuplicates: boolean = true,
  ) {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const q of importData.questions) {
      try {
        // Check for duplicate by questionText (case-insensitive)
        const existing = await this.prisma.question.findFirst({
          where: {
            questionText: {
              equals: q.questionText,
              mode: 'insensitive',
            },
          },
        });

        if (existing) {
          if (skipDuplicates) {
            skipped++;
            continue;
          } else {
            errors.push(`Duplikat übersprungen: "${q.questionText.substring(0, 50)}..."`);
            continue;
          }
        }

        // Create question with hints
        await this.prisma.question.create({
          data: {
            questionText: q.questionText,
            category: q.category || Category.MISC,
            answerValue: q.answerValue,
            answerUnit: q.answerUnit,
            explanation: q.explanation,
            sourceUrl: q.sourceUrl,
            contributorName: q.contributorName,
            status: q.status || QuestionStatus.APPROVED,
            hints: {
              create: q.hints.map((h) => ({
                orderIndex: h.orderIndex,
                hintText: h.hintText,
              })),
            },
          },
        });

        imported++;
      } catch (err) {
        errors.push(
          `Fehler bei "${q.questionText.substring(0, 30)}...": ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`,
        );
      }
    }

    return {
      success: true,
      imported,
      skipped,
      errors,
      message: `Import abgeschlossen: ${imported} importiert, ${skipped} übersprungen (Duplikate)`,
    };
  }
}

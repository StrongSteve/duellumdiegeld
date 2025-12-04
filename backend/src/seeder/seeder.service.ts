import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartupService } from '../startup/startup.service';
import { Category, QuestionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedQuestions } from '../data/questions';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly startupService: StartupService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  // Helper to parse answer value from string like "10.000 Liter" -> 10000
  private parseAnswerValue(answer: string): number {
    const cleaned = answer
      .replace(/[^\d,.\-]/g, ' ')
      .trim()
      .split(/\s+/)[0]
      .replace(/\./g, '') // Remove thousand separators (German format)
      .replace(',', '.'); // Convert decimal comma to dot
    return parseFloat(cleaned);
  }

  // Helper to extract unit from answer
  private extractUnit(answer: string): string | null {
    const match = answer.match(/[\d,.\s]+(.+)/);
    if (match && match[1]) {
      const unit = match[1].trim();
      if (['Mio', 'Millionen', 'Milliarden'].includes(unit)) {
        return unit;
      }
      return unit || null;
    }
    return null;
  }

  // Map German category names to enum values
  private mapCategory(categoryName: string): Category {
    const mapping: Record<string, Category> = {
      Wissenschaft: Category.SCIENCE,
      Tiere: Category.ANIMALS,
      Essen: Category.FOOD,
      'Essen & Trinken': Category.FOOD,
      Alltag: Category.EVERYDAY,
      Gesundheit: Category.HEALTH,
      Geografie: Category.GEOGRAPHY,
      Technik: Category.TECHNOLOGY,
      Sport: Category.SPORTS,
      Musik: Category.MUSIC,
      Astronomie: Category.ASTRONOMY,
      Geschichte: Category.HISTORY,
      Popkultur: Category.POP_CULTURE,
      Sonstiges: Category.MISC,
    };
    return mapping[categoryName] || Category.MISC;
  }

  async seed() {
    this.logger.log('Starting automatic database seeding...');

    // Seed admin user
    await this.seedAdminUser();

    // Seed default questions
    await this.seedDefaultQuestions();

    this.logger.log('Automatic database seeding completed.');
  }

  private async seedAdminUser() {
    const existingAdmin = await this.prisma.adminUser.findUnique({
      where: { username: 'admin' },
    });

    // Get dynamically generated password from startup service
    const adminPassword = this.startupService.adminPassword;
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    if (!existingAdmin) {
      await this.prisma.adminUser.create({
        data: {
          username: 'admin',
          passwordHash,
        },
      });
      this.logger.log('Admin user created with generated password');
    } else {
      // Update password on every startup
      await this.prisma.adminUser.update({
        where: { username: 'admin' },
        data: { passwordHash },
      });
      this.logger.log('Admin user password updated');
    }
  }

  private async seedDefaultQuestions() {
    let createdCount = 0;
    let skippedCount = 0;

    for (const q of seedQuestions) {
      // Check if question already exists by questionText
      const existing = await this.prisma.question.findFirst({
        where: { questionText: q.questionText },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Parse answer value
      let answerValue: number;
      let answerUnit: string | null = null;

      const answer = q.answer;
      if (answer.includes('Mio') || answer.includes('Millionen')) {
        const numPart = answer
          .replace(/[^\d,.\s]/g, '')
          .trim()
          .replace(',', '.');
        answerValue = parseFloat(numPart);
        if (answer.includes('Mio')) {
          answerValue = answerValue * 1000000;
        } else if (answer.toLowerCase().includes('millionen')) {
          answerValue = parseFloat(numPart) * 1000000;
        }
        answerUnit = null;
      } else if (answer.includes('Milliarden')) {
        const numPart = answer
          .replace(/[^\d,.\s]/g, '')
          .trim()
          .replace(',', '.');
        answerValue = parseFloat(numPart) * 1000000000;
        answerUnit = 'Tassen';
      } else {
        answerValue = this.parseAnswerValue(answer);
        answerUnit = this.extractUnit(answer);
      }

      const category = this.mapCategory(q.category);

      await this.prisma.question.create({
        data: {
          category,
          questionText: q.questionText,
          answerValue,
          answerUnit,
          explanation: q.description,
          sourceUrl: q.website,
          status: QuestionStatus.APPROVED,
          hints: {
            create: [
              { orderIndex: 1, hintText: q.hint1 },
              { orderIndex: 2, hintText: q.hint2 },
            ],
          },
        },
      });

      createdCount++;
    }

    this.logger.log(
      `Questions seeded: ${createdCount} created, ${skippedCount} skipped (already exist)`,
    );
  }
}

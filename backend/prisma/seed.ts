import { PrismaClient, Category, QuestionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedQuestions } from '../src/data/questions';

const prisma = new PrismaClient();

// Helper to parse answer value from string like "10.000 Liter" -> 10000
function parseAnswerValue(answer: string): number {
  // Remove units and extract the number
  const cleaned = answer
    .replace(/[^\d,.\-]/g, ' ')
    .trim()
    .split(/\s+/)[0]
    .replace(/\./g, '') // Remove thousand separators (German format)
    .replace(',', '.'); // Convert decimal comma to dot
  return parseFloat(cleaned);
}

// Helper to extract unit from answer
function extractUnit(answer: string): string | null {
  // Match number at start, then capture everything after
  // The number pattern includes digits, dots (thousand separator), commas (decimal), and spaces
  const match = answer.match(/^[\d,.]+\s*(.*)$/);
  if (match && match[1]) {
    const unit = match[1].trim();
    // Return null if empty or if it's just digits (not a real unit)
    if (!unit || /^\d+$/.test(unit)) {
      return null;
    }
    return unit;
  }
  return null;
}

// Map German category names to enum values
function mapCategory(categoryName: string): Category {
  const mapping: Record<string, Category> = {
    'Wissenschaft': Category.SCIENCE,
    'Tiere': Category.ANIMALS,
    'Essen': Category.FOOD,
    'Essen & Trinken': Category.FOOD,
    'Alltag': Category.EVERYDAY,
    'Gesundheit': Category.HEALTH,
    'Geografie': Category.GEOGRAPHY,
    'Technik': Category.TECHNOLOGY,
    'Sport': Category.SPORTS,
    'Musik': Category.MUSIC,
    'Astronomie': Category.ASTRONOMY,
    'Geschichte': Category.HISTORY,
    'Popkultur': Category.POP_CULTURE,
    'Sonstiges': Category.MISC,
  };
  return mapping[categoryName] || Category.MISC;
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
    },
  });
  console.log('✅ Admin user created:', admin.username);

  // Seed the questions (upsert based on questionText to avoid duplicates)
  let createdCount = 0;
  let skippedCount = 0;

  for (const q of seedQuestions) {
    // Check if question already exists
    const existing = await prisma.question.findFirst({
      where: { questionText: q.questionText },
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    // Parse answer value
    let answerValue: number;
    let answerUnit: string | null = null;

    // Handle special cases for answer parsing
    const answer = q.answer;
    if (answer.includes('Mio') || answer.includes('Millionen')) {
      // Handle millions
      const numPart = answer.replace(/[^\d,.\s]/g, '').trim().replace(',', '.');
      answerValue = parseFloat(numPart);
      if (answer.includes('Mio')) {
        answerValue = answerValue * 1000000;
      } else if (answer.toLowerCase().includes('millionen')) {
        answerValue = parseFloat(numPart) * 1000000;
      }
      answerUnit = null;
    } else if (answer.includes('Milliarden')) {
      const numPart = answer.replace(/[^\d,.\s]/g, '').trim().replace(',', '.');
      answerValue = parseFloat(numPart) * 1000000000;
      answerUnit = 'Tassen';
    } else {
      answerValue = parseAnswerValue(answer);
      answerUnit = extractUnit(answer);
    }

    const category = mapCategory(q.category);

    await prisma.question.create({
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
    console.log(`✅ Question created: "${q.questionText.substring(0, 50)}..."`);
  }

  console.log('🎉 Seeding completed!');
  console.log(`   - 1 Admin user`);
  console.log(`   - ${createdCount} questions created`);
  console.log(`   - ${skippedCount} questions skipped (already exist)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

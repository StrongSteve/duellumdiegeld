import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Category, QuestionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Question data structure for seeding
interface SeedQuestion {
  questionText: string;
  hint1: string;
  hint2: string;
  answer: string;
  category: string;
  website: string;
  description: string;
}

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
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

  // The 40 default questions
  private readonly defaultQuestions: SeedQuestion[] = [
    {
      questionText: 'Wie viele Liter Luft atmet ein Mensch pro Tag?',
      hint1: 'Mehr, wenn Montag ist.',
      hint2: 'Es sind deutlich über 5.000 Liter.',
      answer: '10.000 Liter',
      category: 'Wissenschaft',
      website: 'https://www.lung.org',
      description:
        'Erwachsene atmen täglich etwa 10.000 Liter Luft ein und aus.',
    },
    {
      questionText: 'Wie schnell kann ein Faultier maximal klettern?',
      hint1: 'Schneller als eine Steuererklärung.',
      hint2: 'Unter 5 Meter pro Minute.',
      answer: '3,5 Meter pro Minute',
      category: 'Tiere',
      website: 'https://en.wikipedia.org/wiki/Sloth',
      description:
        'Faultiere bewegen sich extrem langsam und schaffen nur wenige Meter pro Minute.',
    },
    {
      questionText: 'Wie viele Sorten Käse gibt es weltweit?',
      hint1: 'Genug, um eine ganze Diät zu zerstören.',
      hint2: 'Mehr als 1.000, weniger als 3.000.',
      answer: '2.000 Sorten',
      category: 'Essen',
      website: 'https://en.wikipedia.org/wiki/Cheese',
      description:
        'Käse existiert weltweit in tausenden traditionellen und modernen Varianten.',
    },
    {
      questionText: 'Wie viele Sekunden braucht Licht von der Sonne zur Erde?',
      hint1: 'Viel schneller als dein WLAN.',
      hint2: 'Rund 8 Minuten.',
      answer: '500 Sekunden',
      category: 'Wissenschaft',
      website: 'https://solarsystem.nasa.gov',
      description:
        'Licht benötigt ungefähr 8 Minuten und 20 Sekunden zur Erde.',
    },
    {
      questionText: 'Wie viele Tassen Kaffee werden weltweit pro Tag getrunken?',
      hint1: 'Davon 70 % in IT-Abteilungen.',
      hint2: 'Mehr als 1 Milliarde.',
      answer: '2,25 Milliarden Tassen',
      category: 'Alltag',
      website: 'https://www.ncausa.org',
      description: 'Kaffee ist eines der meistkonsumierten Getränke der Welt.',
    },
    {
      questionText: 'Wie viele Muskeln hat ein Elefantenrüssel?',
      hint1: 'Mehr als in deinem ganzen Körper.',
      hint2: 'Über 10.000, unter 60.000.',
      answer: '40.000',
      category: 'Tiere',
      website: 'https://www.nationalgeographic.com',
      description:
        'Der Rüssel besteht aus Zehntausenden fein steuerbaren Muskeln.',
    },
    {
      questionText:
        'Wie viele Schritte macht man bei einem 30-minütigen Spaziergang?',
      hint1: 'Kommt auf Hundebespaßung an.',
      hint2: 'Mehr als 2.000, weniger als 5.000.',
      answer: '3.000 Schritte',
      category: 'Gesundheit',
      website: 'https://www.who.int',
      description:
        'Bei mäßigem Tempo schafft man rund 3.000 Schritte in einer halben Stunde.',
    },
    {
      questionText: 'Wie viele Liter Wasser hat ein Erwachsener im Körper?',
      hint1: 'Du bist im Grunde eine teure Wasserflasche.',
      hint2: 'Etwa 50–60 % des Körpergewichts.',
      answer: '42 Liter',
      category: 'Wissenschaft',
      website: 'https://www.healthline.com',
      description: 'Ein 70-kg-Mensch besteht zu rund 60 % aus Wasser.',
    },
    {
      questionText:
        'Wie viele Stunden schaut ein durchschnittlicher Mensch im Jahr TV?',
      hint1: 'Vor allem, wenn nichts Besseres läuft.',
      hint2: 'Zwischen 800 und 1.400 Stunden.',
      answer: '1.000 Stunden',
      category: 'Alltag',
      website: 'https://www.statista.com',
      description: 'Viele Statistiken liegen bei etwa 2–3 Stunden pro Tag.',
    },
    {
      questionText: 'Wie viele Knochen hat ein erwachsener Mensch?',
      hint1: 'Mehr als ein IKEA-Regal.',
      hint2: 'Weniger als 250.',
      answer: '206',
      category: 'Wissenschaft',
      website: 'https://en.wikipedia.org/wiki/Human_skeleton',
      description: 'Viele Knochen verschmelzen im Laufe der Kindheit.',
    },
    {
      questionText: 'Wie schnell kann ein Huhn rennen?',
      hint1: 'Besonders schnell, wenn du es jagst.',
      hint2: 'Unter 20 km/h.',
      answer: '14 km/h',
      category: 'Tiere',
      website: 'https://en.wikipedia.org/wiki/Chicken',
      description: 'Hühner erreichen im Sprint erstaunliche Geschwindigkeiten.',
    },
    {
      questionText: 'Wie viele Minuten dauert ein durchschnittliches Nickerchen?',
      hint1: 'Immer zu kurz.',
      hint2: 'Zwischen 10 und 30 Minuten.',
      answer: '20 Minuten',
      category: 'Alltag',
      website: 'https://www.sleepfoundation.org',
      description: 'Der ideale Powernap dauert rund 20 Minuten.',
    },
    {
      questionText: 'Wie viele Menschen leben in Wien?',
      hint1: 'Mehr als in ganz Vorarlberg.',
      hint2: 'Knapp unter 2 Millionen.',
      answer: '1,95 Mio',
      category: 'Geografie',
      website: 'https://www.statistik.at',
      description: 'Wien ist Österreichs größte Stadt und Metropolregion.',
    },
    {
      questionText: 'Wie viele Arten von Ameisen gibt es weltweit?',
      hint1: 'Genug, um deine Küche zu übernehmen.',
      hint2: 'Über 10.000, unter 15.000.',
      answer: '12.000',
      category: 'Tiere',
      website: 'https://www.antwiki.org',
      description: 'Ameisen sind extrem vielfältig und global verbreitet.',
    },
    {
      questionText: 'Wie viele Liter Bier trinkt ein Österreicher pro Jahr?',
      hint1: 'Stark abhängig vom Festivalprogramm.',
      hint2: 'Über 80, unter 120.',
      answer: '100 Liter',
      category: 'Essen & Trinken',
      website: 'https://www.statista.com',
      description: 'Österreich zählt zu den führenden Bierkonsum-Ländern.',
    },
    {
      questionText: 'Wie viele Kilometer ist die Donau lang?',
      hint1: 'Länger als deine To-Do-Liste.',
      hint2: 'Zwischen 2.500 und 3.000 km.',
      answer: '2.857 km',
      category: 'Geografie',
      website: 'https://en.wikipedia.org/wiki/Danube',
      description: 'Die Donau ist Europas zweitlängster Fluss.',
    },
    {
      questionText: 'Wie viele Megapixel hat ein 4K-Bild?',
      hint1: 'Mehr als dein altes Nokia.',
      hint2: 'Weniger als 10 MP.',
      answer: '8,3 MP',
      category: 'Technik',
      website: 'https://en.wikipedia.org/wiki/4K_resolution',
      description: 'Die 4K-Auflösung besteht aus 3840×2160 Pixeln.',
    },
    {
      questionText:
        'Wie viele Schokoladentafeln isst der durchschnittliche Schweizer pro Jahr?',
      hint1: 'Viele. Wirklich viele.',
      hint2: 'Zwischen 40 und 60 Portionen.',
      answer: '50 Tafeln',
      category: 'Essen & Trinken',
      website: 'https://www.chocosuisse.ch',
      description: 'Die Schweiz hat einen der höchsten Schokoladenverbräuche.',
    },
    {
      questionText: 'Wie viele verschiedene Sprachen erkennt Google Translate?',
      hint1: 'Mehr, wenn du „Hallo" rückwärts sagst.',
      hint2: 'Zwischen 100 und 150.',
      answer: '133',
      category: 'Technik',
      website: 'https://translate.google.com',
      description: 'Der Dienst unterstützt über hundert Sprachen.',
    },
    {
      questionText: 'Wie viele Kalorien verbrennt man beim Lachen pro Minute?',
      hint1: 'Endlich ein gutes Training!',
      hint2: 'Unter 2 Kalorien.',
      answer: '1,3 Kalorien',
      category: 'Gesundheit',
      website: 'https://www.webmd.com',
      description: 'Lachen erhöht Herzfrequenz und Energieverbrauch leicht.',
    },
    {
      questionText: 'Wie lange ist ein Blinzeln?',
      hint1: 'Kürzer als eine gute Ausrede.',
      hint2: 'Rund 100–400 Millisekunden.',
      answer: '300 ms',
      category: 'Wissenschaft',
      website: 'https://www.ncbi.nlm.nih.gov',
      description:
        'Die Dauer eines durchschnittlichen Lidschlags liegt im Millisekundenbereich.',
    },
    {
      questionText: 'Wie viele Kilogramm Schokolade isst ein Deutscher pro Jahr?',
      hint1: 'Besonders viel in der Weihnachtszeit.',
      hint2: 'Zwischen 8 und 12 kg.',
      answer: '9,5 kg',
      category: 'Essen',
      website: 'https://www.statista.com',
      description: 'Deutschland gehört zu den führenden Schokoladenkonsumenten.',
    },
    {
      questionText: 'Wie viele Planeten hat unser Sonnensystem?',
      hint1: 'Pluto hätten wir fast mitgezählt.',
      hint2: 'Unter 10.',
      answer: '8',
      category: 'Wissenschaft',
      website: 'https://solarsystem.nasa.gov',
      description: 'Seit 2006 gilt Pluto nicht mehr als Planet.',
    },
    {
      questionText: 'Wie viele Kilometer macht ein Marathon?',
      hint1: 'Fühlt sich doppelt so lang an.',
      hint2: 'Genau 42-irgendwas.',
      answer: '42,195 km',
      category: 'Sport',
      website: 'https://en.wikipedia.org/wiki/Marathon',
      description: 'Die Strecke ist seit 1908 standardisiert.',
    },
    {
      questionText: 'Wie viele Tasten hat ein Klavier?',
      hint1: 'Genug, um falsch zu greifen.',
      hint2: 'Unter 100.',
      answer: '88',
      category: 'Musik',
      website: 'https://en.wikipedia.org/wiki/Piano',
      description: 'Ein Standardklavier besitzt 88 Tasten.',
    },
    {
      questionText: 'Wie viele Menschen leben aktuell in der EU?',
      hint1: 'Mehr als eine WhatsApp-Gruppe verträgt.',
      hint2: 'Rund 450 Millionen.',
      answer: '448 Millionen',
      category: 'Geografie',
      website: 'https://ec.europa.eu',
      description: 'Die EU hat rund 450 Millionen Einwohner.',
    },
    {
      questionText: 'Wie viele Minuten dauert ein Kinofilm im Durchschnitt?',
      hint1: 'Länger als jeder Werbung lieb ist.',
      hint2: 'Zwischen 90 und 130 Minuten.',
      answer: '110 Minuten',
      category: 'Alltag',
      website: 'https://www.imdb.com',
      description: 'Viele Filme liegen im Bereich von 90–120 Minuten.',
    },
    {
      questionText: 'Wie viele Sterne kann man mit bloßem Auge sehen?',
      hint1: 'Nur, wenn du nicht im Wohnzimmer sitzt.',
      hint2: 'Zwischen 2.000 und 3.000.',
      answer: '2.500',
      category: 'Astronomie',
      website: 'https://www.skyandtelescope.org',
      description: 'Unter idealen Bedingungen sind ca. 2.500 Sterne sichtbar.',
    },
    {
      questionText: 'Wie viele Eier legt ein Huhn pro Jahr?',
      hint1: 'Mehr als du frühstücken kannst.',
      hint2: 'Zwischen 250 und 330.',
      answer: '300',
      category: 'Tiere',
      website: 'https://en.wikipedia.org/wiki/Chicken',
      description: 'Legehennen produzieren im Schnitt rund 300 Eier jährlich.',
    },
    {
      questionText: 'Wie viele Meter tief ist der Marianengraben?',
      hint1: 'Tiefer als jede Ausrede.',
      hint2: 'Über 10.000 m.',
      answer: '11.034 m',
      category: 'Geografie',
      website: 'https://www.noaa.gov',
      description: 'Der Marianengraben ist der tiefste Punkt der Erde.',
    },
    {
      questionText: 'Wie viele Tage dauert es, einmal um die Erde zu gehen?',
      hint1: 'Nur wenn du gute Schuhe hast.',
      hint2: 'Rund 500 Tage.',
      answer: '500 Tage',
      category: 'Alltag',
      website: 'https://www.nationalgeographic.com',
      description: 'Die Strecke beträgt über 40.000 km.',
    },
    {
      questionText: 'Wie viele Menschen leben in Japan?',
      hint1: 'Viele davon in Tokio.',
      hint2: 'Zwischen 120 und 130 Millionen.',
      answer: '125 Millionen',
      category: 'Geografie',
      website: 'https://www.statista.com',
      description: 'Japan zählt zu den dicht besiedelten Ländern.',
    },
    {
      questionText: 'Wie viele Liter Milch gibt eine Kuh pro Tag?',
      hint1: 'Mehr, wenn sie gute Laune hat.',
      hint2: 'Zwischen 20 und 30 Liter.',
      answer: '25 Liter',
      category: 'Tiere',
      website: 'https://www.fao.org',
      description: 'Hochleistungskühe produzieren rund 25 Liter täglich.',
    },
    {
      questionText: 'Wie viele Kalorien verbrennt man beim Schlafen pro Stunde?',
      hint1: 'Endlich ein Sport, der mir liegt.',
      hint2: 'Zwischen 50 und 80 kcal.',
      answer: '65 kcal',
      category: 'Gesundheit',
      website: 'https://www.sleepfoundation.org',
      description: 'Der Grundumsatz läuft auch im Schlaf weiter.',
    },
    {
      questionText:
        'Wie viele Tage hat ein durchschnittlicher Urlauber pro Jahr Urlaub?',
      hint1: 'Emotional zu wenig.',
      hint2: 'Zwischen 20 und 30 Tagen.',
      answer: '25 Tage',
      category: 'Alltag',
      website: 'https://www.eurofound.europa.eu',
      description: 'In Europa liegen Urlaubsansprüche meist um 25 Tage.',
    },
    {
      questionText: 'Wie viele Einwohner hat New York City?',
      hint1: 'Viele!',
      hint2: 'Rund 8 Millionen.',
      answer: '8,3 Millionen',
      category: 'Geografie',
      website: 'https://www.census.gov',
      description: 'NYC ist eine der größten Städte weltweit.',
    },
    {
      questionText: 'Wie viele Haare hat ein Mensch auf dem Kopf?',
      hint1: 'Bei manchen mehr, bei manchen… nun ja.',
      hint2: 'Zwischen 80.000 und 150.000.',
      answer: '100.000',
      category: 'Wissenschaft',
      website: 'https://www.ncbi.nlm.nih.gov',
      description:
        'Menschen besitzen je nach Genetik rund 100.000 Kopfhaare.',
    },
    {
      questionText: 'Wie viele Atemzüge macht ein Mensch pro Tag?',
      hint1: 'Viele unbemerkt.',
      hint2: 'Rund 20.000.',
      answer: '22.000',
      category: 'Gesundheit',
      website: 'https://www.lung.org',
      description: 'Ein Erwachsener atmet etwa 12–20 Mal pro Minute.',
    },
    {
      questionText: 'Wie viele Länder gibt es auf der Welt?',
      hint1: 'Hängt davon ab, wen du fragst.',
      hint2: 'Rund 200.',
      answer: '195',
      category: 'Geografie',
      website: 'https://www.un.org',
      description: 'Die UNO erkennt 195 Staaten an.',
    },
  ];

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

    // Get password from environment variable
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    if (!adminPassword) {
      this.logger.error(
        'ADMIN_PASSWORD environment variable is not set! Admin user will not be created.',
      );
      return;
    }

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await this.prisma.adminUser.create({
        data: {
          username: 'admin',
          passwordHash,
        },
      });
      this.logger.log('Admin user created with secure password from environment');
    } else {
      // Update password if it changed
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await this.prisma.adminUser.update({
        where: { username: 'admin' },
        data: { passwordHash },
      });
      this.logger.log('Admin user password updated from environment');
    }
  }

  private async seedDefaultQuestions() {
    let createdCount = 0;
    let skippedCount = 0;

    for (const q of this.defaultQuestions) {
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

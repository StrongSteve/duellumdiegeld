import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartupService } from '../startup/startup.service';
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
    // Additional 42 questions
    {
      questionText: 'Wie viele Kilogramm wog die größte Brezel der Welt in El Salvador?',
      hint1: 'Definitiv zu groß für deinen Toaster.',
      hint2: 'Die Brezel wog deutlich über 500 Kilogramm, aber unter einer Tonne.',
      answer: '783,81 Kilogramm',
      category: 'Essen',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'In El Salvador wurde eine rekordverdächtige Brezel mit einem Gewicht von 783,81 Kilogramm gebacken.',
    },
    {
      questionText: 'Wie viele Regenschirme bleiben laut Schätzung jedes Jahr in der Londoner U-Bahn zurück?',
      hint1: 'Da hätte sogar Mary Poppins Auswahl.',
      hint2: 'Es sind zehntausende – mehr als 50.000, aber weniger als 100.000 pro Jahr.',
      answer: '75.000 Stück',
      category: 'Alltag',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Jährlich bleiben etwa 75.000 Regenschirme in der Londoner U-Bahn unbeachtet zurück.',
    },
    {
      questionText: 'Welche Spannweite in Zentimetern hatte das 2017 entdeckte Rekordexemplar der größten Spinne der Welt?',
      hint1: 'Definitiv groß genug, um dich kurz laut „Uff!" sagen zu lassen.',
      hint2: 'Die Spannweite lag zwischen 30 und 50 Zentimetern.',
      answer: '40 Zentimeter',
      category: 'Tiere',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Die größte Spinne der Welt stammt aus Australien; 2017 wurde ein Exemplar mit einer Spannweite von etwa 40 Zentimetern entdeckt.',
    },
    {
      questionText: 'Wie viel Prozent der Menschen sind etwa Linkshänder?',
      hint1: 'Sie sind in der Minderheit, aber beim Schreiben sieht es spektakulärer aus.',
      hint2: 'Es sind etwas über 10 Prozent, aber deutlich unter 20 Prozent.',
      answer: '11 Prozent',
      category: 'Wissenschaft',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Nur etwa 11 Prozent aller Menschen sind Linkshänder.',
    },
    {
      questionText: 'Mit wie vielen anderen Menschen teilt ein Individuum im Durchschnitt seinen Geburtstag?',
      hint1: 'Du bist also weniger „special snowflake", als Facebook dir verspricht.',
      hint2: 'Es sind über 10 Millionen, aber keine 20 Millionen Menschen.',
      answer: '16,5 Millionen Menschen',
      category: 'Wissenschaft',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Jedes Individuum hat im Durchschnitt mit etwa 16,5 Millionen anderen Menschen gleichzeitig Geburtstag.',
    },
    {
      questionText: 'Aus wie viel Prozent Wasser besteht die Gehirnmasse eines Menschen?',
      hint1: 'Du bist im Kopf quasi ein sehr kompliziertes Wasserglas.',
      hint2: 'Es sind deutlich mehr als 50 Prozent, ungefähr vier Fünftel.',
      answer: '80 Prozent',
      category: 'Gesundheit',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Die Gehirnmasse besteht zu etwa 80 Prozent aus Wasser.',
    },
    {
      questionText: 'Wie viele Gramm Gehirnmasse verliert ein erwachsener Mensch im Durchschnitt pro Jahr?',
      hint1: 'Also keine Panik: Deine vergessene PIN hat andere Gründe.',
      hint2: 'Es ist grob im Bereich eines einzelnen Büroklammer-Gewichts pro Jahr.',
      answer: '1 Gramm',
      category: 'Gesundheit',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Ein erwachsener Mensch verliert im Erwachsenenalter rund ein Gramm Gehirnmasse pro Jahr.',
    },
    {
      questionText: 'Wie viele Minuten dauerte es, bis die Titanic gesunken war?',
      hint1: 'Genug Zeit, um Popcorn zweimal nachzufüllen.',
      hint2: 'Es sind etwas weniger als drei Stunden, gemessen in Minuten.',
      answer: '160 Minuten',
      category: 'Popkultur',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Die Dauer des Films „Titanic" entspricht etwa der Zeit, die das Schiff zum Sinken brauchte – rund 2 Stunden und 40 Minuten, also etwa 160 Minuten.',
    },
    {
      questionText: 'Wie viele Trauben benötigt man ungefähr, um eine einzige Flasche Wein herzustellen?',
      hint1: 'Kein Wunder, dass Wein nicht in Traubeneinheiten verkauft wird.',
      hint2: 'Es sind mehrere hundert Trauben – zwischen 500 und 1000.',
      answer: '700 Trauben',
      category: 'Essen',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Man braucht rund 700 Trauben, um eine Flasche Wein herzustellen.',
    },
    {
      questionText: 'Wie viele Jahre arbeitete Leonardo da Vinci allein an den Lippen der Mona Lisa?',
      hint1: 'So lange brauchst du ungefähr, um deine Umzugskartons endlich auszupacken.',
      hint2: 'Es war deutlich mehr als fünf Jahre, aber weniger als 15 Jahre.',
      answer: '10 Jahre',
      category: 'Popkultur',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Leonardo da Vinci hat rund zehn Jahre gebraucht, um die Lippen der Mona Lisa zu malen.',
    },
    {
      questionText: 'Wie viele Wochen kann ein Paar Stabheuschrecken ununterbrochen Sex haben?',
      hint1: 'Netflix-and-chill auf Insektenniveau, aber ohne Netflix.',
      hint2: 'Es sind mehr als zwei, aber weniger als zwölf Wochen.',
      answer: '10 Wochen',
      category: 'Tiere',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Stabheuschrecken können bis zu zehn Wochen lang ununterbrochen Sex haben.',
    },
    {
      questionText: 'Wie viele Minuten pro Tag sind deine Augen im Durchschnitt durch Blinzeln geschlossen?',
      hint1: 'Quasi ein eingebauter Mini-Powernap, ohne dass du Urlaub beantragen musst.',
      hint2: 'Es ist deutlich weniger als eine Stunde, aber mehr als fünf Minuten.',
      answer: '15 Minuten',
      category: 'Gesundheit',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Durch das Blinzeln sind die Augen durchschnittlich rund 15 Minuten pro Tag geschlossen.',
    },
    {
      questionText: 'Wie viele Fragen stellen Kinder im Durchschnitt pro Tag?',
      hint1: 'Ungefähr so viele wie du dir beim Steuerbescheid stellen müsstest.',
      hint2: 'Es sind einige hundert – mehr als 200, aber weniger als 600 Fragen.',
      answer: '400 Fragen',
      category: 'Alltag',
      website: 'https://www.nordbayern.de/panorama/unnutzes-wissen-1.13958782',
      description: 'Kinder stellen am Tag etwa 400 Fragen.',
    },
    {
      questionText: 'Wie tief ist der Marianengraben im Pazifik an seiner tiefsten Stelle in Metern?',
      hint1: 'Dort unten ist dein Handyempfang wirklich endgültig weg.',
      hint2: 'Es sind über 10.000 Meter, aber noch keine 12.000 Meter.',
      answer: '11.034 Meter',
      category: 'Geografie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Der Marianengraben im Pazifischen Ozean ist etwa 11.034 Meter tief.',
    },
    {
      questionText: 'Wie lang ist der Nil als längster Fluss der Welt in Kilometern?',
      hint1: 'Zu weit, um mal eben am Wochenende entlangzuspazieren.',
      hint2: 'Die Länge liegt zwischen 6.000 und 8.000 Kilometern.',
      answer: '6.853 Kilometer',
      category: 'Geografie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Der Nil ist etwa 6.853 Kilometer lang.',
    },
    {
      questionText: 'Wie tief ist der Baikalsee als tiefster Süßwassersee der Welt in Metern?',
      hint1: 'Da findest du deine versenkte Sonnenbrille nicht wieder.',
      hint2: 'Die Tiefe liegt zwischen 1.000 und 2.000 Metern.',
      answer: '1.620 Meter',
      category: 'Geografie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Der Baikalsee in Sibirien ist bis zu 1.620 Meter tief.',
    },
    {
      questionText: 'Wie viel Tonnen wiegt ungefähr jeder einzelne Kalkstein- oder Granitblock der Großen Pyramide von Gizeh?',
      hint1: 'Definitiv nichts für deinen nächsten IKEA-Umzug.',
      hint2: 'Es sind weniger als 5 Tonnen pro Block, aber deutlich mehr als 1 Tonne.',
      answer: '2,5 Tonnen',
      category: 'Geschichte',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Jeder Kalkstein- oder Granitblock der Großen Pyramide von Gizeh wiegt etwa 2,5 Tonnen.',
    },
    {
      questionText: 'Aus wie vielen einzelnen Steinblöcken besteht die Große Pyramide von Gizeh ungefähr?',
      hint1: 'Ein LEGO-Set dagegen ist überschaubar.',
      hint2: 'Es sind über eine Million, aber weniger als drei Millionen Blöcke.',
      answer: '2,3 Millionen Steinblöcke',
      category: 'Geschichte',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Die Große Pyramide von Gizeh besteht aus rund 2,3 Millionen einzelnen Kalkstein- und Granitblöcken.',
    },
    {
      questionText: 'Wie viele Monate würde es dauern, die gesamte Chinesische Mauer entlangzulaufen?',
      hint1: 'Definitiv kein Wochenendspaziergang.',
      hint2: 'Es dauert länger als ein Jahr, aber weniger als zwei Jahre.',
      answer: '18 Monate',
      category: 'Geografie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Es würde ungefähr 18 Monate dauern, die gesamte Chinesische Mauer entlangzulaufen.',
    },
    {
      questionText: 'Wie viele Farben hat die Nationalflagge von Belize, die als Flagge mit den meisten Farben gilt?',
      hint1: 'Mehr als der Standard-Buntstiftkasten aus der Grundschule.',
      hint2: 'Es sind zwischen 10 und 15 Farben.',
      answer: '12 Farben',
      category: 'Geschichte',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Die Nationalflagge von Belize hat 12 verschiedene Farben und gilt damit als Flagge mit den meisten Farben.',
    },
    {
      questionText: 'Wie viele Minuten dauerte der kürzeste Krieg der Geschichte, der Anglo-Sansibar-Krieg von 1896?',
      hint1: 'Kürzer als eine durchschnittliche Serienfolge.',
      hint2: 'Der Krieg dauerte deutlich weniger als eine Stunde, aber mehr als 30 Minuten.',
      answer: '38 Minuten',
      category: 'Geschichte',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Der Anglo-Sansibar-Krieg von 1896 war mit einer Dauer von nur 38 Minuten der kürzeste Krieg der Geschichte.',
    },
    {
      questionText: 'Wie viele Jahre ist das älteste bekannte Kunstwerk der Welt ungefähr alt?',
      hint1: 'Definitiv älter als dein Instagram-Account.',
      hint2: 'Es liegt im Bereich von mehreren zehntausend Jahren – zwischen 40.000 und 50.000.',
      answer: '44.000 Jahre',
      category: 'Popkultur',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Das älteste bekannte Kunstwerk der Welt auf der indonesischen Insel Sulawesi ist etwa 44.000 Jahre alt.',
    },
    {
      questionText: 'Wie viele Tweets werden weltweit ungefähr pro Sekunde verschickt?',
      hint1: 'Genug, um jede Meinung gleichzeitig zu posten – mehrfach.',
      hint2: 'Es sind knapp unter 10.000 Tweets pro Sekunde.',
      answer: '9.310 Tweets',
      category: 'Technik',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Etwa 9.310 Tweets werden jede Sekunde verschickt.',
    },
    {
      questionText: 'Welchen Wert in Millionen US-Dollar hat das Gemälde „Salvator Mundi" von Leonardo da Vinci ungefähr?',
      hint1: 'Für den Preis bekommst du mehr als nur einen schicken Ikea-Druck.',
      hint2: 'Der Wert liegt zwischen 400 und 500 Millionen US-Dollar.',
      answer: '450,3 Millionen US-Dollar',
      category: 'Popkultur',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: '„Salvator Mundi" von Leonardo da Vinci gilt als das teuerste Gemälde der Welt und hat einen Wert von etwa 450,3 Millionen US-Dollar.',
    },
    {
      questionText: 'Wie viele internationale Besucher hatte Frankreich im Jahr 2018 ungefähr?',
      hint1: 'Da standen einige Menschen gemeinsam vor dem Eiffelturm an.',
      hint2: 'Es sind knapp unter 100 Millionen Besucher.',
      answer: '90 Millionen Besucher',
      category: 'Geografie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Frankreich war 2018 mit rund 90 Millionen Besuchern das meistbesuchte Land der Welt.',
    },
    {
      questionText: 'Wie viel Prozent der weltweiten Währung sind Schätzungen zufolge digital?',
      hint1: 'Dein Geldbeutel ist deutlich analoger als das Weltfinanzsystem.',
      hint2: 'Es sind deutlich über 80 Prozent, aber weniger als 100 Prozent.',
      answer: '92 Prozent',
      category: 'Technik',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Rund 92 Prozent der weltweiten Währung existieren nur digital.',
    },
    {
      questionText: 'Wie viele Milliarden US-Dollar hat der Film „Avatar" weltweit ungefähr eingespielt?',
      hint1: 'Damit kannst du dir schon ein paar 3D-Brillen leisten.',
      hint2: 'Der Umsatz liegt knapp unter 3 Milliarden US-Dollar.',
      answer: '2,9 Milliarden US-Dollar',
      category: 'Popkultur',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: '„Avatar" ist einer der umsatzstärksten Filme aller Zeiten und hat über 2,9 Milliarden US-Dollar eingespielt.',
    },
    {
      questionText: 'Wie hoch ist die Statue of Unity ungefähr in Metern?',
      hint1: 'Definitiv nichts für Menschen mit Höhenangst.',
      hint2: 'Die Höhe liegt zwischen 150 und 200 Metern.',
      answer: '182 Meter',
      category: 'Geografie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Die Statue of Unity ist mit einer Höhe von etwa 182 Metern die höchste Statue der Welt.',
    },
    {
      questionText: 'Wie hoch ist die Freiheitsstatue ungefähr in Metern?',
      hint1: 'Schon hoch genug, um darüber nachzudenken, ob der Aufzug funktioniert.',
      hint2: 'Die Höhe liegt zwischen 80 und 100 Metern.',
      answer: '93 Meter',
      category: 'Geografie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Die Freiheitsstatue in New York ist im Vergleich dazu etwa 93 Meter hoch.',
    },
    {
      questionText: 'Welcher Anteil der männlichen Weltbevölkerung stammt genetisch von Dschingis Khan ab?',
      hint1: 'Familiendrama auf historischer XXL-Skala.',
      hint2: 'Es ist weniger als ein Prozent, aber mehr als 0,1 Prozent.',
      answer: '0,5 Prozent',
      category: 'Geschichte',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Etwa 0,5 Prozent der männlichen Bevölkerung tragen ein Y-Chromosom, das auf Dschingis Khan zurückgeführt wird.',
    },
    {
      questionText: 'Wie viele Millionen Hektar Waldfläche hat Russland ungefähr?',
      hint1: 'Da verläuft sich sogar ein Navi.',
      hint2: 'Die Fläche liegt zwischen 700 und 900 Millionen Hektar.',
      answer: '815 Millionen Hektar',
      category: 'Geografie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Russland ist das waldreichste Land der Welt mit rund 815 Millionen Hektar Waldfläche.',
    },
    {
      questionText: 'Wie viele Menschen leben ungefähr in China?',
      hint1: 'Da wird es beim Familienfest richtig voll.',
      hint2: 'Es sind etwas mehr als 1,3 Milliarden, aber weniger als 1,5 Milliarden Menschen.',
      answer: '1,4 Milliarden Menschen',
      category: 'Geografie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'China ist mit rund 1,4 Milliarden Menschen das bevölkerungsreichste Land der Welt.',
    },
    {
      questionText: 'Wie alt war Malala Yousafzai, als sie den Friedensnobelpreis erhielt?',
      hint1: 'In dem Alter hast du vermutlich eher über Hausaufgaben geschimpft.',
      hint2: 'Sie war noch keine 20 – eher im späten Teenageralter.',
      answer: '17 Jahre',
      category: 'Geschichte',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Malala Yousafzai war 17 Jahre alt, als sie 2014 den Friedensnobelpreis erhielt.',
    },
    {
      questionText: 'Wie weit sind die Tristan-da-Cunha-Inseln ungefähr vom nächstgelegenen bewohnten Ort St. Helena entfernt?',
      hint1: 'Definitiv kein spontaner Spaziergang zum Nachbarn.',
      hint2: 'Die Entfernung liegt zwischen 2.000 und 3.000 Kilometern.',
      answer: '2.434 Kilometer',
      category: 'Geografie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Die abgelegenen Tristan-da-Cunha-Inseln liegen etwa 2.434 Kilometer von St. Helena, dem nächstgelegenen bewohnten Ort, entfernt.',
    },
    {
      questionText: 'Wie viele Computer setzt Google ungefähr ein, um eine Suchanfrage zu beantworten?',
      hint1: 'Und du dachtest, dein Laptop ackert schon viel.',
      hint2: 'Es sind mehrere hundert – im Bereich um die 1.000 Computer.',
      answer: '1.000 Computer',
      category: 'Technik',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Wenn du etwas googlest, werden etwa 1.000 Computer eingesetzt, um die Antwort zu finden.',
    },
    {
      questionText: 'Wie viele Sekunden dauert es ungefähr, bis Google eine Antwort auf deine Suchanfrage liefert?',
      hint1: 'Schneller, als du „Wie schreibt man…" fertig tippen kannst.',
      hint2: 'Es ist deutlich weniger als eine Sekunde – im Bereich einiger Zehntelsekunden.',
      answer: '0,2 Sekunden',
      category: 'Technik',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Google braucht nur etwa 0,2 Sekunden, um eine Antwort auf eine Suche zu liefern.',
    },
    {
      questionText: 'Wie viele Internetnutzer gibt es weltweit ungefähr?',
      hint1: 'Kein Wunder, dass WLAN nie frei ist.',
      hint2: 'Es sind etwas mehr als 4, aber weniger als 6 Milliarden Menschen.',
      answer: '5 Milliarden Nutzer',
      category: 'Technik',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Es gibt über 5 Milliarden Internetnutzer auf der Welt (Stand 2023).',
    },
    {
      questionText: 'Wie viele Jahre beträgt ungefähr das Durchschnittsalter der Weltbevölkerung?',
      hint1: 'Global gesehen ist die Menschheit eher in der „Quarter-Life-Crisis".',
      hint2: 'Der Wert liegt zwischen 25 und 40 Jahren.',
      answer: '30 Jahre',
      category: 'Wissenschaft',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Das Durchschnittsalter der Weltbevölkerung liegt bei etwa 30 Jahren.',
    },
    {
      questionText: 'In welcher Entfernung in Meilen kann man das Gebrüll eines Tigers ungefähr hören?',
      hint1: 'Wenn du es hörst, brauchst du keine App mehr zur Tiererkennung.',
      hint2: 'Es ist mehr als eine, aber weniger als drei Meilen.',
      answer: '2 Meilen',
      category: 'Tiere',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Das Gebrüll eines Tigers kann man bis zu zwei Meilen weit hören.',
    },
    {
      questionText: 'Wie weit ist die Erde ungefähr von der Sonne entfernt in Kilometern?',
      hint1: 'Ein Stück weiter als dein täglicher Arbeitsweg.',
      hint2: 'Die Distanz liegt zwischen 100 und 200 Millionen Kilometern.',
      answer: '147,2 Millionen Kilometer',
      category: 'Astronomie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Die Erde ist etwa 147,2 Millionen Kilometer von der Sonne entfernt.',
    },
    {
      questionText: 'Wie alt ist die Erde ungefähr in Jahren?',
      hint1: 'Definitiv älter als jede Steuererklärung, die du je abgegeben hast.',
      hint2: 'Das Alter liegt im Bereich von mehreren Milliarden Jahren – etwa zwischen 4 und 5 Milliarden.',
      answer: '4,5 Milliarden Jahre',
      category: 'Astronomie',
      website: 'https://www.ef.at/blog/language/50-unglaubliche-fakten-uber-die-welt-die-dich-kultiviert-wirken-lassen/',
      description: 'Die Erde ist etwa 4,5 Milliarden Jahre alt.',
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

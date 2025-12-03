// Kategorien
export enum Category {
  SCIENCE = 'SCIENCE',
  HISTORY = 'HISTORY',
  GEOGRAPHY = 'GEOGRAPHY',
  SPORTS = 'SPORTS',
  TECHNOLOGY = 'TECHNOLOGY',
  POP_CULTURE = 'POP_CULTURE',
  MISC = 'MISC',
  EVERYDAY = 'EVERYDAY',
  ANIMALS = 'ANIMALS',
  FOOD = 'FOOD',
  HEALTH = 'HEALTH',
  MUSIC = 'MUSIC',
  ASTRONOMY = 'ASTRONOMY'
}

// Kategorie-Labels auf Deutsch
export const CategoryLabels: Record<Category, string> = {
  [Category.SCIENCE]: 'Wissenschaft',
  [Category.HISTORY]: 'Geschichte',
  [Category.GEOGRAPHY]: 'Geografie',
  [Category.SPORTS]: 'Sport',
  [Category.TECHNOLOGY]: 'Technologie',
  [Category.POP_CULTURE]: 'Popkultur',
  [Category.MISC]: 'Sonstiges',
  [Category.EVERYDAY]: 'Alltag',
  [Category.ANIMALS]: 'Tiere',
  [Category.FOOD]: 'Essen & Trinken',
  [Category.HEALTH]: 'Gesundheit',
  [Category.MUSIC]: 'Musik',
  [Category.ASTRONOMY]: 'Astronomie'
}

// Fragen-Status
export enum QuestionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Status-Labels auf Deutsch
export const StatusLabels: Record<QuestionStatus, string> = {
  [QuestionStatus.PENDING]: 'Ausstehend',
  [QuestionStatus.APPROVED]: 'Genehmigt',
  [QuestionStatus.REJECTED]: 'Abgelehnt'
}

// Hinweis
export interface Hint {
  id: string
  questionId: string
  orderIndex: number
  hintText: string
}

// Frage
export interface Question {
  id: string
  category: Category
  questionText: string
  answerValue: number
  answerUnit?: string
  explanation?: string
  sourceUrl?: string // Quelle/Webseite wo die Information herkommt
  status: QuestionStatus
  contributorName?: string
  rejectionReason?: string
  playedCount: number // Wie oft wurde die Frage gespielt
  ratingSum: number // Sum of all ratings (1-5)
  ratingCount: number // Number of ratings
  createdAt: string
  updatedAt: string
  hints: Hint[]
}

// Spielzustände - Neuer Ablauf:
// Frage → Schätzen → Einsatzrunde 1 → Hinweis 1 → Einsatzrunde 2 → Hinweis 2 → Einsatzrunde 3 → Auflösung → Einsatzrunde 4 → Auswertung
export enum GameState {
  QUESTION_INTRO = 'QUESTION_INTRO',
  WRITE_GUESSES = 'WRITE_GUESSES',
  BETTING_ROUND = 'BETTING_ROUND',
  HINT_REVEAL = 'HINT_REVEAL',
  REVEAL_ANSWER = 'REVEAL_ANSWER',
  ROUND_SUMMARY = 'ROUND_SUMMARY',
  GAME_OVER = 'GAME_OVER'
}

// Spielzustand-Labels auf Deutsch
export const GameStateLabels: Record<GameState, string> = {
  [GameState.QUESTION_INTRO]: 'Frage',
  [GameState.WRITE_GUESSES]: 'Schätzen',
  [GameState.BETTING_ROUND]: 'Einsätze',
  [GameState.HINT_REVEAL]: 'Hinweis',
  [GameState.REVEAL_ANSWER]: 'Auflösung',
  [GameState.ROUND_SUMMARY]: 'Auswertung',
  [GameState.GAME_OVER]: 'Spiel Ende'
}

// Mitspielende
export interface Player {
  name: string
  isActive: boolean // false = ausgeschieden
}

// Spieleinstellungen
export interface GameSettings {
  playerCount: number
  playerNames: string[]
  players: Player[]
  dealerIndex: number // Wer ist aktuell Dealer (rotiert jede Runde)
}

// Spielsitzung
export interface GameSession {
  id: string
  createdAt: string
  settings: GameSettings
  usedQuestions: string[]
  currentState: GameState
  isActive: boolean
}

// Runden-Daten
export interface RoundData {
  question: Question
  currentHintIndex: number
  revealedHints: Hint[]
  winnerName?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface DashboardStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

// Formular-Typen
export interface QuestionSubmission {
  category: Category
  questionText: string
  answerValue: number
  explanation?: string
  sourceUrl: string // Verpflichtend: Webseite als Quelle
  hints: { hintText: string }[]
  contributorName?: string
  captchaToken: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  username: string
}

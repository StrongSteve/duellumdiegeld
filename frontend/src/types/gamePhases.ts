/**
 * GamePhase - State machine for round progression
 *
 * This is a frontend-only representation that maps from the existing
 * GameState + bettingRoundNumber + currentHintIndex to provide
 * better UX labels and phase visualization.
 */

export enum GamePhase {
  FrageSchaetzung = 'FrageSchaetzung',
  ErsteEinsatzrunde = 'ErsteEinsatzrunde',
  ErsterHinweis = 'ErsterHinweis',
  ZweiteEinsatzrunde = 'ZweiteEinsatzrunde',
  ZweiterHinweis = 'ZweiterHinweis',
  DritteEinsatzrunde = 'DritteEinsatzrunde',
  Loesung = 'Loesung',
  LetzteEinsatzrunde = 'LetzteEinsatzrunde',
  Showdown = 'Showdown'
}

export type PhaseMeta = {
  fortschrittText: string
  buttonText: string
  shortName: string
  icon: string
}

export const PHASE_META: Record<GamePhase, PhaseMeta> = {
  [GamePhase.FrageSchaetzung]: {
    fortschrittText: 'Schätzungen aufschreiben',
    buttonText: 'Weiter zur ersten Einsatzrunde',
    shortName: 'Frage & Schätzung',
    icon: '❓'
  },
  [GamePhase.ErsteEinsatzrunde]: {
    fortschrittText: 'Erste Einsatzrunde',
    buttonText: 'Einsatzrunde beendet\nWeiter zum ersten Hinweis',
    shortName: '1. Einsatzrunde',
    icon: '🎰'
  },
  [GamePhase.ErsterHinweis]: {
    fortschrittText: '1. Hinweis wird angezeigt',
    buttonText: 'Weiter zur zweiten Einsatzrunde',
    shortName: '1. Hinweis',
    icon: '💡'
  },
  [GamePhase.ZweiteEinsatzrunde]: {
    fortschrittText: 'Zweite Einsatzrunde',
    buttonText: 'Einsatzrunde beendet\nWeiter zum zweiten Hinweis',
    shortName: '2. Einsatzrunde',
    icon: '🎰'
  },
  [GamePhase.ZweiterHinweis]: {
    fortschrittText: '2. Hinweis wird angezeigt',
    buttonText: 'Weiter zur dritten Einsatzrunde',
    shortName: '2. Hinweis',
    icon: '💡'
  },
  [GamePhase.DritteEinsatzrunde]: {
    fortschrittText: 'Dritte Einsatzrunde',
    buttonText: 'Einsatzrunde beendet\nWeiter zur Lösung',
    shortName: '3. Einsatzrunde',
    icon: '🎰'
  },
  [GamePhase.Loesung]: {
    fortschrittText: 'Lösung wird angezeigt',
    buttonText: 'Weiter zur letzten Einsatzrunde',
    shortName: 'Lösung',
    icon: '🎯'
  },
  [GamePhase.LetzteEinsatzrunde]: {
    fortschrittText: 'Letzte Einsatzrunde',
    buttonText: 'Weiter zum Showdown',
    shortName: 'Letzte Einsatzrunde',
    icon: '🎰'
  },
  [GamePhase.Showdown]: {
    fortschrittText: 'Showdown',
    buttonText: 'Runde beenden\nBewertung und neue Frage',
    shortName: 'Showdown',
    icon: '🏆'
  }
}

// Ordered list of all phases for timeline visualization
export const PHASE_ORDER: GamePhase[] = [
  GamePhase.FrageSchaetzung,
  GamePhase.ErsteEinsatzrunde,
  GamePhase.ErsterHinweis,
  GamePhase.ZweiteEinsatzrunde,
  GamePhase.ZweiterHinweis,
  GamePhase.DritteEinsatzrunde,
  GamePhase.Loesung,
  GamePhase.LetzteEinsatzrunde,
  GamePhase.Showdown
]

// Phases that are betting rounds (for overlay)
export const BETTING_PHASES: GamePhase[] = [
  GamePhase.ErsteEinsatzrunde,
  GamePhase.ZweiteEinsatzrunde,
  GamePhase.DritteEinsatzrunde,
  GamePhase.LetzteEinsatzrunde
]

export function isBettingPhase(phase: GamePhase): boolean {
  return BETTING_PHASES.includes(phase)
}

// LocalStorage utility for storing played question texts
// This complements the cookie storage (which stores IDs) by storing the actual question texts

const STORAGE_KEY = 'played_questions_texts'

interface PlayedQuestionEntry {
  id: string
  text: string
}

/**
 * Gets all played question texts from localStorage
 */
export function getPlayedQuestionTexts(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const entries: PlayedQuestionEntry[] = JSON.parse(stored)
    return entries.map(e => e.text)
  } catch {
    return []
  }
}

/**
 * Gets all played question entries (with IDs) from localStorage
 */
export function getPlayedQuestionEntries(): PlayedQuestionEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Adds a played question text to localStorage
 */
export function addPlayedQuestionText(questionId: string, questionText: string): void {
  try {
    const entries = getPlayedQuestionEntries()

    // Avoid duplicates by checking ID
    if (!entries.some(e => e.id === questionId)) {
      entries.push({ id: questionId, text: questionText })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    }
  } catch (e) {
    console.error('Error saving played question text:', e)
  }
}

/**
 * Clears all played question texts from localStorage
 */
export function clearPlayedQuestionTexts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore errors
  }
}

/**
 * Checks if a question text exists in storage
 */
export function hasPlayedQuestionText(questionId: string): boolean {
  const entries = getPlayedQuestionEntries()
  return entries.some(e => e.id === questionId)
}

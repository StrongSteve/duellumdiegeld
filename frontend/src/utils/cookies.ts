// Cookie utility functions for storing played question IDs

const PLAYED_QUESTIONS_KEY = 'played_questions'
const MAX_AGE_DAYS = 365 // Store cookies for 1 year

/**
 * Gets all played question IDs from the cookie
 */
export function getPlayedQuestionIds(): string[] {
  try {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${PLAYED_QUESTIONS_KEY}=`))

    if (!cookie) return []

    const value = decodeURIComponent(cookie.split('=')[1])
    return JSON.parse(value) || []
  } catch {
    return []
  }
}

/**
 * Adds a question ID to the played questions cookie
 */
export function addPlayedQuestionId(questionId: string): void {
  const played = getPlayedQuestionIds()

  // Avoid duplicates
  if (!played.includes(questionId)) {
    played.push(questionId)
  }

  // Set cookie (max 4KB, so ~200-400 IDs)
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60
  const value = encodeURIComponent(JSON.stringify(played))
  document.cookie = `${PLAYED_QUESTIONS_KEY}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`
}

/**
 * Clears all played questions from the cookie
 */
export function clearPlayedQuestions(): void {
  document.cookie = `${PLAYED_QUESTIONS_KEY}=; max-age=0; path=/`
}

/**
 * Checks if a question has already been played
 */
export function wasQuestionPlayed(questionId: string): boolean {
  return getPlayedQuestionIds().includes(questionId)
}

/**
 * Unified IndexedDB storage for played questions
 * Replaces the dual cookie + localStorage approach with a single IndexedDB store
 *
 * Benefits:
 * - Single source of truth for played questions
 * - More storage capacity than cookies (~4KB limit)
 * - Persistent storage that survives browser restarts
 * - Better performance for large datasets
 */

const DB_NAME = 'das_duell_db'
const DB_VERSION = 1
const STORE_NAME = 'played_questions'

interface PlayedQuestion {
  id: string
  text: string
  playedAt: number // timestamp
}

let dbPromise: Promise<IDBDatabase> | null = null

/**
 * Opens the IndexedDB database
 */
function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object store with id as keyPath
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('playedAt', 'playedAt', { unique: false })
      }
    }
  })

  return dbPromise
}

/**
 * Gets all played question IDs
 */
export async function getPlayedQuestionIds(): Promise<string[]> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAllKeys()

      request.onsuccess = () => {
        resolve(request.result as string[])
      }
      request.onerror = () => {
        console.error('Error getting played question IDs:', request.error)
        reject(request.error)
      }
    })
  } catch {
    return []
  }
}

/**
 * Gets all played question texts
 */
export async function getPlayedQuestionTexts(): Promise<string[]> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const questions = request.result as PlayedQuestion[]
        resolve(questions.map((q) => q.text))
      }
      request.onerror = () => {
        console.error('Error getting played question texts:', request.error)
        reject(request.error)
      }
    })
  } catch {
    return []
  }
}

/**
 * Adds a played question to the database
 */
export async function addPlayedQuestion(
  questionId: string,
  questionText: string
): Promise<void> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const question: PlayedQuestion = {
        id: questionId,
        text: questionText,
        playedAt: Date.now()
      }

      // Use put to update if exists, add if not
      const request = store.put(question)

      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Error adding played question:', request.error)
        reject(request.error)
      }
    })
  } catch (e) {
    console.error('Error adding played question:', e)
  }
}

/**
 * Checks if a question has been played
 */
export async function wasQuestionPlayed(questionId: string): Promise<boolean> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(questionId)

      request.onsuccess = () => {
        resolve(!!request.result)
      }
      request.onerror = () => {
        console.error('Error checking played question:', request.error)
        reject(request.error)
      }
    })
  } catch {
    return false
  }
}

/**
 * Clears all played questions
 */
export async function clearPlayedQuestions(): Promise<void> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error('Error clearing played questions:', request.error)
        reject(request.error)
      }
    })
  } catch (e) {
    console.error('Error clearing played questions:', e)
  }
}

/**
 * Gets count of played questions
 */
export async function getPlayedQuestionsCount(): Promise<number> {
  try {
    const db = await openDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.count()

      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = () => {
        console.error('Error counting played questions:', request.error)
        reject(request.error)
      }
    })
  } catch {
    return 0
  }
}

/**
 * Migrate existing data from cookie + localStorage to IndexedDB
 * Call this once on app startup
 */
export async function migrateFromLegacyStorage(): Promise<void> {
  try {
    // Check if migration already done
    const count = await getPlayedQuestionsCount()
    if (count > 0) return // Already has data, skip migration

    // Try to read from old localStorage
    const LEGACY_STORAGE_KEY = 'played_questions_texts'
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (stored) {
      const entries: { id: string; text: string }[] = JSON.parse(stored)
      for (const entry of entries) {
        await addPlayedQuestion(entry.id, entry.text)
      }
      // Clean up legacy storage after successful migration
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    }

    // Also try to read IDs from old cookie (in case localStorage didn't have texts)
    const LEGACY_COOKIE_KEY = 'played_questions'
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${LEGACY_COOKIE_KEY}=`))

    if (cookie) {
      const value = decodeURIComponent(cookie.split('=')[1])
      const ids: string[] = JSON.parse(value) || []
      for (const id of ids) {
        // Only add if not already migrated from localStorage
        const exists = await wasQuestionPlayed(id)
        if (!exists) {
          // We don't have the text, so use a placeholder
          await addPlayedQuestion(id, '[Frage nicht mehr verfügbar]')
        }
      }
      // Clear the old cookie
      document.cookie = `${LEGACY_COOKIE_KEY}=; max-age=0; path=/`
    }
  } catch (e) {
    console.error('Migration from legacy storage failed:', e)
  }
}

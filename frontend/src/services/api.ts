import type {
  Question,
  QuestionSubmission,
  LoginCredentials,
  AuthResponse,
  DashboardStats,
  GameSession,
  QuestionStatus,
  Category
} from '@/types'

const API_BASE = '/api'

// Default retry configuration - longer timeouts for Render cold starts
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 2000,
  maxDelayMs: 15000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504, 0] // 0 = network error
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public isRetryable: boolean = false
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RetryConfig {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  retryableStatusCodes?: number[]
}

interface FetchOptions extends RequestInit {
  retry?: RetryConfig | false
  timeout?: number
}

/**
 * Calculates exponential backoff delay with jitter
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  // Add random jitter (0-25% of the delay)
  const jitter = exponentialDelay * Math.random() * 0.25
  return exponentialDelay + jitter
}

/**
 * Sleeps for the specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Centralized API fetch with retry logic and error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  // Longer default timeout for Render cold starts (60s)
  const { retry, timeout = 60000, ...fetchOptions } = options
  const retryConfig = retry === false ? null : { ...DEFAULT_RETRY_CONFIG, ...retry }

  const token = localStorage.getItem('adminToken')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers
  }

  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  let lastError: ApiError | null = null
  const maxAttempts = retryConfig ? retryConfig.maxRetries + 1 : 1

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const isRetryable =
          retryConfig?.retryableStatusCodes?.includes(response.status) ?? false

        lastError = new ApiError(
          response.status,
          errorData.message || getErrorMessage(response.status),
          isRetryable
        )

        // Only retry if it's a retryable error and we have attempts left
        if (isRetryable && retryConfig && attempt < retryConfig.maxRetries) {
          const delay = calculateDelay(
            attempt,
            retryConfig.baseDelayMs,
            retryConfig.maxDelayMs
          )
          console.warn(
            `API call to ${endpoint} failed (attempt ${attempt + 1}/${maxAttempts}), retrying in ${Math.round(delay)}ms...`
          )
          await sleep(delay)
          continue
        }

        throw lastError
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        throw error
      }

      // Handle network errors and timeouts
      const isNetworkError =
        error instanceof TypeError ||
        (error instanceof DOMException && error.name === 'AbortError')

      lastError = new ApiError(
        0,
        isNetworkError ? 'Netzwerkfehler - Bitte Verbindung überprüfen' : 'Unbekannter Fehler',
        isNetworkError
      )

      // Retry network errors
      if (isNetworkError && retryConfig && attempt < retryConfig.maxRetries) {
        const delay = calculateDelay(
          attempt,
          retryConfig.baseDelayMs,
          retryConfig.maxDelayMs
        )
        console.warn(
          `Network error on ${endpoint} (attempt ${attempt + 1}/${maxAttempts}), retrying in ${Math.round(delay)}ms...`
        )
        await sleep(delay)
        continue
      }

      throw lastError
    }
  }

  // Should not reach here, but just in case
  throw lastError || new ApiError(0, 'Unbekannter Fehler')
}

/**
 * Get user-friendly error message for HTTP status codes
 */
function getErrorMessage(status: number): string {
  switch (status) {
    case 0:
      return 'Server nicht erreichbar - Der Server startet möglicherweise gerade (bis zu 60 Sekunden)'
    case 400:
      return 'Ungültige Anfrage'
    case 401:
      return 'Nicht autorisiert - Bitte erneut anmelden'
    case 403:
      return 'Zugriff verweigert'
    case 404:
      return 'Nicht gefunden'
    case 408:
      return 'Zeitüberschreitung - Server antwortet nicht, bitte erneut versuchen'
    case 409:
      return 'Konflikt - Daten wurden bereits geändert'
    case 422:
      return 'Ungültige Daten'
    case 429:
      return 'Zu viele Anfragen - Bitte warten'
    case 500:
      return 'Serverfehler - Bitte erneut versuchen'
    case 502:
      return 'Server startet gerade - Bitte einen Moment warten und erneut versuchen'
    case 503:
      return 'Server nicht verfügbar - Startet möglicherweise gerade'
    case 504:
      return 'Server antwortet nicht - Bitte erneut versuchen'
    default:
      return `HTTP-Fehler: ${status}`
  }
}

// Health check API (used by serverStatus store)
export const healthApi = {
  check: async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 65000)

      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }
}

// Auth API
export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
}

// Questions API (Public)
export const questionsApi = {
  submit: (data: QuestionSubmission): Promise<{ success: boolean; message: string; questionId: string }> =>
    fetchApi('/questions/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getRandom: (excludeIds: string[] = []): Promise<{ success: boolean; question: Question | null; message?: string }> => {
    const query = excludeIds.length > 0 ? `?exclude=${excludeIds.join(',')}` : ''
    return fetchApi(`/questions/random${query}`)
  },

  getCount: (): Promise<{ count: number }> =>
    fetchApi('/questions/count'),

  getCaptchaChallenge: (): Promise<{ challengeId: string; question: string }> =>
    fetchApi('/questions/captcha'),

  rateQuestion: (questionId: string, rating: number): Promise<{ success: boolean; message: string }> =>
    fetchApi('/questions/rate', {
      method: 'POST',
      body: JSON.stringify({ questionId, rating })
    })
}

// Admin API
export const adminApi = {
  getDashboard: (): Promise<DashboardStats> =>
    fetchApi('/admin/dashboard'),

  getPendingQuestions: (): Promise<Question[]> =>
    fetchApi('/admin/questions/pending'),

  getAllQuestions: (filters?: {
    status?: QuestionStatus
    category?: Category
    search?: string
  }): Promise<Question[]> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.search) params.append('search', filters.search)
    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchApi(`/admin/questions${query}`)
  },

  getQuestion: (id: string): Promise<Question> =>
    fetchApi(`/admin/questions/${id}`),

  approveQuestion: (id: string): Promise<Question> =>
    fetchApi(`/admin/questions/${id}/approve`, { method: 'POST' }),

  rejectQuestion: (id: string, reason?: string): Promise<Question> =>
    fetchApi(`/admin/questions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  updateQuestion: (id: string, data: Partial<Omit<Question, 'hints'>> & { hints?: { hintText: string }[] }): Promise<Question> =>
    fetchApi(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteQuestion: (id: string): Promise<{ success: boolean; message: string }> =>
    fetchApi(`/admin/questions/${id}`, { method: 'DELETE' }),

  exportQuestions: async (): Promise<void> => {
    const token = localStorage.getItem('adminToken')
    const response = await fetch(`${API_BASE}/admin/export`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new ApiError(response.status, 'Export fehlgeschlagen')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `questions-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  importQuestions: (data: { questions: unknown[] }, skipDuplicates = true): Promise<{
    success: boolean
    imported: number
    skipped: number
    errors: string[]
    message: string
  }> =>
    fetchApi(`/admin/import?skipDuplicates=${skipDuplicates}`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
}

// Game API
export const gameApi = {
  createSession: (settings: { playerCount: number; playerNames: string[] }): Promise<GameSession> =>
    fetchApi('/game/session', {
      method: 'POST',
      body: JSON.stringify({
        ...settings,
        startingMoney: 1000, // Default value for backend compatibility
        timerDuration: 0
      })
    }),

  getSession: (id: string): Promise<GameSession> =>
    fetchApi(`/game/session/${id}`),

  updateSession: (id: string, data: { currentState?: string; usedQuestions?: string[] }): Promise<GameSession> =>
    fetchApi(`/game/session/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getNextQuestion: (sessionId: string): Promise<{ success: boolean; question: Question | null; message?: string }> =>
    fetchApi(`/game/session/${sessionId}/next-question`),

  endSession: (id: string): Promise<GameSession> =>
    fetchApi(`/game/session/${id}/end`, { method: 'POST' })
}

export { ApiError }

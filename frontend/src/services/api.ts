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

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('adminToken')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      errorData.message || `HTTP-Fehler: ${response.status}`
    )
  }

  return response.json()
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

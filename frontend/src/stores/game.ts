import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questionsApi, gameApi } from '@/services/api'
import { GameState, type Question, type GameSettings, type Player } from '@/types'
import { getPlayedQuestionIds, addPlayedQuestionId, clearPlayedQuestions } from '@/utils/cookies'

// LocalStorage Keys
const STORAGE_KEYS = {
  SESSION_ID: 'game_session_id',
  SETTINGS: 'game_settings',
  CURRENT_STATE: 'game_current_state',
  CURRENT_QUESTION: 'game_current_question',
  CURRENT_HINT_INDEX: 'game_current_hint_index',
  BETTING_ROUND_NUMBER: 'game_betting_round_number',
  USED_QUESTIONS: 'game_used_questions',
  ROUND_NUMBER: 'game_round_number',
  PLAYERS: 'game_players',
  DEALER_INDEX: 'game_dealer_index'
}

// Game flow:
// Question → Guessing → Betting Round 1 → Hint 1 → Betting Round 2 → Hint 2 → Betting Round 3 → Answer Reveal → Betting Round 4 → Winner
// bettingRoundNumber: 1 = after guessing, 2 = after hint 1, 3 = after hint 2, 4 = after answer reveal

export const useGameStore = defineStore('game', () => {
  // State
  const sessionId = ref<string | null>(loadFromStorage(STORAGE_KEYS.SESSION_ID))
  const settings = ref<GameSettings>(
    loadFromStorage(STORAGE_KEYS.SETTINGS) || {
      playerCount: 2,
      playerNames: ['Spieler 1', 'Spieler 2'],
      players: [
        { name: 'Spieler 1', isActive: true },
        { name: 'Spieler 2', isActive: true }
      ],
      dealerIndex: 0
    }
  )
  const currentState = ref<GameState>(
    loadFromStorage(STORAGE_KEYS.CURRENT_STATE) || GameState.QUESTION_INTRO
  )
  const currentQuestion = ref<Question | null>(loadFromStorage(STORAGE_KEYS.CURRENT_QUESTION))
  const currentHintIndex = ref<number>(loadFromStorage(STORAGE_KEYS.CURRENT_HINT_INDEX) || 0)
  const bettingRoundNumber = ref<number>(loadFromStorage(STORAGE_KEYS.BETTING_ROUND_NUMBER) || 1)
  const usedQuestionIds = ref<string[]>(loadFromStorage(STORAGE_KEYS.USED_QUESTIONS) || [])
  const roundNumber = ref<number>(loadFromStorage(STORAGE_KEYS.ROUND_NUMBER) || 1)
  const winnerName = ref<string | null>(null)

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed: Active players
  const activePlayers = computed<Player[]>(() => {
    return settings.value.players.filter(p => p.isActive)
  })

  // Computed: Small Blind and Big Blind (only active players)
  // dealerIndex is used as the blind position marker (rotates each round)
  // SB and BB are always consecutive active players clockwise

  const smallBlindPlayer = computed<Player | null>(() => {
    const active = activePlayers.value
    if (active.length < 2) return null
    // SB is at the current blind position
    const idx = settings.value.dealerIndex % active.length
    return active[idx]
  })

  const bigBlindPlayer = computed<Player | null>(() => {
    const active = activePlayers.value
    if (active.length < 2) return null
    // BB is always one position after SB (clockwise)
    const idx = (settings.value.dealerIndex + 1) % active.length
    return active[idx]
  })

  // Computed: Hints (only the first 2)
  const availableHints = computed(() => {
    if (!currentQuestion.value) return []
    return currentQuestion.value.hints.slice(0, 2)
  })

  const revealedHints = computed(() => {
    return availableHints.value.slice(0, currentHintIndex.value)
  })

  const currentHint = computed(() => {
    if (currentHintIndex.value === 0) return null
    return availableHints.value[currentHintIndex.value - 1] || null
  })

  const hasMoreHints = computed(() => {
    return currentHintIndex.value < 2
  })

  // Computed: Game steps for step indicator
  const gameSteps = computed(() => {
    return [
      { state: GameState.QUESTION_INTRO, label: 'Frage', icon: '❓' },
      { state: GameState.WRITE_GUESSES, label: 'Schätzen', icon: '📝' },
      { state: GameState.BETTING_ROUND, label: 'Einsätze', bettingRound: 1, icon: '💰' },
      { state: GameState.HINT_REVEAL, label: 'Hinweis 1', hintIndex: 1, icon: '💡' },
      { state: GameState.BETTING_ROUND, label: 'Einsätze', bettingRound: 2, icon: '💰' },
      { state: GameState.HINT_REVEAL, label: 'Hinweis 2', hintIndex: 2, icon: '💡' },
      { state: GameState.BETTING_ROUND, label: 'Einsätze', bettingRound: 3, icon: '💰' },
      { state: GameState.REVEAL_ANSWER, label: 'Auflösung', icon: '🎯' },
      { state: GameState.BETTING_ROUND, label: 'Einsätze', bettingRound: 4, icon: '💰' },
      { state: GameState.ROUND_SUMMARY, label: 'Gewinner', icon: '🏆' }
    ]
  })

  const currentStepIndex = computed(() => {
    switch (currentState.value) {
      case GameState.QUESTION_INTRO:
        return 0
      case GameState.WRITE_GUESSES:
        return 1
      case GameState.BETTING_ROUND:
        // Wettrunde 1 = Index 2, Wettrunde 2 = Index 4, Wettrunde 3 = Index 6, Wettrunde 4 = Index 8
        return 2 + (bettingRoundNumber.value - 1) * 2
      case GameState.HINT_REVEAL:
        // Hinweis 1 = Index 3, Hinweis 2 = Index 5
        return 3 + (currentHintIndex.value - 1) * 2
      case GameState.REVEAL_ANSWER:
        return 7
      case GameState.ROUND_SUMMARY:
        return 9
      default:
        return 0
    }
  })

  // Helper: Load from LocalStorage
  function loadFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  }

  // Helper: Save to LocalStorage
  function saveToStorage(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Error saving to storage:', e)
    }
  }

  // Helper: Clear LocalStorage
  function clearStorage() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  // Persist state
  function persistState() {
    saveToStorage(STORAGE_KEYS.SESSION_ID, sessionId.value)
    saveToStorage(STORAGE_KEYS.SETTINGS, settings.value)
    saveToStorage(STORAGE_KEYS.CURRENT_STATE, currentState.value)
    saveToStorage(STORAGE_KEYS.CURRENT_QUESTION, currentQuestion.value)
    saveToStorage(STORAGE_KEYS.CURRENT_HINT_INDEX, currentHintIndex.value)
    saveToStorage(STORAGE_KEYS.BETTING_ROUND_NUMBER, bettingRoundNumber.value)
    saveToStorage(STORAGE_KEYS.USED_QUESTIONS, usedQuestionIds.value)
    saveToStorage(STORAGE_KEYS.ROUND_NUMBER, roundNumber.value)
  }

  // Actions
  function updateSettings(newSettings: Partial<GameSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    persistState()
  }

  async function startGame() {
    isLoading.value = true
    error.value = null

    try {
      // Session auf dem Server erstellen
      const session = await gameApi.createSession({
        playerCount: settings.value.playerCount,
        playerNames: settings.value.playerNames
      })

      sessionId.value = session.id
      usedQuestionIds.value = []
      roundNumber.value = 1
      bettingRoundNumber.value = 1
      currentHintIndex.value = 0

      // Erste Frage laden
      await loadNextQuestion()

      currentState.value = GameState.QUESTION_INTRO
      persistState()

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Spiel konnte nicht gestartet werden'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function loadNextQuestion() {
    isLoading.value = true
    error.value = null

    try {
      // Combine session-used questions with cookie-stored played questions
      const cookiePlayedIds = getPlayedQuestionIds()
      const allExcludedIds = [...new Set([...usedQuestionIds.value, ...cookiePlayedIds])]

      const response = await questionsApi.getRandom(allExcludedIds)

      if (!response.success || !response.question) {
        error.value = response.message || 'Keine weiteren Fragen verfügbar'
        currentState.value = GameState.GAME_OVER
        persistState()
        return false
      }

      currentQuestion.value = response.question
      usedQuestionIds.value.push(response.question.id)

      // Store question ID in cookie to prevent repeats across sessions
      addPlayedQuestionId(response.question.id)

      currentHintIndex.value = 0
      bettingRoundNumber.value = 1
      winnerName.value = null
      persistState()

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Frage konnte nicht geladen werden'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Change game state
  function goToState(state: GameState) {
    currentState.value = state
    persistState()
  }

  // Go to next step in game flow
  function nextStep() {
    switch (currentState.value) {
      case GameState.QUESTION_INTRO:
        currentState.value = GameState.WRITE_GUESSES
        break
      case GameState.WRITE_GUESSES:
        bettingRoundNumber.value = 1
        currentState.value = GameState.BETTING_ROUND
        break
      case GameState.BETTING_ROUND:
        if (bettingRoundNumber.value === 1) {
          currentHintIndex.value = 1
          currentState.value = GameState.HINT_REVEAL
        } else if (bettingRoundNumber.value === 2) {
          currentHintIndex.value = 2
          currentState.value = GameState.HINT_REVEAL
        } else if (bettingRoundNumber.value === 3) {
          currentState.value = GameState.REVEAL_ANSWER
        } else if (bettingRoundNumber.value === 4) {
          currentState.value = GameState.ROUND_SUMMARY
        }
        break
      case GameState.HINT_REVEAL:
        bettingRoundNumber.value++
        currentState.value = GameState.BETTING_ROUND
        break
      case GameState.REVEAL_ANSWER:
        bettingRoundNumber.value = 4
        currentState.value = GameState.BETTING_ROUND
        break
      case GameState.ROUND_SUMMARY:
        // Nächste Runde oder Spielende
        break
    }
    persistState()
  }

  // Set winner
  function setWinner(name: string | null) {
    winnerName.value = name
  }

  // Eliminate player from the game
  function eliminatePlayer(playerName: string) {
    const player = settings.value.players.find(p => p.name === playerName)
    if (player) {
      player.isActive = false
      persistState()
    }
  }

  // Reactivate player
  function reactivatePlayer(playerName: string) {
    const player = settings.value.players.find(p => p.name === playerName)
    if (player) {
      player.isActive = true
      persistState()
    }
  }

  // Next round
  async function nextRound() {
    roundNumber.value++
    // Rotate dealer (only among active players)
    settings.value.dealerIndex = (settings.value.dealerIndex + 1) % activePlayers.value.length

    const success = await loadNextQuestion()

    if (success) {
      currentState.value = GameState.QUESTION_INTRO
      persistState()
    }

    return success
  }

  // Skip question (if already known)
  async function skipQuestion() {
    const success = await loadNextQuestion()

    if (success) {
      currentState.value = GameState.QUESTION_INTRO
      persistState()
    }

    return success
  }

  // End game
  function endGame() {
    clearStorage()
    sessionId.value = null
    currentQuestion.value = null
    currentHintIndex.value = 0
    bettingRoundNumber.value = 1
    usedQuestionIds.value = []
    roundNumber.value = 1
    winnerName.value = null
    currentState.value = GameState.QUESTION_INTRO
    error.value = null
  }

  // Reset played questions history (stored in cookie)
  function resetPlayedQuestionsHistory() {
    clearPlayedQuestions()
  }

  // Check if there's an active session (after browser reload)
  function hasActiveSession() {
    return !!sessionId.value && !!currentQuestion.value
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  return {
    // State
    sessionId,
    settings,
    currentState,
    currentQuestion,
    currentHintIndex,
    bettingRoundNumber,
    usedQuestionIds,
    roundNumber,
    winnerName,
    isLoading,
    error,

    // Computed
    activePlayers,
    smallBlindPlayer,
    bigBlindPlayer,
    availableHints,
    revealedHints,
    currentHint,
    hasMoreHints,
    gameSteps,
    currentStepIndex,

    // Actions
    updateSettings,
    startGame,
    loadNextQuestion,
    goToState,
    nextStep,
    setWinner,
    eliminatePlayer,
    reactivatePlayer,
    nextRound,
    skipQuestion,
    endGame,
    resetPlayedQuestionsHistory,
    hasActiveSession,
    clearError
  }
})

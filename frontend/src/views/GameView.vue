<script setup lang="ts">
/**
 * GameView - Main game interface
 *
 * Uses the new MainGameScreen component that matches the mockup design.
 * Optimized for iPad landscape (1024x768 with Safari toolbars).
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { GameState } from '@/types'
import { questionsApi } from '@/services/api'
import MainGameScreen from '@/components/game/MainGameScreen.vue'
import GameModal from '@/components/game/GameModal.vue'
import RoundSummaryModal from '@/components/game/RoundSummaryModal.vue'

const router = useRouter()
const gameStore = useGameStore()

// Modal state
const showEndGameModal = ref(false)
const showRoundSummaryModal = ref(false)

// Computed from store
const currentQuestion = computed(() => gameStore.currentQuestion)
const currentState = computed(() => gameStore.currentState)
const currentGamePhase = computed(() => gameStore.currentGamePhase)
const revealedHints = computed(() => gameStore.revealedHints)
const roundNumber = computed(() => gameStore.roundNumber)
const settings = computed(() => gameStore.settings)
const bettingRoundNumber = computed(() => gameStore.bettingRoundNumber)
const currentHintIndex = computed(() => gameStore.currentHintIndex)
const availableHints = computed(() => gameStore.availableHints)

// Blind players
const smallBlindPlayer = computed(() => gameStore.smallBlindPlayer)
const bigBlindPlayer = computed(() => gameStore.bigBlindPlayer)

// Whether the answer is revealed
const isSolutionRevealed = computed(() => {
  return currentState.value === GameState.REVEAL_ANSWER ||
         currentState.value === GameState.ROUND_SUMMARY ||
         (currentState.value === GameState.BETTING_ROUND && bettingRoundNumber.value === 4)
})

// Format solution text
const solutionText = computed(() => {
  if (!currentQuestion.value) return ''
  const value = currentQuestion.value.answerValue.toLocaleString('de-DE')
  const unit = currentQuestion.value.answerUnit || ''
  return unit ? `${value} ${unit}` : value
})

// Lifecycle
onMounted(() => {
  if (!gameStore.hasActiveSession()) {
    router.push('/game/setup')
  }
})

// Actions
function handleNextAction() {
  if (currentState.value === GameState.ROUND_SUMMARY) {
    startNextRound()
  } else {
    gameStore.nextStep()
  }
}

function confirmEndGame() {
  showEndGameModal.value = true
}

function endGame() {
  gameStore.endGame()
  router.push('/')
}

function cancelEndGame() {
  showEndGameModal.value = false
}

async function startNextRound() {
  showRoundSummaryModal.value = false
  // Reset showdown flag before loading new round to prevent stale overlay
  showdownOverlayShown.value = false
  await gameStore.nextRound()
}

// Handle closing round summary modal with X button - go to start screen
function handleRoundSummaryClose() {
  showRoundSummaryModal.value = false
  gameStore.endGame()
  router.push('/')
}

// Handle player elimination
function handleEliminatePlayer(playerName: string) {
  gameStore.eliminatePlayer(playerName)
}

// Handle player reactivation
function handleReactivatePlayer(playerName: string) {
  gameStore.reactivatePlayer(playerName)
}

// Check if question was already rated (localStorage check)
function hasRatedQuestion(questionId: string): boolean {
  const ratedQuestions = JSON.parse(localStorage.getItem('ratedQuestions') || '[]')
  return ratedQuestions.includes(questionId)
}

// Mark question as rated in localStorage
function markQuestionAsRated(questionId: string): void {
  const ratedQuestions = JSON.parse(localStorage.getItem('ratedQuestions') || '[]')
  if (!ratedQuestions.includes(questionId)) {
    ratedQuestions.push(questionId)
    localStorage.setItem('ratedQuestions', JSON.stringify(ratedQuestions))
  }
}

// Handle question rating
async function handleRateQuestion(rating: number) {
  if (currentQuestion.value) {
    // Check if already rated (frontend protection)
    if (hasRatedQuestion(currentQuestion.value.id)) {
      console.log('Question already rated (localStorage check)')
      return
    }

    try {
      await questionsApi.rateQuestion(currentQuestion.value.id, rating)
      // Mark as rated in localStorage
      markQuestionAsRated(currentQuestion.value.id)
      // Update local question data to reflect the new rating
      currentQuestion.value.ratingSum = (currentQuestion.value.ratingSum || 0) + rating
      currentQuestion.value.ratingCount = (currentQuestion.value.ratingCount || 0) + 1
    } catch (err) {
      console.error('Failed to rate question:', err)
    }
  }
}

// Flag to track if showdown overlay was shown
const showdownOverlayShown = ref(false)

// Watch for ROUND_SUMMARY state - don't show modal immediately, wait for showdown overlay to be dismissed
watch(currentState, (newState) => {
  if (newState === GameState.ROUND_SUMMARY) {
    // Set flag that showdown overlay should be shown
    showdownOverlayShown.value = true
  }
})

// Called when showdown overlay is dismissed
function handleShowdownDismissed() {
  if (showdownOverlayShown.value) {
    showdownOverlayShown.value = false
    showRoundSummaryModal.value = true
  }
}
</script>

<template>
  <div class="game-view">
    <!-- Loading State -->
    <div v-if="gameStore.isLoading" class="loading-state">
      <div class="loading-spinner" />
      <p class="loading-text">Lädt...</p>
    </div>

    <!-- Error/Game Over State -->
    <div v-else-if="gameStore.error && currentState === GameState.GAME_OVER" class="error-state">
      <div class="error-icon">🏁</div>
      <h2 class="error-title">Spiel beendet</h2>
      <p class="error-message">{{ gameStore.error }}</p>
      <button class="error-btn" @click="endGame">
        Zur Startseite
      </button>
    </div>

    <!-- Main Game Screen -->
    <MainGameScreen
      v-else-if="currentQuestion"
      :current-state="currentState"
      :phase="currentGamePhase"
      :question-text="currentQuestion.questionText"
      :hints="availableHints"
      :revealed-hint-count="revealedHints.length"
      :solution-text="solutionText"
      :is-solution-revealed="isSolutionRevealed"
      :current-round="roundNumber"
      :betting-round="bettingRoundNumber"
      :current-hint-index="currentHintIndex"
      :players="settings.players"
      :small-blind-name="smallBlindPlayer?.name"
      :big-blind-name="bigBlindPlayer?.name"
      :is-loading="gameStore.isLoading"
      :rating-sum="currentQuestion.ratingSum"
      :rating-count="currentQuestion.ratingCount"
      :source-url="currentQuestion.sourceUrl"
      @next-action="handleNextAction"
      @end-game="confirmEndGame"
      @rate-question="handleRateQuestion"
      @showdown-dismissed="handleShowdownDismissed"
    />

    <!-- End Game Confirmation Modal -->
    <GameModal
      :is-open="showEndGameModal"
      title="Spiel beenden?"
      @close="cancelEndGame"
    >
      <p class="modal-text">
        Möchtest du das Spiel wirklich beenden? Der aktuelle Spielstand geht verloren.
      </p>
      <div class="modal-actions">
        <button class="modal-btn modal-btn--secondary" @click="cancelEndGame">
          Abbrechen
        </button>
        <button class="modal-btn modal-btn--danger" @click="endGame">
          Ja, beenden
        </button>
      </div>
    </GameModal>

    <!-- Round Summary Modal -->
    <RoundSummaryModal
      :is-open="showRoundSummaryModal"
      :players="settings.players"
      :round-number="roundNumber"
      :question-id="currentQuestion?.id || ''"
      @close="handleRoundSummaryClose"
      @continue-game="startNextRound"
      @eliminate-player="handleEliminatePlayer"
      @reactivate-player="handleReactivatePlayer"
      @rate-question="handleRateQuestion"
    />
  </div>
</template>

<style scoped>
.game-view {
  @apply min-h-screen bg-slate-900;
}

/* Loading state */
.loading-state {
  @apply min-h-screen;
  @apply flex flex-col items-center justify-center;
  @apply gap-4;
}

.loading-spinner {
  @apply w-12 h-12;
  @apply border-4 border-primary-500 border-t-transparent;
  @apply rounded-full;
  @apply animate-spin;
}

.loading-text {
  @apply text-slate-400;
}

/* Error state */
.error-state {
  @apply min-h-screen;
  @apply flex flex-col items-center justify-center;
  @apply gap-4 p-6;
  @apply text-center;
}

.error-icon {
  @apply text-6xl;
}

.error-title {
  @apply text-2xl font-bold text-white;
}

.error-message {
  @apply text-slate-400;
}

.error-btn {
  @apply mt-4 px-6 py-3;
  @apply bg-primary-600 hover:bg-primary-700;
  @apply text-white font-medium;
  @apply rounded-lg;
  @apply transition-colors duration-200;
  min-height: 44px;
}

/* Modal content */
.modal-text {
  @apply text-slate-300 mb-6;
}

.modal-actions {
  @apply flex gap-3 justify-end;
}

.modal-btn {
  @apply px-5 py-2.5;
  @apply font-medium;
  @apply rounded-lg;
  @apply transition-colors duration-200;
  min-height: 44px;
}

.modal-btn--secondary {
  @apply bg-slate-700 hover:bg-slate-600;
  @apply text-slate-300;
}

.modal-btn--danger {
  @apply bg-danger-600 hover:bg-danger-700;
  @apply text-white;
}
</style>

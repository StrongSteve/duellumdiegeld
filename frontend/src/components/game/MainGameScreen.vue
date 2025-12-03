<script setup lang="ts">
/**
 * MainGameScreen - Main game layout matching mockup
 *
 * Layout (based on mockup):
 * - Full dark background
 * - Left side (~2/3): Question, Hints, Solution, Info cards
 * - Right side (~1/3): End game button, Logo panel, Next action button
 *
 * Optimized for iPad landscape (1024x768)
 */

import { ref, computed, watch } from 'vue'
import { GameState, type Player, type Hint } from '@/types'
import { GamePhase, isBettingPhase } from '@/types/gamePhases'
import GameQuestionCard from './GameQuestionCard.vue'
import GameHintCard from './GameHintCard.vue'
import GameSolutionCard from './GameSolutionCard.vue'
import GameProgressCard from './GameProgressCard.vue'
import GameProgressModal from './GameProgressModal.vue'
import GameRulesCard from './GameRulesCard.vue'
import GameRulesModal from './GameRulesModal.vue'
import GamePlayersCard from './GamePlayersCard.vue'
import GamePlayersModal from './GamePlayersModal.vue'
import GameLogoPanel from './GameLogoPanel.vue'
import GameNextActionButton from './GameNextActionButton.vue'
import BettingOverlay from './BettingOverlay.vue'
import ShowdownOverlay from './ShowdownOverlay.vue'

const props = defineProps<{
  /** Current game state */
  currentState: GameState
  /** Current game phase (new state machine) */
  phase: GamePhase
  /** Current question text */
  questionText: string
  /** Available hints (max 2) */
  hints: Hint[]
  /** Number of revealed hints */
  revealedHintCount: number
  /** Solution text (answer + unit) */
  solutionText: string
  /** Whether solution is revealed */
  isSolutionRevealed: boolean
  /** Current round number */
  currentRound: number
  /** Current betting round (1-4) */
  bettingRound: number
  /** Current hint index (0-2) */
  currentHintIndex: number
  /** List of players */
  players: Player[]
  /** Small blind player name */
  smallBlindName?: string
  /** Big blind player name */
  bigBlindName?: string
  /** Whether loading */
  isLoading?: boolean
  /** Question rating sum */
  ratingSum?: number
  /** Question rating count */
  ratingCount?: number
}>()

const emit = defineEmits<{
  nextAction: []
  endGame: []
  rateQuestion: [rating: number]
  showdownDismissed: []
}>()

// Modal states
const showProgressModal = ref(false)
const showRulesModal = ref(false)
const showPlayersModal = ref(false)

// Betting overlay state
const showBettingOverlay = ref(false)

// Showdown overlay state
const showShowdownOverlay = ref(false)

// Track previous phase for comparison (start as null, not set on immediate)
const previousPhase = ref<GamePhase | null>(null)
const isInitialized = ref(false)

// Watch for phase changes to show overlays
watch(() => props.phase, (newPhase) => {
  // On first run, just record the phase without showing overlays
  if (!isInitialized.value) {
    previousPhase.value = newPhase
    isInitialized.value = true
    return
  }

  const oldPhase = previousPhase.value

  // Always update previous phase BEFORE any early returns
  const shouldUpdatePrevious = true

  // Reset all overlays when starting a new round (going back to question phase)
  if (newPhase === GamePhase.FrageSchaetzung) {
    showBettingOverlay.value = false
    showShowdownOverlay.value = false
    if (shouldUpdatePrevious) previousPhase.value = newPhase
    return
  }

  // Show betting overlay when entering any betting phase (from a non-betting phase)
  if (isBettingPhase(newPhase) && (oldPhase === null || !isBettingPhase(oldPhase))) {
    showBettingOverlay.value = true
  }

  // Show showdown overlay when entering showdown phase
  if (newPhase === GamePhase.Showdown && oldPhase !== GamePhase.Showdown) {
    showShowdownOverlay.value = true
  }

  if (shouldUpdatePrevious) previousPhase.value = newPhase
}, { immediate: true })

// Handle betting overlay dismiss
function dismissBettingOverlay() {
  showBettingOverlay.value = false
}

// Handle showdown overlay dismiss
function dismissShowdownOverlay() {
  showShowdownOverlay.value = false
  emit('showdownDismissed')
}

// Compute hint states
const hint1 = computed(() => props.hints[0] || null)
const hint2 = computed(() => props.hints[1] || null)

const isHint1Unlocked = computed(() => props.revealedHintCount >= 1 || props.currentState === GameState.HINT_REVEAL && props.currentHintIndex >= 1)
const isHint1Revealed = computed(() => props.revealedHintCount >= 1)

const isHint2Unlocked = computed(() => props.revealedHintCount >= 2 || props.currentState === GameState.HINT_REVEAL && props.currentHintIndex >= 2)
const isHint2Revealed = computed(() => props.revealedHintCount >= 2)

// Solution state
const isSolutionUnlocked = computed(() => {
  return props.currentState === GameState.REVEAL_ANSWER ||
         props.currentState === GameState.ROUND_SUMMARY ||
         (props.currentState === GameState.BETTING_ROUND && props.bettingRound === 4)
})
</script>

<template>
  <div class="main-game-screen">
    <!-- Main container -->
    <div class="game-container">
      <!-- Left side: Main content area -->
      <div class="game-left">
        <!-- Top: Question Card + Logo Panel -->
        <div class="game-top-row">
          <div class="question-area">
            <GameQuestionCard
              :question-text="questionText"
              :rating-sum="ratingSum"
              :rating-count="ratingCount"
              class="w-full"
              @rate-question="emit('rateQuestion', $event)"
            />
          </div>
          <div class="logo-area">
            <GameLogoPanel class="w-full" />
          </div>
        </div>

        <!-- Middle: Hints row -->
        <div class="hints-row">
          <GameHintCard
            title="Hinweis 1"
            :text="hint1?.hintText || null"
            :is-unlocked="isHint1Unlocked"
            :is-revealed="isHint1Revealed"
            :hint-number="1"
          />
          <GameHintCard
            title="Hinweis 2"
            :text="hint2?.hintText || null"
            :is-unlocked="isHint2Unlocked"
            :is-revealed="isHint2Revealed"
            :hint-number="2"
          />
        </div>

        <!-- Solution -->
        <div class="solution-row">
          <GameSolutionCard
            :solution-text="solutionText"
            :is-unlocked="isSolutionUnlocked"
            :is-revealed="isSolutionRevealed"
          />
        </div>

        <!-- Bottom: Info cards row -->
        <div class="info-cards-row">
          <GameProgressCard
            :phase="phase"
            @click="showProgressModal = true"
          />
          <GameRulesCard @click="showRulesModal = true" />
          <GamePlayersCard
            :players="players"
            :small-blind-name="smallBlindName"
            :big-blind-name="bigBlindName"
            @click="showPlayersModal = true"
          />
        </div>

        <!-- Action row: End game button + Next action -->
        <div class="action-row">
          <button class="end-game-btn" @click="emit('endGame')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Beenden</span>
          </button>
          <div class="action-area">
            <GameNextActionButton
              :phase="phase"
              :disabled="isLoading"
              @click="emit('nextAction')"
            />
          </div>
        </div>
      </div>

    </div>

    <!-- Modals -->
    <GameProgressModal
      :is-open="showProgressModal"
      :phase="phase"
      :current-round="currentRound"
      @close="showProgressModal = false"
    />

    <GameRulesModal
      :is-open="showRulesModal"
      @close="showRulesModal = false"
    />

    <GamePlayersModal
      :is-open="showPlayersModal"
      :players="players"
      :small-blind-name="smallBlindName"
      :big-blind-name="bigBlindName"
      @close="showPlayersModal = false"
    />

    <!-- Betting Overlay -->
    <BettingOverlay
      :visible="showBettingOverlay"
      :question-text="questionText"
      :hints="hints"
      :revealed-hint-count="revealedHintCount"
      :is-last-betting-round="phase === GamePhase.LetzteEinsatzrunde"
      :solution-text="solutionText"
      @dismiss="dismissBettingOverlay"
    />

    <!-- Showdown Overlay -->
    <ShowdownOverlay
      :visible="showShowdownOverlay"
      :question-text="questionText"
      :solution-text="solutionText"
      @dismiss="dismissShowdownOverlay"
    />
  </div>
</template>

<style scoped>
.main-game-screen {
  @apply min-h-screen;
  @apply bg-slate-900;
  @apply p-4 md:p-6;
  /* Safe area padding */
  padding-top: max(env(safe-area-inset-top), 1rem);
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);
}

.game-container {
  @apply max-w-7xl mx-auto;
  @apply flex gap-6;
  @apply h-full;
}

/* Left side - main content */
.game-left {
  @apply flex-1;
  @apply flex flex-col gap-4;
}

/* Top row: Question + Logo Panel side by side - NEVER wrap */
.game-top-row {
  @apply flex gap-4 items-stretch;
  flex-wrap: nowrap;
}

.question-area {
  @apply flex;
  flex: 1 1 0;
  min-width: 0; /* Allow shrinking below content size */
}

.logo-area {
  @apply flex;
  flex: 0 0 auto;
  width: 220px;
}

/* Info cards full width */
.info-cards-row {
  @apply grid grid-cols-3 gap-4;
}

/* Action row: end game button on left, next action button on right (same width as one info card) */
.action-row {
  @apply flex items-center gap-4;
  @apply mt-4;
}

/* Action area - same width as one info card, aligned right */
.action-area {
  @apply ml-auto;
  /* Width = 1/3 of container minus the gaps (same as one grid column) */
  width: calc((100% - 2rem) / 3);
}

/* End game button - subtle */
.end-game-btn {
  @apply flex items-center gap-2;
  @apply px-3 py-2;
  @apply rounded-lg;
  @apply text-sm;
  @apply transition-all duration-200;
  @apply flex-shrink-0;
  @apply bg-slate-800/60 hover:bg-slate-700;
  @apply text-slate-400 hover:text-slate-200;
  @apply border border-slate-700/50 hover:border-slate-600;
  min-height: 44px;
}

/* Hints row */
.hints-row {
  @apply grid grid-cols-2 gap-4;
}

/* Solution row */
.solution-row {
  /* Full width */
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .game-container {
    @apply flex-col;
  }

  .game-top-row {
    @apply flex-col;
  }

  .logo-area {
    width: 100%;
  }

  .info-cards-row {
    @apply grid-cols-1 sm:grid-cols-3;
  }

  .action-row {
    @apply flex-col;
  }

  .action-area {
    width: 100%;
  }

  .hints-row {
    @apply grid-cols-1 sm:grid-cols-2;
  }
}

/* iPad landscape specific */
@media (min-width: 1024px) and (max-height: 800px) {
  .main-game-screen {
    @apply p-3;
  }

  .game-container {
    @apply gap-4;
  }

  .game-left {
    @apply gap-3;
  }

  .info-cards-row {
    @apply gap-3;
  }

  .hints-row {
    @apply gap-3;
  }

  .logo-area {
    width: 200px;
  }

  .action-row {
    @apply mt-3;
  }

  .action-area {
    width: calc((100% - 1.5rem) / 3);
  }
}
</style>

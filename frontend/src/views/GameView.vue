<script setup lang="ts">
/**
 * GameView - Main game interface
 *
 * Handles all game phases with consistent layout using GameScreenLayout.
 * Optimized for iPad landscape (1024x768 with Safari toolbars).
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { GameState } from '@/types'
import GameScreenLayout from '@/components/GameScreenLayout.vue'
import StepIndicator from '@/components/StepIndicator.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import ExplanationPanel from '@/components/ExplanationPanel.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import CollapsiblePanel from '@/components/CollapsiblePanel.vue'
import PokerTable from '@/components/PokerTable.vue'
import WinnerSelection from '@/components/WinnerSelection.vue'
import HelpModal from '@/components/HelpModal.vue'

const router = useRouter()
const gameStore = useGameStore()

// Modals
const showEndGameModal = ref(false)
const showBettingRulesModal = ref(false)

// Computed from store
const currentQuestion = computed(() => gameStore.currentQuestion)
const currentState = computed(() => gameStore.currentState)
const revealedHints = computed(() => gameStore.revealedHints)
const roundNumber = computed(() => gameStore.roundNumber)
const settings = computed(() => gameStore.settings)
const gameSteps = computed(() => gameStore.gameSteps)
const currentStepIndex = computed(() => gameStore.currentStepIndex)
const bettingRoundNumber = computed(() => gameStore.bettingRoundNumber)
const currentHintIndex = computed(() => gameStore.currentHintIndex)
const availableHints = computed(() => gameStore.availableHints)

// Blind players
const smallBlindPlayer = computed(() => gameStore.smallBlindPlayer)
const bigBlindPlayer = computed(() => gameStore.bigBlindPlayer)

// Whether the answer is revealed
const showAnswer = computed(() => {
  return currentState.value === GameState.REVEAL_ANSWER ||
         currentState.value === GameState.ROUND_SUMMARY ||
         (currentState.value === GameState.BETTING_ROUND && bettingRoundNumber.value === 4)
})

// Lifecycle
onMounted(() => {
  if (!gameStore.hasActiveSession()) {
    router.push('/game/setup')
  }
})

// Navigation
function nextStep() {
  gameStore.nextStep()
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

function togglePlayerActive(playerName: string) {
  const player = settings.value.players.find(p => p.name === playerName)
  if (player) {
    if (player.isActive) {
      gameStore.eliminatePlayer(playerName)
    } else {
      gameStore.reactivatePlayer(playerName)
    }
  }
}

async function startNextRound() {
  await gameStore.nextRound()
}

async function skipQuestion() {
  await gameStore.skipQuestion()
}

// Betting round descriptions
const bettingRoundInfo = computed(() => {
  const rounds = {
    1: { emoji: '🎴', title: 'Einsatzrunde 1', desc: 'Pre-Flop: Erste Einsatzrunde nach dem Schätzen' },
    2: { emoji: '🃏', title: 'Einsatzrunde 2', desc: 'Flop: Nach dem ersten Hinweis' },
    3: { emoji: '♠️', title: 'Einsatzrunde 3', desc: 'Turn: Nach dem zweiten Hinweis' },
    4: { emoji: '♦️', title: 'Letzte Einsatzrunde', desc: 'River: Die Antwort ist bekannt!' }
  }
  return rounds[bettingRoundNumber.value as keyof typeof rounds] || { emoji: '💰', title: 'Einsatzrunde', desc: '' }
})
</script>

<template>
  <GameScreenLayout>
    <!-- Top: Header with round info and stepper -->
    <template #top>
      <div class="game-header">
        <div class="game-header__left">
          <span class="game-header__round">Runde {{ roundNumber }}</span>
          <button
            class="exit-button"
            title="Spiel beenden"
            @click="confirmEndGame"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="exit-button__text">Beenden</span>
          </button>
        </div>

        <div v-if="currentQuestion" class="game-header__stepper">
          <StepIndicator :steps="gameSteps" :current-index="currentStepIndex" />
        </div>

        <div class="game-header__right"></div>
      </div>
    </template>

    <!-- Main content area -->
    <div class="game-main">
      <!-- Loading State -->
      <div v-if="gameStore.isLoading" class="game-loading">
        <div class="game-loading__spinner" />
        <p class="game-loading__text">Lädt...</p>
      </div>

      <!-- Game Over State -->
      <div v-else-if="gameStore.error && currentState === GameState.GAME_OVER" class="game-over">
        <div class="game-over__icon">🏁</div>
        <h2 class="game-over__title">Spiel beendet</h2>
        <p class="game-over__message">{{ gameStore.error }}</p>
      </div>

      <!-- Game States -->
      <template v-else-if="currentQuestion">
        <!-- QUESTION_INTRO -->
        <div v-if="currentState === GameState.QUESTION_INTRO" class="phase-intro">
          <h2 class="phase-title">
            <span class="phase-title__icon">❓</span>
            Neue Frage
          </h2>

          <QuestionCard
            :question-text="currentQuestion.questionText"
            :category="currentQuestion.category"
            class="hero-card"
          />

          <button class="skip-button" @click="skipQuestion" :disabled="gameStore.isLoading">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Frage überspringen (bereits bekannt)
          </button>
        </div>

        <!-- WRITE_GUESSES -->
        <div v-else-if="currentState === GameState.WRITE_GUESSES" class="phase-guessing">
          <h2 class="phase-title phase-title--gold">
            <span class="phase-title__icon">📝</span>
            Schätzt jetzt!
          </h2>
          <p class="phase-subtitle">Alle Spieler: Schreibt eure Schätzung geheim auf.</p>

          <div class="question-reminder">
            <span class="question-reminder__label">Frage</span>
            <p class="question-reminder__text">{{ currentQuestion.questionText }}</p>
          </div>
        </div>

        <!-- BETTING_ROUND -->
        <div v-else-if="currentState === GameState.BETTING_ROUND" class="phase-betting">
          <!-- Question is the HERO - most important element -->
          <div class="question-hero">
            <p class="question-hero__text">{{ currentQuestion.questionText }}</p>
          </div>

          <div class="betting-header">
            <span class="betting-header__emoji">{{ bettingRoundInfo.emoji }}</span>
            <h2 class="betting-header__title">{{ bettingRoundInfo.title }}</h2>
          </div>

          <!-- Revealed hints -->
          <div v-if="revealedHints.length > 0" class="hints-compact">
            <div v-for="(hint, index) in revealedHints" :key="hint.id" class="hint-tag">
              <span class="hint-tag__number">{{ index + 1 }}</span>
              <span class="hint-tag__text">{{ hint.hintText }}</span>
            </div>
          </div>

          <!-- Answer (if betting round 4) -->
          <div v-if="showAnswer" class="answer-hero">
            <span class="answer-hero__label">Lösung</span>
            <div class="answer-hero__value">
              {{ currentQuestion.answerValue.toLocaleString('de-DE') }}
              <span v-if="currentQuestion.answerUnit" class="answer-hero__unit">{{ currentQuestion.answerUnit }}</span>
            </div>
          </div>

          <!-- Poker table -->
          <PokerTable
            :players="settings.players"
            :small-blind-name="smallBlindPlayer?.name"
            :big-blind-name="bigBlindPlayer?.name"
            show-pot
            pot-label="Pot"
            class="betting-table"
          />

          <!-- Rules hint -->
          <button class="rules-hint" @click="showBettingRulesModal = true">
            <span class="rules-hint__chips">
              <span class="chip-mini chip-mini--sb">SB</span>
              <span class="chip-mini chip-mini--bb">BB</span>
            </span>
            <span class="rules-hint__text">Small Blind · Big Blind · <span class="underline">Regeln</span></span>
          </button>
        </div>

        <!-- HINT_REVEAL -->
        <div v-else-if="currentState === GameState.HINT_REVEAL" class="phase-hint">
          <!-- Question is the HERO -->
          <div class="question-hero">
            <p class="question-hero__text">{{ currentQuestion.questionText }}</p>
          </div>

          <h2 class="phase-title phase-title--primary">
            <span class="phase-title__icon">💡</span>
            Hinweis {{ currentHintIndex }}
          </h2>

          <!-- Current hint (hero) -->
          <div class="hint-hero">
            <p class="hint-hero__text">{{ availableHints[currentHintIndex - 1]?.hintText }}</p>
          </div>

          <!-- Previous hints -->
          <div v-if="revealedHints.length > 1" class="hints-previous">
            <div v-for="(hint, index) in revealedHints.slice(0, -1)" :key="hint.id" class="hint-tag hint-tag--muted">
              <span class="hint-tag__number">{{ index + 1 }}</span>
              <span class="hint-tag__text">{{ hint.hintText }}</span>
            </div>
          </div>
        </div>

        <!-- REVEAL_ANSWER -->
        <div v-else-if="currentState === GameState.REVEAL_ANSWER" class="phase-reveal">
          <!-- Question is the HERO -->
          <div class="question-hero">
            <p class="question-hero__text">{{ currentQuestion.questionText }}</p>
          </div>

          <h2 class="phase-title">
            <span class="phase-title__icon">🎯</span>
            Die Antwort ist...
          </h2>

          <!-- Answer (hero) -->
          <div class="answer-hero answer-hero--reveal">
            <span class="answer-hero__label">Lösung</span>
            <div class="answer-hero__value">
              {{ currentQuestion.answerValue.toLocaleString('de-DE') }}
              <span v-if="currentQuestion.answerUnit" class="answer-hero__unit">{{ currentQuestion.answerUnit }}</span>
            </div>
          </div>

          <!-- Hints summary -->
          <div v-if="revealedHints.length > 0" class="hints-summary">
            <div v-for="(hint, index) in revealedHints" :key="hint.id" class="hint-tag hint-tag--muted">
              <span class="hint-tag__number">{{ index + 1 }}</span>
              <span class="hint-tag__text">{{ hint.hintText }}</span>
            </div>
          </div>

          <!-- Source & Explanation -->
          <div class="reveal-details">
            <a
              v-if="currentQuestion.sourceUrl"
              :href="currentQuestion.sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="source-link"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Quelle ansehen
            </a>

            <ExplanationPanel
              v-if="currentQuestion.explanation"
              title="Warum?"
              :content="currentQuestion.explanation"
            />
          </div>
        </div>

        <!-- ROUND_SUMMARY -->
        <div v-else-if="currentState === GameState.ROUND_SUMMARY" class="phase-summary">
          <h2 class="phase-title phase-title--success">
            <span class="phase-title__icon">✅</span>
            Runde {{ roundNumber }} abgeschlossen
          </h2>

          <!-- Answer summary -->
          <div class="summary-answer">
            <div class="summary-answer__question">{{ currentQuestion.questionText }}</div>
            <div class="summary-answer__value">
              {{ currentQuestion.answerValue.toLocaleString('de-DE') }}
              <span v-if="currentQuestion.answerUnit">{{ currentQuestion.answerUnit }}</span>
            </div>
          </div>

          <!-- Winner selection (optional) -->
          <WinnerSelection :players="settings.players" />

          <!-- Player management -->
          <CollapsiblePanel title="Spieler verwalten" icon="👥">
            <div class="player-management">
              <button
                v-for="player in settings.players"
                :key="'manage-' + player.name"
                class="player-toggle"
                :class="{ 'player-toggle--inactive': !player.isActive }"
                @click="togglePlayerActive(player.name)"
              >
                <span v-if="!player.isActive">❌</span>
                <span v-else>✓</span>
                {{ player.name }}
              </button>
            </div>
            <p class="player-management__hint">
              Klicke auf einen Spieler um ihn auszuschalten oder wieder zu aktivieren.
            </p>
          </CollapsiblePanel>
        </div>
      </template>
    </div>

    <!-- Actions slot -->
    <template #actions>
      <!-- Loading/Error state -->
      <template v-if="gameStore.isLoading" />
      <PrimaryButton v-else-if="gameStore.error && currentState === GameState.GAME_OVER" @click="endGame">
        Zur Startseite
      </PrimaryButton>

      <!-- Game state actions -->
      <template v-else-if="currentQuestion">
        <!-- QUESTION_INTRO -->
        <PrimaryButton v-if="currentState === GameState.QUESTION_INTRO" variant="gold" @click="nextStep">
          Alle bereit → Schätzen
        </PrimaryButton>

        <!-- WRITE_GUESSES -->
        <PrimaryButton v-else-if="currentState === GameState.WRITE_GUESSES" @click="nextStep">
          Alle haben geschätzt → Einsätze
        </PrimaryButton>

        <!-- BETTING_ROUND -->
        <PrimaryButton v-else-if="currentState === GameState.BETTING_ROUND" variant="gold" @click="nextStep">
          Einsätze fertig → Weiter
        </PrimaryButton>

        <!-- HINT_REVEAL -->
        <PrimaryButton v-else-if="currentState === GameState.HINT_REVEAL" @click="nextStep">
          Verstanden → Einsatzrunde
        </PrimaryButton>

        <!-- REVEAL_ANSWER -->
        <PrimaryButton v-else-if="currentState === GameState.REVEAL_ANSWER" variant="gold" @click="nextStep">
          → Letzte Einsatzrunde
        </PrimaryButton>

        <!-- ROUND_SUMMARY -->
        <template v-else-if="currentState === GameState.ROUND_SUMMARY">
          <SecondaryButton variant="danger" @click="confirmEndGame">
            Spiel beenden
          </SecondaryButton>
          <PrimaryButton variant="gold" @click="startNextRound">
            Nächste Runde
          </PrimaryButton>
        </template>
      </template>
    </template>
  </GameScreenLayout>

  <!-- End Game Modal -->
  <HelpModal
    :is-open="showEndGameModal"
    title="Spiel beenden?"
    @close="cancelEndGame"
  >
    <p class="text-slate-300 mb-6">
      Möchtest du das Spiel wirklich beenden?
    </p>
    <div class="flex gap-4 justify-center">
      <SecondaryButton @click="cancelEndGame">
        Abbrechen
      </SecondaryButton>
      <PrimaryButton variant="primary" @click="endGame">
        Ja, beenden
      </PrimaryButton>
    </div>
  </HelpModal>

  <!-- Betting Rules Modal -->
  <HelpModal
    :is-open="showBettingRulesModal"
    title="Einsatzregeln"
    @close="showBettingRulesModal = false"
  >
    <div class="rules-content">
      <div class="rules-section">
        <h4 class="rules-section__title">Positionen</h4>
        <ul class="rules-section__list">
          <li><strong class="text-blue-400">SB (Small Blind)</strong> - Kleiner Pflichteinsatz</li>
          <li><strong class="text-red-400">BB (Big Blind)</strong> - Großer Pflichteinsatz (2x SB)</li>
        </ul>
        <p class="rules-section__note">Positionen rotieren jede Runde im Uhrzeigersinn.</p>
      </div>

      <div class="rules-section">
        <h4 class="rules-section__title">Aktionen</h4>
        <ul class="rules-section__list">
          <li><strong>Check</strong> - Kein Einsatz, wenn niemand erhöht hat</li>
          <li><strong>Call</strong> - Den aktuellen Einsatz mitgehen</li>
          <li><strong>Raise</strong> - Den Einsatz erhöhen</li>
          <li><strong>Fold</strong> - Aufgeben und aussteigen</li>
          <li><strong>All-In</strong> - Alle Chips setzen</li>
        </ul>
      </div>

      <div class="rules-section">
        <h4 class="rules-section__title">Ende der Einsatzrunde</h4>
        <p class="rules-section__text">
          Die Runde endet, wenn alle Spieler den gleichen Betrag gesetzt haben oder gefoldet haben.
        </p>
      </div>
    </div>

    <div class="mt-6">
      <PrimaryButton @click="showBettingRulesModal = false">
        Verstanden
      </PrimaryButton>
    </div>
  </HelpModal>
</template>

<style scoped>
/* Header */
.game-header {
  @apply flex items-center justify-between gap-4;
}

.game-header__left {
  @apply flex flex-col items-start gap-1;
}

.game-header__round {
  @apply text-sm text-slate-400 font-medium;
  @apply bg-slate-800 px-3 py-1 rounded-full;
}

.game-header__stepper {
  @apply flex-1 max-w-xl;
}

.game-header__right {
  @apply flex items-center;
  @apply flex-shrink-0;
}

/* Exit button */
.exit-button {
  @apply flex items-center gap-1;
  @apply px-2 py-1 rounded;
  @apply text-slate-500 hover:text-slate-300;
  @apply hover:bg-slate-800/50;
  @apply transition-colors duration-200;
  @apply text-xs;
  min-height: 32px;
}

.exit-button__text {
  @apply inline;
}

/* Main game area */
.game-main {
  @apply w-full max-w-2xl mx-auto;
  @apply flex flex-col items-center;
}

/* Loading state */
.game-loading {
  @apply text-center py-12;
}

.game-loading__spinner {
  @apply w-10 h-10 mx-auto mb-3;
  @apply border-4 border-primary-500 border-t-transparent rounded-full;
  @apply animate-spin;
}

.game-loading__text {
  @apply text-slate-400 text-sm;
}

/* Game over state */
.game-over {
  @apply text-center py-8;
}

.game-over__icon {
  @apply text-5xl mb-4;
}

.game-over__title {
  @apply text-2xl font-display font-bold text-white mb-2;
}

.game-over__message {
  @apply text-slate-400;
}

/* Phase titles */
.phase-title {
  @apply text-xl md:text-2xl font-display font-bold text-white;
  @apply flex items-center justify-center gap-2;
  @apply mb-4;
}

.phase-title--gold {
  @apply text-gold-400;
}

.phase-title--primary {
  @apply text-primary-400;
}

.phase-title--success {
  @apply text-success-400;
}

.phase-title__icon {
  @apply text-2xl;
}

.phase-subtitle {
  @apply text-center text-slate-300 mb-6;
}

/* Hero card for questions */
.hero-card {
  @apply text-center;
}

/* Question Hero - Large prominent question display */
.question-hero {
  @apply w-full mb-4;
  @apply p-4 md:p-6;
  @apply bg-slate-800/60 rounded-2xl;
  @apply border border-primary-500/30;
}

.question-hero__text {
  @apply text-xl md:text-2xl lg:text-3xl;
  @apply font-medium text-white text-center;
  @apply leading-relaxed;
}

/* Skip button */
.skip-button {
  @apply mt-4 mx-auto;
  @apply text-slate-500 hover:text-slate-300;
  @apply text-sm;
  @apply flex items-center gap-1;
  @apply transition-colors duration-200;
  min-height: 44px;
}

.skip-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Question reminder */
.question-reminder {
  @apply p-6 md:p-8;
  @apply bg-slate-800/80 backdrop-blur rounded-2xl;
  @apply border border-slate-600/50;
  @apply text-center;
}

.question-reminder__label {
  @apply text-primary-400 font-bold text-sm;
}

.question-reminder__text {
  @apply text-xl md:text-2xl lg:text-3xl text-slate-100 mt-2;
}

/* Betting phase */
.phase-betting {
  @apply w-full text-center;
}

.betting-header {
  @apply mb-4;
}

.betting-header__emoji {
  @apply text-3xl;
}

.betting-header__title {
  @apply text-xl font-display font-bold text-gold-400;
}

.betting-header__desc {
  @apply text-xs text-slate-500;
}

.betting-table {
  @apply my-4;
}

/* Hints */
.hints-compact {
  @apply flex flex-wrap justify-center gap-2 mb-4;
}

.hints-summary {
  @apply flex flex-wrap justify-center gap-2 mb-4;
}

.hints-previous {
  @apply flex flex-wrap justify-center gap-2 mt-4;
}

.hint-tag {
  @apply inline-flex items-center gap-1.5;
  @apply px-3 py-1.5 rounded-full;
  @apply bg-primary-500/20 text-primary-300;
  @apply text-sm;
}

.hint-tag--muted {
  @apply bg-slate-700/50 text-slate-400;
}

.hint-tag__number {
  @apply w-5 h-5 rounded-full;
  @apply bg-primary-500/30 text-primary-300;
  @apply flex items-center justify-center;
  @apply text-xs font-bold;
}

.hint-tag--muted .hint-tag__number {
  @apply bg-slate-600 text-slate-400;
}

/* Hint hero */
.hint-hero {
  @apply p-6 rounded-2xl;
  @apply bg-gradient-to-br from-primary-900/30 to-slate-800;
  @apply border border-primary-500/50;
  @apply text-center;
}

.hint-hero__text {
  @apply text-xl md:text-2xl text-white font-medium;
}

/* Answer hero */
.answer-hero {
  @apply p-4 md:p-6 rounded-2xl;
  @apply bg-gradient-to-br from-gold-900/30 to-slate-800;
  @apply border border-gold-500/50;
  @apply text-center;
  @apply mb-4;
}

.answer-hero--reveal {
  @apply p-6 md:p-8;
}

.answer-hero__label {
  @apply text-gold-400 font-bold text-sm;
}

.answer-hero__value {
  @apply text-2xl md:text-3xl font-bold mt-1;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.answer-hero__unit {
  @apply text-lg;
  -webkit-text-fill-color: #fbbf24;
}

/* Rules hint button */
.rules-hint {
  @apply flex items-center justify-center gap-2;
  @apply text-xs text-slate-500 hover:text-slate-400;
  @apply transition-colors duration-200;
  @apply py-2;
  min-height: 44px;
}

.rules-hint__chips {
  @apply flex gap-1;
}

.chip-mini {
  @apply w-5 h-5 rounded-full;
  @apply text-[9px] font-bold;
  @apply flex items-center justify-center;
}

.chip-mini--sb {
  @apply bg-blue-500 text-white;
}

.chip-mini--bb {
  @apply bg-red-500 text-white;
}

/* Source link */
.source-link {
  @apply inline-flex items-center gap-2;
  @apply text-primary-400 hover:text-primary-300;
  @apply text-sm;
  @apply transition-colors duration-200;
  @apply mb-4;
}

/* Reveal details */
.reveal-details {
  @apply text-center;
}

/* Summary phase */
.phase-summary {
  @apply w-full space-y-4;
}

.summary-answer {
  @apply text-center p-4 bg-slate-800/50 rounded-xl;
}

.summary-answer__question {
  @apply text-sm text-slate-400 mb-2;
}

.summary-answer__value {
  @apply text-xl font-bold text-gold-400;
}

/* Player management */
.player-management {
  @apply flex flex-wrap gap-2 mb-2;
}

.player-toggle {
  @apply px-3 py-1.5 rounded-lg text-sm;
  @apply transition-all duration-200;
  @apply flex items-center gap-1;
  @apply bg-slate-700 text-slate-300 hover:bg-slate-600;
  min-height: 40px;
}

.player-toggle--inactive {
  @apply bg-danger-900/30 text-danger-400;
  @apply border border-danger-500/50;
}

.player-management__hint {
  @apply text-slate-500 text-xs;
}

/* Rules modal content */
.rules-content {
  @apply space-y-4 text-sm;
}

.rules-section__title {
  @apply font-semibold text-gold-400 mb-1;
}

.rules-section__list {
  @apply text-slate-300 space-y-1;
}

.rules-section__note {
  @apply text-slate-500 text-xs mt-1;
}

.rules-section__text {
  @apply text-slate-300;
}

/* Animations */
.phase-intro,
.phase-guessing,
.phase-betting,
.phase-hint,
.phase-reveal,
.phase-summary {
  animation: fadeSlideIn 0.25s ease-out;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

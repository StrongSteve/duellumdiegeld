<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { GameState } from '@/types'
import StepIndicator from '@/components/StepIndicator.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import HintCard from '@/components/HintCard.vue'
import ExplanationPanel from '@/components/ExplanationPanel.vue'
import CTAButton from '@/components/CTAButton.vue'
import HelpModal from '@/components/HelpModal.vue'

const router = useRouter()
const gameStore = useGameStore()

const showEndGameModal = ref(false)
const showBettingRulesModal = ref(false)

// Computed
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

// Should show player table (not in intro states)
const showPlayerTable = computed(() => {
  return currentState.value !== GameState.QUESTION_INTRO &&
         currentState.value !== GameState.WRITE_GUESSES
})

// Should show answer (after reveal)
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
  const success = await gameStore.nextRound()
  if (!success && gameStore.currentState === GameState.GAME_OVER) {
    // No more questions available
  }
}

// Skip question (if already known)
async function skipQuestion() {
  const success = await gameStore.skipQuestion()
  if (!success && gameStore.currentState === GameState.GAME_OVER) {
    // No more questions available
  }
}

// Betting round description
const bettingRoundDescription = computed(() => {
  switch (bettingRoundNumber.value) {
    case 1:
      return 'Erste Einsatzrunde nach dem Schätzen - wie der Pre-Flop beim Poker'
    case 2:
      return 'Einsatzrunde nach dem ersten Hinweis - wie der Flop'
    case 3:
      return 'Einsatzrunde nach dem zweiten Hinweis - wie der Turn'
    case 4:
      return 'Letzte Einsatzrunde nach der Auflösung - wie der River'
    default:
      return ''
  }
})

const bettingRoundEmoji = computed(() => {
  switch (bettingRoundNumber.value) {
    case 1: return '🎴'
    case 2: return '🃏'
    case 3: return '♠️'
    case 4: return '♦️'
    default: return '💰'
  }
})

// Player role checks
function isSmallBlind(playerName: string) {
  return smallBlindPlayer.value?.name === playerName
}

function isBigBlind(playerName: string) {
  return bigBlindPlayer.value?.name === playerName
}
</script>

<template>
  <div class="game-view min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
    <!-- Header -->
    <header class="p-3 md:p-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl">💰</span>
          <span class="text-slate-400 text-sm">Runde {{ roundNumber }}</span>
        </div>

        <button
          class="btn-icon text-danger-500 hover:text-danger-400"
          title="Spiel beenden"
          @click="confirmEndGame"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Step Indicator -->
      <div v-if="currentQuestion" class="mt-2">
        <StepIndicator :steps="gameSteps" :current-index="currentStepIndex" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center p-3 md:p-6 overflow-auto">
      <!-- Loading State -->
      <div v-if="gameStore.isLoading" class="text-center">
        <div class="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p class="text-slate-400 text-sm">Lädt...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="gameStore.error && currentState === GameState.GAME_OVER" class="text-center max-w-lg">
        <div class="text-5xl mb-4">🏁</div>
        <h2 class="heading-display text-2xl text-white mb-3">Spiel beendet</h2>
        <p class="text-slate-400 mb-6">{{ gameStore.error }}</p>
        <CTAButton variant="primary" @click="endGame">
          Zur Startseite
        </CTAButton>
      </div>

      <!-- Game States -->
      <template v-else-if="currentQuestion">
        <!-- QUESTION_INTRO -->
        <div v-if="currentState === GameState.QUESTION_INTRO" class="game-layout animate-fade-in">
          <div class="game-content">
            <div class="text-center mb-4">
              <h2 class="text-xl md:text-2xl font-semibold text-primary-400">
                ❓ Neue Frage
              </h2>
            </div>

            <QuestionCard
              :question-text="currentQuestion.questionText"
              :category="currentQuestion.category"
            />

            <!-- Skip Button -->
            <button
              class="mt-3 text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 mx-auto transition-colors"
              @click="skipQuestion"
              :disabled="gameStore.isLoading"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Frage überspringen (bereits bekannt)
            </button>
          </div>

          <div class="game-action">
            <CTAButton variant="gold" size="lg" @click="nextStep">
              Alle bereit → Schätzen
            </CTAButton>
          </div>
        </div>

        <!-- WRITE_GUESSES -->
        <div v-else-if="currentState === GameState.WRITE_GUESSES" class="game-layout animate-fade-in">
          <div class="game-content">
            <div class="text-center mb-4">
              <h2 class="heading-display text-3xl md:text-4xl text-gold-400 mb-2">
                📝 Schätzt jetzt!
              </h2>
              <p class="text-lg text-slate-300">
                Alle Spieler: Schreibt eure Schätzung geheim auf.
              </p>
            </div>

            <!-- Question reminder -->
            <div class="card p-6 md:p-8 bg-slate-800/80 backdrop-blur border-slate-600/50">
              <div class="text-center">
                <span class="text-primary-400 font-bold text-sm md:text-base">Frage</span>
              </div>
              <p class="text-xl md:text-2xl lg:text-3xl text-center text-slate-100 mt-2">
                {{ currentQuestion.questionText }}
              </p>
            </div>
          </div>

          <div class="game-action">
            <CTAButton variant="primary" size="lg" @click="nextStep">
              Alle haben geschätzt → Einsätze
            </CTAButton>
          </div>
        </div>

        <!-- All other states with consistent layout -->
        <div v-else class="game-layout animate-fade-in">
          <div class="game-content">
            <!-- Question Card - always at top -->
            <div class="card p-6 md:p-8 bg-slate-800/80 backdrop-blur border-slate-600/50 mb-3">
              <div class="text-center">
                <span class="text-primary-400 font-bold text-sm md:text-base">Frage</span>
              </div>
              <p class="text-xl md:text-2xl lg:text-3xl text-center text-slate-100 mt-2">
                {{ currentQuestion.questionText }}
              </p>
            </div>

            <!-- Hints and Answer Cards -->
            <div v-if="revealedHints.length > 0 || showAnswer" class="cards-row mb-3">
              <HintCard
                v-for="(hint, index) in revealedHints"
                :key="hint.id"
                :hint-number="index + 1"
                :hint-text="hint.hintText"
                class="card-item"
              />
              <!-- Answer card -->
              <div v-if="showAnswer" class="card card-item p-6 md:p-8 bg-gradient-to-br from-gold-900/30 to-slate-800 border-gold-500/50" :class="{ 'animate-scale-in': currentState === GameState.REVEAL_ANSWER }">
                <div class="text-center">
                  <div class="text-gold-400 font-bold text-sm md:text-base">Lösung</div>
                  <div class="answer-display-card mt-2">
                    {{ currentQuestion.answerValue.toLocaleString('de-DE') }}
                    <span v-if="currentQuestion.answerUnit" class="text-gold-400/70 text-lg ml-1">
                      {{ currentQuestion.answerUnit }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- State-specific content -->
            <!-- BETTING_ROUND header -->
            <div v-if="currentState === GameState.BETTING_ROUND" class="text-center mb-3">
              <div class="text-3xl mb-1">{{ bettingRoundEmoji }}</div>
              <h2 class="heading-display text-xl md:text-2xl text-gold-400 mb-1">
                Einsatzrunde {{ bettingRoundNumber }}
              </h2>
              <p class="text-slate-400 text-xs">
                {{ bettingRoundDescription }}
              </p>
            </div>

            <!-- HINT_REVEAL header -->
            <div v-if="currentState === GameState.HINT_REVEAL" class="text-center mb-3">
              <h2 class="heading-display text-2xl md:text-3xl text-primary-400 mb-1">
                💡 Hinweis {{ currentHintIndex }}
              </h2>
              <!-- Current hint prominent -->
              <div class="card p-6 bg-gradient-to-br from-primary-900/30 to-slate-800 border-primary-500/50 animate-scale-in mt-3">
                <div class="text-center">
                  <p class="text-xl md:text-2xl text-white font-medium">
                    {{ availableHints[currentHintIndex - 1]?.hintText }}
                  </p>
                </div>
              </div>
            </div>

            <!-- REVEAL_ANSWER header -->
            <div v-if="currentState === GameState.REVEAL_ANSWER" class="text-center mb-3">
              <h2 class="text-xl md:text-2xl font-semibold text-primary-400">
                🎯 Die Antwort ist...
              </h2>
              <!-- Source link -->
              <div v-if="currentQuestion.sourceUrl" class="mt-3">
                <a
                  :href="currentQuestion.sourceUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Quelle ansehen
                </a>
              </div>
              <!-- Explanation -->
              <div v-if="currentQuestion.explanation" class="text-left mt-3">
                <ExplanationPanel
                  title="Warum?"
                  :content="currentQuestion.explanation"
                />
              </div>
            </div>

            <!-- ROUND_SUMMARY header -->
            <div v-if="currentState === GameState.ROUND_SUMMARY" class="text-center mb-3">
              <h2 class="heading-display text-2xl md:text-3xl text-white mb-1">
                ✅ Runde {{ roundNumber }} abgeschlossen
              </h2>
            </div>

            <!-- Player Table Visualization - shown in all states except intro -->
            <div v-if="showPlayerTable" class="poker-table-container mt-3">
              <!-- Players top row -->
              <div class="players-top">
                <div
                  v-for="player in settings.players.slice(0, Math.ceil(settings.players.length / 2))"
                  :key="'top-' + player.name"
                  class="player-seat-compact"
                  :class="{ 'player-inactive': !player.isActive }"
                >
                  <div class="player-chips-compact">
                    <div v-if="isSmallBlind(player.name)" class="chip-small chip-sb" title="Small Blind">SB</div>
                    <div v-if="isBigBlind(player.name)" class="chip-small chip-bb" title="Big Blind">BB</div>
                  </div>
                  <div class="player-avatar-compact" :class="{
                    'ring-blue-500': isSmallBlind(player.name),
                    'ring-red-500': isBigBlind(player.name)
                  }">
                    {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="player-name-compact">{{ player.name }}</div>
                </div>
              </div>

              <!-- The table -->
              <div class="table-felt-compact">
                <span class="text-gold-400/60 text-xs">Pot</span>
              </div>

              <!-- Players bottom row -->
              <div class="players-bottom">
                <div
                  v-for="player in settings.players.slice(Math.ceil(settings.players.length / 2))"
                  :key="'bottom-' + player.name"
                  class="player-seat-compact"
                  :class="{ 'player-inactive': !player.isActive }"
                >
                  <div class="player-name-compact">{{ player.name }}</div>
                  <div class="player-avatar-compact" :class="{
                    'ring-blue-500': isSmallBlind(player.name),
                    'ring-red-500': isBigBlind(player.name)
                  }">
                    {{ player.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="player-chips-compact">
                    <div v-if="isSmallBlind(player.name)" class="chip-small chip-sb" title="Small Blind">SB</div>
                    <div v-if="isBigBlind(player.name)" class="chip-small chip-bb" title="Big Blind">BB</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Betting rules button (only in BETTING_ROUND) -->
            <button
              v-if="currentState === GameState.BETTING_ROUND"
              class="card p-2 bg-slate-800/50 text-sm w-full hover:bg-slate-700/50 transition-colors cursor-pointer mt-2"
              @click="showBettingRulesModal = true"
            >
              <div class="flex items-center justify-center gap-2 text-slate-400">
                <span>❓</span>
                <span class="text-xs">
                  <strong class="text-blue-400">SB</strong> Small Blind ·
                  <strong class="text-red-400">BB</strong> Big Blind ·
                  <span class="text-primary-400 underline">Regeln anzeigen</span>
                </span>
              </div>
            </button>

            <!-- Player management (only in ROUND_SUMMARY) -->
            <div v-if="currentState === GameState.ROUND_SUMMARY" class="card p-4 mt-3">
              <h3 class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                Spieler-Status verwalten
              </h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="player in settings.players"
                  :key="'manage-' + player.name"
                  class="px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1"
                  :class="{
                    'bg-slate-700 text-slate-300 hover:bg-slate-600': player.isActive,
                    'bg-danger-900/30 text-danger-400 border border-danger-500/50': !player.isActive
                  }"
                  @click="togglePlayerActive(player.name)"
                >
                  <span v-if="!player.isActive">❌</span>
                  <span v-else>✓</span>
                  {{ player.name }}
                </button>
              </div>
              <p class="text-slate-500 text-xs mt-2">
                Klicke auf einen Spieler um ihn auszuschalten oder wieder zu aktivieren.
              </p>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="game-action">
            <!-- BETTING_ROUND action -->
            <CTAButton v-if="currentState === GameState.BETTING_ROUND" variant="gold" size="lg" @click="nextStep">
              Einsätze fertig → Weiter
            </CTAButton>

            <!-- HINT_REVEAL action -->
            <CTAButton v-if="currentState === GameState.HINT_REVEAL" variant="primary" size="lg" @click="nextStep">
              Verstanden → Einsatzrunde
            </CTAButton>

            <!-- REVEAL_ANSWER action -->
            <CTAButton v-if="currentState === GameState.REVEAL_ANSWER" variant="gold" size="lg" @click="nextStep">
              → Letzte Einsatzrunde
            </CTAButton>

            <!-- ROUND_SUMMARY actions -->
            <div v-if="currentState === GameState.ROUND_SUMMARY" class="flex flex-col gap-2">
              <CTAButton variant="gold" @click="startNextRound">
                Nächste Frage
              </CTAButton>
              <CTAButton variant="outline" size="sm" @click="confirmEndGame">
                Spiel beenden
              </CTAButton>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- End Game Modal -->
    <HelpModal
      :is-open="showEndGameModal"
      title="Spiel beenden?"
      @close="cancelEndGame"
    >
      <p class="text-slate-300 mb-6">
        Möchtest du das Spiel wirklich beenden?
      </p>

      <div class="flex gap-4">
        <CTAButton variant="danger" @click="endGame">
          Ja, beenden
        </CTAButton>
        <CTAButton variant="secondary" @click="cancelEndGame">
          Abbrechen
        </CTAButton>
      </div>
    </HelpModal>

    <!-- Betting Rules Modal -->
    <HelpModal
      :is-open="showBettingRulesModal"
      title="Einsatzregeln"
      @close="showBettingRulesModal = false"
    >
      <div class="space-y-4 text-sm">
        <div>
          <h4 class="font-semibold text-gold-400 mb-1">Positionen</h4>
          <ul class="text-slate-300 space-y-1">
            <li><strong class="text-blue-400">SB (Small Blind)</strong> - Muss kleinen Pflichteinsatz zahlen</li>
            <li><strong class="text-red-400">BB (Big Blind)</strong> - Muss großen Pflichteinsatz zahlen (2x SB)</li>
          </ul>
          <p class="text-slate-500 text-xs mt-1">Die Positionen rotieren jede Runde im Uhrzeigersinn.</p>
        </div>

        <div>
          <h4 class="font-semibold text-gold-400 mb-1">Aktionen</h4>
          <ul class="text-slate-300 space-y-1">
            <li><strong class="text-white">Check</strong> - Kein Einsatz, wenn niemand erhöht hat</li>
            <li><strong class="text-white">Call</strong> - Den aktuellen Einsatz mitgehen</li>
            <li><strong class="text-white">Raise</strong> - Den Einsatz erhöhen</li>
            <li><strong class="text-white">Fold</strong> - Aufgeben und aus der Runde aussteigen</li>
            <li><strong class="text-white">All-In</strong> - Alle verbleibenden Chips setzen</li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-gold-400 mb-1">Wann endet eine Einsatzrunde?</h4>
          <p class="text-slate-300">
            Die Runde endet, wenn alle Spieler entweder:
          </p>
          <ul class="text-slate-300 mt-1 list-disc list-inside">
            <li>Den gleichen Betrag gesetzt haben (Call/Check)</li>
            <li>Oder gefoldet haben</li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold text-gold-400 mb-1">All-In Regeln</h4>
          <p class="text-slate-300">
            Wer All-In geht, kann nur den Pot bis zu seinem Einsatz gewinnen.
            Für höhere Einsätze wird ein Side-Pot gebildet.
          </p>
        </div>
      </div>

      <div class="mt-6">
        <CTAButton variant="primary" full-width @click="showBettingRulesModal = false">
          Verstanden
        </CTAButton>
      </div>
    </HelpModal>
  </div>
</template>

<style scoped>
/* Landscape Game Layout */
.game-layout {
  @apply w-full max-w-5xl flex flex-col lg:flex-row gap-4 lg:gap-8 items-center;
}

.game-content {
  @apply flex-1 w-full lg:max-w-2xl;
}

.game-action {
  @apply flex-shrink-0 w-full lg:w-auto lg:self-center;
}

@media (min-width: 1024px) {
  .game-action {
    min-width: 200px;
  }
}

/* Cards row (hints + answer side by side) */
.cards-row {
  @apply flex flex-col sm:flex-row gap-2;
}

.card-item {
  @apply flex-1 min-w-0;
}

/* Answer display in card format */
.answer-display-card {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (min-width: 640px) {
  .answer-display-card {
    font-size: 1.75rem;
  }
}

/* Compact Poker Table */
.poker-table-container {
  @apply flex flex-col items-center gap-1 mx-auto;
  max-width: 320px;
}

.players-top,
.players-bottom {
  @apply flex justify-center gap-3;
}

.table-felt-compact {
  @apply w-48 h-10 rounded-lg bg-gradient-to-br from-green-800 to-green-900 border border-amber-900/40 shadow-inner flex items-center justify-center;
}

.player-seat-compact {
  @apply flex flex-col items-center;
}

.player-chips-compact {
  @apply flex gap-0.5 min-h-[16px];
}

.chip-small {
  @apply w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center;
}

.chip-sb {
  @apply bg-blue-500 text-white;
}

.chip-bb {
  @apply bg-red-500 text-white;
}

.player-avatar-compact {
  @apply w-8 h-8 rounded-full bg-slate-700 ring-2 ring-slate-600 flex items-center justify-center text-white font-bold text-xs;
}

.player-name-compact {
  @apply text-[9px] text-slate-400 text-center max-w-[45px] truncate;
}

.player-inactive .player-avatar-compact {
  @apply opacity-30 grayscale;
}

.player-inactive .player-name-compact {
  @apply text-slate-600 line-through;
}

.player-inactive .player-chips-compact {
  @apply opacity-30;
}

/* Animations */
.animate-scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

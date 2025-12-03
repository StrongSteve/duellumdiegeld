<script setup lang="ts">
/**
 * GameProgressCard - Small progress info card matching mockup
 *
 * Features:
 * - Stepper icon
 * - Mini progress visualization
 * - Round counter
 * - Clickable to open modal
 */

import { computed } from 'vue'
import { GameState } from '@/types'

const props = defineProps<{
  /** Current game state */
  currentState: GameState
  /** Current round number */
  currentRound: number
  /** Current betting round (1-4) */
  bettingRound: number
  /** Current hint index (0-2) */
  currentHintIndex: number
}>()

const emit = defineEmits<{
  click: []
}>()

// Compute a simplified step representation
const stepInfo = computed(() => {
  const state = props.currentState
  const betting = props.bettingRound
  const hint = props.currentHintIndex

  // Simplified 3-step view: Previous, Current, Next
  let currentLabel = 'Frage'
  let previousLabel = ''
  let nextLabel = 'Schätzen'

  switch (state) {
    case GameState.QUESTION_INTRO:
      currentLabel = 'Frage'
      previousLabel = ''
      nextLabel = 'Schätzen'
      break
    case GameState.WRITE_GUESSES:
      currentLabel = 'Schätzen'
      previousLabel = 'Frage'
      nextLabel = 'Einsätze'
      break
    case GameState.BETTING_ROUND:
      currentLabel = `Einsätze ${betting}`
      previousLabel = betting === 1 ? 'Schätzen' : betting === 4 ? 'Auflösung' : `Hinweis ${betting - 1}`
      nextLabel = betting === 4 ? 'Gewinner' : betting < 3 ? `Hinweis ${betting}` : 'Auflösung'
      break
    case GameState.HINT_REVEAL:
      currentLabel = `Hinweis ${hint}`
      previousLabel = `Einsätze ${hint}`
      nextLabel = `Einsätze ${hint + 1}`
      break
    case GameState.REVEAL_ANSWER:
      currentLabel = 'Auflösung'
      previousLabel = 'Einsätze 3'
      nextLabel = 'Einsätze 4'
      break
    case GameState.ROUND_SUMMARY:
      currentLabel = 'Gewinner'
      previousLabel = 'Einsätze 4'
      nextLabel = 'Nächste Runde'
      break
  }

  return { previousLabel, currentLabel, nextLabel }
})
</script>

<template>
  <button class="progress-card" @click="emit('click')">
    <!-- Icon -->
    <div class="progress-card__icon">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>

    <!-- Content -->
    <div class="progress-card__content">
      <span class="progress-card__label">Fortschritt</span>

      <!-- Mini stepper -->
      <div class="progress-card__stepper">
        <span v-if="stepInfo.previousLabel" class="progress-card__step progress-card__step--past">
          {{ stepInfo.previousLabel }}
        </span>
        <span class="progress-card__step progress-card__step--current">
          {{ stepInfo.currentLabel }}
        </span>
        <span class="progress-card__step progress-card__step--next">
          {{ stepInfo.nextLabel }}
        </span>
      </div>

      <!-- Skeleton bar -->
      <div class="progress-card__skeleton"></div>
    </div>
  </button>
</template>

<style scoped>
.progress-card {
  @apply flex items-start gap-3;
  @apply p-4;
  @apply bg-slate-800/60 rounded-xl;
  @apply border border-slate-700/50;
  @apply text-left w-full;
  @apply transition-all duration-200;
  @apply hover:bg-slate-800 hover:border-slate-600;
  @apply cursor-pointer;
  min-height: 44px;
}

.progress-card__icon {
  @apply flex-shrink-0;
  @apply text-slate-400;
}

.progress-card__content {
  @apply flex-1 min-w-0;
}

.progress-card__label {
  @apply text-sm font-semibold text-slate-300;
  @apply block mb-1.5;
}

.progress-card__stepper {
  @apply flex items-center gap-1;
  @apply text-[10px];
  @apply mb-2;
}

.progress-card__step {
  @apply px-1.5 py-0.5 rounded;
}

.progress-card__step--past {
  @apply bg-slate-700/50 text-slate-500;
}

.progress-card__step--current {
  @apply bg-primary-500/30 text-primary-300 font-medium;
}

.progress-card__step--next {
  @apply bg-slate-700/30 text-slate-500;
}

.progress-card__skeleton {
  @apply h-1 rounded-full;
  @apply bg-gradient-to-r from-primary-500/50 via-slate-600 to-slate-700;
  @apply w-full;
}
</style>

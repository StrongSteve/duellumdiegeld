<script setup lang="ts">
/**
 * GameProgressModal - Detailed progress view in modal
 *
 * Features:
 * - Full stepper/timeline view
 * - All phases of a round
 * - Current step highlighted
 * - Completed steps marked
 */

import { computed } from 'vue'
import { GameState } from '@/types'
import GameModal from './GameModal.vue'

const props = defineProps<{
  isOpen: boolean
  currentState: GameState
  currentRound: number
  bettingRound: number
  currentHintIndex: number
}>()

const emit = defineEmits<{
  close: []
}>()

// Define all steps in a round
const allSteps = computed(() => {
  const state = props.currentState
  const betting = props.bettingRound

  const steps = [
    { id: 'question', label: 'Frage stellen', state: GameState.QUESTION_INTRO },
    { id: 'guess', label: 'Schätzen', state: GameState.WRITE_GUESSES },
    { id: 'bet1', label: 'Einsatzrunde 1', state: GameState.BETTING_ROUND, bettingRound: 1 },
    { id: 'hint1', label: 'Hinweis 1', state: GameState.HINT_REVEAL, hintIndex: 1 },
    { id: 'bet2', label: 'Einsatzrunde 2', state: GameState.BETTING_ROUND, bettingRound: 2 },
    { id: 'hint2', label: 'Hinweis 2', state: GameState.HINT_REVEAL, hintIndex: 2 },
    { id: 'bet3', label: 'Einsatzrunde 3', state: GameState.BETTING_ROUND, bettingRound: 3 },
    { id: 'answer', label: 'Auflösung', state: GameState.REVEAL_ANSWER },
    { id: 'bet4', label: 'Letzte Einsatzrunde', state: GameState.BETTING_ROUND, bettingRound: 4 },
    { id: 'winner', label: 'Gewinner', state: GameState.ROUND_SUMMARY }
  ]

  // Calculate current index based on state
  let currentIndex = 0
  switch (state) {
    case GameState.QUESTION_INTRO:
      currentIndex = 0
      break
    case GameState.WRITE_GUESSES:
      currentIndex = 1
      break
    case GameState.BETTING_ROUND:
      currentIndex = betting === 1 ? 2 : betting === 2 ? 4 : betting === 3 ? 6 : 8
      break
    case GameState.HINT_REVEAL:
      currentIndex = props.currentHintIndex === 1 ? 3 : 5
      break
    case GameState.REVEAL_ANSWER:
      currentIndex = 7
      break
    case GameState.ROUND_SUMMARY:
      currentIndex = 9
      break
  }

  return steps.map((step, index) => ({
    ...step,
    isCurrent: index === currentIndex,
    isCompleted: index < currentIndex,
    isPending: index > currentIndex
  }))
})
</script>

<template>
  <GameModal :is-open="isOpen" title="Fortschritt" @close="emit('close')">
    <!-- Round counter -->
    <div class="round-counter">
      <span class="round-counter__current">Runde {{ currentRound }}</span>
    </div>

    <!-- Timeline -->
    <div class="progress-timeline">
      <div
        v-for="(step, index) in allSteps"
        :key="step.id"
        class="timeline-step"
        :class="{
          'timeline-step--completed': step.isCompleted,
          'timeline-step--current': step.isCurrent,
          'timeline-step--pending': step.isPending
        }"
      >
        <!-- Step indicator -->
        <div class="timeline-step__indicator">
          <div class="timeline-step__dot">
            <svg v-if="step.isCompleted" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span v-else-if="step.isCurrent" class="timeline-step__pulse"></span>
          </div>
          <div v-if="index < allSteps.length - 1" class="timeline-step__line"></div>
        </div>

        <!-- Step label -->
        <span class="timeline-step__label">{{ step.label }}</span>
      </div>
    </div>

    <!-- Close button -->
    <template #footer>
      <button class="close-btn" @click="emit('close')">
        Schließen
      </button>
    </template>
  </GameModal>
</template>

<style scoped>
.round-counter {
  @apply text-center mb-6;
}

.round-counter__current {
  @apply text-2xl font-bold text-primary-400;
}

.progress-timeline {
  @apply space-y-0;
}

.timeline-step {
  @apply flex items-start gap-3;
  @apply py-1.5;
}

.timeline-step__indicator {
  @apply flex flex-col items-center;
  @apply flex-shrink-0;
}

.timeline-step__dot {
  @apply w-6 h-6 rounded-full;
  @apply flex items-center justify-center;
  @apply transition-all duration-200;
}

.timeline-step--completed .timeline-step__dot {
  @apply bg-success-500 text-white;
}

.timeline-step--current .timeline-step__dot {
  @apply bg-primary-500 text-white;
  @apply ring-4 ring-primary-500/30;
}

.timeline-step--pending .timeline-step__dot {
  @apply bg-slate-700 text-slate-500;
}

.timeline-step__pulse {
  @apply w-2 h-2 rounded-full bg-white;
  animation: pulse 1.5s ease-in-out infinite;
}

.timeline-step__line {
  @apply w-0.5 h-4 mt-1;
  @apply transition-colors duration-200;
}

.timeline-step--completed .timeline-step__line {
  @apply bg-success-500;
}

.timeline-step--current .timeline-step__line {
  @apply bg-gradient-to-b from-primary-500 to-slate-700;
}

.timeline-step--pending .timeline-step__line {
  @apply bg-slate-700;
}

.timeline-step__label {
  @apply text-sm;
  @apply pt-0.5;
}

.timeline-step--completed .timeline-step__label {
  @apply text-slate-400;
}

.timeline-step--current .timeline-step__label {
  @apply text-white font-semibold;
}

.timeline-step--pending .timeline-step__label {
  @apply text-slate-500;
}

.close-btn {
  @apply w-full py-3;
  @apply bg-slate-700 hover:bg-slate-600;
  @apply text-white font-medium;
  @apply rounded-lg;
  @apply transition-colors duration-200;
  min-height: 44px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}
</style>

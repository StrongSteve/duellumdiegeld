<script setup lang="ts">
/**
 * GameProgressCard - Small progress info card matching mockup
 *
 * Features:
 * - Stepper icon
 * - Mini progress visualization with 3 dots
 * - Shows current phase text from PHASE_META
 * - Clickable to open modal
 */

import { computed } from 'vue'
import { GamePhase, PHASE_META, PHASE_ORDER } from '@/types/gamePhases'

const props = defineProps<{
  /** Current game phase */
  phase: GamePhase
}>()

const emit = defineEmits<{
  click: []
}>()

// Get phase index for navigation
const phaseIndex = computed(() => PHASE_ORDER.indexOf(props.phase))

// Get previous, current, next phases
const previousPhase = computed(() => {
  const idx = phaseIndex.value
  return idx > 0 ? PHASE_ORDER[idx - 1] : null
})

const nextPhase = computed(() => {
  const idx = phaseIndex.value
  return idx < PHASE_ORDER.length - 1 ? PHASE_ORDER[idx + 1] : null
})

// Get display names
const previousName = computed(() => previousPhase.value ? PHASE_META[previousPhase.value].shortName : '')
const currentName = computed(() => PHASE_META[props.phase].shortName)
const nextName = computed(() => nextPhase.value ? PHASE_META[nextPhase.value].shortName : 'Neue Runde')

// Get current phase description
const phaseDescription = computed(() => PHASE_META[props.phase].fortschrittText)
</script>

<template>
  <button class="progress-card" @click="emit('click')">
    <!-- Icon -->
    <div class="progress-card__icon">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>

    <!-- Content -->
    <div class="progress-card__content">
      <span class="progress-card__label">Fortschritt</span>

      <!-- Current phase description -->
      <p class="progress-card__description">{{ phaseDescription }}</p>

      <!-- Mini 3-dot stepper -->
      <div class="progress-card__dots">
        <div class="dot dot--past" :title="previousName">
          <span v-if="previousName" class="dot-label">{{ previousName }}</span>
        </div>
        <div class="dot dot--current" :title="currentName">
          <span class="dot-label">{{ currentName }}</span>
        </div>
        <div class="dot dot--next" :title="nextName">
          <span class="dot-label">{{ nextName }}</span>
        </div>
      </div>
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
  @apply text-primary-400;
  @apply mt-0.5;
}

.progress-card__content {
  @apply flex-1 min-w-0;
}

.progress-card__header {
  @apply flex items-center justify-between;
  @apply mb-1;
}

.progress-card__label {
  @apply text-sm font-semibold text-slate-300;
}

.progress-card__description {
  @apply text-xs text-primary-300;
  @apply mb-2;
}

/* Mini 3-dot stepper */
.progress-card__dots {
  @apply flex items-center gap-2;
}

.dot {
  @apply flex flex-col items-center gap-1;
  @apply flex-1;
}

.dot::before {
  content: '';
  @apply w-2.5 h-2.5 rounded-full;
  @apply transition-all duration-200;
}

.dot--past::before {
  @apply bg-slate-600;
}

.dot--current::before {
  @apply bg-primary-400;
  box-shadow: 0 0 8px rgba(var(--color-primary-400), 0.5);
}

.dot--next::before {
  @apply bg-slate-700;
}

.dot-label {
  @apply text-[9px] leading-tight;
  @apply text-center;
  @apply max-w-full truncate;
}

.dot--past .dot-label {
  @apply text-slate-500;
}

.dot--current .dot-label {
  @apply text-primary-300 font-medium;
}

.dot--next .dot-label {
  @apply text-slate-500;
}
</style>

<script setup lang="ts">
/**
 * GameProgressModal - Detailed progress view in modal
 *
 * Features:
 * - Full stepper/timeline view of all GamePhases
 * - Current phase highlighted with glow
 * - Completed phases marked with checkmark
 * - Icons for each phase type
 */

import { computed } from 'vue'
import { GamePhase, PHASE_META, PHASE_ORDER } from '@/types/gamePhases'
import GameModal from './GameModal.vue'

const props = defineProps<{
  isOpen: boolean
  phase: GamePhase
  currentRound: number
}>()

const emit = defineEmits<{
  close: []
}>()

// Get current phase index
const currentPhaseIndex = computed(() => PHASE_ORDER.indexOf(props.phase))

// Build timeline steps from PHASE_ORDER
const timelineSteps = computed(() => {
  return PHASE_ORDER.map((phase, index) => ({
    phase,
    label: PHASE_META[phase].shortName,
    icon: PHASE_META[phase].icon,
    isCompleted: index < currentPhaseIndex.value,
    isCurrent: index === currentPhaseIndex.value,
    isPending: index > currentPhaseIndex.value
  }))
})

// Current phase description
const currentPhaseDescription = computed(() => PHASE_META[props.phase].fortschrittText)
</script>

<template>
  <GameModal :is-open="isOpen" title="Fortschritt" @close="emit('close')">
    <!-- Header with round and current phase -->
    <div class="progress-header">
      <span class="round-badge">Runde {{ currentRound }}</span>
      <div class="current-phase-info">
        <span class="current-phase-label">Aktuelle Phase:</span>
        <span class="current-phase-text">{{ currentPhaseDescription }}</span>
      </div>
    </div>

    <!-- Visual Timeline -->
    <div class="progress-timeline">
      <div
        v-for="(step, index) in timelineSteps"
        :key="step.phase"
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
            <!-- Checkmark for completed -->
            <svg v-if="step.isCompleted" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <!-- Icon for current -->
            <span v-else-if="step.isCurrent" class="timeline-step__icon">{{ step.icon }}</span>
            <!-- Icon for pending (dimmed) -->
            <span v-else class="timeline-step__icon timeline-step__icon--dim">{{ step.icon }}</span>
          </div>
          <!-- Connecting line -->
          <div v-if="index < timelineSteps.length - 1" class="timeline-step__line"></div>
        </div>

        <!-- Step label -->
        <div class="timeline-step__content">
          <span class="timeline-step__label">{{ step.label }}</span>
        </div>
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
.progress-header {
  @apply mb-6;
  @apply text-center;
}

.round-badge {
  @apply inline-block px-4 py-1.5;
  @apply bg-primary-500/20 text-primary-300;
  @apply rounded-full text-sm font-semibold;
  @apply mb-3;
}

.current-phase-info {
  @apply flex flex-col gap-1;
}

.current-phase-label {
  @apply text-xs text-slate-500 uppercase tracking-wider;
}

.current-phase-text {
  @apply text-lg font-semibold text-white;
}

/* Timeline */
.progress-timeline {
  @apply space-y-0;
}

.timeline-step {
  @apply flex items-start gap-3;
  @apply py-2;
}

.timeline-step__indicator {
  @apply flex flex-col items-center;
  @apply flex-shrink-0;
}

.timeline-step__dot {
  @apply w-8 h-8 rounded-full;
  @apply flex items-center justify-center;
  @apply transition-all duration-200;
  @apply text-sm;
}

.timeline-step--completed .timeline-step__dot {
  @apply bg-green-500/20 text-green-400;
  @apply border-2 border-green-500/50;
}

.timeline-step--current .timeline-step__dot {
  @apply bg-gold-500/20 text-gold-400;
  @apply border-2 border-gold-400;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.4);
}

.timeline-step--pending .timeline-step__dot {
  @apply bg-slate-800 text-slate-500;
  @apply border-2 border-slate-700;
}

.timeline-step__icon {
  @apply text-base;
}

.timeline-step__icon--dim {
  @apply opacity-40;
}

.timeline-step__line {
  @apply w-0.5 h-6 mt-1;
  @apply transition-colors duration-200;
}

.timeline-step--completed .timeline-step__line {
  @apply bg-green-500/50;
}

.timeline-step--current .timeline-step__line {
  @apply bg-gradient-to-b from-gold-400/50 to-slate-700;
}

.timeline-step--pending .timeline-step__line {
  @apply bg-slate-700;
}

.timeline-step__content {
  @apply flex-1;
  @apply pt-1.5;
}

.timeline-step__label {
  @apply text-sm;
}

.timeline-step--completed .timeline-step__label {
  @apply text-slate-400;
}

.timeline-step--current .timeline-step__label {
  @apply text-gold-300 font-semibold;
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
</style>

<script setup lang="ts">
/**
 * StepIndicator - Game progress stepper
 *
 * Shows the 10-step game flow with clear active state highlighting.
 * Groups steps into logical phases for better readability.
 *
 * Step groups:
 * - Question phase (1): Question
 * - Guessing phase (1): Guessing
 * - Betting/Hints cycle (6): Bet1, Hint1, Bet2, Hint2, Bet3, Reveal
 * - Final phase (2): Bet4, Winner
 */

interface Step {
  label: string
  state: string
  shortLabel?: string
}

const props = defineProps<{
  steps: Step[]
  currentIndex: number
}>()

// Group steps for visual separation
const stepGroups = [
  { start: 0, end: 0, name: 'Question' },   // Question
  { start: 1, end: 1, name: 'Guess' },      // Guessing
  { start: 2, end: 7, name: 'Play' },       // Bet1, Hint1, Bet2, Hint2, Bet3, Reveal
  { start: 8, end: 9, name: 'End' }         // Bet4, Winner
]

// Short labels for compact display
const shortLabels: Record<string, string> = {
  'Frage': 'Q',
  'Schätzen': 'G',
  'Wette 1': 'B1',
  'Hinweis 1': 'H1',
  'Wette 2': 'B2',
  'Hinweis 2': 'H2',
  'Wette 3': 'B3',
  'Auflösung': 'R',
  'Wette 4': 'B4',
  'Gewinner': 'W'
}

function getShortLabel(label: string): string {
  return shortLabels[label] || label.charAt(0)
}

function isInActiveGroup(index: number): boolean {
  const group = stepGroups.find(g => props.currentIndex >= g.start && props.currentIndex <= g.end)
  return group ? index >= group.start && index <= group.end : false
}
</script>

<template>
  <div class="step-indicator">
    <!-- Desktop: Full stepper with labels -->
    <div class="hidden lg:flex items-center justify-center">
      <template v-for="(step, index) in steps" :key="index">
        <!-- Step item -->
        <div
          class="step-item"
          :class="{
            'step-item--active': index === currentIndex,
            'step-item--completed': index < currentIndex,
            'step-item--pending': index > currentIndex,
            'step-item--in-group': isInActiveGroup(index)
          }"
        >
          <!-- Step circle with number/icon -->
          <div class="step-circle">
            <!-- Completed checkmark -->
            <svg
              v-if="index < currentIndex"
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Current/pending number -->
            <span v-else class="step-number">{{ index + 1 }}</span>
          </div>

          <!-- Step label -->
          <span class="step-label">{{ step.label }}</span>
        </div>

        <!-- Connector line -->
        <div
          v-if="index < steps.length - 1"
          class="step-connector"
          :class="{
            'step-connector--completed': index < currentIndex,
            'step-connector--active': index === currentIndex
          }"
        />
      </template>
    </div>

    <!-- Tablet: Compact stepper with short labels -->
    <div class="hidden md:flex lg:hidden items-center justify-center gap-1">
      <template v-for="(step, index) in steps" :key="index">
        <div
          class="step-compact"
          :class="{
            'step-compact--active': index === currentIndex,
            'step-compact--completed': index < currentIndex,
            'step-compact--pending': index > currentIndex
          }"
          :title="step.label"
        >
          <span class="step-compact__label">{{ getShortLabel(step.label) }}</span>
        </div>

        <div
          v-if="index < steps.length - 1"
          class="step-connector-mini"
          :class="{ 'step-connector-mini--completed': index < currentIndex }"
        />
      </template>
    </div>

    <!-- Mobile: Current step indicator -->
    <div class="md:hidden text-center">
      <div class="step-mobile">
        <span class="step-mobile__current">{{ steps[currentIndex]?.label || '' }}</span>
        <span class="step-mobile__progress">{{ currentIndex + 1 }} / {{ steps.length }}</span>
      </div>
      <!-- Mini progress bar -->
      <div class="step-mobile-bar">
        <div
          class="step-mobile-bar__fill"
          :style="{ width: `${((currentIndex + 1) / steps.length) * 100}%` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-indicator {
  @apply py-3 px-4;
}

/* Desktop step item */
.step-item {
  @apply flex flex-col items-center gap-1.5;
  @apply transition-all duration-200;
}

.step-circle {
  @apply w-8 h-8 rounded-full;
  @apply flex items-center justify-center;
  @apply text-xs font-bold;
  @apply transition-all duration-200;
  @apply border-2;
}

.step-label {
  @apply text-xs font-medium;
  @apply transition-colors duration-200;
  @apply whitespace-nowrap;
}

/* Active step */
.step-item--active .step-circle {
  @apply bg-primary-500 border-primary-400 text-white;
  @apply shadow-lg shadow-primary-500/50;
  @apply scale-110;
}

.step-item--active .step-label {
  @apply text-primary-400 font-semibold;
}

/* Completed step */
.step-item--completed .step-circle {
  @apply bg-success-500/20 border-success-500 text-success-400;
}

.step-item--completed .step-label {
  @apply text-success-500/80;
}

/* Pending step */
.step-item--pending .step-circle {
  @apply bg-slate-800 border-slate-600 text-slate-500;
}

.step-item--pending .step-label {
  @apply text-slate-500;
}

/* In active group - slightly highlighted */
.step-item--in-group:not(.step-item--active):not(.step-item--completed) .step-circle {
  @apply border-slate-500;
}

/* Connector lines */
.step-connector {
  @apply w-6 h-0.5 mx-1;
  @apply transition-colors duration-200;
  @apply bg-slate-700;
}

.step-connector--completed {
  @apply bg-success-500/60;
}

.step-connector--active {
  @apply bg-primary-500/60;
}

/* Tablet compact view */
.step-compact {
  @apply w-7 h-7 rounded-full;
  @apply flex items-center justify-center;
  @apply text-xs font-bold;
  @apply transition-all duration-200;
}

.step-compact--active {
  @apply bg-primary-500 text-white;
  @apply shadow-md shadow-primary-500/40;
  @apply scale-110;
}

.step-compact--completed {
  @apply bg-success-500/30 text-success-400;
}

.step-compact--pending {
  @apply bg-slate-700 text-slate-500;
}

.step-connector-mini {
  @apply w-2 h-0.5 bg-slate-700;
}

.step-connector-mini--completed {
  @apply bg-success-500/60;
}

/* Mobile view */
.step-mobile {
  @apply flex items-center justify-center gap-3;
  @apply mb-2;
}

.step-mobile__current {
  @apply text-lg font-semibold text-primary-400;
}

.step-mobile__progress {
  @apply text-sm text-slate-500;
  @apply bg-slate-800 px-2 py-0.5 rounded-full;
}

.step-mobile-bar {
  @apply h-1 bg-slate-700 rounded-full;
  @apply max-w-xs mx-auto;
  @apply overflow-hidden;
}

.step-mobile-bar__fill {
  @apply h-full bg-gradient-to-r from-primary-500 to-primary-400;
  @apply transition-all duration-300 ease-out;
}
</style>

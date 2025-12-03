<script setup lang="ts">
/**
 * GameHintCard - Hint display card matching mockup
 *
 * Features:
 * - Icon on the left (lightbulb or info)
 * - Title + subtitle/text
 * - Locked/unlocked/revealed states
 * - Visual feedback for state
 */

defineProps<{
  /** Title shown on the card (e.g., "Hinweis 1") */
  title: string
  /** The hint text, or null if not yet revealed */
  text: string | null
  /** Whether the hint is unlocked (available to show) */
  isUnlocked: boolean
  /** Whether the hint text has been revealed */
  isRevealed: boolean
  /** Hint number (1 or 2) for icon styling */
  hintNumber?: number
}>()
</script>

<template>
  <div
    class="hint-card"
    :class="{
      'hint-card--locked': !isUnlocked,
      'hint-card--unlocked': isUnlocked && !isRevealed,
      'hint-card--revealed': isRevealed
    }"
  >
    <!-- Icon -->
    <div class="hint-card__icon">
      <svg
        v-if="hintNumber === 1"
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      <svg
        v-else
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <!-- Content -->
    <div class="hint-card__content">
      <span class="hint-card__title">{{ title }}</span>
      <span class="hint-card__text">
        <template v-if="isRevealed && text">
          {{ text }}
        </template>
        <template v-else>
          Noch nicht freigeschaltet
        </template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.hint-card {
  @apply flex items-start gap-3;
  @apply p-4;
  @apply rounded-xl;
  @apply transition-all duration-200;
}

/* Locked state */
.hint-card--locked {
  @apply bg-slate-800/40;
  @apply opacity-60;
}

.hint-card--locked .hint-card__icon {
  @apply text-slate-500;
}

.hint-card--locked .hint-card__title {
  @apply text-slate-400;
}

.hint-card--locked .hint-card__text {
  @apply text-slate-500;
}

/* Unlocked but not revealed */
.hint-card--unlocked {
  @apply bg-slate-800/60;
  @apply border border-primary-500/20;
}

.hint-card--unlocked .hint-card__icon {
  @apply text-primary-400;
}

.hint-card--unlocked .hint-card__title {
  @apply text-slate-300;
}

.hint-card--unlocked .hint-card__text {
  @apply text-slate-400;
}

/* Revealed state */
.hint-card--revealed {
  @apply bg-slate-800/80;
  @apply border border-primary-500/30;
}

.hint-card--revealed .hint-card__icon {
  @apply text-primary-400;
}

.hint-card--revealed .hint-card__title {
  @apply text-primary-400;
}

.hint-card--revealed .hint-card__text {
  @apply text-slate-200;
}

.hint-card__icon {
  @apply flex-shrink-0;
  @apply w-8 h-8 rounded-full;
  @apply flex items-center justify-center;
  @apply bg-slate-700/50;
}

.hint-card__content {
  @apply flex flex-col gap-0.5;
  @apply min-w-0;
  @apply text-left;
}

.hint-card__title {
  @apply text-sm font-semibold;
}

.hint-card__text {
  @apply text-xs;
  @apply line-clamp-2;
}
</style>

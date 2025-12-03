<script setup lang="ts">
/**
 * GameSolutionCard - Solution display card matching mockup
 *
 * Features:
 * - "Lösung" title
 * - Lock icon when not revealed
 * - Locked/unlocked/revealed states
 * - Large solution text when revealed
 */

defineProps<{
  /** The solution text (answer value + unit) */
  solutionText: string | null
  /** Whether the solution is unlocked */
  isUnlocked: boolean
  /** Whether the solution has been revealed */
  isRevealed: boolean
}>()
</script>

<template>
  <div
    class="solution-card"
    :class="{
      'solution-card--locked': !isUnlocked,
      'solution-card--unlocked': isUnlocked && !isRevealed,
      'solution-card--revealed': isRevealed
    }"
  >
    <div class="solution-card__content">
      <span class="solution-card__title">Lösung</span>
      <span class="solution-card__text">
        <template v-if="isRevealed && solutionText">
          {{ solutionText }}
        </template>
        <template v-else>
          Noch nicht freigeschaltet
        </template>
      </span>
    </div>

    <!-- Lock icon -->
    <div class="solution-card__icon">
      <svg
        v-if="!isRevealed"
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
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
          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.solution-card {
  @apply flex items-center justify-between;
  @apply p-4;
  @apply rounded-xl;
  @apply transition-all duration-200;
}

/* Locked state */
.solution-card--locked {
  @apply bg-slate-800/40;
  @apply opacity-70;
}

.solution-card--locked .solution-card__title {
  @apply text-slate-400;
}

.solution-card--locked .solution-card__text {
  @apply text-slate-500;
}

.solution-card--locked .solution-card__icon {
  @apply text-slate-500;
}

/* Unlocked but not revealed */
.solution-card--unlocked {
  @apply bg-slate-800/60;
  @apply border border-gold-500/20;
}

.solution-card--unlocked .solution-card__title {
  @apply text-slate-300;
}

.solution-card--unlocked .solution-card__text {
  @apply text-slate-400;
}

.solution-card--unlocked .solution-card__icon {
  @apply text-gold-500/60;
}

/* Revealed state */
.solution-card--revealed {
  @apply bg-gradient-to-r from-gold-900/30 to-slate-800;
  @apply border border-gold-500/40;
}

.solution-card--revealed .solution-card__title {
  @apply text-gold-400;
}

.solution-card--revealed .solution-card__text {
  @apply text-xl font-bold;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.solution-card--revealed .solution-card__icon {
  @apply text-gold-500;
}

.solution-card__content {
  @apply flex flex-col gap-0.5;
}

.solution-card__title {
  @apply text-sm font-semibold;
}

.solution-card__text {
  @apply text-xs;
}

.solution-card__icon {
  @apply flex-shrink-0;
}
</style>

<script setup lang="ts">
/**
 * GameSolutionCard - Solution display card matching mockup
 *
 * Features:
 * - "Lösung" title
 * - Locked/unlocked/revealed states
 * - Large solution text when revealed
 * - Source URL link when revealed
 */

defineProps<{
  /** The solution text (answer value + unit) */
  solutionText: string | null
  /** Whether the solution is unlocked */
  isUnlocked: boolean
  /** Whether the solution has been revealed */
  isRevealed: boolean
  /** Optional source URL for the answer */
  sourceUrl?: string | null
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
      <a
        v-if="isRevealed && sourceUrl"
        :href="sourceUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="solution-card__source"
      >
        Quelle ansehen →
      </a>
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


.solution-card__content {
  @apply flex flex-col gap-0.5;
}

.solution-card__title {
  @apply text-sm font-semibold;
}

.solution-card__text {
  @apply text-xs;
}

.solution-card__source {
  @apply text-xs;
  @apply text-gold-400/80 hover:text-gold-300;
  @apply underline;
  @apply transition-colors duration-150;
  @apply cursor-pointer;
  @apply mt-1;
}
</style>

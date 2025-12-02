<script setup lang="ts">
/**
 * GameScreenLayout - Shared three-zone layout for all game phases
 *
 * Zone 1 (Top): Round info + Stepper
 * Zone 2 (Center): Main content (question, hints, instructions)
 * Zone 3 (Bottom): Primary and secondary CTAs
 *
 * Optimized for iPad landscape (1024x768 with Safari toolbars)
 */

defineProps<{
  /** Whether to show the stepper in the top zone */
  showStepper?: boolean
  /** Optional subtitle text shown below round info */
  subtitle?: string
}>()

defineEmits<{
  (e: 'primary-action'): void
  (e: 'secondary-action'): void
}>()
</script>

<template>
  <div class="game-screen-layout">
    <!-- Top Zone: Round Info + Stepper -->
    <header class="game-screen-top">
      <slot name="top">
        <slot name="stepper" />
      </slot>
    </header>

    <!-- Center Zone: Main Content -->
    <main class="game-screen-center">
      <div class="game-screen-content">
        <slot />
      </div>
    </main>

    <!-- Bottom Zone: CTAs -->
    <footer class="game-screen-bottom">
      <div class="game-screen-actions">
        <slot name="actions" />
      </div>
    </footer>
  </div>
</template>

<style scoped>
.game-screen-layout {
  @apply flex flex-col min-h-screen;
  @apply bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900;
  /* Safe padding for tablet UI */
  padding-top: max(env(safe-area-inset-top), 0.75rem);
  padding-bottom: max(env(safe-area-inset-bottom), 0.75rem);
}

/* Top Zone - Stepper area */
.game-screen-top {
  @apply flex-shrink-0;
  @apply px-4 py-2;
  @apply max-w-5xl w-full mx-auto;
}

/* Center Zone - Main content, vertically centered */
.game-screen-center {
  @apply flex-1 flex items-center justify-center;
  @apply px-4 py-2;
  @apply overflow-y-auto;
}

.game-screen-content {
  @apply max-w-3xl w-full mx-auto;
  @apply flex flex-col items-center;
}

/* Bottom Zone - CTA area */
.game-screen-bottom {
  @apply flex-shrink-0;
  @apply px-4 py-4;
  @apply max-w-5xl w-full mx-auto;
}

.game-screen-actions {
  @apply flex flex-col sm:flex-row items-center justify-center gap-3;
}

/* Ensure proper touch targets and spacing on tablet */
@media (min-width: 768px) {
  .game-screen-layout {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .game-screen-top {
    @apply py-3;
  }

  .game-screen-bottom {
    @apply py-5;
  }

  .game-screen-actions {
    @apply gap-4;
  }
}

/* iPad landscape specific */
@media (min-width: 1024px) and (max-height: 768px) {
  .game-screen-layout {
    /* Compensate for Safari toolbars */
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
  }
}
</style>

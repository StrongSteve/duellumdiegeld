<script setup lang="ts">
/**
 * GameRulesCard - Small rules info card matching mockup
 *
 * Features:
 * - Document/book icon
 * - "Regeln" label
 * - Clickable to open modal
 */

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button class="rules-card" @click="emit('click')">
    <!-- Icon -->
    <div class="rules-card__icon">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>

    <!-- Content -->
    <div class="rules-card__content">
      <span class="rules-card__label">Regeln</span>
      <!-- Skeleton bar -->
      <div class="rules-card__skeleton"></div>
    </div>
  </button>
</template>

<style scoped>
.rules-card {
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

.rules-card__icon {
  @apply flex-shrink-0;
  @apply text-slate-400;
}

.rules-card__content {
  @apply flex-1 min-w-0;
}

.rules-card__label {
  @apply text-sm font-semibold text-slate-300;
  @apply block mb-2;
}

.rules-card__skeleton {
  @apply h-1 rounded-full;
  @apply bg-gradient-to-r from-slate-600 via-slate-600 to-slate-700;
  @apply w-full;
}
</style>

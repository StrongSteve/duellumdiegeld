<script setup lang="ts">
/**
 * InfoButton - Circular info button for top-left corner
 *
 * Displays system info and played questions modal when clicked.
 * Should be positioned at top-left of every screen.
 */

import { ref } from 'vue'
import InfoModal from './InfoModal.vue'

const showModal = ref(false)
</script>

<template>
  <div class="info-button-wrapper">
    <button
      class="info-button"
      @click="showModal = true"
      aria-label="Informationen anzeigen"
      title="Informationen"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>

    <InfoModal
      :is-open="showModal"
      @close="showModal = false"
    />
  </div>
</template>

<style scoped>
.info-button-wrapper {
  @apply fixed;
  top: 1rem;
  left: 1rem;
  z-index: 40;
}

.info-button {
  @apply w-10 h-10;
  @apply rounded-full;
  @apply flex items-center justify-center;
  @apply bg-slate-800/80 hover:bg-slate-700;
  @apply text-slate-400 hover:text-white;
  @apply border border-slate-700/50 hover:border-slate-600;
  @apply transition-all duration-200;
  @apply shadow-lg;
  backdrop-filter: blur(4px);
}

.info-button:hover {
  @apply transform scale-105;
}

.info-button:active {
  @apply transform scale-95;
}

/* Safe area padding for mobile */
@supports (padding-top: env(safe-area-inset-top)) {
  .info-button-wrapper {
    top: max(env(safe-area-inset-top), 1rem);
    left: max(env(safe-area-inset-left), 1rem);
  }
}

/* Desktop with iPad frame: position inside the frame */
@media (min-width: 1101px) {
  .info-button-wrapper {
    /* On desktop, the iPad frame has padding, so we need to offset */
    top: calc(2rem + 18px + 1rem); /* wrapper padding + bezel padding + button margin */
    left: calc(2rem + 18px + 1rem);
  }
}
</style>

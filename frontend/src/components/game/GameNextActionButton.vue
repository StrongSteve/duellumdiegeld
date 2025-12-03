<script setup lang="ts">
/**
 * GameNextActionButton - Dynamic CTA button matching mockup
 *
 * Features:
 * - Gold gradient button
 * - Dynamic label from PHASE_META
 * - Rounded pill shape
 * - Glow effect
 */

import { computed } from 'vue'
import { GamePhase, PHASE_META } from '@/types/gamePhases'

const props = defineProps<{
  /** Current game phase */
  phase: GamePhase
  /** Whether the button is disabled */
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

// Get the button label from PHASE_META
const buttonLabel = computed(() => PHASE_META[props.phase].buttonText)
</script>

<template>
  <button
    class="next-action-btn"
    :disabled="disabled"
    @click="emit('click')"
  >
    <span class="button-text" v-html="buttonLabel.replace('\n', '<br>')"></span>
  </button>
</template>

<style scoped>
.next-action-btn {
  @apply w-full py-4 px-6;
  @apply text-base font-bold;
  @apply text-slate-900;
  @apply rounded-xl;
  @apply transition-all duration-200;
  @apply shadow-lg;
  @apply leading-tight;
  @apply text-center;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
  /* Fixed height to support two lines of text */
  height: 72px;
  @apply flex items-center justify-center;
}

.next-action-btn:hover:not(:disabled) {
  @apply transform scale-[1.02];
  box-shadow: 0 6px 30px rgba(251, 191, 36, 0.4);
}

.next-action-btn:active:not(:disabled) {
  @apply transform scale-[0.98];
}

.next-action-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply transform-none;
}

/* Subtle glow animation */
@keyframes subtle-glow {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow: 0 4px 30px rgba(251, 191, 36, 0.5);
  }
}

.next-action-btn:not(:disabled) {
  animation: subtle-glow 3s ease-in-out infinite;
}
</style>

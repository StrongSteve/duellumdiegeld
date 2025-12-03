<script setup lang="ts">
/**
 * GameNextActionButton - Dynamic CTA button matching mockup
 *
 * Features:
 * - Gold gradient button
 * - Dynamic label based on game state
 * - Rounded pill shape
 * - Glow effect
 */

import { computed } from 'vue'
import { GameState } from '@/types'

const props = defineProps<{
  /** Current game state */
  currentState: GameState
  /** Current betting round number (1-4) */
  bettingRound: number
  /** Whether this is the last round */
  isLastRound?: boolean
  /** Whether the button is disabled */
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

// Get the appropriate label based on game state
const buttonLabel = computed(() => {
  switch (props.currentState) {
    case GameState.QUESTION_INTRO:
      return 'Alle bereit → Schätzen'
    case GameState.WRITE_GUESSES:
      return 'Alle haben geschätzt → Einsätze'
    case GameState.BETTING_ROUND:
      if (props.bettingRound === 1) {
        return 'Ersten Hinweis anzeigen'
      } else if (props.bettingRound === 2) {
        return 'Zweiten Hinweis anzeigen'
      } else if (props.bettingRound === 3) {
        return 'Lösung anzeigen'
      } else {
        return 'Zur Auswertung'
      }
    case GameState.HINT_REVEAL:
      return 'Zur Einsatzrunde'
    case GameState.REVEAL_ANSWER:
      return 'Letzte Einsatzrunde'
    case GameState.ROUND_SUMMARY:
      if (props.isLastRound) {
        return 'Zum Endergebnis'
      }
      return 'Nächste Runde starten'
    case GameState.GAME_OVER:
      return 'Spiel beenden'
    default:
      return 'Weiter'
  }
})
</script>

<template>
  <button
    class="next-action-btn"
    :disabled="disabled"
    @click="emit('click')"
  >
    {{ buttonLabel }}
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

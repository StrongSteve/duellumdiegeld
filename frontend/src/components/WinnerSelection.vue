<script setup lang="ts">
/**
 * WinnerSelection - Optional component to mark round winner(s)
 *
 * Allows the host to optionally mark who won the round.
 * This is purely informational and doesn't affect gameplay.
 */

import { ref } from 'vue'
import type { Player } from '@/types'

defineProps<{
  /** List of active players to choose from */
  players: Player[]
}>()

const emit = defineEmits<{
  (e: 'winner-selected', winners: string[]): void
}>()

const selectedWinners = ref<string[]>([])
const isExpanded = ref(false)

function togglePlayer(playerName: string) {
  const index = selectedWinners.value.indexOf(playerName)
  if (index === -1) {
    selectedWinners.value.push(playerName)
  } else {
    selectedWinners.value.splice(index, 1)
  }
  emit('winner-selected', selectedWinners.value)
}

function isSelected(playerName: string) {
  return selectedWinners.value.includes(playerName)
}

function clearSelection() {
  selectedWinners.value = []
  emit('winner-selected', [])
}
</script>

<template>
  <div class="winner-selection">
    <button
      class="winner-selection__toggle"
      @click="isExpanded = !isExpanded"
    >
      <span class="winner-selection__icon">🏆</span>
      <span class="winner-selection__label">
        <template v-if="selectedWinners.length === 0">
          Gewinner markieren (optional)
        </template>
        <template v-else-if="selectedWinners.length === 1">
          Gewinner: {{ selectedWinners[0] }}
        </template>
        <template v-else>
          Gewinner: {{ selectedWinners.join(', ') }}
        </template>
      </span>
      <svg
        class="winner-selection__chevron"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition name="expand">
      <div v-if="isExpanded" class="winner-selection__content">
        <p class="winner-selection__hint">
          Wer hat diese Runde gewonnen? (Mehrfachauswahl möglich)
        </p>

        <div class="winner-selection__players">
          <button
            v-for="player in players.filter(p => p.isActive)"
            :key="player.name"
            class="winner-selection__player"
            :class="{ 'winner-selection__player--selected': isSelected(player.name) }"
            @click="togglePlayer(player.name)"
          >
            <span class="winner-selection__avatar">
              {{ player.name.charAt(0).toUpperCase() }}
            </span>
            <span class="winner-selection__name">{{ player.name }}</span>
            <svg
              v-if="isSelected(player.name)"
              class="winner-selection__check"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        <button
          v-if="selectedWinners.length > 0"
          class="winner-selection__clear"
          @click="clearSelection"
        >
          Auswahl zurücksetzen
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.winner-selection {
  @apply bg-slate-800/50 rounded-xl border border-slate-700;
  @apply overflow-hidden;
}

.winner-selection__toggle {
  @apply w-full px-4 py-3;
  @apply flex items-center gap-2;
  @apply text-left;
  @apply transition-colors duration-200;
  @apply hover:bg-slate-700/30;
  min-height: 48px;
}

.winner-selection__icon {
  @apply text-xl;
}

.winner-selection__label {
  @apply flex-1 text-sm text-slate-300;
}

.winner-selection__chevron {
  @apply w-5 h-5 text-slate-400;
  @apply transition-transform duration-200;
}

.winner-selection__content {
  @apply px-4 pb-4;
}

.winner-selection__hint {
  @apply text-xs text-slate-500 mb-3;
}

.winner-selection__players {
  @apply flex flex-wrap gap-2;
}

.winner-selection__player {
  @apply flex items-center gap-2 px-3 py-2;
  @apply bg-slate-700 rounded-lg;
  @apply text-sm text-slate-300;
  @apply transition-all duration-200;
  @apply hover:bg-slate-600;
  min-height: 44px;
}

.winner-selection__player--selected {
  @apply bg-gold-500/20 border border-gold-500/50;
  @apply text-gold-400;
}

.winner-selection__avatar {
  @apply w-6 h-6 rounded-full;
  @apply bg-slate-600 text-slate-300;
  @apply flex items-center justify-center;
  @apply text-xs font-bold;
}

.winner-selection__player--selected .winner-selection__avatar {
  @apply bg-gold-500/30 text-gold-400;
}

.winner-selection__name {
  @apply font-medium;
}

.winner-selection__check {
  @apply w-4 h-4 text-gold-400;
}

.winner-selection__clear {
  @apply mt-3 text-xs text-slate-500;
  @apply hover:text-slate-400;
  @apply transition-colors duration-200;
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease-out;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>

<script setup lang="ts">
/**
 * RoundSummaryModal - End of round dialog
 *
 * Features:
 * - Shows all players with ability to mark them as eliminated (greyed out)
 * - Question rating with 5 stars
 * - Continue to next round button
 */

import { ref, computed } from 'vue'
import type { Player } from '@/types'
import GameModal from './GameModal.vue'

const props = defineProps<{
  /** Whether the modal is open */
  isOpen: boolean
  /** List of all players */
  players: Player[]
  /** Current round number */
  roundNumber: number
  /** Question ID for rating */
  questionId: string
}>()

const emit = defineEmits<{
  close: []
  continueGame: []
  eliminatePlayer: [playerName: string]
  reactivatePlayer: [playerName: string]
  rateQuestion: [rating: number]
}>()

// Rating state
const selectedRating = ref<number>(0)
const hoverRating = ref<number>(0)
const hasRated = ref(false)

// Check localStorage for previous rating on this question
function checkIfAlreadyRated(): boolean {
  const ratedQuestions = JSON.parse(localStorage.getItem('ratedQuestions') || '[]')
  return ratedQuestions.includes(props.questionId)
}

// Computed: Active players count
const activePlayersCount = computed(() => props.players.filter(p => p.isActive).length)

// Handle star click
function handleStarClick(rating: number) {
  if (hasRated.value) return
  selectedRating.value = rating
}

// Handle rate and continue
function handleContinue() {
  if (selectedRating.value > 0 && !hasRated.value) {
    emit('rateQuestion', selectedRating.value)
    hasRated.value = true
  }
  emit('continueGame')
}

// Toggle player elimination
function togglePlayerStatus(player: Player) {
  if (player.isActive) {
    // Only allow elimination if more than 2 players remain
    if (activePlayersCount.value > 2) {
      emit('eliminatePlayer', player.name)
    }
  } else {
    emit('reactivatePlayer', player.name)
  }
}

// Handle star hover
function handleStarHover(rating: number) {
  if (hasRated.value) return
  hoverRating.value = rating
}

function handleStarLeave() {
  hoverRating.value = 0
}

// Reset state when modal opens
function resetState() {
  selectedRating.value = 0
  hoverRating.value = 0
  // Check if already rated in localStorage
  hasRated.value = checkIfAlreadyRated()
}

// Watch for modal open
import { watch } from 'vue'
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    resetState()
  }
})
</script>

<template>
  <GameModal
    :is-open="isOpen"
    title="Runde beendet"
    @close="emit('close')"
  >
    <div class="round-summary">
      <!-- Rating section -->
      <div class="rating-section">
        <span class="rating-label">Frage bewerten</span>
        <div class="stars-row" @mouseleave="handleStarLeave">
          <button
            v-for="star in 5"
            :key="star"
            class="star-btn"
            :class="{
              'star-btn--active': star <= selectedRating,
              'star-btn--hover': hoverRating > 0 && star <= hoverRating && !hasRated,
              'star-btn--disabled': hasRated
            }"
            @click="handleStarClick(star)"
            @mouseenter="handleStarHover(star)"
          >
            ★
          </button>
        </div>
      </div>

      <!-- Players section - compact grid -->
      <div class="players-section">
        <p class="section-hint">Tippe auf eine Person, um sie aus dem Spiel zu nehmen</p>
        <div class="players-grid">
          <button
            v-for="player in players"
            :key="player.name"
            class="player-chip"
            :class="{ 'player-chip--eliminated': !player.isActive }"
            @click="togglePlayerStatus(player)"
          >
            <span class="player-initial">{{ player.name.charAt(0).toUpperCase() }}</span>
            <span class="player-name">{{ player.name }}</span>
          </button>
        </div>
      </div>

      <!-- Continue button -->
      <button class="continue-btn" @click="handleContinue">
        Nächste Runde starten
      </button>
    </div>
  </GameModal>
</template>

<style scoped>
.round-summary {
  @apply flex flex-col gap-5;
}

/* Rating section */
.rating-section {
  @apply flex items-center justify-between;
  @apply flex-wrap gap-3;
}

.rating-label {
  @apply text-base font-medium text-slate-300;
}

.stars-row {
  @apply flex gap-1;
}

.star-btn {
  @apply text-2xl leading-none;
  @apply text-slate-600;
  @apply transition-all duration-150;
  @apply cursor-pointer;
}

.star-btn--hover {
  @apply text-yellow-300;
}

.star-btn--active {
  @apply text-yellow-400;
}

.star-btn--disabled {
  @apply cursor-default;
}

/* Players section */
.players-section {
  @apply space-y-3;
}

.section-hint {
  @apply text-sm text-slate-400;
}

.players-grid {
  @apply flex flex-wrap gap-2;
}

.player-chip {
  @apply flex items-center gap-2;
  @apply px-3 py-2 rounded-full;
  @apply bg-slate-700/60 hover:bg-slate-600/80;
  @apply border border-slate-600/50;
  @apply transition-all duration-200;
  @apply cursor-pointer;
}

.player-chip--eliminated {
  @apply opacity-40;
  @apply bg-slate-800/50;
  @apply border-slate-700/30;
  @apply line-through;
}

.player-initial {
  @apply w-7 h-7 rounded-full;
  @apply bg-primary-500/80 text-white;
  @apply flex items-center justify-center;
  @apply text-xs font-bold;
  @apply flex-shrink-0;
}

.player-chip--eliminated .player-initial {
  @apply bg-slate-600 text-slate-400;
}

.player-name {
  @apply text-sm font-medium text-slate-200;
}

/* Continue button */
.continue-btn {
  @apply w-full py-3 px-6;
  @apply text-base font-bold;
  @apply text-slate-900;
  @apply rounded-xl;
  @apply transition-all duration-200;
  @apply shadow-lg;
  @apply mt-2;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
  min-height: 48px;
}

.continue-btn:hover {
  @apply transform scale-[1.01];
  box-shadow: 0 6px 30px rgba(251, 191, 36, 0.4);
}

.continue-btn:active {
  @apply transform scale-[0.99];
}
</style>

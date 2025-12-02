<script setup lang="ts">
/**
 * PokerTable - Visualizes the poker table with player positions
 *
 * Shows players around an oval table with Small Blind and Big Blind indicators.
 * Supports 2-8 players with proper positioning.
 */

import type { Player } from '@/types'

defineProps<{
  /** List of players */
  players: Player[]
  /** Name of the small blind player */
  smallBlindName?: string
  /** Name of the big blind player */
  bigBlindName?: string
  /** Show pot in center */
  showPot?: boolean
  /** Pot label text */
  potLabel?: string
}>()

defineEmits<{
  (e: 'player-click', playerName: string): void
}>()

function isSmallBlind(playerName: string, sbName?: string) {
  return sbName === playerName
}

function isBigBlind(playerName: string, bbName?: string) {
  return bbName === playerName
}
</script>

<template>
  <div class="poker-table">
    <!-- Players top row -->
    <div class="poker-table__row poker-table__row--top">
      <div
        v-for="player in players.slice(0, Math.ceil(players.length / 2))"
        :key="'top-' + player.name"
        class="poker-table__seat"
        :class="{ 'poker-table__seat--inactive': !player.isActive }"
        @click="$emit('player-click', player.name)"
      >
        <!-- Blind chips -->
        <div class="poker-table__chips">
          <div
            v-if="isSmallBlind(player.name, smallBlindName)"
            class="poker-table__chip poker-table__chip--sb"
            title="Small Blind"
          >
            SB
          </div>
          <div
            v-if="isBigBlind(player.name, bigBlindName)"
            class="poker-table__chip poker-table__chip--bb"
            title="Big Blind"
          >
            BB
          </div>
        </div>

        <!-- Avatar -->
        <div
          class="poker-table__avatar"
          :class="{
            'poker-table__avatar--sb': isSmallBlind(player.name, smallBlindName),
            'poker-table__avatar--bb': isBigBlind(player.name, bigBlindName)
          }"
        >
          {{ player.name.charAt(0).toUpperCase() }}
        </div>

        <!-- Name -->
        <div class="poker-table__name">{{ player.name }}</div>
      </div>
    </div>

    <!-- The felt table -->
    <div class="poker-table__felt">
      <span v-if="showPot" class="poker-table__pot">
        {{ potLabel || 'Pot' }}
      </span>
    </div>

    <!-- Players bottom row -->
    <div class="poker-table__row poker-table__row--bottom">
      <div
        v-for="player in players.slice(Math.ceil(players.length / 2))"
        :key="'bottom-' + player.name"
        class="poker-table__seat poker-table__seat--bottom"
        :class="{ 'poker-table__seat--inactive': !player.isActive }"
        @click="$emit('player-click', player.name)"
      >
        <!-- Name -->
        <div class="poker-table__name">{{ player.name }}</div>

        <!-- Avatar -->
        <div
          class="poker-table__avatar"
          :class="{
            'poker-table__avatar--sb': isSmallBlind(player.name, smallBlindName),
            'poker-table__avatar--bb': isBigBlind(player.name, bigBlindName)
          }"
        >
          {{ player.name.charAt(0).toUpperCase() }}
        </div>

        <!-- Blind chips -->
        <div class="poker-table__chips">
          <div
            v-if="isSmallBlind(player.name, smallBlindName)"
            class="poker-table__chip poker-table__chip--sb"
            title="Small Blind"
          >
            SB
          </div>
          <div
            v-if="isBigBlind(player.name, bigBlindName)"
            class="poker-table__chip poker-table__chip--bb"
            title="Big Blind"
          >
            BB
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.poker-table {
  @apply flex flex-col items-center gap-2;
  @apply mx-auto;
  max-width: 400px;
}

.poker-table__row {
  @apply flex justify-center gap-4;
}

.poker-table__felt {
  @apply w-64 h-14 rounded-2xl;
  @apply bg-gradient-to-br from-green-800 to-green-900;
  @apply border-2 border-amber-900/40;
  @apply shadow-inner;
  @apply flex items-center justify-center;
}

.poker-table__pot {
  @apply text-gold-400/70 text-sm font-medium;
}

.poker-table__seat {
  @apply flex flex-col items-center gap-1;
  @apply cursor-pointer;
  @apply transition-opacity duration-200;
}

.poker-table__seat:hover:not(.poker-table__seat--inactive) {
  @apply opacity-80;
}

.poker-table__seat--inactive {
  @apply opacity-30;
}

.poker-table__seat--inactive .poker-table__avatar {
  @apply grayscale;
}

.poker-table__seat--inactive .poker-table__name {
  @apply line-through text-slate-600;
}

.poker-table__chips {
  @apply flex gap-1 min-h-[20px];
}

.poker-table__chip {
  @apply w-5 h-5 rounded-full;
  @apply text-[9px] font-bold;
  @apply flex items-center justify-center;
  @apply shadow-sm;
}

.poker-table__chip--sb {
  @apply bg-blue-500 text-white;
}

.poker-table__chip--bb {
  @apply bg-red-500 text-white;
}

.poker-table__avatar {
  @apply w-10 h-10 rounded-full;
  @apply bg-slate-700;
  @apply ring-2 ring-slate-600;
  @apply flex items-center justify-center;
  @apply text-white font-bold text-sm;
  @apply transition-all duration-200;
}

.poker-table__avatar--sb {
  @apply ring-blue-500;
}

.poker-table__avatar--bb {
  @apply ring-red-500;
}

.poker-table__name {
  @apply text-xs text-slate-400;
  @apply text-center;
  @apply max-w-[60px] truncate;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .poker-table__felt {
    @apply w-72 h-16;
  }

  .poker-table__avatar {
    @apply w-12 h-12 text-base;
  }

  .poker-table__chip {
    @apply w-6 h-6 text-[10px];
  }

  .poker-table__name {
    @apply text-sm max-w-[80px];
  }
}
</style>

<script setup lang="ts">
/**
 * GamePlayersCard - Small players overview card matching mockup
 *
 * Features:
 * - Group/avatars icon
 * - Player initials as chips
 * - SB/BB badges
 * - Clickable to open modal
 */

import type { Player } from '@/types'

defineProps<{
  /** List of players */
  players: Player[]
  /** Name of small blind player */
  smallBlindName?: string
  /** Name of big blind player */
  bigBlindName?: string
}>()

const emit = defineEmits<{
  click: []
}>()

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase()
}

function getRole(playerName: string, sbName?: string, bbName?: string): string | null {
  if (playerName === sbName) return 'SB'
  if (playerName === bbName) return 'BB'
  return null
}
</script>

<template>
  <button class="players-card" @click="emit('click')">
    <!-- Icon -->
    <div class="players-card__icon">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>

    <!-- Content -->
    <div class="players-card__content">
      <span class="players-card__label">Mitspielende</span>

      <!-- Player chips -->
      <div class="players-card__chips">
        <div
          v-for="player in players.filter(p => p.isActive).slice(0, 5)"
          :key="player.name"
          class="player-chip"
          :class="{ 'player-chip--inactive': !player.isActive }"
        >
          <span class="player-chip__initial">{{ getInitials(player.name) }}</span>
          <span
            v-if="getRole(player.name, smallBlindName, bigBlindName)"
            class="player-chip__badge"
            :class="{
              'player-chip__badge--sb': getRole(player.name, smallBlindName, bigBlindName) === 'SB',
              'player-chip__badge--bb': getRole(player.name, smallBlindName, bigBlindName) === 'BB'
            }"
          >
            {{ getRole(player.name, smallBlindName, bigBlindName) }}
          </span>
        </div>
        <span v-if="players.filter(p => p.isActive).length > 5" class="players-card__more">
          +{{ players.filter(p => p.isActive).length - 5 }}
        </span>
      </div>

      <!-- Skeleton bar -->
      <div class="players-card__skeleton"></div>
    </div>
  </button>
</template>

<style scoped>
.players-card {
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

.players-card__icon {
  @apply flex-shrink-0;
  @apply text-slate-400;
}

.players-card__content {
  @apply flex-1 min-w-0;
}

.players-card__label {
  @apply text-sm font-semibold text-slate-300;
  @apply block mb-1.5;
}

.players-card__chips {
  @apply flex items-center gap-1;
  @apply mb-2;
}

.player-chip {
  @apply relative;
  @apply w-6 h-6 rounded-full;
  @apply bg-slate-700;
  @apply flex items-center justify-center;
}

.player-chip--inactive {
  @apply opacity-40;
}

.player-chip__initial {
  @apply text-[10px] font-bold text-slate-300;
}

.player-chip__badge {
  @apply absolute -top-1 -right-1;
  @apply text-[7px] font-bold;
  @apply px-1 rounded;
}

.player-chip__badge--sb {
  @apply bg-blue-500 text-white;
}

.player-chip__badge--bb {
  @apply bg-red-500 text-white;
}

.players-card__more {
  @apply text-[10px] text-slate-500;
  @apply ml-0.5;
}

.players-card__skeleton {
  @apply h-1 rounded-full;
  @apply bg-gradient-to-r from-slate-600 via-slate-600 to-slate-700;
  @apply w-full;
}
</style>

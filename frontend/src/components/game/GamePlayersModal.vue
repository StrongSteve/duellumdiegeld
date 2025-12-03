<script setup lang="ts">
/**
 * GamePlayersModal - Detailed players view in modal
 *
 * Features:
 * - Full player table
 * - Role badges (SB, BB)
 * - Active/inactive status
 * - Clean dark mode design
 */

import type { Player } from '@/types'
import GameModal from './GameModal.vue'

defineProps<{
  isOpen: boolean
  players: Player[]
  smallBlindName?: string
  bigBlindName?: string
}>()

const emit = defineEmits<{
  close: []
}>()

function getRole(playerName: string, sbName?: string, bbName?: string): string | null {
  if (playerName === sbName) return 'SB'
  if (playerName === bbName) return 'BB'
  return null
}

function getRoleLabel(role: string | null): string {
  if (role === 'SB') return 'Small Blind'
  if (role === 'BB') return 'Big Blind'
  return 'Spieler'
}
</script>

<template>
  <GameModal :is-open="isOpen" title="Spielerübersicht" @close="emit('close')">
    <div class="players-table-wrapper">
      <table class="players-table">
        <thead>
          <tr>
            <th class="players-table__th">#</th>
            <th class="players-table__th">Name</th>
            <th class="players-table__th">Rolle</th>
            <th class="players-table__th">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, index) in players"
            :key="player.name"
            class="players-table__row"
            :class="{ 'players-table__row--inactive': !player.isActive }"
          >
            <td class="players-table__td players-table__td--index">
              {{ index + 1 }}
            </td>
            <td class="players-table__td players-table__td--name">
              <div class="player-name">
                <span class="player-name__avatar">
                  {{ player.name.charAt(0).toUpperCase() }}
                </span>
                <span class="player-name__text">{{ player.name }}</span>
              </div>
            </td>
            <td class="players-table__td">
              <span
                v-if="getRole(player.name, smallBlindName, bigBlindName)"
                class="role-badge"
                :class="{
                  'role-badge--sb': getRole(player.name, smallBlindName, bigBlindName) === 'SB',
                  'role-badge--bb': getRole(player.name, smallBlindName, bigBlindName) === 'BB'
                }"
              >
                {{ getRoleLabel(getRole(player.name, smallBlindName, bigBlindName)) }}
              </span>
              <span v-else class="text-slate-500 text-sm">-</span>
            </td>
            <td class="players-table__td">
              <span
                class="status-badge"
                :class="{
                  'status-badge--active': player.isActive,
                  'status-badge--inactive': !player.isActive
                }"
              >
                {{ player.isActive ? 'Aktiv' : 'Ausgeschieden' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Legend -->
    <div class="players-legend">
      <div class="legend-item">
        <span class="legend-dot legend-dot--sb"></span>
        <span class="legend-label">SB = Small Blind (kleiner Pflichteinsatz)</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot legend-dot--bb"></span>
        <span class="legend-label">BB = Big Blind (großer Pflichteinsatz)</span>
      </div>
    </div>

    <template #footer>
      <button class="close-btn" @click="emit('close')">
        Schließen
      </button>
    </template>
  </GameModal>
</template>

<style scoped>
.players-table-wrapper {
  @apply -mx-2 overflow-x-auto;
}

.players-table {
  @apply w-full text-sm;
}

.players-table__th {
  @apply px-3 py-2;
  @apply text-left text-xs font-semibold;
  @apply text-slate-400 uppercase tracking-wider;
  @apply border-b border-slate-700;
}

.players-table__row {
  @apply transition-colors duration-200;
}

.players-table__row:hover {
  @apply bg-slate-700/30;
}

.players-table__row--inactive {
  @apply opacity-50;
}

.players-table__td {
  @apply px-3 py-3;
  @apply border-b border-slate-700/50;
}

.players-table__td--index {
  @apply text-slate-500 font-mono text-xs;
  @apply w-8;
}

.players-table__td--name {
  @apply font-medium;
}

.player-name {
  @apply flex items-center gap-2;
}

.player-name__avatar {
  @apply w-7 h-7 rounded-full;
  @apply bg-slate-700;
  @apply flex items-center justify-center;
  @apply text-xs font-bold text-slate-300;
}

.player-name__text {
  @apply text-white;
}

.role-badge {
  @apply inline-flex items-center;
  @apply px-2 py-0.5 rounded;
  @apply text-xs font-medium;
}

.role-badge--sb {
  @apply bg-blue-500/20 text-blue-400;
}

.role-badge--bb {
  @apply bg-red-500/20 text-red-400;
}

.status-badge {
  @apply inline-flex items-center;
  @apply px-2 py-0.5 rounded;
  @apply text-xs font-medium;
}

.status-badge--active {
  @apply bg-success-500/20 text-success-400;
}

.status-badge--inactive {
  @apply bg-danger-500/20 text-danger-400;
}

.players-legend {
  @apply mt-4 pt-4;
  @apply border-t border-slate-700/50;
  @apply space-y-1;
}

.legend-item {
  @apply flex items-center gap-2;
}

.legend-dot {
  @apply w-2 h-2 rounded-full;
}

.legend-dot--sb {
  @apply bg-blue-500;
}

.legend-dot--bb {
  @apply bg-red-500;
}

.legend-label {
  @apply text-xs text-slate-500;
}

.close-btn {
  @apply w-full py-3;
  @apply bg-slate-700 hover:bg-slate-600;
  @apply text-white font-medium;
  @apply rounded-lg;
  @apply transition-colors duration-200;
  min-height: 44px;
}
</style>

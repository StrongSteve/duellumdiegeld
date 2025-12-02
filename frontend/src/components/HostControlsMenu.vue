<script setup lang="ts">
/**
 * HostControlsMenu - Quick access menu for host controls
 *
 * Provides quick access to common host actions like skipping questions,
 * ending the game, or managing players.
 */

import { ref } from 'vue'

defineProps<{
  /** Allow skipping current question */
  canSkip?: boolean
  /** Allow ending game */
  canEndGame?: boolean
}>()

defineEmits<{
  (e: 'skip-question'): void
  (e: 'end-game'): void
  (e: 'show-rules'): void
}>()

const isOpen = ref(false)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}
</script>

<template>
  <div class="host-controls" v-click-outside="closeMenu">
    <!-- Toggle button -->
    <button
      class="host-controls__toggle"
      :class="{ 'host-controls__toggle--open': isOpen }"
      @click="toggleMenu"
      title="Host-Menü"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
        />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <Transition name="menu">
      <div v-if="isOpen" class="host-controls__menu">
        <button
          v-if="canSkip"
          class="host-controls__item"
          @click="$emit('skip-question'); closeMenu()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <span>Frage überspringen</span>
        </button>

        <button
          class="host-controls__item"
          @click="$emit('show-rules'); closeMenu()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Regeln anzeigen</span>
        </button>

        <div class="host-controls__divider" />

        <button
          v-if="canEndGame"
          class="host-controls__item host-controls__item--danger"
          @click="$emit('end-game'); closeMenu()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Spiel beenden</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.host-controls {
  @apply relative;
}

.host-controls__toggle {
  @apply w-10 h-10 rounded-full;
  @apply bg-slate-800 text-slate-400;
  @apply flex items-center justify-center;
  @apply transition-all duration-200;
  @apply hover:bg-slate-700 hover:text-white;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900;
}

.host-controls__toggle--open {
  @apply bg-slate-700 text-white;
}

.host-controls__menu {
  @apply absolute right-0 top-full mt-2;
  @apply w-48 py-1;
  @apply bg-slate-800 rounded-xl;
  @apply border border-slate-700;
  @apply shadow-xl shadow-black/30;
  @apply z-50;
}

.host-controls__item {
  @apply w-full px-3 py-2;
  @apply flex items-center gap-2;
  @apply text-sm text-slate-300;
  @apply transition-colors duration-150;
  @apply hover:bg-slate-700 hover:text-white;
}

.host-controls__item--danger {
  @apply text-danger-400;
}

.host-controls__item--danger:hover {
  @apply bg-danger-500/20 text-danger-300;
}

.host-controls__divider {
  @apply my-1 mx-2 h-px bg-slate-700;
}

/* Menu transition */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.15s ease-out;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>

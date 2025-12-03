<script setup lang="ts">
/**
 * GameModal - Generic modal component for game screens
 *
 * Features:
 * - Dark overlay with blur
 * - ESC key and backdrop click to close
 * - Accessible ARIA attributes
 * - Smooth animations
 */

import { watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

// Lock body scroll when modal is open
watch(
  () => props.isOpen,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
)

// Handle ESC key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

// Handle backdrop click
function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="game-modal-overlay"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'modal-title'"
      >
        <div class="game-modal-content">
          <!-- Header -->
          <div class="game-modal-header">
            <h3 id="modal-title" class="game-modal-title">{{ title }}</h3>
            <button
              class="game-modal-close"
              @click="emit('close')"
              aria-label="Schließen"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="game-modal-body">
            <slot />
          </div>

          <!-- Footer (optional) -->
          <div v-if="$slots.footer" class="game-modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.game-modal-overlay {
  @apply fixed inset-0 z-50;
  @apply flex items-center justify-center;
  @apply p-4;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.game-modal-content {
  @apply w-full max-w-lg;
  @apply bg-slate-800 rounded-2xl;
  @apply border border-slate-700;
  @apply shadow-2xl;
  @apply max-h-[90vh] overflow-y-auto;
  animation: modal-scale-in 0.2s ease-out;
}

.game-modal-header {
  @apply flex items-center justify-between;
  @apply px-6 py-4;
  @apply border-b border-slate-700/50;
}

.game-modal-title {
  @apply text-xl font-semibold text-white;
}

.game-modal-close {
  @apply w-10 h-10 rounded-full;
  @apply flex items-center justify-center;
  @apply text-slate-400 hover:text-white;
  @apply hover:bg-slate-700;
  @apply transition-colors duration-200;
}

.game-modal-body {
  @apply px-6 py-5;
}

.game-modal-footer {
  @apply px-6 py-4;
  @apply border-t border-slate-700/50;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .game-modal-content,
.modal-leave-to .game-modal-content {
  transform: scale(0.95);
}

@keyframes modal-scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

// Body Scroll sperren wenn Modal offen
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
      >
        <div class="modal-content animate-scale-in" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="modal-header flex items-center justify-between p-5 border-b border-slate-700/50">
            <h3 class="text-xl font-semibold text-white">{{ title }}</h3>
            <button
              class="btn-icon text-slate-400 hover:text-white"
              @click="emit('close')"
              aria-label="Schließen"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body p-5">
            <slot />
          </div>

          <!-- Footer (optional) -->
          <div v-if="$slots.footer" class="modal-footer p-5 border-t border-slate-700/50">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-content {
  @apply max-w-lg w-full;
}
</style>

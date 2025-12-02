<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title?: string
  content: string
}>()

const isExpanded = ref(false)

function toggle() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="explanation-panel">
    <!-- Toggle Button -->
    <button
      class="explanation-toggle w-full flex items-center justify-between p-4 md:p-5
             text-left text-slate-300 hover:text-white
             bg-slate-800/50 hover:bg-slate-800
             rounded-xl transition-all duration-200"
      @click="toggle"
    >
      <span class="flex items-center gap-3">
        <svg
          class="w-5 h-5 text-primary-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="font-medium">{{ title || 'Erklärung anzeigen' }}</span>
      </span>

      <svg
        class="w-5 h-5 transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Inhalt -->
    <Transition name="expand">
      <div v-if="isExpanded" class="explanation-content">
        <div class="p-4 md:p-5 bg-slate-800/30 rounded-b-xl border-t border-slate-700/50">
          <p class="text-slate-300 text-base md:text-lg leading-relaxed">
            {{ content }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.explanation-panel {
  @apply max-w-2xl mx-auto;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-out;
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
  max-height: 500px;
}
</style>

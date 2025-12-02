<script setup lang="ts">
/**
 * CollapsiblePanel - Expandable/collapsible info panel
 *
 * Used for secondary information like Texas Hold'em rules,
 * betting instructions, etc.
 */

import { ref } from 'vue'

withDefaults(defineProps<{
  /** Title shown in the header */
  title: string
  /** Icon/emoji shown before title */
  icon?: string
  /** Whether panel starts expanded */
  defaultExpanded?: boolean
}>(), {
  icon: '',
  defaultExpanded: false
})

const isExpanded = ref(false)

defineExpose({ isExpanded })
</script>

<template>
  <div
    class="collapsible-panel"
    :class="{ 'collapsible-panel--expanded': isExpanded }"
  >
    <button
      class="collapsible-panel__header"
      @click="isExpanded = !isExpanded"
      :aria-expanded="isExpanded"
    >
      <div class="collapsible-panel__title">
        <span v-if="icon" class="collapsible-panel__icon">{{ icon }}</span>
        <span>{{ title }}</span>
      </div>
      <svg
        class="collapsible-panel__chevron"
        :class="{ 'rotate-180': isExpanded }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition name="collapse">
      <div v-show="isExpanded" class="collapsible-panel__content">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.collapsible-panel {
  @apply bg-slate-800/50 rounded-xl border border-slate-700;
  @apply transition-all duration-200;
}

.collapsible-panel--expanded {
  @apply border-slate-600;
}

.collapsible-panel__header {
  @apply w-full px-4 py-3;
  @apply flex items-center justify-between;
  @apply text-left;
  @apply transition-colors duration-200;
  @apply rounded-xl;
  /* Touch target */
  min-height: 48px;
}

.collapsible-panel__header:hover {
  @apply bg-slate-700/30;
}

.collapsible-panel__title {
  @apply flex items-center gap-2;
  @apply font-semibold text-slate-200;
}

.collapsible-panel__icon {
  @apply text-xl;
}

.collapsible-panel__chevron {
  @apply w-5 h-5 text-slate-400;
  @apply transition-transform duration-200;
}

.collapsible-panel__content {
  @apply px-4 pb-4;
  @apply text-sm text-slate-400;
}

/* Collapse animation */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.2s ease-out;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>

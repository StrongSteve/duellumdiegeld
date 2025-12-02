<script setup lang="ts">
/**
 * SecondaryButton - Secondary action button
 *
 * Used for secondary actions like "Skip", "Back", "Cancel"
 * Styled as outline/ghost button to be visually subordinate to PrimaryButton
 */

withDefaults(defineProps<{
  /** Disable the button */
  disabled?: boolean
  /** Show loading spinner */
  loading?: boolean
  /** Button type */
  type?: 'button' | 'submit' | 'reset'
  /** Visual variant */
  variant?: 'outline' | 'ghost' | 'danger'
}>(), {
  disabled: false,
  loading: false,
  type: 'button',
  variant: 'outline'
})

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="secondary-btn"
    :class="[
      `secondary-btn--${variant}`,
      { 'secondary-btn--loading': loading, 'secondary-btn--disabled': disabled }
    ]"
    @click="$emit('click', $event)"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="secondary-btn__spinner">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </span>

    <!-- Button content -->
    <span :class="{ 'opacity-0': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.secondary-btn {
  @apply relative inline-flex items-center justify-center;
  @apply px-6 py-3;
  @apply text-base font-semibold;
  @apply rounded-xl;
  @apply transition-all duration-200 ease-out;
  /* Minimum touch target for tablet - slightly smaller than primary */
  min-height: 48px;
  min-width: 120px;
}

.secondary-btn:focus-visible {
  @apply outline-none ring-2 ring-offset-2 ring-offset-slate-900;
}

/* Outline variant (default) */
.secondary-btn--outline {
  @apply bg-transparent;
  @apply border-2 border-slate-500;
  @apply text-slate-300;
  @apply hover:border-slate-400 hover:text-white;
  @apply focus-visible:ring-slate-500;
}

.secondary-btn--outline:hover:not(:disabled) {
  @apply bg-slate-800/50;
}

.secondary-btn--outline:active:not(:disabled) {
  @apply bg-slate-700/50;
}

/* Ghost variant - more subtle */
.secondary-btn--ghost {
  @apply bg-transparent;
  @apply border-0;
  @apply text-slate-400;
  @apply hover:text-white hover:bg-slate-800/50;
  @apply focus-visible:ring-slate-500;
}

.secondary-btn--ghost:active:not(:disabled) {
  @apply bg-slate-700/50;
}

/* Danger variant - for destructive actions */
.secondary-btn--danger {
  @apply bg-transparent;
  @apply border-2 border-danger-500/50;
  @apply text-danger-400;
  @apply hover:border-danger-500 hover:text-danger-300;
  @apply focus-visible:ring-danger-500;
}

.secondary-btn--danger:hover:not(:disabled) {
  @apply bg-danger-500/10;
}

.secondary-btn--danger:active:not(:disabled) {
  @apply bg-danger-500/20;
}

/* Disabled state */
.secondary-btn--disabled,
.secondary-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Loading state */
.secondary-btn--loading {
  @apply cursor-wait;
}

.secondary-btn__spinner {
  @apply absolute inset-0 flex items-center justify-center;
}
</style>

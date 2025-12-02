<script setup lang="ts">
/**
 * PrimaryButton - Main CTA button for game actions
 *
 * Used for primary actions like "Continue", "Next Round", "Start Game"
 * Minimum touch target: 56px height for comfortable tablet interaction
 */

withDefaults(defineProps<{
  /** Disable the button */
  disabled?: boolean
  /** Show loading spinner */
  loading?: boolean
  /** Button type */
  type?: 'button' | 'submit' | 'reset'
  /** Visual variant */
  variant?: 'primary' | 'gold' | 'success'
}>(), {
  disabled: false,
  loading: false,
  type: 'button',
  variant: 'primary'
})

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="primary-btn"
    :class="[
      `primary-btn--${variant}`,
      { 'primary-btn--loading': loading, 'primary-btn--disabled': disabled }
    ]"
    @click="$emit('click', $event)"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="primary-btn__spinner">
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
.primary-btn {
  @apply relative inline-flex items-center justify-center;
  @apply px-8 py-4;
  @apply text-lg font-bold;
  @apply rounded-xl;
  @apply transition-all duration-200 ease-out;
  @apply shadow-lg;
  /* Minimum touch target for tablet */
  min-height: 56px;
  min-width: 180px;
}

.primary-btn:focus-visible {
  @apply outline-none ring-2 ring-offset-2 ring-offset-slate-900;
}

/* Primary variant (default) */
.primary-btn--primary {
  @apply bg-gradient-to-r from-primary-500 to-primary-600;
  @apply text-white;
  @apply hover:from-primary-400 hover:to-primary-500;
  @apply focus-visible:ring-primary-500;
  @apply shadow-primary-500/30;
}

.primary-btn--primary:hover:not(:disabled) {
  @apply shadow-xl shadow-primary-500/40;
  transform: translateY(-1px);
}

.primary-btn--primary:active:not(:disabled) {
  transform: translateY(0);
  @apply shadow-lg;
}

/* Gold variant */
.primary-btn--gold {
  @apply bg-gradient-to-r from-gold-500 to-gold-600;
  @apply text-slate-900;
  @apply hover:from-gold-400 hover:to-gold-500;
  @apply focus-visible:ring-gold-500;
  @apply shadow-gold-500/30;
}

.primary-btn--gold:hover:not(:disabled) {
  @apply shadow-xl shadow-gold-500/40;
  transform: translateY(-1px);
}

.primary-btn--gold:active:not(:disabled) {
  transform: translateY(0);
}

/* Success variant */
.primary-btn--success {
  @apply bg-gradient-to-r from-success-500 to-success-600;
  @apply text-white;
  @apply hover:from-success-400 hover:to-success-500;
  @apply focus-visible:ring-success-500;
  @apply shadow-success-500/30;
}

.primary-btn--success:hover:not(:disabled) {
  @apply shadow-xl shadow-success-500/40;
  transform: translateY(-1px);
}

.primary-btn--success:active:not(:disabled) {
  transform: translateY(0);
}

/* Disabled state */
.primary-btn--disabled,
.primary-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
  transform: none !important;
}

/* Loading state */
.primary-btn--loading {
  @apply cursor-wait;
}

.primary-btn__spinner {
  @apply absolute inset-0 flex items-center justify-center;
}
</style>

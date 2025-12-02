<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'danger' | 'success' | 'outline'

withDefaults(
  defineProps<{
    variant?: ButtonVariant
    disabled?: boolean
    loading?: boolean
    fullWidth?: boolean
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    variant: 'primary',
    disabled: false,
    loading: false,
    fullWidth: false,
    size: 'lg'
  }
)

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :class="[
      'cta-button',
      `cta-${variant}`,
      `cta-${size}`,
      { 'w-full': fullWidth, 'opacity-50 cursor-not-allowed': disabled || loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <!-- Ladeindikator -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-3 h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <slot />
  </button>
</template>

<style scoped>
.cta-button {
  @apply inline-flex items-center justify-center font-semibold
         rounded-xl shadow-lg
         transition-all duration-200 ease-out
         min-h-touch min-w-touch
         focus:outline-none focus:ring-4;
}

/* Größen */
.cta-sm {
  @apply px-4 py-2 text-base;
}

.cta-md {
  @apply px-6 py-3 text-lg;
}

.cta-lg {
  @apply px-8 py-4 text-xl;
}

/* Varianten */
.cta-primary {
  @apply text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800
         shadow-primary-500/30 focus:ring-primary-500/50;
}

.cta-secondary {
  @apply text-slate-300 bg-slate-700 hover:bg-slate-600 active:bg-slate-800
         shadow-slate-500/20 focus:ring-slate-500/50;
}

.cta-gold {
  @apply text-slate-900 font-bold
         bg-gradient-to-r from-gold-400 to-gold-500
         hover:from-gold-500 hover:to-gold-600
         shadow-gold-500/30 focus:ring-gold-500/50;
}

.cta-danger {
  @apply text-white bg-danger-600 hover:bg-danger-700 active:bg-danger-800
         shadow-danger-500/30 focus:ring-danger-500/50;
}

.cta-success {
  @apply text-white bg-success-600 hover:bg-success-700 active:bg-success-800
         shadow-success-500/30 focus:ring-success-500/50;
}

.cta-outline {
  @apply text-slate-300 border-2 border-slate-600 bg-transparent
         hover:border-slate-500 hover:bg-slate-800
         shadow-none focus:ring-slate-500/50;
}

/* Disabled State */
.cta-button:disabled {
  @apply hover:bg-current;
}
</style>

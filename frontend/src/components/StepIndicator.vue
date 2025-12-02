<script setup lang="ts">
interface Step {
  label: string
  state: string
}

defineProps<{
  steps: Step[]
  currentIndex: number
}>()
</script>

<template>
  <div class="step-indicator-container">
    <div class="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
      <template v-for="(step, index) in steps" :key="index">
        <!-- Schritt -->
        <div
          class="step-item flex items-center gap-1 md:gap-2"
          :class="{
            'step-active': index === currentIndex,
            'step-completed': index < currentIndex,
            'step-pending': index > currentIndex
          }"
        >
          <!-- Punkt -->
          <div
            class="step-dot w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300"
            :class="{
              'bg-primary-500 scale-125': index === currentIndex,
              'bg-success-500': index < currentIndex,
              'bg-slate-600': index > currentIndex
            }"
          />
          <!-- Label (nur auf größeren Bildschirmen) -->
          <span
            class="step-label hidden md:inline text-xs font-medium transition-colors duration-300"
            :class="{
              'text-primary-400': index === currentIndex,
              'text-success-500': index < currentIndex,
              'text-slate-500': index > currentIndex
            }"
          >
            {{ step.label }}
          </span>
        </div>

        <!-- Verbindungslinie -->
        <div
          v-if="index < steps.length - 1"
          class="step-connector w-4 md:w-8 h-0.5 transition-colors duration-300"
          :class="{
            'bg-success-500': index < currentIndex,
            'bg-slate-700': index >= currentIndex
          }"
        />
      </template>
    </div>

    <!-- Aktueller Schritt Label (mobil) -->
    <div class="md:hidden text-center mt-2">
      <span class="text-sm font-medium text-primary-400">
        {{ steps[currentIndex]?.label || '' }}
      </span>
      <span class="text-slate-500 text-xs ml-1">
        ({{ currentIndex + 1 }}/{{ steps.length }})
      </span>
    </div>
  </div>
</template>

<style scoped>
.step-indicator-container {
  @apply py-4 px-2;
}

.step-item {
  @apply transition-all duration-300;
}

.step-active .step-dot {
  @apply shadow-lg shadow-primary-500/50;
}
</style>

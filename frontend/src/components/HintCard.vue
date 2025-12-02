<script setup lang="ts">
defineProps<{
  hintNumber: number
  hintText: string
  isNew?: boolean
}>()
</script>

<template>
  <div
    class="hint-card"
    :class="{ 'hint-new animate-scale-in': isNew }"
  >
    <!-- Hinweis-Nummer -->
    <div class="hint-number">
      <span class="text-primary-400 font-bold text-sm md:text-base">
        Hinweis {{ hintNumber }}
      </span>
    </div>

    <!-- Hinweis-Text -->
    <p class="hint-text text-xl md:text-2xl lg:text-3xl text-center text-slate-100 mt-2">
      {{ hintText }}
    </p>
  </div>
</template>

<style scoped>
.hint-card {
  @apply card p-6 md:p-8 bg-slate-800/80 backdrop-blur border-slate-600/50;
}

.hint-new {
  @apply border-primary-500/50 shadow-lg shadow-primary-500/20;
}

.hint-number {
  @apply text-center;
}
</style>

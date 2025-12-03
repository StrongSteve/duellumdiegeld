<script setup lang="ts">
/**
 * GameLogoPanel - Branding panel matching mockup
 *
 * Features:
 * - Logo (money bag emoji styled as icon)
 * - Title text
 * - Subtitle text
 * - Dark card design
 */
</script>

<template>
  <div class="logo-panel">
    <!-- Logo icon -->
    <div class="logo-panel__icon">
      <div class="logo-icon">
        <span class="logo-icon__emoji">💰</span>
      </div>
    </div>

    <!-- Text -->
    <h2 class="logo-panel__title">Das Duell um die Geld</h2>
    <p class="logo-panel__subtitle">
      Das digitale Quiz-Poker-Erlebnis für euren Spieleabend.
    </p>
  </div>
</template>

<style scoped>
.logo-panel {
  @apply bg-slate-800/80 rounded-2xl;
  @apply p-4;
  @apply border border-slate-700/50;
  @apply text-center;
  @apply flex flex-col items-center justify-center;
  @apply h-full;
}

.logo-panel__icon {
  @apply mb-2;
}

.logo-icon {
  @apply w-12 h-12 rounded-xl;
  @apply bg-gradient-to-br from-gold-400 to-gold-600;
  @apply flex items-center justify-center;
  @apply shadow-lg shadow-gold-500/20;
}

.logo-icon__emoji {
  @apply text-2xl;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.logo-panel__title {
  @apply text-base font-bold text-white;
  @apply mb-1;
}

.logo-panel__subtitle {
  @apply text-[11px] text-slate-400;
  @apply leading-snug;
}
</style>

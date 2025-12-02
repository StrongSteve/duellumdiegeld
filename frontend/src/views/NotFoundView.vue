<script setup lang="ts">
import { RouterLink } from 'vue-router'
import CTAButton from '@/components/CTAButton.vue'
</script>

<template>
  <div class="not-found-view min-h-screen flex flex-col items-center justify-center p-4">
    <div class="text-center animate-fade-in">
      <div class="text-8xl mb-6">🤷</div>
      <h1 class="heading-display text-4xl text-white mb-4">
        404 - Nicht gefunden
      </h1>
      <p class="text-xl text-slate-400 mb-8 max-w-md">
        Die Seite, die du suchst, existiert leider nicht.
      </p>
      <RouterLink to="/">
        <CTAButton variant="primary">
          Zur Startseite
        </CTAButton>
      </RouterLink>
    </div>
  </div>
</template>

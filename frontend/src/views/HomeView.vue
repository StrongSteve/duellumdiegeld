<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import CTAButton from '@/components/CTAButton.vue'
import { questionsApi } from '@/services/api'

const questionCount = ref<number | null>(null)

onMounted(async () => {
  try {
    const response = await questionsApi.getCount()
    questionCount.value = response.count
  } catch {
    // Ignorieren - zeigt einfach nichts an
  }
})
</script>

<template>
  <div class="home-view">
    <!-- Header -->
    <header class="home-header">
      <div class="flex justify-end">
        <RouterLink
          to="/admin/login"
          class="text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          Admin
        </RouterLink>
      </div>
    </header>

    <!-- Main Content -->
    <main class="home-main">
      <!-- Logo / Titel -->
      <div class="text-center animate-fade-in">
        <div class="mb-4">
          <span class="text-6xl md:text-7xl">💰</span>
        </div>
        <h1 class="heading-display text-white mb-2 text-3xl md:text-4xl">
          Das Duell um die Geld
        </h1>
        <p class="text-lg text-slate-400 max-w-xl mx-auto">
          Das digitale Quiz-Poker-Erlebnis für euren Spieleabend
        </p>

        <!-- Fragen-Anzahl KPI -->
        <div v-if="questionCount !== null" class="mt-4 inline-block">
          <div class="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-2">
            <span class="text-2xl md:text-3xl font-bold text-gold-400">{{ questionCount.toLocaleString('de-DE') }}</span>
            <span class="text-slate-400 ml-2 text-sm">Fragen im Spiel</span>
          </div>
        </div>
      </div>

      <!-- Hauptaktionen -->
      <div class="flex flex-col gap-3 w-full max-w-sm animate-slide-up mt-6">
        <RouterLink to="/game/setup" class="block">
          <CTAButton variant="gold" full-width>
            🎮 Neues Spiel starten
          </CTAButton>
        </RouterLink>

        <RouterLink to="/submit-question" class="block">
          <CTAButton variant="secondary" full-width>
            ➕ Frage einreichen
          </CTAButton>
        </RouterLink>
      </div>

      <!-- Info-Karten -->
      <div class="grid grid-cols-3 gap-4 mt-8 max-w-3xl w-full">
        <div class="card p-4 text-center">
          <div class="text-3xl mb-2">🎯</div>
          <h3 class="text-sm font-semibold text-white mb-1">Schätzen</h3>
          <p class="text-slate-400 text-xs">
            Schreibt eure Schätzungen geheim auf und blufft euch zum Sieg.
          </p>
        </div>

        <div class="card p-4 text-center">
          <div class="text-3xl mb-2">💡</div>
          <h3 class="text-sm font-semibold text-white mb-1">Hinweise</h3>
          <p class="text-slate-400 text-xs">
            Mit jedem Hinweis könnt ihr eure Antwort besser einschätzen. Aber eure Gegner auch!
          </p>
        </div>

        <div class="card p-4 text-center">
          <div class="text-3xl mb-2">💰</div>
          <h3 class="text-sm font-semibold text-white mb-1">Wetten</h3>
          <p class="text-slate-400 text-xs">
            Setzt euer Geld und zeigt, wie sicher ihr euch seid. Blufft oder steigt aus!
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="home-footer">
      <p>Ein digitaler Spielbegleiter für analoge Spieleabende</p>
    </footer>
  </div>
</template>

<style scoped>
.home-view {
  @apply bg-slate-900;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.home-header {
  @apply py-3 px-6;
  flex-shrink: 0;
}

.home-main {
  @apply flex-1 flex flex-col items-center justify-center;
  @apply px-6;
  overflow: hidden;
}

.home-footer {
  @apply py-4 text-center text-slate-500 text-xs;
  flex-shrink: 0;
}
</style>

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
  <div class="home-view min-h-screen flex flex-col">
    <!-- Header -->
    <header class="py-4 px-6">
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
    <main class="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
      <!-- Logo / Titel -->
      <div class="text-center mb-12 animate-fade-in">
        <div class="mb-6">
          <span class="text-7xl md:text-8xl lg:text-9xl">💰</span>
        </div>
        <h1 class="heading-display text-white mb-4">
          Das Duell um die Geld
        </h1>
        <p class="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
          Das digitale Quiz-Poker-Erlebnis für euren Spieleabend
        </p>

        <!-- Fragen-Anzahl KPI -->
        <div v-if="questionCount !== null" class="mt-6 inline-block">
          <div class="bg-slate-800/50 border border-slate-700 rounded-xl px-6 py-3">
            <span class="text-3xl md:text-4xl font-bold text-gold-400">{{ questionCount.toLocaleString('de-DE') }}</span>
            <span class="text-slate-400 ml-2">Fragen im Spiel</span>
          </div>
        </div>
      </div>

      <!-- Hauptaktionen -->
      <div class="flex flex-col gap-4 w-full max-w-md animate-slide-up">
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
      <div class="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full">
        <div class="card p-6 text-center">
          <div class="text-4xl mb-3">🎯</div>
          <h3 class="text-lg font-semibold text-white mb-2">Schätzen</h3>
          <p class="text-slate-400 text-sm">
            Schreibt eure Schätzungen geheim auf und blufft euch zum Sieg.
          </p>
        </div>

        <div class="card p-6 text-center">
          <div class="text-4xl mb-3">💡</div>
          <h3 class="text-lg font-semibold text-white mb-2">Hinweise</h3>
          <p class="text-slate-400 text-sm">
            Mit jedem Hinweis kommt ihr der Antwort näher – oder eure Gegner auch!
          </p>
        </div>

        <div class="card p-6 text-center">
          <div class="text-4xl mb-3">💰</div>
          <h3 class="text-lg font-semibold text-white mb-2">Wetten</h3>
          <p class="text-slate-400 text-sm">
            Setzt euer Geld und zeigt, wie sicher ihr euch seid. Blufft oder steigt aus!
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-6 text-center text-slate-500 text-sm">
      <p>Ein digitaler Spielleiter für analoge Spieleabende</p>
    </footer>
  </div>
</template>

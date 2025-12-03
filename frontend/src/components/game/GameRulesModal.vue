<script setup lang="ts">
/**
 * GameRulesModal - Full rules display in modal
 *
 * Features:
 * - Scrollable rules text
 * - Organized sections
 * - Clean typography
 */

import GameModal from './GameModal.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <GameModal :is-open="isOpen" title="Regeln" @close="emit('close')">
    <div class="rules-content">
      <!-- Spielablauf -->
      <section class="rules-section">
        <h4 class="rules-section__title">Spielablauf</h4>
        <ol class="rules-section__list rules-section__list--numbered">
          <li>Eine Frage wird vorgelesen</li>
          <li>Alle Spieler schreiben ihre Schätzung geheim auf</li>
          <li>Mehrere Einsatzrunden mit Hinweisen folgen</li>
          <li>Die Lösung wird aufgedeckt</li>
          <li>Der Spieler mit der besten Schätzung gewinnt den Pot</li>
        </ol>
      </section>

      <!-- Einsatzrunden -->
      <section class="rules-section">
        <h4 class="rules-section__title">Einsatzrunden (Texas Hold'em Style)</h4>
        <ul class="rules-section__list">
          <li><strong class="text-gold-400">Einsatzrunde 1:</strong> Nach dem Schätzen (Pre-Flop)</li>
          <li><strong class="text-gold-400">Einsatzrunde 2:</strong> Nach Hinweis 1 (Flop)</li>
          <li><strong class="text-gold-400">Einsatzrunde 3:</strong> Nach Hinweis 2 (Turn)</li>
          <li><strong class="text-gold-400">Einsatzrunde 4:</strong> Nach der Auflösung (River)</li>
        </ul>
      </section>

      <!-- Positionen -->
      <section class="rules-section">
        <h4 class="rules-section__title">Positionen</h4>
        <ul class="rules-section__list">
          <li><strong class="text-blue-400">SB (Small Blind):</strong> Kleiner Pflichteinsatz</li>
          <li><strong class="text-red-400">BB (Big Blind):</strong> Großer Pflichteinsatz (2× SB)</li>
        </ul>
        <p class="rules-section__note">Die Positionen rotieren jede Runde im Uhrzeigersinn.</p>
      </section>

      <!-- Aktionen -->
      <section class="rules-section">
        <h4 class="rules-section__title">Mögliche Aktionen</h4>
        <ul class="rules-section__list">
          <li><strong>Check:</strong> Kein Einsatz, wenn niemand erhöht hat</li>
          <li><strong>Call:</strong> Den aktuellen Einsatz mitgehen</li>
          <li><strong>Raise:</strong> Den Einsatz erhöhen</li>
          <li><strong>Fold:</strong> Aufgeben und aussteigen</li>
          <li><strong>All-In:</strong> Alle Chips setzen</li>
        </ul>
      </section>

      <!-- Gewinner -->
      <section class="rules-section">
        <h4 class="rules-section__title">Gewinner ermitteln</h4>
        <p class="rules-section__text">
          Der Spieler, dessen Schätzung am nächsten an der richtigen Antwort liegt,
          gewinnt den Pot. Bei Gleichstand wird der Pot geteilt.
        </p>
      </section>
    </div>

    <template #footer>
      <button class="close-btn" @click="emit('close')">
        Verstanden
      </button>
    </template>
  </GameModal>
</template>

<style scoped>
.rules-content {
  @apply space-y-5;
  @apply max-h-[60vh] overflow-y-auto;
  @apply pr-4 -mr-2;
}

.rules-section {
  @apply pb-4 border-b border-slate-700/50;
}

.rules-section:last-child {
  @apply border-b-0 pb-0;
}

.rules-section__title {
  @apply text-sm font-semibold text-gold-400;
  @apply mb-2;
}

.rules-section__list {
  @apply text-sm text-slate-300;
  @apply space-y-1.5;
  @apply pl-4;
}

.rules-section__list--numbered {
  @apply list-decimal;
}

.rules-section__list:not(.rules-section__list--numbered) {
  @apply list-disc;
}

.rules-section__note {
  @apply text-xs text-slate-500;
  @apply mt-2 italic;
}

.rules-section__text {
  @apply text-sm text-slate-300;
}

.close-btn {
  @apply w-full py-3;
  @apply bg-gold-500 hover:bg-gold-600;
  @apply text-slate-900 font-semibold;
  @apply rounded-lg;
  @apply transition-colors duration-200;
  min-height: 44px;
}
</style>

<script setup lang="ts">
/**
 * GameRulesModal - Full rules display in modal
 *
 * Features:
 * - Scrollable rules text
 * - Organized sections
 * - Example game walkthrough
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

      <!-- Beispielrunde -->
      <section class="rules-section rules-section--example">
        <h4 class="rules-section__title">
          <span class="example-icon">📖</span>
          Beispielrunde: Anna, Ben, Carla und David
        </h4>

        <div class="example-content">
          <div class="example-step">
            <span class="example-step__number">1</span>
            <div class="example-step__content">
              <strong>Frage & Schätzung</strong>
              <p>Die Frage lautet: „Wie viele Kilometer hat der Nil?" Alle vier Spieler schreiben ihre Schätzung geheim auf einen Zettel:</p>
              <ul class="example-guesses">
                <li><span class="player-name">Anna:</span> 5.500 km</li>
                <li><span class="player-name">Ben:</span> 7.200 km</li>
                <li><span class="player-name">Carla:</span> 6.000 km</li>
                <li><span class="player-name">David:</span> 4.800 km</li>
              </ul>
            </div>
          </div>

          <div class="example-step">
            <span class="example-step__number">2</span>
            <div class="example-step__content">
              <strong>Erste Einsatzrunde</strong>
              <p>Anna (SB) setzt 5 Chips, Ben (BB) setzt 10 Chips. Carla callt die 10, David erhöht auf 20. Alle callen – Pot: 80 Chips.</p>
            </div>
          </div>

          <div class="example-step">
            <span class="example-step__number">3</span>
            <div class="example-step__content">
              <strong>1. Hinweis</strong>
              <p>„Der Fluss durchfließt mehrere Länder in Nordostafrika." Ben fühlt sich bestätigt, Carla wird unsicher.</p>
            </div>
          </div>

          <div class="example-step">
            <span class="example-step__number">4</span>
            <div class="example-step__content">
              <strong>Zweite Einsatzrunde</strong>
              <p>Anna checkt, Ben setzt 15 Chips. Carla foldet, David callt, Anna callt auch. Pot: 125 Chips.</p>
            </div>
          </div>

          <div class="example-step">
            <span class="example-step__number">5</span>
            <div class="example-step__content">
              <strong>2. Hinweis</strong>
              <p>„Er ist der längste Fluss Afrikas." David ärgert sich über seine niedrige Schätzung.</p>
            </div>
          </div>

          <div class="example-step">
            <span class="example-step__number">6</span>
            <div class="example-step__content">
              <strong>Dritte Einsatzrunde</strong>
              <p>Anna checkt, Ben setzt 25 Chips. David überlegt lange und foldet. Anna callt. Pot: 175 Chips.</p>
            </div>
          </div>

          <div class="example-step">
            <span class="example-step__number">7</span>
            <div class="example-step__content">
              <strong>Lösung</strong>
              <p>Die richtige Antwort ist <strong class="text-gold-400">6.650 km</strong>!</p>
            </div>
          </div>

          <div class="example-step">
            <span class="example-step__number">8</span>
            <div class="example-step__content">
              <strong>Letzte Einsatzrunde</strong>
              <p>Jetzt wissen beide ihre Differenz. Anna (5.500 km, Differenz: 1.150 km) und Ben (7.200 km, Differenz: 550 km). Ben ist näher dran! Anna checkt resigniert, Ben setzt noch 30 Chips. Anna foldet. Pot: 175 Chips.</p>
            </div>
          </div>

          <div class="example-step">
            <span class="example-step__number">9</span>
            <div class="example-step__content">
              <strong>Showdown</strong>
              <p><span class="winner-badge">🏆 Ben gewinnt 175 Chips!</span> Seine Schätzung von 7.200 km war am nächsten an der Lösung (6.650 km).</p>
            </div>
          </div>

          <div class="example-note">
            <p>Nach dem Showdown öffnet sich ein Dialog, in dem ihr:</p>
            <ul>
              <li>Spieler aus dem Spiel nehmen könnt (wenn jemand kein Geld mehr hat)</li>
              <li>Die Frage mit Sternen bewerten könnt</li>
              <li>Zur nächsten Runde mit neuer Frage weitergehen könnt</li>
            </ul>
          </div>
        </div>
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
  @apply flex items-center gap-2;
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

/* Example section */
.rules-section--example {
  @apply bg-slate-800/50 rounded-xl p-4 -mx-2;
  @apply border border-slate-700/30;
}

.example-icon {
  @apply text-lg;
}

.example-content {
  @apply space-y-4 mt-3;
}

.example-step {
  @apply flex gap-3;
}

.example-step__number {
  @apply w-6 h-6 rounded-full;
  @apply bg-primary-500/20 text-primary-300;
  @apply flex items-center justify-center;
  @apply text-xs font-bold;
  @apply flex-shrink-0;
}

.example-step__content {
  @apply flex-1;
  @apply text-sm text-slate-300;
}

.example-step__content strong {
  @apply text-slate-200;
  @apply block mb-1;
}

.example-step__content p {
  @apply leading-relaxed;
}

.example-guesses {
  @apply mt-2 space-y-1;
  @apply text-xs;
}

.player-name {
  @apply text-primary-300 font-medium;
}

.winner-badge {
  @apply inline-block px-2 py-0.5;
  @apply bg-gold-500/20 text-gold-400;
  @apply rounded font-semibold;
}

.example-note {
  @apply mt-4 pt-4;
  @apply border-t border-slate-700/50;
  @apply text-xs text-slate-400;
}

.example-note ul {
  @apply mt-2 space-y-1 pl-4 list-disc;
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

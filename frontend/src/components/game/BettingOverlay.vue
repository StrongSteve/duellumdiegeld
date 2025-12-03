<script setup lang="ts">
/**
 * BettingOverlay - Betting round announcement with question and hints
 *
 * Features:
 * - Displays question text
 * - Shows hints (revealed or greyed out)
 * - Click to dismiss (no auto-timer)
 * - Sophisticated poker styling matching ShowdownOverlay
 */

import type { Hint } from '@/types'

defineProps<{
  /** Whether the overlay is visible */
  visible: boolean
  /** The question text */
  questionText: string
  /** Available hints */
  hints: Hint[]
  /** Number of revealed hints (0, 1, or 2) */
  revealedHintCount: number
  /** Whether this is the last betting round (shows answer instead of hints) */
  isLastBettingRound: boolean
  /** The solution/answer text (for last betting round) */
  solutionText?: string
}>()

const emit = defineEmits<{
  dismiss: []
}>()

// Handle click to dismiss
function handleClick() {
  emit('dismiss')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div
        v-if="visible"
        class="betting-overlay"
        @click="handleClick"
      >
        <!-- Ambient effect -->
        <div class="ambient-layer"></div>

        <!-- Main content card -->
        <div class="betting-card">
          <!-- Top decorative border -->
          <div class="card-border card-border--top"></div>

          <!-- Poker chip stacks -->
          <div class="chip-stacks">
            <div class="chip-stack chip-stack--red">
              <span class="chip">🔴</span>
              <span class="chip">🔴</span>
              <span class="chip">🔴</span>
            </div>
            <div class="chip-stack chip-stack--gold">
              <span class="chip">🟡</span>
              <span class="chip">🟡</span>
              <span class="chip">🟡</span>
              <span class="chip">🟡</span>
            </div>
            <div class="chip-stack chip-stack--blue">
              <span class="chip">🔵</span>
              <span class="chip">🔵</span>
            </div>
          </div>

          <!-- Main title -->
          <h2 class="betting-title">Einsätze</h2>
          <p class="betting-subtitle">Die Wettrunde beginnt</p>

          <!-- Decorative divider -->
          <div class="divider">
            <span class="divider-icon">♠</span>
          </div>

          <!-- Question section -->
          <div class="question-section">
            <span class="section-label">Die Frage</span>
            <p class="question-text">{{ questionText }}</p>
          </div>

          <!-- Answer section (for last betting round) -->
          <div v-if="isLastBettingRound && solutionText" class="answer-section">
            <span class="section-label">Die Antwort</span>
            <p class="answer-text">{{ solutionText }}</p>
          </div>

          <!-- Hints section (for other betting rounds) -->
          <div v-else class="hints-section">
            <!-- Hint 1 -->
            <div
              class="hint-box"
              :class="{ 'hint-box--revealed': revealedHintCount >= 1, 'hint-box--locked': revealedHintCount < 1 }"
            >
              <span class="hint-label">Hinweis 1</span>
              <p v-if="revealedHintCount >= 1 && hints[0]" class="hint-text">
                {{ hints[0].hintText }}
              </p>
              <p v-else class="hint-text hint-text--locked">
                <span class="lock-icon">🔒</span>
                Noch nicht aufgedeckt
              </p>
            </div>

            <!-- Hint 2 -->
            <div
              class="hint-box"
              :class="{ 'hint-box--revealed': revealedHintCount >= 2, 'hint-box--locked': revealedHintCount < 2 }"
            >
              <span class="hint-label">Hinweis 2</span>
              <p v-if="revealedHintCount >= 2 && hints[1]" class="hint-text">
                {{ hints[1].hintText }}
              </p>
              <p v-else class="hint-text hint-text--locked">
                <span class="lock-icon">🔒</span>
                Noch nicht aufgedeckt
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="divider divider--small">
            <span class="divider-icon">♦</span>
          </div>

          <!-- Card suits decoration -->
          <div class="suits-row">
            <span class="suit suit--spade">♠</span>
            <span class="suit suit--heart">♥</span>
            <span class="suit suit--diamond">♦</span>
            <span class="suit suit--club">♣</span>
          </div>

          <!-- Dismiss hint -->
          <p class="dismiss-hint">Antippen zum Fortfahren</p>

          <!-- Bottom decorative border -->
          <div class="card-border card-border--bottom"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.betting-overlay {
  @apply fixed inset-0 z-50;
  @apply flex items-center justify-center;
  @apply cursor-pointer;
  background: radial-gradient(ellipse at center, rgba(15, 23, 42, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
}

/* Ambient golden glow */
.ambient-layer {
  @apply absolute inset-0;
  @apply pointer-events-none;
  background:
    radial-gradient(ellipse 60% 40% at 50% 30%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 80% 50% at 50% 100%, rgba(251, 191, 36, 0.05) 0%, transparent 50%);
  animation: ambient-pulse 4s ease-in-out infinite;
}

@keyframes ambient-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Main card container */
.betting-card {
  @apply relative;
  @apply px-10 py-8;
  @apply rounded-2xl;
  @apply text-center;
  @apply max-w-lg mx-4;
  background: linear-gradient(
    145deg,
    rgba(30, 41, 59, 0.95) 0%,
    rgba(15, 23, 42, 0.98) 100%
  );
  border: 1px solid rgba(251, 191, 36, 0.3);
  box-shadow:
    0 0 80px rgba(0, 0, 0, 0.6),
    0 0 120px rgba(251, 191, 36, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  animation: card-appear 0.4s ease-out;
}

@keyframes card-appear {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Decorative borders */
.card-border {
  @apply absolute left-6 right-6;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(251, 191, 36, 0.5) 20%,
    rgba(251, 191, 36, 0.7) 50%,
    rgba(251, 191, 36, 0.5) 80%,
    transparent 100%
  );
}

.card-border--top {
  @apply top-3;
}

.card-border--bottom {
  @apply bottom-3;
}

/* Poker chip stacks */
.chip-stacks {
  @apply flex justify-center items-end gap-3 mb-3;
  animation: stacks-appear 0.5s ease-out;
}

@keyframes stacks-appear {
  0% {
    opacity: 0;
    transform: translateY(-15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.chip-stack {
  @apply flex flex-col-reverse items-center;
  gap: -4px;
}

.chip {
  @apply text-2xl leading-none;
  margin-top: -12px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4));
  animation: chip-drop 0.3s ease-out backwards;
}

.chip:first-child {
  margin-top: 0;
}

/* Staggered chip animations */
.chip-stack--red .chip:nth-child(1) { animation-delay: 0.1s; }
.chip-stack--red .chip:nth-child(2) { animation-delay: 0.15s; }
.chip-stack--red .chip:nth-child(3) { animation-delay: 0.2s; }

.chip-stack--gold .chip:nth-child(1) { animation-delay: 0.25s; }
.chip-stack--gold .chip:nth-child(2) { animation-delay: 0.3s; }
.chip-stack--gold .chip:nth-child(3) { animation-delay: 0.35s; }
.chip-stack--gold .chip:nth-child(4) { animation-delay: 0.4s; }

.chip-stack--blue .chip:nth-child(1) { animation-delay: 0.45s; }
.chip-stack--blue .chip:nth-child(2) { animation-delay: 0.5s; }

@keyframes chip-drop {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.8);
  }
  70% {
    transform: translateY(2px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Title styling */
.betting-title {
  @apply text-4xl font-bold tracking-wide;
  @apply mb-1;
  color: #fbbf24;
  text-shadow:
    0 0 30px rgba(251, 191, 36, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.5);
  font-family: 'Georgia', serif;
  letter-spacing: 0.15em;
}

.betting-subtitle {
  @apply text-sm text-slate-400 mb-4;
  @apply tracking-widest uppercase;
  letter-spacing: 0.2em;
}

/* Divider */
.divider {
  @apply flex items-center justify-center gap-4 mb-5;
}

.divider--small {
  @apply mb-4 mt-4;
}

.divider::before,
.divider::after {
  content: '';
  @apply h-px flex-1;
  background: linear-gradient(90deg, transparent 0%, rgba(251, 191, 36, 0.3) 100%);
}

.divider::after {
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.3) 0%, transparent 100%);
}

.divider-icon {
  @apply text-gold-400 text-lg;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

/* Section styling */
.section-label {
  @apply block text-xs text-slate-500 uppercase tracking-widest mb-2;
  letter-spacing: 0.2em;
}

.question-section {
  @apply mb-5;
}

.question-text {
  @apply text-base text-slate-300 leading-relaxed;
  @apply px-2;
}

/* Answer section (for last betting round) */
.answer-section {
  @apply mb-2;
  @apply py-4 px-6 rounded-xl;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.answer-text {
  @apply text-2xl font-bold text-gold-400;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
}

/* Hints section */
.hints-section {
  @apply grid grid-cols-2 gap-3 mb-2;
}

.hint-box {
  @apply py-3 px-4 rounded-xl;
  @apply text-left;
  background: rgba(100, 116, 139, 0.1);
  border: 1px solid rgba(100, 116, 139, 0.2);
  transition: all 0.3s ease;
}

.hint-box--revealed {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.2);
}

.hint-box--locked {
  @apply opacity-60;
}

.hint-label {
  @apply block text-xs text-slate-500 uppercase tracking-wider mb-1;
  font-size: 0.65rem;
}

.hint-box--revealed .hint-label {
  @apply text-gold-500;
}

.hint-text {
  @apply text-sm text-slate-300 leading-snug;
}

.hint-text--locked {
  @apply text-slate-500 italic;
  @apply flex items-center gap-1.5;
  font-size: 0.75rem;
}

.lock-icon {
  @apply text-xs;
}

/* Card suits row */
.suits-row {
  @apply flex justify-center gap-5 mb-4;
}

.suit {
  @apply text-xl;
  opacity: 0.5;
  animation: suit-appear 0.3s ease-out backwards;
}

.suit--spade,
.suit--club {
  @apply text-slate-400;
}

.suit--heart,
.suit--diamond {
  @apply text-red-500;
}

.suit:nth-child(1) { animation-delay: 0.4s; }
.suit:nth-child(2) { animation-delay: 0.5s; }
.suit:nth-child(3) { animation-delay: 0.6s; }
.suit:nth-child(4) { animation-delay: 0.7s; }

@keyframes suit-appear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
}

/* Dismiss hint */
.dismiss-hint {
  @apply text-xs text-slate-500;
  @apply tracking-wider;
  animation: pulse-subtle 2s ease-in-out infinite;
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* Transition */
.overlay-fade-enter-active {
  transition: all 0.3s ease-out;
}

.overlay-fade-leave-active {
  transition: all 0.2s ease-in;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.overlay-fade-enter-from .betting-card {
  transform: scale(0.95) translateY(10px);
}

.overlay-fade-leave-to .betting-card {
  transform: scale(0.98) translateY(-5px);
}
</style>

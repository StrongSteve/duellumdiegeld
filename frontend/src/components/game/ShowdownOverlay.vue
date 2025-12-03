<script setup lang="ts">
/**
 * ShowdownOverlay - Showdown announcement with question and answer reveal
 *
 * Features:
 * - Displays question text and answer
 * - Prompts players to reveal their guesses
 * - Click to dismiss (no auto-timer)
 * - Sophisticated poker styling matching BettingOverlay
 */

defineProps<{
  /** Whether the overlay is visible */
  visible: boolean
  /** The question text */
  questionText: string
  /** The solution/answer text */
  solutionText: string
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
        class="showdown-overlay"
        @click="handleClick"
      >
        <!-- Ambient effect -->
        <div class="ambient-layer"></div>

        <!-- Main content card -->
        <div class="showdown-card">
          <!-- Top decorative border -->
          <div class="card-border card-border--top"></div>

          <!-- Trophy icon -->
          <div class="trophy-icon">🏆</div>

          <!-- Main title -->
          <h2 class="showdown-title">Showdown</h2>

          <!-- Decorative divider -->
          <div class="divider">
            <span class="divider-icon">♠</span>
          </div>

          <!-- Question section -->
          <div class="question-section">
            <span class="section-label">Die Frage</span>
            <p class="question-text">{{ questionText }}</p>
          </div>

          <!-- Answer section -->
          <div class="answer-section">
            <span class="section-label">Die Antwort</span>
            <p class="answer-text">{{ solutionText }}</p>
          </div>

          <!-- Divider -->
          <div class="divider divider--small">
            <span class="divider-icon">♦</span>
          </div>

          <!-- Call to action -->
          <p class="cta-text">Deckt eure Schätzungen auf!</p>
          <p class="cta-subtext">Wer liegt am nächsten?</p>

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
.showdown-overlay {
  @apply fixed inset-0 z-50;
  @apply flex items-center justify-center;
  @apply cursor-pointer;
  background: radial-gradient(ellipse at center, rgba(15, 23, 42, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%);
}

/* Ambient golden glow for showdown */
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
.showdown-card {
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

/* Trophy icon */
.trophy-icon {
  @apply text-5xl mb-2;
  animation: trophy-bounce 0.6s ease-out;
  filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.5));
}

@keyframes trophy-bounce {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(-20px);
  }
  60% {
    transform: scale(1.1) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Title styling */
.showdown-title {
  @apply text-4xl font-bold tracking-wide;
  @apply mb-4;
  color: #fbbf24;
  text-shadow:
    0 0 30px rgba(251, 191, 36, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.5);
  font-family: 'Georgia', serif;
  letter-spacing: 0.15em;
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

/* Call to action */
.cta-text {
  @apply text-xl font-semibold text-white;
  @apply mb-1;
}

.cta-subtext {
  @apply text-sm text-slate-400;
  @apply mb-5;
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

.overlay-fade-enter-from .showdown-card {
  transform: scale(0.95) translateY(10px);
}

.overlay-fade-leave-to .showdown-card {
  transform: scale(0.98) translateY(-5px);
}
</style>

<script setup lang="ts">
/**
 * GameQuestionCard - Question display card matching mockup
 *
 * Features:
 * - "FRAGE" label in top-left
 * - Star rating in top-right
 * - Large question text
 * - Decorative skeleton bar below
 * - Dark card with subtle border
 */

import { ref, computed } from 'vue'

const props = defineProps<{
  /** The question text to display */
  questionText: string
  /** Sum of all ratings */
  ratingSum?: number
  /** Number of ratings */
  ratingCount?: number
}>()

const emit = defineEmits<{
  rateQuestion: [rating: number]
}>()

// Rating popup state
const showRatingPopup = ref(false)
const selectedRating = ref(0)

// Computed average rating
const averageRating = computed(() => {
  if (!props.ratingCount || props.ratingCount === 0) return 0
  return props.ratingSum! / props.ratingCount
})

const hasRating = computed(() => props.ratingCount && props.ratingCount > 0)

// Handle rating click
function handleRatingClick() {
  if (!hasRating.value) {
    showRatingPopup.value = true
  }
}

// Handle star selection in popup
function selectStar(rating: number) {
  selectedRating.value = rating
}

// Submit rating
function submitRating() {
  if (selectedRating.value > 0) {
    emit('rateQuestion', selectedRating.value)
    showRatingPopup.value = false
    selectedRating.value = 0
  }
}

// Close popup
function closePopup() {
  showRatingPopup.value = false
  selectedRating.value = 0
}
</script>

<template>
  <div class="question-card">
    <!-- Header row with label and rating -->
    <div class="question-card__header">
      <span class="question-card__label">FRAGE</span>

      <!-- Rating display -->
      <button
        class="rating-badge"
        :class="{ 'rating-badge--clickable': !hasRating }"
        @click="handleRatingClick"
      >
        <span class="rating-star" :class="{ 'rating-star--active': hasRating }">★</span>
        <span v-if="hasRating" class="rating-value">{{ averageRating.toFixed(1) }}</span>
        <span v-else class="rating-value rating-value--none">–</span>
        <span class="rating-count">({{ ratingCount || 0 }})</span>
      </button>
    </div>

    <p class="question-card__text">{{ questionText }}</p>
    <div class="question-card__skeleton"></div>

    <!-- Rating popup for unrated questions -->
    <Teleport to="body">
      <div v-if="showRatingPopup" class="rating-popup-overlay" @click.self="closePopup">
        <div class="rating-popup">
          <h3 class="rating-popup__title">Frage bewerten</h3>
          <p class="rating-popup__subtitle">Noch keine Bewertung vorhanden</p>

          <div class="rating-popup__stars">
            <button
              v-for="star in 5"
              :key="star"
              class="popup-star"
              :class="{ 'popup-star--active': star <= selectedRating }"
              @click="selectStar(star)"
            >
              ★
            </button>
          </div>

          <div class="rating-popup__actions">
            <button class="popup-btn popup-btn--cancel" @click="closePopup">
              Abbrechen
            </button>
            <button
              class="popup-btn popup-btn--submit"
              :disabled="selectedRating === 0"
              @click="submitRating"
            >
              Bewerten
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.question-card {
  @apply bg-slate-800/90 rounded-2xl;
  @apply p-5 md:p-6;
  @apply border border-slate-700/50;
  @apply h-full;
  @apply flex flex-col;
}

.question-card__header {
  @apply flex items-center justify-between;
  @apply mb-3;
}

.question-card__label {
  @apply text-xs font-semibold text-slate-400 tracking-wider;
  @apply uppercase;
}

.question-card__text {
  @apply text-lg md:text-xl lg:text-2xl;
  @apply font-medium text-white;
  @apply leading-relaxed;
  @apply mb-4;
  @apply flex-1;
}

.question-card__skeleton {
  @apply h-1.5 rounded-full;
  @apply bg-gradient-to-r from-primary-500/40 via-primary-400/60 to-transparent;
  @apply w-3/4;
}

/* Rating badge */
.rating-badge {
  @apply flex items-center gap-1;
  @apply px-2 py-1 rounded-lg;
  @apply bg-slate-700/50;
  @apply text-sm;
  @apply transition-all duration-200;
}

.rating-badge--clickable {
  @apply cursor-pointer;
  @apply hover:bg-slate-600/50;
}

.rating-star {
  @apply text-slate-500;
  font-size: 1rem;
}

.rating-star--active {
  @apply text-yellow-400;
}

.rating-value {
  @apply text-slate-200 font-medium;
}

.rating-value--none {
  @apply text-slate-500;
}

.rating-count {
  @apply text-slate-500 text-xs;
}

/* Rating popup overlay */
.rating-popup-overlay {
  @apply fixed inset-0 z-50;
  @apply flex items-center justify-center;
  @apply bg-black/60 backdrop-blur-sm;
}

.rating-popup {
  @apply bg-slate-800 rounded-2xl;
  @apply p-6;
  @apply border border-slate-700;
  @apply shadow-2xl;
  @apply max-w-sm w-full mx-4;
  @apply text-center;
}

.rating-popup__title {
  @apply text-xl font-bold text-white;
  @apply mb-2;
}

.rating-popup__subtitle {
  @apply text-slate-400 text-sm;
  @apply mb-6;
}

.rating-popup__stars {
  @apply flex justify-center gap-2;
  @apply mb-6;
}

.popup-star {
  @apply text-3xl;
  @apply text-slate-500;
  @apply transition-all duration-200;
  @apply hover:scale-110;
  @apply cursor-pointer;
}

.popup-star--active {
  @apply text-yellow-400;
}

.rating-popup__actions {
  @apply flex gap-3 justify-center;
}

.popup-btn {
  @apply px-5 py-2.5;
  @apply font-medium;
  @apply rounded-lg;
  @apply transition-colors duration-200;
  min-height: 44px;
}

.popup-btn--cancel {
  @apply bg-slate-700 hover:bg-slate-600;
  @apply text-slate-300;
}

.popup-btn--submit {
  @apply text-slate-900 font-bold;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
}

.popup-btn--submit:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>

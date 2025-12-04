<script setup lang="ts">
/**
 * InfoModal - System info and played questions modal
 *
 * Shows:
 * - Device/system information (OS, browser, resolution)
 * - List of played questions (stored locally)
 * - Option to clear played questions history
 */

import { ref, computed, onMounted, watch } from 'vue'
import {
  getPlayedQuestionTexts,
  clearPlayedQuestions
} from '@/utils/playedQuestionsDb'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// Build info (injected at build time)
const commitHash = __COMMIT_HASH__
const buildTime = __BUILD_TIME__

// Funny version name generator (Joko & Klaas universe themed)
const funnyVersionName = computed(() => {
  // Adjectives inspired by Joko & Klaas show vibes
  const adjectives = [
    'Ausgehaltener', 'Duellierender', 'Lachender', 'Heulender',
    'Gewagter', 'Gesprengter', 'Verzockter', 'Geduelltter',
    'Ahnungsloser', 'Übermütiger', 'Eskalierter', 'Entfesselter',
    'Tollkühner', 'Gescheiterter', 'Siegreicher', 'Bestrafter'
  ]

  // Nouns from Joko & Klaas universe (shows, segments, running gags)
  const nouns = [
    'Weltrekord', 'Teletext', 'HalliGalli', 'Showdown',
    'Pflegenotstand', 'Männerwelten', 'Sendezeit', 'Wasserloch',
    'Blindflug', 'Wildcard', 'Endgegner', 'Primetime',
    'Finalspiel', 'Strafaufgabe', 'Joker', 'Zockerabend'
  ]

  // Use commit hash to deterministically pick words
  const hash = commitHash || 'unknown'
  const adjIndex = parseInt(hash.slice(0, 3), 16) % adjectives.length
  const nounIndex = parseInt(hash.slice(3, 6), 16) % nouns.length

  return `${adjectives[adjIndex]} ${nouns[nounIndex]}`
})

// Format build time for display
const formattedBuildTime = computed(() => {
  try {
    const date = new Date(buildTime)
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return buildTime
  }
})

// System info
const systemInfo = ref({
  os: '',
  browser: '',
  browserVersion: '',
  resolution: '',
  screenSize: '',
  language: '',
  timezone: '',
  cookiesEnabled: false,
  onlineStatus: true
})

// Played questions
const playedQuestions = ref<string[]>([])

// Detect OS
function detectOS(): string {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Win')) return 'Windows'
  if (userAgent.includes('Mac')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
  return 'Unbekannt'
}

// Detect browser
function detectBrowser(): { name: string; version: string } {
  const userAgent = navigator.userAgent
  let name = 'Unbekannt'
  let version = ''

  if (userAgent.includes('Firefox/')) {
    name = 'Firefox'
    version = userAgent.split('Firefox/')[1]?.split(' ')[0] || ''
  } else if (userAgent.includes('Edg/')) {
    name = 'Edge'
    version = userAgent.split('Edg/')[1]?.split(' ')[0] || ''
  } else if (userAgent.includes('Chrome/')) {
    name = 'Chrome'
    version = userAgent.split('Chrome/')[1]?.split(' ')[0] || ''
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    name = 'Safari'
    version = userAgent.split('Version/')[1]?.split(' ')[0] || ''
  }

  return { name, version }
}

// Load system info
function loadSystemInfo() {
  const browser = detectBrowser()
  systemInfo.value = {
    os: detectOS(),
    browser: browser.name,
    browserVersion: browser.version,
    resolution: `${window.innerWidth} × ${window.innerHeight} px`,
    screenSize: `${window.screen.width} × ${window.screen.height} px`,
    language: navigator.language || 'Unbekannt',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unbekannt',
    cookiesEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine
  }
}

// Load played questions
async function loadPlayedQuestions() {
  playedQuestions.value = await getPlayedQuestionTexts()
}

// Clear played questions
async function clearPlayedQuestionsHistory() {
  await clearPlayedQuestions()
  playedQuestions.value = []
}

// Computed: Question count (based on stored texts, not cookie IDs)
const questionCount = computed(() => {
  return playedQuestions.value.length
})

// Handle ESC key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

// Handle backdrop click
function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

// Watch for open state
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadSystemInfo()
    loadPlayedQuestions()
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleKeydown)
  }
})

onMounted(() => {
  if (props.isOpen) {
    loadSystemInfo()
    loadPlayedQuestions()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
      >
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <h2 id="info-modal-title" class="modal-title">
              <span class="title-icon">ℹ️</span>
              Informationen
            </h2>
            <button
              class="close-btn"
              @click="emit('close')"
              aria-label="Schließen"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="modal-body">
            <!-- Version Info Section -->
            <section class="version-section">
              <div class="version-info">
                <span class="version-label">Version:</span>
                <span class="version-name">{{ funnyVersionName }}</span>
                <span class="version-hash">({{ commitHash }})</span>
              </div>
              <div class="build-time">
                {{ formattedBuildTime }}
              </div>
            </section>

            <div class="divider"></div>

            <!-- System Info Section -->
            <section class="info-section">
              <h3 class="section-title">
                <span class="section-icon">🖥️</span>
                Systeminformationen
              </h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-icon">💻</span>
                  <span class="info-label">Betriebssystem</span>
                  <span class="info-value">{{ systemInfo.os }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🌐</span>
                  <span class="info-label">Browser</span>
                  <span class="info-value">{{ systemInfo.browser }} {{ systemInfo.browserVersion }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">📐</span>
                  <span class="info-label">Fenster</span>
                  <span class="info-value">{{ systemInfo.resolution }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🖼️</span>
                  <span class="info-label">Bildschirm</span>
                  <span class="info-value">{{ systemInfo.screenSize }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🗣️</span>
                  <span class="info-label">Sprache</span>
                  <span class="info-value">{{ systemInfo.language }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🕐</span>
                  <span class="info-label">Zeitzone</span>
                  <span class="info-value">{{ systemInfo.timezone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-icon">🍪</span>
                  <span class="info-label">Cookies</span>
                  <span class="info-value" :class="systemInfo.cookiesEnabled ? 'text-green-400' : 'text-red-400'">
                    {{ systemInfo.cookiesEnabled ? 'Aktiviert' : 'Deaktiviert' }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-icon">📶</span>
                  <span class="info-label">Verbindung</span>
                  <span class="info-value" :class="systemInfo.onlineStatus ? 'text-green-400' : 'text-red-400'">
                    {{ systemInfo.onlineStatus ? 'Online' : 'Offline' }}
                  </span>
                </div>
              </div>
            </section>

            <div class="divider"></div>

            <!-- Played Questions Section -->
            <section class="info-section">
              <h3 class="section-title">
                <span class="section-icon">📋</span>
                Gespielte Fragen
                <span class="question-count">({{ questionCount }})</span>
              </h3>

              <div v-if="playedQuestions.length > 0" class="questions-list">
                <div
                  v-for="(question, index) in playedQuestions"
                  :key="index"
                  class="question-item"
                >
                  <span class="question-number">{{ index + 1 }}.</span>
                  <span class="question-text">{{ question }}</span>
                </div>
              </div>
              <div v-else class="no-questions">
                <span class="no-questions-icon">🎯</span>
                <p>Noch keine Fragen gespielt.</p>
              </div>

              <!-- Clear button -->
              <button
                v-if="playedQuestions.length > 0"
                class="clear-btn"
                @click="clearPlayedQuestionsHistory"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Gespielte Fragen zurücksetzen
              </button>
            </section>

            <div class="divider"></div>

            <!-- Footer notice -->
            <div class="footer-notice">
              <span class="notice-icon">💾</span>
              <p>
                Die gespielten Fragen werden lokal im Browser gespeichert.
                In einem anderen Browser oder nach dem Löschen der Browser-Daten
                sind diese Informationen nicht mehr verfügbar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 z-50;
  @apply flex items-center justify-center;
  @apply p-4;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-container {
  @apply w-full max-w-lg;
  @apply bg-slate-800 rounded-2xl;
  @apply border border-slate-700;
  @apply shadow-2xl;
  @apply max-h-[90vh] overflow-y-auto;
  animation: modal-scale-in 0.2s ease-out;
}

.modal-header {
  @apply flex items-center justify-between;
  @apply px-5 py-4;
  @apply border-b border-slate-700/50;
  @apply sticky top-0 bg-slate-800 z-10;
}

.modal-title {
  @apply text-xl font-semibold text-white;
  @apply flex items-center gap-2;
}

.title-icon {
  @apply text-lg;
}

.close-btn {
  @apply w-10 h-10 rounded-full;
  @apply flex items-center justify-center;
  @apply text-slate-400 hover:text-white;
  @apply hover:bg-slate-700;
  @apply transition-colors duration-200;
}

.modal-body {
  @apply px-5 py-4;
}

.version-section {
  @apply flex items-center justify-between;
  @apply bg-slate-700/30 rounded-lg;
  @apply px-4 py-3;
}

.version-info {
  @apply flex items-center gap-2;
}

.version-label {
  @apply text-sm text-slate-400;
}

.version-name {
  @apply text-sm text-gold-400 font-semibold;
}

.version-hash {
  @apply font-mono text-xs text-slate-500;
}

.build-time {
  @apply text-xs text-slate-500;
}

.info-section {
  @apply mb-4;
}

.section-title {
  @apply text-sm font-semibold text-gold-400 uppercase tracking-wide;
  @apply flex items-center gap-2 mb-3;
}

.section-icon {
  @apply text-base;
}

.question-count {
  @apply text-slate-400 font-normal;
}

.info-grid {
  @apply grid grid-cols-2 gap-2;
}

.info-item {
  @apply flex items-center gap-2;
  @apply bg-slate-700/50 rounded-lg;
  @apply px-3 py-2;
}

.info-icon {
  @apply text-sm flex-shrink-0;
}

.info-label {
  @apply text-xs text-slate-400 flex-shrink-0;
}

.info-value {
  @apply text-xs text-white ml-auto text-right;
  @apply truncate;
}

.divider {
  @apply h-px bg-slate-700/50 my-4;
}

.questions-list {
  @apply space-y-2 max-h-48 overflow-y-auto;
  @apply pr-1;
}

.question-item {
  @apply flex gap-2;
  @apply bg-slate-700/30 rounded-lg;
  @apply px-3 py-2;
  @apply text-sm;
}

.question-number {
  @apply text-gold-400 font-semibold flex-shrink-0;
}

.question-text {
  @apply text-slate-300;
  @apply line-clamp-2;
}

.no-questions {
  @apply text-center py-6;
  @apply text-slate-400;
}

.no-questions-icon {
  @apply text-3xl block mb-2;
}

.clear-btn {
  @apply mt-4 w-full;
  @apply flex items-center justify-center gap-2;
  @apply px-4 py-2;
  @apply bg-red-600/20 hover:bg-red-600/30;
  @apply text-red-400 hover:text-red-300;
  @apply border border-red-600/30 hover:border-red-500/50;
  @apply rounded-lg;
  @apply text-sm font-medium;
  @apply transition-all duration-200;
}

.footer-notice {
  @apply flex gap-3;
  @apply bg-slate-700/30 rounded-lg;
  @apply px-4 py-3;
}

.notice-icon {
  @apply text-lg flex-shrink-0;
}

.footer-notice p {
  @apply text-xs text-slate-400 leading-relaxed;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

@keyframes modal-scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .info-grid {
    @apply grid-cols-1;
  }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import GameLogoPanel from '@/components/game/GameLogoPanel.vue'
import InfoButton from '@/components/InfoButton.vue'

const router = useRouter()
const gameStore = useGameStore()

const playerCount = ref(gameStore.settings.playerCount || 4)
const playerNames = ref<string[]>([...gameStore.settings.playerNames])

const isLoading = ref(false)
const error = ref<string | null>(null)

// Initialize player names on mount
onMounted(() => {
  if (playerNames.value.length === 0 || playerNames.value.length !== playerCount.value) {
    updatePlayerCount(playerCount.value)
  }
})

// Update player names when count changes
function updatePlayerCount(count: number) {
  playerCount.value = count
  const currentNames = [...playerNames.value]
  const newNames: string[] = []

  for (let i = 0; i < count; i++) {
    newNames.push(currentNames[i] || `Person ${i + 1}`)
  }

  playerNames.value = newNames
}

// Validation
const isValid = computed(() => {
  return (
    playerCount.value >= 2 &&
    playerCount.value <= 8 &&
    playerNames.value.every((name) => name.trim().length > 0)
  )
})

// Start game
async function startGame() {
  if (!isValid.value) return

  isLoading.value = true
  error.value = null

  try {
    const trimmedNames = playerNames.value.map((n) => n.trim())

    gameStore.updateSettings({
      playerCount: playerCount.value,
      playerNames: trimmedNames,
      players: trimmedNames.map(name => ({ name, isActive: true })),
      dealerIndex: 0
    })

    const success = await gameStore.startGame()

    if (success) {
      router.push('/game')
    } else {
      error.value = gameStore.error || 'Spiel konnte nicht gestartet werden'
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten'
  } finally {
    isLoading.value = false
  }
}

// Back to home
function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="setup-screen">
    <!-- Info Button (top left) -->
    <InfoButton />

    <div class="setup-container">
      <!-- Left side: Setup form -->
      <div class="setup-left">
        <!-- Top row: Title + Logo -->
        <div class="setup-top-row">
          <div class="setup-header">
            <h1 class="setup-title">Spiel einrichten</h1>
          </div>
          <div class="logo-area">
            <GameLogoPanel class="w-full" />
          </div>
        </div>

        <!-- Error message -->
        <Transition name="fade">
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </Transition>

        <!-- Main content card -->
        <div class="setup-card">
          <!-- Player count -->
          <div class="setup-section">
            <label class="setup-label">Anzahl Mitspielende</label>
            <div class="player-count-grid">
              <button
                v-for="n in 7"
                :key="n + 1"
                class="player-count-btn"
                :class="{ 'player-count-btn--active': playerCount === n + 1 }"
                @click="updatePlayerCount(n + 1)"
              >
                {{ n + 1 }}
              </button>
            </div>
          </div>

          <!-- Player names -->
          <div class="setup-section">
            <label class="setup-label">Namen</label>
            <div class="player-names-grid">
              <div v-for="(_, index) in playerNames" :key="index" class="player-name-input">
                <span class="player-name-index">{{ index + 1 }}</span>
                <input
                  v-model="playerNames[index]"
                  type="text"
                  class="input"
                  :placeholder="`Person ${index + 1}`"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Action row -->
        <div class="action-row">
          <button class="back-btn" @click="goBack">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Zurück</span>
          </button>
          <div class="action-area">
            <button
              class="start-btn"
              :disabled="!isValid || isLoading"
              @click="startGame"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              <span v-else>Spiel starten</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setup-screen {
  @apply min-h-screen;
  @apply bg-slate-900;
  @apply p-4 md:p-6;
  @apply relative;
  padding-top: max(env(safe-area-inset-top), 1rem);
  padding-bottom: max(env(safe-area-inset-bottom), 1rem);
}

.setup-container {
  @apply max-w-7xl mx-auto;
  @apply flex gap-6;
  @apply h-full;
}

.setup-left {
  @apply flex-1;
  @apply flex flex-col gap-4;
}

/* Top row: Title + Logo side by side - NEVER wrap */
.setup-top-row {
  @apply flex gap-4 items-stretch;
  flex-wrap: nowrap;
}

.setup-header {
  @apply flex items-center;
  flex: 1 1 0;
  min-width: 0;
}

.setup-title {
  @apply text-2xl md:text-3xl font-display font-bold text-white;
}

.logo-area {
  @apply flex;
  flex: 0 0 auto;
  width: 220px;
}

/* Main content card - matches game cards */
.setup-card {
  @apply bg-slate-800/60;
  @apply rounded-2xl;
  @apply border border-slate-700/50;
  @apply p-6;
  @apply flex-1;
  @apply space-y-6;
}

.error-message {
  @apply p-4 bg-danger-500/20 border border-danger-500/50 rounded-xl;
  @apply text-danger-400 text-center;
}

.setup-section {
  @apply space-y-3;
}

.setup-label {
  @apply block text-lg font-semibold text-slate-200;
}

/* Player count buttons */
.player-count-grid {
  @apply flex flex-wrap gap-2;
}

.player-count-btn {
  @apply w-12 h-12 rounded-xl;
  @apply font-bold text-lg;
  @apply transition-all duration-200;
  @apply bg-slate-700 text-slate-300;
  @apply hover:bg-slate-600;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900;
}

.player-count-btn--active {
  @apply bg-primary-600 text-white;
  @apply shadow-lg shadow-primary-500/30;
}

/* Player name inputs - 4 columns on desktop */
.player-names-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-3;
}

.player-name-input {
  @apply flex items-center gap-2;
}

.player-name-index {
  @apply w-7 h-7 rounded-full;
  @apply bg-slate-700 text-slate-400;
  @apply flex items-center justify-center;
  @apply text-sm font-bold;
  @apply flex-shrink-0;
}

.player-name-input .input {
  @apply flex-1;
  @apply text-sm;
  @apply py-2 px-3;
}

/* Action row - matches main game */
.action-row {
  @apply flex items-stretch gap-4;
  @apply mt-4;
}

.back-btn {
  @apply flex items-center gap-2;
  @apply px-3 py-2;
  @apply rounded-lg;
  @apply text-sm;
  @apply transition-all duration-200;
  @apply flex-shrink-0;
  @apply bg-slate-800/60 hover:bg-slate-700;
  @apply text-slate-400 hover:text-slate-200;
  @apply border border-slate-700/50 hover:border-slate-600;
}

.action-area {
  @apply ml-auto flex;
  width: calc((100% - 2rem) / 3);
}

.start-btn {
  @apply w-full py-4 px-6;
  @apply text-base font-bold;
  @apply text-slate-900;
  @apply rounded-xl;
  @apply transition-all duration-200;
  @apply shadow-lg;
  @apply leading-tight;
  @apply text-center;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
  height: 72px;
  @apply flex items-center justify-center;
}

.start-btn:hover:not(:disabled) {
  @apply transform scale-[1.02];
  box-shadow: 0 6px 30px rgba(251, 191, 36, 0.4);
}

.start-btn:active:not(:disabled) {
  @apply transform scale-[0.98];
}

.start-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply transform-none;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments - only for screens narrower than iPad landscape */
@media (max-width: 768px) {
  .setup-top-row {
    @apply flex-col;
  }

  .logo-area {
    width: 100%;
  }

  .action-row {
    @apply flex-col;
  }

  .action-area {
    width: 100%;
  }
}

/* iPad landscape specific */
@media (min-width: 1024px) and (max-height: 800px) {
  .setup-screen {
    @apply p-3;
  }

  .setup-container {
    @apply gap-4;
  }

  .setup-left {
    @apply gap-3;
  }

  .setup-card {
    @apply p-4;
    @apply space-y-4;
  }

  .logo-area {
    width: 200px;
  }

  .action-row {
    @apply mt-3;
  }

  .action-area {
    width: calc((100% - 1.5rem) / 3);
  }
}

/* Mobile portrait: scrollable, stacked layout */
@media (max-width: 767px) and (orientation: portrait) {
  .setup-screen {
    @apply p-4;
    min-height: 100vh;
    min-height: 100dvh;
    height: auto;
  }

  .setup-card {
    @apply flex-none;
  }

  .player-names-grid {
    @apply grid-cols-1;
  }

  .start-btn {
    height: auto;
    @apply py-4;
  }
}
</style>

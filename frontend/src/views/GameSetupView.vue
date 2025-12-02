<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import GameScreenLayout from '@/components/GameScreenLayout.vue'
import PrimaryButton from '@/components/PrimaryButton.vue'
import SecondaryButton from '@/components/SecondaryButton.vue'
import CollapsiblePanel from '@/components/CollapsiblePanel.vue'

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
    newNames.push(currentNames[i] || `Spieler ${i + 1}`)
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
  <GameScreenLayout>
    <!-- Top slot: Back button -->
    <template #top>
      <button
        class="back-button"
        @click="goBack"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Zurück
      </button>
    </template>

    <!-- Main content -->
    <div class="setup-content">
      <h1 class="setup-title">Spiel einrichten</h1>

      <!-- Error message -->
      <Transition name="fade">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </Transition>

      <!-- Player count -->
      <div class="setup-section">
        <label class="setup-label">Anzahl Spieler</label>
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
        <label class="setup-label">Spielernamen</label>
        <div class="player-names-grid">
          <div v-for="(_, index) in playerNames" :key="index" class="player-name-input">
            <span class="player-name-index">{{ index + 1 }}</span>
            <input
              v-model="playerNames[index]"
              type="text"
              class="input"
              :placeholder="`Spieler ${index + 1}`"
            />
          </div>
        </div>
      </div>

      <!-- Texas Hold'em Info - Collapsible -->
      <CollapsiblePanel
        title="Wie bei Texas Hold'em"
        icon="🃏"
      >
        <p>
          Die Wettrunden funktionieren wie beim Poker. Der Dealer-Button rotiert jede Runde.
          Small Blind und Big Blind wechseln entsprechend.
        </p>
        <p class="mt-2">
          <strong class="text-slate-300">Das Geld wird offline auf Papier verwaltet.</strong>
          Das Tablet zeigt nur den Spielablauf an.
        </p>
      </CollapsiblePanel>
    </div>

    <!-- Actions slot -->
    <template #actions>
      <SecondaryButton @click="goBack">
        Abbrechen
      </SecondaryButton>
      <PrimaryButton
        variant="gold"
        :disabled="!isValid"
        :loading="isLoading"
        @click="startGame"
      >
        Spiel starten
      </PrimaryButton>
    </template>
  </GameScreenLayout>
</template>

<style scoped>
.back-button {
  @apply text-slate-400 hover:text-white;
  @apply flex items-center gap-2;
  @apply transition-colors duration-200;
  @apply py-2;
  min-height: 44px;
}

.setup-content {
  @apply w-full max-w-xl space-y-6;
}

.setup-title {
  @apply text-2xl md:text-3xl font-display font-bold text-white text-center;
  @apply mb-6;
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
  @apply flex flex-wrap gap-2 justify-center;
}

.player-count-btn {
  @apply w-14 h-14 rounded-xl;
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

/* Player name inputs */
.player-names-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-3;
}

.player-name-input {
  @apply flex items-center gap-2;
}

.player-name-index {
  @apply w-8 h-8 rounded-full;
  @apply bg-slate-700 text-slate-400;
  @apply flex items-center justify-center;
  @apply text-sm font-bold;
  @apply flex-shrink-0;
}

.player-name-input .input {
  @apply flex-1;
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
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import CTAButton from '@/components/CTAButton.vue'

const router = useRouter()
const gameStore = useGameStore()

const playerCount = ref(gameStore.settings.playerCount)
const playerNames = ref<string[]>([...gameStore.settings.playerNames])

const isLoading = ref(false)
const error = ref<string | null>(null)

// Spielernamen aktualisieren wenn Anzahl sich ändert
function updatePlayerCount(count: number) {
  playerCount.value = count
  const currentNames = [...playerNames.value]
  const newNames: string[] = []

  for (let i = 0; i < count; i++) {
    newNames.push(currentNames[i] || `Spieler ${i + 1}`)
  }

  playerNames.value = newNames
}

// Validierung
const isValid = computed(() => {
  return (
    playerCount.value >= 2 &&
    playerCount.value <= 8 &&
    playerNames.value.every((name) => name.trim().length > 0)
  )
})

// Spiel starten
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

// Zurück zur Startseite
function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="game-setup-view min-h-screen flex flex-col p-4 md:p-8">
    <!-- Header -->
    <header class="mb-8">
      <button
        class="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
        @click="goBack"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Zurück
      </button>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center justify-center">
      <div class="card w-full max-w-2xl">
        <div class="card-header">
          <h1 class="text-2xl md:text-3xl font-display font-bold text-white text-center">
            Spiel einrichten
          </h1>
        </div>

        <div class="card-body space-y-8">
          <!-- Fehlermeldung -->
          <div
            v-if="error"
            class="p-4 bg-danger-500/20 border border-danger-500/50 rounded-lg text-danger-500"
          >
            {{ error }}
          </div>

          <!-- Spieleranzahl -->
          <div>
            <label class="label text-lg">Anzahl Spieler</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="n in 7"
                :key="n + 1"
                class="px-6 py-3 rounded-lg font-medium transition-all duration-200 min-h-touch"
                :class="{
                  'bg-primary-600 text-white': playerCount === n + 1,
                  'bg-slate-700 text-slate-300 hover:bg-slate-600': playerCount !== n + 1
                }"
                @click="updatePlayerCount(n + 1)"
              >
                {{ n + 1 }}
              </button>
            </div>
          </div>

          <!-- Spielernamen -->
          <div>
            <label class="label text-lg">Spielernamen</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="(_, index) in playerNames" :key="index">
                <input
                  v-model="playerNames[index]"
                  type="text"
                  class="input"
                  :placeholder="`Spieler ${index + 1}`"
                />
              </div>
            </div>
          </div>

          <!-- Texas Hold'em Info -->
          <div class="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div class="flex items-start gap-3">
              <span class="text-2xl">🃏</span>
              <div>
                <h3 class="font-semibold text-white mb-1">Wie bei Texas Hold'em</h3>
                <p class="text-slate-400 text-sm">
                  Die Wettrunden funktionieren wie beim Poker. Der Dealer-Button rotiert jede Runde.
                  Small Blind und Big Blind wechseln entsprechend. Das Geld wird offline auf Papier verwaltet.
                </p>
              </div>
            </div>
          </div>

          <!-- Start Button -->
          <div class="pt-4">
            <CTAButton
              variant="gold"
              full-width
              :disabled="!isValid"
              :loading="isLoading"
              @click="startGame"
            >
              Spiel starten
            </CTAButton>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

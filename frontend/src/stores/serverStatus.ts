import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ServerState = 'unknown' | 'connecting' | 'waking' | 'ready' | 'error'

export const useServerStatusStore = defineStore('serverStatus', () => {
  const state = ref<ServerState>('unknown')
  const lastError = ref<string | null>(null)
  const wakeStartTime = ref<number | null>(null)

  // Configuration
  const WAKE_THRESHOLD_MS = 3000      // Show "waking" message after 3s
  const HEALTH_CHECK_TIMEOUT = 10000  // 10s per health check attempt
  const HEALTH_CHECK_INTERVAL = 3000  // Poll every 3s
  const MAX_WAKE_TIME_MS = 90000      // Give up after 90 seconds total

  const isReady = computed(() => state.value === 'ready')
  const isConnecting = computed(() => state.value === 'connecting' || state.value === 'waking')
  const hasError = computed(() => state.value === 'error')

  const statusMessage = computed(() => {
    switch (state.value) {
      case 'connecting':
        return 'Verbinde mit Server...'
      case 'waking':
        return 'Server startet... (bis zu 90s)'
      case 'error':
        return lastError.value || 'Server nicht erreichbar'
      case 'ready':
        return 'Verbunden'
      default:
        return ''
    }
  })

  async function checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)

      const response = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
        // Prevent caching
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return false
      }

      // Also check that database is connected
      const data = await response.json()
      return data.status === 'ok' && data.database === 'ok'
    } catch {
      return false
    }
  }

  async function connect(): Promise<boolean> {
    state.value = 'connecting'
    lastError.value = null
    wakeStartTime.value = Date.now()

    // Start a timer to switch to "waking" state after threshold
    const wakingTimer = setTimeout(() => {
      if (state.value === 'connecting') {
        state.value = 'waking'
      }
    }, WAKE_THRESHOLD_MS)

    // Poll for health until success or timeout
    let elapsed = 0
    while (elapsed < MAX_WAKE_TIME_MS) {
      // Try health check
      const healthy = await checkHealth()

      if (healthy) {
        clearTimeout(wakingTimer)
        state.value = 'ready'
        return true
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, HEALTH_CHECK_INTERVAL))
      elapsed = Date.now() - wakeStartTime.value!
    }

    // Exceeded max wake time
    clearTimeout(wakingTimer)
    state.value = 'error'
    lastError.value = 'Server nicht erreichbar nach 90 Sekunden. Bitte später erneut versuchen.'
    return false
  }

  function reset() {
    state.value = 'unknown'
    lastError.value = null
    wakeStartTime.value = null
  }

  async function retry(): Promise<boolean> {
    return connect()
  }

  return {
    state,
    lastError,
    isReady,
    isConnecting,
    hasError,
    statusMessage,
    connect,
    reset,
    retry
  }
})

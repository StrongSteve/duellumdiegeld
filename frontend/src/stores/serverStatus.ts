import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ServerState = 'unknown' | 'connecting' | 'waking' | 'ready' | 'error'

export const useServerStatusStore = defineStore('serverStatus', () => {
  const state = ref<ServerState>('unknown')
  const lastError = ref<string | null>(null)
  const connectionAttempts = ref(0)
  const maxAttempts = 3
  const wakeStartTime = ref<number | null>(null)

  // Show waking message after 3 seconds of connecting
  const WAKE_THRESHOLD_MS = 3000

  const isReady = computed(() => state.value === 'ready')
  const isConnecting = computed(() => state.value === 'connecting' || state.value === 'waking')
  const hasError = computed(() => state.value === 'error')

  const statusMessage = computed(() => {
    switch (state.value) {
      case 'connecting':
        return 'Verbinde mit Server...'
      case 'waking':
        return 'Server wird gestartet... (kann bis zu 60 Sekunden dauern)'
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
      const timeoutId = setTimeout(() => controller.abort(), 65000) // 65s timeout

      const response = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (err) {
      // Check if it's a timeout/abort
      if (err instanceof DOMException && err.name === 'AbortError') {
        lastError.value = 'Server antwortet nicht (Timeout)'
      }
      return false
    }
  }

  async function connect(): Promise<boolean> {
    state.value = 'connecting'
    lastError.value = null
    connectionAttempts.value++
    wakeStartTime.value = Date.now()

    // Start a timer to switch to "waking" state after threshold
    const wakingTimer = setTimeout(() => {
      if (state.value === 'connecting') {
        state.value = 'waking'
      }
    }, WAKE_THRESHOLD_MS)

    try {
      const healthy = await checkHealth()

      clearTimeout(wakingTimer)

      if (healthy) {
        state.value = 'ready'
        connectionAttempts.value = 0
        return true
      } else {
        // Try again if we haven't exceeded max attempts
        if (connectionAttempts.value < maxAttempts) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 2000))
          return connect()
        }

        state.value = 'error'
        lastError.value = 'Server nicht erreichbar nach mehreren Versuchen'
        return false
      }
    } catch {
      clearTimeout(wakingTimer)

      if (connectionAttempts.value < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        return connect()
      }

      state.value = 'error'
      lastError.value = 'Verbindungsfehler'
      return false
    }
  }

  function reset() {
    state.value = 'unknown'
    lastError.value = null
    connectionAttempts.value = 0
    wakeStartTime.value = null
  }

  async function retry(): Promise<boolean> {
    connectionAttempts.value = 0
    return connect()
  }

  // Called when an API call fails - might indicate server went to sleep
  function reportApiError(error: string) {
    // Only report if we thought we were connected
    if (state.value === 'ready') {
      lastError.value = error
      // Don't change state to error immediately, let the UI handle retry
    }
  }

  return {
    state,
    lastError,
    connectionAttempts,
    isReady,
    isConnecting,
    hasError,
    statusMessage,
    connect,
    reset,
    retry,
    reportApiError
  }
})

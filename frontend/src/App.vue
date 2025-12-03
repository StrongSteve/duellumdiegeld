<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import DisclaimerModal from '@/components/DisclaimerModal.vue'
import { healthApi } from '@/services/api'

const isBackendReady = ref(false)
const isWakingUp = ref(false)
const connectionError = ref(false)

onMounted(async () => {
  // Show waking up message after 2 seconds if still loading
  const wakingUpTimer = setTimeout(() => {
    isWakingUp.value = true
  }, 2000)

  try {
    const healthy = await healthApi.check()
    if (healthy) {
      isBackendReady.value = true
    } else {
      connectionError.value = true
    }
  } catch {
    connectionError.value = true
  } finally {
    clearTimeout(wakingUpTimer)
  }
})

function retry() {
  connectionError.value = false
  isWakingUp.value = false
  healthApi.check().then(healthy => {
    if (healthy) {
      isBackendReady.value = true
    } else {
      connectionError.value = true
    }
  }).catch(() => {
    connectionError.value = true
  })
}
</script>

<template>
  <!-- Loading screen while waiting for backend -->
  <div v-if="!isBackendReady" class="loading-screen">
    <div class="loading-content">
      <div class="loading-icon">🎲</div>
      <h1 class="loading-title">Das Duell um die Geld</h1>

      <div v-if="connectionError" class="error-state">
        <p class="error-text">Server nicht erreichbar</p>
        <button class="retry-btn" @click="retry">
          Erneut versuchen
        </button>
      </div>

      <div v-else class="loading-state">
        <div class="loading-spinner"></div>
        <p v-if="isWakingUp" class="waking-up-text">
          Server wird gestartet... (kann bis zu 60 Sekunden dauern)
        </p>
        <p v-else class="loading-text">Verbinde...</p>
      </div>
    </div>
  </div>

  <!-- Main app content -->
  <template v-else>
    <DisclaimerModal />
    <RouterView />
  </template>
</template>

<style scoped>
.loading-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  padding: 1rem;
}

.loading-content {
  text-align: center;
  max-width: 400px;
}

.loading-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.loading-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top-color: #fbbf24;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #94a3b8;
  font-size: 0.9rem;
}

.waking-up-text {
  color: #fbbf24;
  font-size: 0.9rem;
  max-width: 280px;
  line-height: 1.5;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-text {
  color: #f87171;
  font-size: 0.9rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #0f172a;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.retry-btn:hover {
  transform: scale(1.05);
}
</style>

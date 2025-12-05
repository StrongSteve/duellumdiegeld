<script setup lang="ts">
import { useServerStatusStore } from '@/stores/serverStatus'

const serverStatus = useServerStatusStore()

function handleRetry() {
  serverStatus.retry()
}
</script>

<template>
  <div class="wake-screen">
    <div class="wake-content">
      <!-- Logo/Icon -->
      <div class="wake-icon">🎲</div>
      <h1 class="wake-title">Das Duell um die Geld</h1>

      <!-- Error State -->
      <div v-if="serverStatus.hasError" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-text">{{ serverStatus.statusMessage }}</p>
        <p class="error-hint">
          Der Server ist möglicherweise im Ruhezustand oder nicht erreichbar.
        </p>
        <button class="retry-btn" @click="handleRetry">
          <span class="retry-icon">🔄</span>
          Erneut verbinden
        </button>
      </div>

      <!-- Connecting/Waking State -->
      <div v-else class="connecting-state">
        <div class="spinner-container">
          <div class="spinner"></div>
          <div class="spinner-glow"></div>
        </div>

        <p class="status-text">{{ serverStatus.statusMessage }}</p>

        <!-- Additional info when waking -->
        <div v-if="serverStatus.state === 'waking'" class="wake-info">
          <p class="wake-explanation">
            Die App läuft auf einem kostenlosen Server, der nach Inaktivität in den Ruhezustand geht.
          </p>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wake-screen {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  padding: 1.5rem;
}

.wake-content {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.wake-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 2s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.3));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-8px) rotate(-5deg);
  }
  75% {
    transform: translateY(-8px) rotate(5deg);
  }
}

.wake-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2.5rem;
  text-shadow: 0 0 30px rgba(251, 191, 36, 0.3);
}

/* Connecting State */
.connecting-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner-container {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 4px solid #334155;
  border-top-color: #fbbf24;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.status-text {
  color: #fbbf24;
  font-size: 1rem;
  font-weight: 500;
}

.wake-info {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wake-explanation {
  color: #94a3b8;
  font-size: 0.85rem;
  line-height: 1.5;
  max-width: 300px;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: #334155;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 2px;
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; margin-left: 0; }
  50% { width: 50%; margin-left: 25%; }
  100% { width: 0%; margin-left: 100%; }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 2.5rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-text {
  color: #f87171;
  font-size: 1rem;
  font-weight: 500;
}

.error-hint {
  color: #94a3b8;
  font-size: 0.85rem;
  line-height: 1.5;
  max-width: 280px;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #0f172a;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
}

.retry-btn:active {
  transform: translateY(0);
}

.retry-icon {
  font-size: 1.1rem;
}
</style>

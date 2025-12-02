<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps<{
  duration: number // in Sekunden
  autoStart?: boolean
}>()

const emit = defineEmits<{
  complete: []
  tick: [remaining: number]
}>()

const remaining = ref(props.duration)
const isRunning = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null

const progress = computed(() => {
  return ((props.duration - remaining.value) / props.duration) * 100
})

const formattedTime = computed(() => {
  const minutes = Math.floor(remaining.value / 60)
  const seconds = remaining.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const isLow = computed(() => remaining.value <= 10)
const isCritical = computed(() => remaining.value <= 5)

function start() {
  if (isRunning.value) return

  isRunning.value = true
  intervalId = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value--
      emit('tick', remaining.value)
    } else {
      stop()
      emit('complete')
    }
  }, 1000)
}

function stop() {
  isRunning.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function reset() {
  stop()
  remaining.value = props.duration
}

// Auto-Start wenn gewünscht
watch(
  () => props.autoStart,
  (autoStart) => {
    if (autoStart) {
      start()
    }
  },
  { immediate: true }
)

// Aufräumen
onUnmounted(() => {
  stop()
})

// Expose für Parent
defineExpose({
  start,
  stop,
  reset,
  remaining
})
</script>

<template>
  <div class="timer-container">
    <!-- Timer Anzeige -->
    <div
      class="timer-display text-4xl md:text-5xl font-display font-bold text-center transition-colors duration-300"
      :class="{
        'text-white': !isLow,
        'text-gold-400': isLow && !isCritical,
        'text-danger-500 animate-pulse': isCritical
      }"
    >
      {{ formattedTime }}
    </div>

    <!-- Fortschrittsbalken -->
    <div class="timer-progress mt-4">
      <div class="progress-bar h-3 rounded-full bg-slate-700 overflow-hidden">
        <div
          class="progress-fill h-full rounded-full transition-all duration-1000 ease-linear"
          :class="{
            'bg-primary-500': !isLow,
            'bg-gold-400': isLow && !isCritical,
            'bg-danger-500': isCritical
          }"
          :style="{ width: `${100 - progress}%` }"
        />
      </div>
    </div>

    <!-- Status -->
    <div class="timer-status text-center mt-2 text-sm text-slate-400">
      <span v-if="isRunning">Zeit läuft...</span>
      <span v-else-if="remaining === 0">Zeit abgelaufen!</span>
      <span v-else>Pausiert</span>
    </div>
  </div>
</template>

<style scoped>
.timer-container {
  @apply max-w-xs mx-auto;
}
</style>

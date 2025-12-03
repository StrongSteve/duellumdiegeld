<script setup lang="ts">
import { ref } from 'vue'
import HelpModal from './HelpModal.vue'

type HelpTopic = 'rules' | 'betting' | 'folding' | 'hints' | 'winner'

const isOpen = ref(false)
const currentTopic = ref<HelpTopic>('rules')

const topics: Record<HelpTopic, { title: string; content: string[] }> = {
  rules: {
    title: 'Spielregeln',
    content: [
      '🎯 Bei jeder Frage müsst ihr eine Zahl schätzen.',
      '📝 Schreibt eure Schätzung geheim auf Papier.',
      '💡 Nach und nach werden Hinweise aufgedeckt.',
      '💰 Nach jedem Hinweis könnt ihr wetten oder aussteigen.',
      '🏆 Wer am nächsten an der richtigen Antwort liegt, gewinnt den Pot!'
    ]
  },
  betting: {
    title: 'Wetten',
    content: [
      '💵 Alle starten mit einem Startkapital.',
      '📈 Nach jedem Hinweis könnt ihr einen beliebigen Betrag setzen.',
      '🔄 Alle Einsätze werden in den Pot geworfen.',
      '⚠️ Ihr könnt nur wetten, was ihr noch habt!',
      '🃏 Bluffen ist erlaubt und Teil des Spiels.',
      '📊 Das Geld wird offline (auf Papier) verwaltet.'
    ]
  },
  folding: {
    title: 'Aussteigen (Fold)',
    content: [
      '🚪 Ihr könnt jederzeit nach einem Hinweis aussteigen.',
      '💸 Beim Aussteigen verliert ihr alle bisherigen Einsätze dieser Runde.',
      '🛡️ Aber ihr riskiert nicht noch mehr Geld.',
      '🏆 Wenn alle bis auf eine Person aussteigen, gewinnt diese automatisch.',
      '🤔 Überlegt gut: Ist eure Schätzung gut genug?'
    ]
  },
  hints: {
    title: 'Hinweise',
    content: [
      '💡 Jede Frage hat mehrere Hinweise.',
      '📖 Hinweise werden nacheinander aufgedeckt.',
      '🎯 Jeder Hinweis bringt euch näher an die Antwort.',
      '⚖️ Mehr Hinweise = weniger Risiko, aber andere könnten auch besser schätzen.',
      '🔒 Eure ursprüngliche Schätzung bleibt geheim bis zum Schluss!'
    ]
  },
  winner: {
    title: 'Wer gewinnt?',
    content: [
      '🎯 Wer am nächsten an der korrekten Zahl liegt, gewinnt.',
      '📏 Es zählt der absolute Abstand (egal ob darüber oder darunter).',
      '🏆 Wer gewinnt, erhält den gesamten Pot.',
      '🤝 Bei Gleichstand wird der Pot geteilt.',
      '🚪 Wenn nur eine Person übrig ist (alle anderen sind ausgestiegen), gewinnt diese automatisch.'
    ]
  }
}

function openHelp(topic: HelpTopic = 'rules') {
  currentTopic.value = topic
  isOpen.value = true
}

function closeHelp() {
  isOpen.value = false
}

// Expose für Parent
defineExpose({
  openHelp,
  closeHelp
})
</script>

<template>
  <div class="game-help">
    <!-- Hilfe-Buttons -->
    <div class="help-buttons flex flex-wrap gap-2 justify-center">
      <button
        v-for="(topic, key) in topics"
        :key="key"
        class="help-chip px-3 py-1.5 text-sm rounded-full
               bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600
               transition-colors duration-200"
        @click="openHelp(key as HelpTopic)"
      >
        {{ topic.title }}
      </button>
    </div>

    <!-- Hilfe-Modal -->
    <HelpModal :is-open="isOpen" :title="topics[currentTopic].title" @close="closeHelp">
      <div class="help-content space-y-4">
        <p
          v-for="(line, index) in topics[currentTopic].content"
          :key="index"
          class="text-slate-300 text-base leading-relaxed"
        >
          {{ line }}
        </p>
      </div>

      <template #footer>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(topic, key) in topics"
            :key="key"
            class="px-3 py-1.5 text-sm rounded-lg transition-colors duration-200"
            :class="{
              'bg-primary-600 text-white': key === currentTopic,
              'bg-slate-700 text-slate-400 hover:text-white': key !== currentTopic
            }"
            @click="currentTopic = key as HelpTopic"
          >
            {{ topic.title }}
          </button>
        </div>
      </template>
    </HelpModal>
  </div>
</template>

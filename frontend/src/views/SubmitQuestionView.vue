<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { questionsApi } from '@/services/api'
import { Category, CategoryLabels } from '@/types'
import CTAButton from '@/components/CTAButton.vue'

const router = useRouter()

const form = reactive({
  category: Category.MISC,
  questionText: '',
  answerValue: null as number | null,
  explanation: '',
  sourceUrl: '',
  hint1: '',
  hint2: '',
  contributorName: ''
})

// Math captcha state
const captchaChallengeId = ref('')
const captchaQuestion = ref('')
const captchaAnswer = ref<number | null>(null)
const captchaError = ref<string | null>(null)
const captchaLoading = ref(false)

const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref<string | null>(null)

// Categories for dropdown
const categories = Object.entries(CategoryLabels).map(([value, label]) => ({
  value: value as Category,
  label
}))

// Validation
const isValid = computed(() => {
  return (
    form.questionText.trim().length > 0 &&
    form.answerValue !== null &&
    !isNaN(form.answerValue) &&
    form.hint1.trim().length > 0 &&
    form.hint2.trim().length > 0 &&
    isValidUrl(form.sourceUrl)
  )
})

// Check if captcha is answered
const isCaptchaAnswered = computed(() => {
  return captchaChallengeId.value && captchaAnswer.value !== null
})

function isValidUrl(url: string): boolean {
  if (!url.trim()) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Load math captcha challenge
async function loadCaptcha() {
  captchaLoading.value = true
  captchaError.value = null
  captchaAnswer.value = null

  try {
    const response = await questionsApi.getCaptchaChallenge()
    captchaChallengeId.value = response.challengeId
    captchaQuestion.value = response.question
  } catch {
    captchaError.value = 'Captcha konnte nicht geladen werden'
  } finally {
    captchaLoading.value = false
  }
}

// Initialize captcha on mount
onMounted(() => {
  loadCaptcha()
})

// Submit form
async function submitForm() {
  if (!isValid.value) return

  // Check captcha
  if (!isCaptchaAnswered.value) {
    captchaError.value = 'Bitte löse die Rechenaufgabe'
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    // Create captcha token in format "challengeId:answer"
    const captchaToken = `${captchaChallengeId.value}:${captchaAnswer.value}`

    await questionsApi.submit({
      category: form.category,
      questionText: form.questionText.trim(),
      answerValue: form.answerValue!,
      explanation: form.explanation.trim() || undefined,
      sourceUrl: form.sourceUrl.trim(),
      hints: [
        { hintText: form.hint1.trim() },
        { hintText: form.hint2.trim() }
      ],
      contributorName: form.contributorName.trim() || undefined,
      captchaToken
    })

    submitSuccess.value = true
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
    // Reload captcha on error
    await loadCaptcha()
  } finally {
    isSubmitting.value = false
  }
}

// Go back to home
function goHome() {
  router.push('/')
}

// Submit another question
function submitAnother() {
  form.category = Category.MISC
  form.questionText = ''
  form.answerValue = null
  form.explanation = ''
  form.sourceUrl = ''
  form.hint1 = ''
  form.hint2 = ''
  form.contributorName = ''
  captchaAnswer.value = null
  submitSuccess.value = false
  submitError.value = null

  // Load new captcha
  loadCaptcha()
}
</script>

<template>
  <div class="submit-question-view min-h-screen p-4 md:p-8">
    <!-- Header -->
    <header class="mb-6">
      <button
        class="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
        @click="goHome"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Zurück
      </button>
    </header>

    <main class="max-w-2xl mx-auto">
      <!-- Erfolgs-Anzeige -->
      <div v-if="submitSuccess" class="card p-8 text-center animate-scale-in">
        <div class="text-6xl mb-6">✅</div>
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">
          Vielen Dank!
        </h2>
        <p class="text-slate-300 text-lg mb-8">
          Deine Frage wurde erfolgreich eingereicht und wird von einem Admin überprüft.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <CTAButton variant="primary" @click="submitAnother">
            Weitere Frage einreichen
          </CTAButton>
          <CTAButton variant="secondary" @click="goHome">
            Zur Startseite
          </CTAButton>
        </div>
      </div>

      <!-- Formular -->
      <div v-else class="card">
        <div class="card-header">
          <h1 class="text-2xl md:text-3xl font-display font-bold text-white text-center">
            Frage einreichen
          </h1>
          <p class="text-slate-400 text-center mt-2">
            Trage zum Fragenpool bei!
          </p>
        </div>

        <form class="card-body space-y-5" @submit.prevent="submitForm">
          <!-- Fehlermeldung -->
          <div
            v-if="submitError"
            class="p-4 bg-danger-500/20 border border-danger-500/50 rounded-lg text-danger-500"
          >
            {{ submitError }}
          </div>

          <!-- Kategorie -->
          <div>
            <label class="label">Kategorie *</label>
            <select v-model="form.category" class="select">
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <!-- Fragetext -->
          <div>
            <label class="label">Frage *</label>
            <textarea
              v-model="form.questionText"
              class="input min-h-[80px] resize-y"
              placeholder="z.B. Wie viele Knochen hat ein erwachsener Mensch?"
              rows="2"
            />
            <p class="text-slate-500 text-sm mt-1">
              Die Antwort muss eine Zahl sein.
            </p>
          </div>

          <!-- Antwort -->
          <div>
            <label class="label">Antwort (Zahl) *</label>
            <input
              v-model.number="form.answerValue"
              type="number"
              step="any"
              class="input"
              placeholder="z.B. 206"
            />
          </div>

          <!-- Quelle (Pflichtfeld) -->
          <div>
            <label class="label">Quelle (Webseite) *</label>
            <input
              v-model="form.sourceUrl"
              type="url"
              class="input"
              placeholder="https://de.wikipedia.org/wiki/..."
            />
            <p class="text-slate-500 text-sm mt-1">
              Link zur Webseite, die die Antwort bestätigt.
            </p>
          </div>

          <!-- Hinweise (genau 2) -->
          <div>
            <label class="label">Hinweise * (genau 2)</label>
            <div class="space-y-3">
              <div class="flex gap-2">
                <span class="text-slate-500 py-3 w-6">1.</span>
                <input
                  v-model="form.hint1"
                  type="text"
                  class="input flex-1"
                  placeholder="Erster Hinweis - allgemeiner"
                />
              </div>
              <div class="flex gap-2">
                <span class="text-slate-500 py-3 w-6">2.</span>
                <input
                  v-model="form.hint2"
                  type="text"
                  class="input flex-1"
                  placeholder="Zweiter Hinweis - spezifischer"
                />
              </div>
            </div>
            <p class="text-slate-500 text-sm mt-2">
              Hinweise sollten die Spieler schrittweise zur Antwort führen.
            </p>
          </div>

          <!-- Erklärung -->
          <div>
            <label class="label">Erklärung (optional)</label>
            <textarea
              v-model="form.explanation"
              class="input min-h-[60px] resize-y"
              placeholder="Warum ist das die Antwort? Interessante Hintergrundinformationen..."
              rows="2"
            />
          </div>

          <!-- Name des Beitragenden -->
          <div>
            <label class="label">Dein Name (optional)</label>
            <input
              v-model="form.contributorName"
              type="text"
              class="input"
              placeholder="Wird bei der Frage angezeigt"
            />
          </div>

          <!-- Math Captcha -->
          <div class="captcha-container">
            <label class="label">Sicherheitsfrage *</label>
            <div class="card p-4 bg-slate-800/50">
              <div v-if="captchaLoading" class="text-center py-2">
                <div class="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
              <div v-else-if="captchaQuestion" class="flex items-center gap-4 justify-center">
                <span class="text-lg text-slate-300">Was ist</span>
                <span class="text-2xl font-bold text-gold-400">{{ captchaQuestion }}</span>
                <span class="text-lg text-slate-300">=</span>
                <input
                  v-model.number="captchaAnswer"
                  type="number"
                  class="input w-24 text-center text-lg"
                  placeholder="?"
                  @input="captchaError = null"
                />
                <button
                  type="button"
                  class="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Neue Aufgabe"
                  @click="loadCaptcha"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <p v-if="captchaError" class="text-danger-500 text-sm text-center mt-2">
                {{ captchaError }}
              </p>
            </div>
          </div>

          <!-- Submit -->
          <div class="pt-2">
            <CTAButton
              type="submit"
              variant="gold"
              full-width
              :disabled="!isValid || !isCaptchaAnswered"
              :loading="isSubmitting"
            >
              Frage einreichen
            </CTAButton>
          </div>

          <p class="text-slate-500 text-sm text-center">
            * Pflichtfelder
          </p>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

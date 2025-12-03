<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminApi } from '@/services/api'
import { Category, CategoryLabels, QuestionStatus, StatusLabels, type Question } from '@/types'
import CTAButton from '@/components/CTAButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const questionId = route.params.id as string

const question = ref<Question | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const form = reactive({
  category: Category.MISC,
  questionText: '',
  answerValue: null as number | null,
  answerUnit: '',
  explanation: '',
  sourceUrl: '',
  hint1: '',
  hint2: '',
  contributorName: ''
})

const categories = Object.entries(CategoryLabels).map(([value, label]) => ({
  value: value as Category,
  label
}))

// Validation - same as SubmitQuestionView but without captcha
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

function isValidUrl(url: string): boolean {
  if (!url.trim()) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

onMounted(async () => {
  await loadQuestion()
})

async function loadQuestion() {
  isLoading.value = true
  error.value = null

  try {
    question.value = await adminApi.getQuestion(questionId)

    // Fill form with question data
    form.category = question.value.category
    form.questionText = question.value.questionText
    form.answerValue = question.value.answerValue
    form.answerUnit = question.value.answerUnit || ''
    form.explanation = question.value.explanation || ''
    form.sourceUrl = question.value.sourceUrl || ''
    form.contributorName = question.value.contributorName || ''

    // Fill hints (ensure exactly 2)
    const hints = question.value.hints.sort((a, b) => a.orderIndex - b.orderIndex)
    form.hint1 = hints[0]?.hintText || ''
    form.hint2 = hints[1]?.hintText || ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Laden'
  } finally {
    isLoading.value = false
  }
}

async function saveQuestion() {
  if (!isValid.value) return

  isSaving.value = true
  error.value = null
  successMessage.value = null

  try {
    await adminApi.updateQuestion(questionId, {
      category: form.category,
      questionText: form.questionText.trim(),
      answerValue: form.answerValue!,
      answerUnit: form.answerUnit.trim() || undefined,
      explanation: form.explanation.trim() || undefined,
      sourceUrl: form.sourceUrl.trim(),
      hints: [
        { hintText: form.hint1.trim() },
        { hintText: form.hint2.trim() }
      ],
      contributorName: form.contributorName.trim() || undefined
    })

    successMessage.value = 'Frage erfolgreich gespeichert!'

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/admin/questions')
    }, 2000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Speichern'
  } finally {
    isSaving.value = false
  }
}

async function approveQuestion() {
  isSaving.value = true
  error.value = null

  try {
    await adminApi.approveQuestion(questionId)
    question.value!.status = QuestionStatus.APPROVED
    successMessage.value = 'Frage genehmigt!'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Genehmigen'
  } finally {
    isSaving.value = false
  }
}

function logout() {
  authStore.logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="admin-question-detail min-h-screen">
    <!-- Header -->
    <header class="bg-slate-800 border-b border-slate-700">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="text-2xl">💰</RouterLink>
          <h1 class="text-xl font-semibold text-white">Admin Dashboard</h1>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-slate-400 text-sm">{{ authStore.username }}</span>
          <button class="text-slate-400 hover:text-white text-sm" @click="logout">
            Abmelden
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-2xl mx-auto px-4 py-8">
      <!-- Back Link -->
      <RouterLink
        to="/admin/questions"
        class="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Zurück zur Liste
      </RouterLink>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
      </div>

      <!-- Error -->
      <div v-else-if="error && !question" class="card p-6 text-center">
        <p class="text-danger-500 mb-4">{{ error }}</p>
        <CTAButton variant="secondary" size="sm" @click="loadQuestion">
          Erneut versuchen
        </CTAButton>
      </div>

      <!-- Form -->
      <div v-else-if="question" class="card">
        <div class="card-header flex items-center justify-between">
          <h2 class="text-2xl md:text-3xl font-display font-bold text-white">Frage bearbeiten</h2>
          <span :class="['badge', question.status === QuestionStatus.APPROVED ? 'badge-success' : question.status === QuestionStatus.REJECTED ? 'badge-danger' : 'badge-gold']">
            {{ StatusLabels[question.status] }}
          </span>
        </div>

        <form class="card-body space-y-5" @submit.prevent="saveQuestion">
          <!-- Success/Error Messages -->
          <div
            v-if="successMessage"
            class="p-4 bg-success-500/20 border border-success-500/50 rounded-lg text-success-500"
          >
            {{ successMessage }}
          </div>

          <div
            v-if="error"
            class="p-4 bg-danger-500/20 border border-danger-500/50 rounded-lg text-danger-500"
          >
            {{ error }}
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

          <!-- Einheit (optional) -->
          <div>
            <label class="label">Einheit (optional)</label>
            <input
              v-model="form.answerUnit"
              type="text"
              class="input"
              placeholder="z.B. Knochen, km, Liter"
            />
          </div>

          <!-- Quelle -->
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
              Hinweise sollten schrittweise zur Antwort führen.
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
            <label class="label">Beigetragen von (optional)</label>
            <input
              v-model="form.contributorName"
              type="text"
              class="input"
              placeholder="Wird bei der Frage angezeigt"
            />
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-700">
            <CTAButton
              type="submit"
              variant="primary"
              :disabled="!isValid"
              :loading="isSaving"
            >
              Speichern
            </CTAButton>

            <CTAButton
              v-if="question.status !== QuestionStatus.APPROVED"
              type="button"
              variant="success"
              :loading="isSaving"
              @click="approveQuestion"
            >
              Genehmigen
            </CTAButton>

            <RouterLink to="/admin/questions">
              <CTAButton variant="secondary">
                Abbrechen
              </CTAButton>
            </RouterLink>
          </div>

          <p class="text-slate-500 text-sm text-center">
            * Pflichtfelder
          </p>
        </form>
      </div>
    </main>
  </div>
</template>

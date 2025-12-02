<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminApi } from '@/services/api'
import { CategoryLabels, type Question } from '@/types'
import CTAButton from '@/components/CTAButton.vue'
import HelpModal from '@/components/HelpModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const questions = ref<Question[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const actionLoading = ref<string | null>(null)
const showRejectModal = ref(false)
const rejectingQuestion = ref<Question | null>(null)
const rejectReason = ref('')

onMounted(async () => {
  await loadQuestions()
})

async function loadQuestions() {
  isLoading.value = true
  error.value = null

  try {
    questions.value = await adminApi.getPendingQuestions()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Laden'
  } finally {
    isLoading.value = false
  }
}

async function approveQuestion(question: Question) {
  actionLoading.value = question.id

  try {
    await adminApi.approveQuestion(question.id)
    questions.value = questions.value.filter((q) => q.id !== question.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Genehmigen'
  } finally {
    actionLoading.value = null
  }
}

function openRejectModal(question: Question) {
  rejectingQuestion.value = question
  rejectReason.value = ''
  showRejectModal.value = true
}

function closeRejectModal() {
  showRejectModal.value = false
  rejectingQuestion.value = null
  rejectReason.value = ''
}

async function confirmReject() {
  if (!rejectingQuestion.value) return

  actionLoading.value = rejectingQuestion.value.id

  try {
    await adminApi.rejectQuestion(rejectingQuestion.value.id, rejectReason.value || undefined)
    questions.value = questions.value.filter((q) => q.id !== rejectingQuestion.value!.id)
    closeRejectModal()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Ablehnen'
  } finally {
    actionLoading.value = null
  }
}

function logout() {
  authStore.logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="admin-review min-h-screen">
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

    <!-- Navigation -->
    <nav class="bg-slate-800/50 border-b border-slate-700">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex gap-6">
          <RouterLink
            to="/admin"
            class="py-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-colors"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            to="/admin/review"
            class="py-3 text-sm font-medium border-b-2 border-primary-500 text-primary-400 transition-colors"
          >
            Überprüfen
            <span v-if="questions.length" class="ml-1 px-2 py-0.5 bg-gold-500 text-slate-900 text-xs rounded-full">
              {{ questions.length }}
            </span>
          </RouterLink>
          <RouterLink
            to="/admin/questions"
            class="py-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-colors"
          >
            Alle Fragen
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <h2 class="text-2xl font-bold text-white mb-6">
        Ausstehende Fragen
        <span v-if="!isLoading" class="text-slate-400 font-normal text-lg">
          ({{ questions.length }})
        </span>
      </h2>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="card p-6 text-center">
        <p class="text-danger-500 mb-4">{{ error }}</p>
        <CTAButton variant="secondary" size="sm" @click="loadQuestions">
          Erneut versuchen
        </CTAButton>
      </div>

      <!-- Empty State -->
      <div v-else-if="questions.length === 0" class="card p-12 text-center">
        <div class="text-5xl mb-4">✅</div>
        <h3 class="text-xl font-semibold text-white mb-2">Alles erledigt!</h3>
        <p class="text-slate-400">Keine ausstehenden Fragen zum Überprüfen.</p>
      </div>

      <!-- Questions List -->
      <div v-else class="space-y-4">
        <div
          v-for="question in questions"
          :key="question.id"
          class="card p-6"
        >
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <span class="badge badge-primary text-xs">
                {{ CategoryLabels[question.category] }}
              </span>
              <span v-if="question.contributorName" class="text-slate-500 text-xs ml-2">
                von {{ question.contributorName }}
              </span>
            </div>
            <span class="text-slate-500 text-xs">
              {{ new Date(question.createdAt).toLocaleDateString('de-DE') }}
            </span>
          </div>

          <!-- Question -->
          <h3 class="text-lg font-medium text-white mb-4">
            {{ question.questionText }}
          </h3>

          <!-- Answer -->
          <div class="mb-4">
            <span class="text-slate-400 text-sm">Antwort: </span>
            <span class="text-gold-400 font-semibold">
              {{ question.answerValue.toLocaleString('de-DE') }}
              {{ question.answerUnit || '' }}
            </span>
          </div>

          <!-- Hints -->
          <div class="mb-4">
            <span class="text-slate-400 text-sm block mb-2">Hinweise:</span>
            <ul class="space-y-1 ml-4">
              <li
                v-for="(hint, index) in question.hints"
                :key="hint.id"
                class="text-slate-300 text-sm"
              >
                {{ index + 1 }}. {{ hint.hintText }}
              </li>
            </ul>
          </div>

          <!-- Explanation -->
          <div v-if="question.explanation" class="mb-4">
            <span class="text-slate-400 text-sm block mb-1">Erklärung:</span>
            <p class="text-slate-300 text-sm">{{ question.explanation }}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t border-slate-700">
            <CTAButton
              variant="success"
              size="sm"
              :loading="actionLoading === question.id"
              @click="approveQuestion(question)"
            >
              ✓ Genehmigen
            </CTAButton>
            <CTAButton
              variant="danger"
              size="sm"
              :disabled="actionLoading === question.id"
              @click="openRejectModal(question)"
            >
              ✗ Ablehnen
            </CTAButton>
            <RouterLink :to="`/admin/questions/${question.id}`">
              <CTAButton variant="secondary" size="sm">
                Bearbeiten
              </CTAButton>
            </RouterLink>
          </div>
        </div>
      </div>
    </main>

    <!-- Reject Modal -->
    <HelpModal
      :is-open="showRejectModal"
      title="Frage ablehnen"
      @close="closeRejectModal"
    >
      <div v-if="rejectingQuestion" class="space-y-4">
        <p class="text-slate-300">
          Möchtest du diese Frage wirklich ablehnen?
        </p>
        <div class="p-3 bg-slate-700/50 rounded-lg">
          <p class="text-sm text-slate-400">{{ rejectingQuestion.questionText }}</p>
        </div>

        <div>
          <label class="label">Ablehnungsgrund (optional)</label>
          <textarea
            v-model="rejectReason"
            class="input min-h-[80px]"
            placeholder="z.B. Frage ist nicht eindeutig, Antwort ist falsch..."
          />
        </div>

        <div class="flex gap-3 pt-2">
          <CTAButton
            variant="danger"
            :loading="actionLoading === rejectingQuestion.id"
            @click="confirmReject"
          >
            Ablehnen
          </CTAButton>
          <CTAButton variant="secondary" @click="closeRejectModal">
            Abbrechen
          </CTAButton>
        </div>
      </div>
    </HelpModal>
  </div>
</template>

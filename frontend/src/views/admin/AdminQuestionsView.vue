<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminApi } from '@/services/api'
import { Category, CategoryLabels, QuestionStatus, StatusLabels, type Question } from '@/types'
import CTAButton from '@/components/CTAButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const questions = ref<Question[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Filter
const filterStatus = ref<QuestionStatus | ''>('')
const filterCategory = ref<Category | ''>('')
const searchQuery = ref('')

const categories = Object.entries(CategoryLabels).map(([value, label]) => ({
  value: value as Category,
  label
}))

const statuses = Object.entries(StatusLabels).map(([value, label]) => ({
  value: value as QuestionStatus,
  label
}))

const filteredQuestions = computed(() => {
  let result = questions.value

  if (filterStatus.value) {
    result = result.filter((q) => q.status === filterStatus.value)
  }

  if (filterCategory.value) {
    result = result.filter((q) => q.category === filterCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((q) =>
      q.questionText.toLowerCase().includes(query)
    )
  }

  return result
})

onMounted(async () => {
  await loadQuestions()
})

async function loadQuestions() {
  isLoading.value = true
  error.value = null

  try {
    questions.value = await adminApi.getAllQuestions()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Laden'
  } finally {
    isLoading.value = false
  }
}

async function deleteQuestion(question: Question) {
  if (!confirm(`Möchtest du "${question.questionText.substring(0, 50)}..." wirklich löschen?`)) {
    return
  }

  try {
    await adminApi.deleteQuestion(question.id)
    questions.value = questions.value.filter((q) => q.id !== question.id)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Löschen'
  }
}

function getStatusBadgeClass(status: QuestionStatus) {
  switch (status) {
    case QuestionStatus.APPROVED:
      return 'badge-success'
    case QuestionStatus.REJECTED:
      return 'badge-danger'
    default:
      return 'badge-gold'
  }
}

function logout() {
  authStore.logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="admin-questions min-h-screen">
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
            class="py-3 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-white transition-colors"
          >
            Überprüfen
          </RouterLink>
          <RouterLink
            to="/admin/questions"
            class="py-3 text-sm font-medium border-b-2 border-primary-500 text-primary-400 transition-colors"
          >
            Alle Fragen
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">
          Alle Fragen
          <span v-if="!isLoading" class="text-slate-400 font-normal text-lg">
            ({{ filteredQuestions.length }})
          </span>
        </h2>
      </div>

      <!-- Filters -->
      <div class="card p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <input
              v-model="searchQuery"
              type="text"
              class="input"
              placeholder="Suche..."
            />
          </div>

          <!-- Status Filter -->
          <div>
            <select v-model="filterStatus" class="select">
              <option value="">Alle Status</option>
              <option v-for="s in statuses" :key="s.value" :value="s.value">
                {{ s.label }}
              </option>
            </select>
          </div>

          <!-- Category Filter -->
          <div>
            <select v-model="filterCategory" class="select">
              <option value="">Alle Kategorien</option>
              <option v-for="c in categories" :key="c.value" :value="c.value">
                {{ c.label }}
              </option>
            </select>
          </div>

          <!-- Refresh -->
          <div>
            <CTAButton variant="secondary" size="md" full-width @click="loadQuestions">
              Aktualisieren
            </CTAButton>
          </div>
        </div>
      </div>

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

      <!-- Table -->
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="admin-table w-full">
            <thead>
              <tr>
                <th>Frage</th>
                <th>Kategorie</th>
                <th>Antwort</th>
                <th>Gespielt</th>
                <th>Status</th>
                <th>Datum</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="question in filteredQuestions" :key="question.id">
                <td class="max-w-md">
                  <p class="text-slate-200 truncate">
                    {{ question.questionText }}
                  </p>
                  <p v-if="question.contributorName" class="text-slate-500 text-xs mt-1">
                    von {{ question.contributorName }}
                  </p>
                </td>
                <td>
                  <span class="badge badge-primary text-xs">
                    {{ CategoryLabels[question.category] }}
                  </span>
                </td>
                <td>
                  <span class="text-gold-400 font-medium">
                    {{ question.answerValue.toLocaleString('de-DE') }}
                  </span>
                  <span v-if="question.answerUnit" class="text-slate-400 text-sm ml-1">
                    {{ question.answerUnit }}
                  </span>
                </td>
                <td>
                  <span class="text-slate-300">
                    {{ question.playedCount || 0 }}x
                  </span>
                </td>
                <td>
                  <span :class="['badge text-xs', getStatusBadgeClass(question.status)]">
                    {{ StatusLabels[question.status] }}
                  </span>
                </td>
                <td class="text-slate-400 text-sm">
                  {{ new Date(question.createdAt).toLocaleDateString('de-DE') }}
                </td>
                <td>
                  <div class="flex gap-2">
                    <RouterLink :to="`/admin/questions/${question.id}`">
                      <button class="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors">
                        Bearbeiten
                      </button>
                    </RouterLink>
                    <button
                      class="px-3 py-1 text-sm bg-danger-600/20 hover:bg-danger-600/40 text-danger-500 rounded transition-colors"
                      @click="deleteQuestion(question)"
                    >
                      Löschen
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredQuestions.length === 0" class="p-12 text-center">
          <p class="text-slate-400">Keine Fragen gefunden.</p>
        </div>
      </div>
    </main>
  </div>
</template>

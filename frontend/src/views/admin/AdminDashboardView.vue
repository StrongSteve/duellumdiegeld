<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminApi } from '@/services/api'
import type { DashboardStats } from '@/types'
import CTAButton from '@/components/CTAButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref<DashboardStats | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const isExporting = ref(false)
const isImporting = ref(false)
const importResult = ref<{
  success: boolean
  imported: number
  skipped: number
  errors: string[]
  message: string
} | null>(null)
const showImportModal = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

onMounted(async () => {
  await loadStats()
})

async function loadStats() {
  isLoading.value = true
  error.value = null

  try {
    stats.value = await adminApi.getDashboard()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Fehler beim Laden'
  } finally {
    isLoading.value = false
  }
}

function logout() {
  authStore.logout()
  router.push('/admin/login')
}

async function handleExport() {
  isExporting.value = true
  error.value = null

  try {
    await adminApi.exportQuestions()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Export fehlgeschlagen'
  } finally {
    isExporting.value = false
  }
}

function openImportModal() {
  showImportModal.value = true
  importResult.value = null
}

function closeImportModal() {
  showImportModal.value = false
  importResult.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  isImporting.value = true
  error.value = null
  importResult.value = null

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Ungültiges Dateiformat: "questions" Array fehlt')
    }

    importResult.value = await adminApi.importQuestions(data, true)

    // Reload stats after import
    await loadStats()
  } catch (err) {
    if (err instanceof SyntaxError) {
      error.value = 'Ungültige JSON-Datei'
    } else {
      error.value = err instanceof Error ? err.message : 'Import fehlgeschlagen'
    }
  } finally {
    isImporting.value = false
  }
}
</script>

<template>
  <div class="admin-dashboard min-h-screen">
    <!-- Header -->
    <header class="bg-slate-800 border-b border-slate-700">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="text-2xl">💰</RouterLink>
          <h1 class="text-xl font-semibold text-white">Admin Dashboard</h1>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-slate-400 text-sm">
            {{ authStore.username }}
          </span>
          <button
            class="text-slate-400 hover:text-white text-sm"
            @click="logout"
          >
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
            class="py-3 text-sm font-medium border-b-2 transition-colors"
            :class="{
              'border-primary-500 text-primary-400': $route.path === '/admin',
              'border-transparent text-slate-400 hover:text-white': $route.path !== '/admin'
            }"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            to="/admin/review"
            class="py-3 text-sm font-medium border-b-2 transition-colors"
            :class="{
              'border-primary-500 text-primary-400': $route.path === '/admin/review',
              'border-transparent text-slate-400 hover:text-white': $route.path !== '/admin/review'
            }"
          >
            Überprüfen
            <span v-if="stats?.pending" class="ml-1 px-2 py-0.5 bg-gold-500 text-slate-900 text-xs rounded-full">
              {{ stats.pending }}
            </span>
          </RouterLink>
          <RouterLink
            to="/admin/questions"
            class="py-3 text-sm font-medium border-b-2 transition-colors"
            :class="{
              'border-primary-500 text-primary-400': $route.path === '/admin/questions',
              'border-transparent text-slate-400 hover:text-white': $route.path !== '/admin/questions'
            }"
          >
            Alle Fragen
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="card p-6 text-center">
        <p class="text-danger-500 mb-4">{{ error }}</p>
        <CTAButton variant="secondary" size="sm" @click="loadStats">
          Erneut versuchen
        </CTAButton>
      </div>

      <!-- Stats -->
      <div v-else-if="stats">
        <h2 class="text-2xl font-bold text-white mb-6">Übersicht</h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <!-- Ausstehend -->
          <RouterLink to="/admin/review" class="card p-6 hover:bg-slate-700/50 transition-colors">
            <div class="text-3xl font-bold text-gold-400">{{ stats.pending }}</div>
            <div class="text-slate-400 text-sm mt-1">Ausstehend</div>
          </RouterLink>

          <!-- Genehmigt -->
          <div class="card p-6">
            <div class="text-3xl font-bold text-success-500">{{ stats.approved }}</div>
            <div class="text-slate-400 text-sm mt-1">Genehmigt</div>
          </div>

          <!-- Abgelehnt -->
          <div class="card p-6">
            <div class="text-3xl font-bold text-danger-500">{{ stats.rejected }}</div>
            <div class="text-slate-400 text-sm mt-1">Abgelehnt</div>
          </div>

          <!-- Gesamt -->
          <div class="card p-6">
            <div class="text-3xl font-bold text-white">{{ stats.total }}</div>
            <div class="text-slate-400 text-sm mt-1">Gesamt</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Schnellaktionen</h3>
          <div class="flex flex-wrap gap-4">
            <RouterLink to="/admin/review">
              <CTAButton variant="gold" size="md">
                {{ stats.pending }} Fragen überprüfen
              </CTAButton>
            </RouterLink>
            <RouterLink to="/admin/questions">
              <CTAButton variant="secondary" size="md">
                Alle Fragen ansehen
              </CTAButton>
            </RouterLink>
          </div>
        </div>

        <!-- Import/Export Section -->
        <div class="card p-6 mt-6">
          <h3 class="text-lg font-semibold text-white mb-4">Datenverwaltung</h3>
          <p class="text-slate-400 text-sm mb-4">
            Exportiere alle Fragen als JSON-Datei oder importiere Fragen aus einer Backup-Datei.
            Beim Import werden Duplikate (basierend auf dem Fragetext) automatisch übersprungen.
          </p>
          <div class="flex flex-wrap gap-4">
            <CTAButton
              variant="secondary"
              size="md"
              :disabled="isExporting"
              @click="handleExport"
            >
              <span v-if="isExporting">Exportiere...</span>
              <span v-else>Fragen exportieren</span>
            </CTAButton>
            <CTAButton
              variant="secondary"
              size="md"
              @click="openImportModal"
            >
              Fragen importieren
            </CTAButton>
          </div>
        </div>
      </div>
    </main>

    <!-- Import Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showImportModal" class="modal-overlay" @click.self="closeImportModal">
          <div class="modal-container">
            <div class="modal-header">
              <h2 class="text-xl font-semibold text-white">Fragen importieren</h2>
              <button class="text-slate-400 hover:text-white" @click="closeImportModal">
                &times;
              </button>
            </div>

            <div class="modal-content">
              <p class="text-slate-400 text-sm mb-4">
                Wähle eine JSON-Datei aus, die mit der Export-Funktion erstellt wurde.
                Duplikate werden automatisch übersprungen.
              </p>

              <div class="file-upload-area">
                <input
                  ref="fileInput"
                  type="file"
                  accept=".json"
                  class="hidden"
                  @change="handleFileSelect"
                />
                <CTAButton
                  variant="gold"
                  size="md"
                  :disabled="isImporting"
                  @click="fileInput?.click()"
                >
                  <span v-if="isImporting">Importiere...</span>
                  <span v-else>JSON-Datei auswählen</span>
                </CTAButton>
              </div>

              <!-- Import Result -->
              <div v-if="importResult" class="import-result mt-4">
                <div
                  class="p-4 rounded-lg"
                  :class="importResult.success ? 'bg-success-500/20 border border-success-500/30' : 'bg-danger-500/20 border border-danger-500/30'"
                >
                  <p class="font-semibold" :class="importResult.success ? 'text-success-400' : 'text-danger-400'">
                    {{ importResult.message }}
                  </p>
                  <ul class="text-sm text-slate-300 mt-2 space-y-1">
                    <li>Importiert: {{ importResult.imported }}</li>
                    <li>Übersprungen (Duplikate): {{ importResult.skipped }}</li>
                  </ul>
                  <div v-if="importResult.errors.length > 0" class="mt-3">
                    <p class="text-sm text-danger-400 font-medium">Fehler:</p>
                    <ul class="text-xs text-slate-400 mt-1 space-y-1">
                      <li v-for="(err, index) in importResult.errors" :key="index">{{ err }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Error -->
              <div v-if="error && showImportModal" class="mt-4 p-4 bg-danger-500/20 border border-danger-500/30 rounded-lg">
                <p class="text-danger-400 text-sm">{{ error }}</p>
              </div>
            </div>

            <div class="modal-footer">
              <CTAButton variant="secondary" size="sm" @click="closeImportModal">
                Schließen
              </CTAButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: #1e293b;
  border-radius: 1rem;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header button {
  font-size: 1.5rem;
  line-height: 1;
}

.modal-content {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
}

.file-upload-area {
  text-align: center;
  padding: 2rem;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>

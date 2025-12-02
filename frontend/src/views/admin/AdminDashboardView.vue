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
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CTAButton from '@/components/CTAButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

onMounted(() => {
  // Wenn bereits eingeloggt, weiterleiten
  if (authStore.isAuthenticated) {
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  }
})

async function handleLogin() {
  const success = await authStore.login({
    username: username.value,
    password: password.value
  })

  if (success) {
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  }
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="admin-login-view min-h-screen flex flex-col items-center justify-center p-4">
    <!-- Header -->
    <header class="absolute top-4 left-4">
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

    <div class="card w-full max-w-md">
      <div class="card-header text-center">
        <h1 class="text-2xl font-display font-bold text-white">
          🔐 Admin Login
        </h1>
      </div>

      <form class="card-body space-y-6" @submit.prevent="handleLogin">
        <!-- Fehlermeldung -->
        <div
          v-if="authStore.error"
          class="p-4 bg-danger-500/20 border border-danger-500/50 rounded-lg text-danger-500 text-sm"
        >
          {{ authStore.error }}
        </div>

        <!-- Benutzername -->
        <div>
          <label class="label">Benutzername</label>
          <input
            v-model="username"
            type="text"
            class="input"
            placeholder="admin"
            autocomplete="username"
            required
          />
        </div>

        <!-- Passwort -->
        <div>
          <label class="label">Passwort</label>
          <input
            v-model="password"
            type="password"
            class="input"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <!-- Login Button -->
        <CTAButton
          type="submit"
          variant="primary"
          full-width
          :loading="authStore.isLoading"
        >
          Anmelden
        </CTAButton>
      </form>
    </div>
  </div>
</template>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api'
import type { LoginCredentials } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('adminToken'))
  const username = ref<string | null>(localStorage.getItem('adminUsername'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: LoginCredentials) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)
      token.value = response.accessToken
      username.value = response.username

      localStorage.setItem('adminToken', response.accessToken)
      localStorage.setItem('adminUsername', response.username)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    token.value = null
    username.value = null
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
  }

  function clearError() {
    error.value = null
  }

  return {
    token,
    username,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError
  }
})

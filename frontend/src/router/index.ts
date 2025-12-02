import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Das Duell um die Geld' }
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('@/views/GameView.vue'),
      meta: { title: 'Spiel' }
    },
    {
      path: '/game/setup',
      name: 'game-setup',
      component: () => import('@/views/GameSetupView.vue'),
      meta: { title: 'Spiel einrichten' }
    },
    {
      path: '/submit-question',
      name: 'submit-question',
      component: () => import('@/views/SubmitQuestionView.vue'),
      meta: { title: 'Frage einreichen' }
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('@/views/admin/AdminLoginView.vue'),
      meta: { title: 'Admin Login' }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/AdminDashboardView.vue'),
      meta: { title: 'Admin Dashboard', requiresAuth: true }
    },
    {
      path: '/admin/review',
      name: 'admin-review',
      component: () => import('@/views/admin/AdminReviewView.vue'),
      meta: { title: 'Fragen überprüfen', requiresAuth: true }
    },
    {
      path: '/admin/questions',
      name: 'admin-questions',
      component: () => import('@/views/admin/AdminQuestionsView.vue'),
      meta: { title: 'Alle Fragen', requiresAuth: true }
    },
    {
      path: '/admin/questions/:id',
      name: 'admin-question-detail',
      component: () => import('@/views/admin/AdminQuestionDetailView.vue'),
      meta: { title: 'Frage bearbeiten', requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '404 - Nicht gefunden' }
    }
  ]
})

// Navigation Guard für Admin-Routen
router.beforeEach((to, _from, next) => {
  // Titel setzen
  document.title = to.meta.title
    ? `${to.meta.title} | Das Duell um die Geld`
    : 'Das Duell um die Geld'

  // Auth-Check für geschützte Routen
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      next({ name: 'admin-login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router

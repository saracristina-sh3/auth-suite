import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import SuiteView from '../views/SuiteView.vue'
import LoginView from '../views/LoginView.vue'
import FrotaView from '@/views/FrotaView.vue'
import { authService } from '@/services/auth.service'
import AdminManagementView from '@/views/suporte/AdminManagementView.vue'

interface RouteMeta {
  requiresAuth?: boolean
  requiresGuest?: boolean
  requiresRole?: string
  requiresSH3?: boolean // Requires SH3 autarquia (support team)
}

const routes: Array<RouteRecordRaw & { meta?: RouteMeta }> = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'home',
    component: SuiteView,
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/frota',
    name: 'frota',
    component: FrotaView,
    meta: { requiresAuth: true }
  },
  {
    path: '/suporteSH3',
    name: 'suporte-sh3',
    component: AdminManagementView,
    meta: { requiresAuth: true, requiresRole: 'superadmin', requiresSH3: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Helper function to check if user belongs to SH3 autarquia
const isSH3User = (user: any): boolean => {
  if (!user?.autarquia) return false
  return user.autarquia.nome === 'SH3 - Suporte'
}

// ✅ Guard de navegação completo
router.beforeEach(async (to, _from, next) => {
  const user = authService.getUserFromStorage()

  // Usuário não autenticado tentando acessar área protegida
  if (to.meta.requiresAuth && !user) {
    next('/login')
    return
  }

  // Usuário logado tentando acessar /login
  if (to.meta.requiresGuest && user) {
    // Redirect SH3 superadmin to AdminManagementView
    if (user.is_superadmin && isSH3User(user)) {
      next('/suporteSH3')
      return
    }
    next('/')
    return
  }

  // Verifica se rota exige superadmin
  if (to.meta.requiresRole && !user?.is_superadmin) {
    next('/')
    return
  }

  // Verifica se rota exige SH3 autarquia (support team)
  if (to.meta.requiresSH3 && !isSH3User(user)) {
    next('/')
    return
  }

  next()
})

export default router

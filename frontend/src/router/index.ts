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
    path: '/users',
    name: 'user-management',
    component: AdminManagementView,
    meta: { requiresAuth: true, requiresRole: 'superadmin' }
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

// ✅ Guard de navegação completo
router.beforeEach(async (to, from, next) => {
  const user = authService.getUserFromStorage()

  // Usuário não autenticado tentando acessar área protegida
  if (to.meta.requiresAuth && !user) {
    next('/login')
    return
  }

  // Usuário logado tentando acessar /login
  if (to.meta.requiresGuest && user) {
    next('/')
    return
  }

  // Verifica se rota exige superadmin
  if (to.meta.requiresRole && !user?.is_superadmin) {
    next('/')
    return
  }

  next()
})

export default router

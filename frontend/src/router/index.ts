import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import SuiteView from '../views/SuiteView.vue'
import LoginView from '../views/LoginView.vue'
import FrotaView from '@/views/FrotaView.vue'
import PerfilView from '@/views/usuarios/PerfilView.vue'
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
    name: 'Sobre',
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
    path: '/perfil',
    name: 'perfil',
    component: PerfilView,
    meta: { requiresAuth: true }
  },
  {
    path: '/suporteSH3',
    component: AdminManagementView,
    meta: { requiresAuth: true, requiresRole: 'superadmin' },
    redirect: '/suporteSH3/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'suporte-dashboard',
        component: () => import('@/views/suporte/tabs/DashboardTab.vue'),
        meta: { requiresAuth: true, requiresRole: 'superadmin' }
      },
      {
        path: 'usuarios',
        name: 'suporte-usuarios',
        component: () => import('@/views/suporte/tabs/UserTab.vue'),
        meta: { requiresAuth: true, requiresRole: 'superadmin' }
      },
      {
        path: 'autarquias',
        name: 'suporte-autarquias',
        component: () => import('@/views/suporte/tabs/autarquia/AutarquiasTab.vue'),
        meta: { requiresAuth: true, requiresRole: 'superadmin' }
      },
      {
        path: 'modulos',
        name: 'suporte-modulos',
        component: () => import('@/views/suporte/tabs/ModulosTab.vue'),
        meta: { requiresAuth: true, requiresRole: 'superadmin' }
      },
      {
        path: 'liberacoes',
        name: 'suporte-liberacoes',
        component: () => import('@/views/suporte/tabs/LiberacoesTab.vue'),
        meta: { requiresAuth: true, requiresRole: 'superadmin' }
      },
      {
        path: 'modo-suporte',
        name: 'suporte-contexto',
        component: () => import('@/views/suporte/tabs/SupportContextTab.vue'),
        meta: { requiresAuth: true, requiresRole: 'superadmin' }
      }
    ]
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
router.beforeEach(async (to, _from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  const user = authService.getUserFromStorage()

  console.log('🛡️ Router Guard:', {
    to: to.path,
    isAuthenticated,
    user: user ? { id: user.id, email: user.email, is_superadmin: user.is_superadmin } : null,
    meta: to.meta
  })

  // Se há dados do usuário mas o token é inválido, limpar tudo
  if (user && !isAuthenticated) {
    console.log('⚠️ Token inválido detectado, limpando dados do usuário')
    await authService.logout()
  }

  // Usuário não autenticado tentando acessar área protegida
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('⛔ Usuário não autenticado, redirecionando para /login')
    next('/login')
    return
  }

  // Usuário logado tentando acessar /login
  if (to.meta.requiresGuest && isAuthenticated && user) {
    // Redirect SuperAdmin to AdminManagementView
    if (user.is_superadmin) {
      console.log('✅ SuperAdmin detectado no guard, redirecionando para /suporteSH3')
      next('/suporteSH3')
      return
    }
    console.log('✅ Usuário normal no guard, redirecionando para /')
    next('/')
    return
  }

  // Verifica se rota exige superadmin
  if (to.meta.requiresRole && !user?.is_superadmin) {
    console.log('⛔ Rota exige superadmin, mas usuário não é superadmin. Redirecionando para /')
    next('/')
    return
  }

  // ✅ REMOVIDO: Verificação de requiresSH3
  // Agora apenas is_superadmin é suficiente para acessar /suporteSH3
  // A verificação de autarquia SH3 não é mais necessária

  console.log('✅ Guard passou, continuando para:', to.path)
  next()
})

export default router

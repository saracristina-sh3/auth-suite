import { createRouter, createWebHistory, } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router';
import SuiteView from '../views/SuiteView.vue'
import LoginView from '../views/LoginView.vue'
import FrotaView from '@/views/FrotaView.vue'
import { authService } from '@/services/auth.service'
import UserManagementView from '@/views/UserManagementView.vue';


interface RouteMeta {
  requiresAuth?: boolean;
  requiresGuest?: boolean;
  requiresRole?: string; 
}


const routes: Array<RouteRecordRaw & { meta?: RouteMeta }> = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true } // apenas visitantes
  },
  {
    path: '/',
    name: 'home',
    component: SuiteView,
    meta: { requiresAuth: true } // qualquer usuário logado
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
    component: UserManagementView,
    meta: { requiresAuth: true, requiresRole: 'superadmin' } // só superadmin
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/' // fallback 404
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});



// Guard de navegação corrigido
router.beforeEach(async (to, from, next) => {
  const user = authService.getUserFromStorage();

  if (to.meta.requiresAuth && !user) {
    next('/login');
    return;
  }

  // Verifica superadmin
  if (to.meta.requiresRole && !user?.is_superadmin) {
    next('/');
    return;
  }

  next();
});




export default router

import { createRouter, createWebHistory } from 'vue-router'
import SuiteView from '../views/SuiteView.vue'
import LoginView from '../views/LoginView.vue'
import FrotaView from '@/views/FrotaView.vue'
import { authService } from '@/services/auth.service'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/frota',
      name: 'frota',
      component: FrotaView,
      meta: { requiresAuth: true }
    },
    // Rota de fallback para 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

// Guard de navegação corrigido
router.beforeEach(async (to, from, next) => {
  console.log('📍 Navegando de:', from.path, 'para:', to.path);

  try {
    const isAuthenticated = authService.isAuthenticated();
    let user = authService.getUserFromStorage();

    console.log('🔐 Está autenticado?:', isAuthenticated);
    console.log('👤 Usuário no storage:', user);

    // Se tem token mas não tem usuário no storage, tenta buscar da API
    if (isAuthenticated && !user) {
      console.log('🔄 Buscando usuário da API...');
      user = await authService.getCurrentUser();
      console.log('👤 Usuário da API:', user);
    }

    // Rota requer autenticação mas usuário não está autenticado
    if (to.meta.requiresAuth && !user) {
      console.log('🚫 Redirecionando para login - não autenticado');
      next('/login');
      return;
    }

    // Rota é para convidados mas usuário está autenticado
    if (to.meta.requiresGuest && user) {
      console.log('🚫 Redirecionando para home - já autenticado');
      next('/');
      return;
    }

    console.log('✅ Navegação permitida');
    next();
  } catch (error) {
    console.error('❌ Erro no guard de navegação:', error);
    // Em caso de erro, redireciona para login para segurança
    next('/login');
  }
});

export default router

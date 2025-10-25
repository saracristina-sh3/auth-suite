<template>
  <div class="min-h-screen flex bg-background text-foreground">
    <div class="relative lg:flex flex-col items-center justify-center  lg:w-1/3 bg-primary text-white">
      <div class="flex flex-col items-center text-center gap-6 mt-12">
        <div
          class="w-44 h-44 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
          <img src="@/assets/logo-2.svg" alt="Logo SH3" class="w-28 h-28" />
        </div>
        <h2 class="text-2xl font-semibold tracking-wide text-white/90">
          Sistema Integrado de Gestão
        </h2>
      </div>
      <div class="flex flex-col gap-3 mt-16 text-white/80 text-sm">
        <a href="#" class="py-2 border-b border-white/10 hover:border-white/40 hover:pl-2 transition-all duration-300">
          site oficial
        </a>
        <a href="#" class="py-2 border-b border-white/10 hover:border-white/40 hover:pl-2 transition-all duration-300">
          portal da transparência
        </a>
        <a href="#" class="py-2 border-b border-white/10 hover:border-white/40 hover:pl-2 transition-all duration-300">
          webmail
        </a>
      </div>
    </div>

    <div class="flex-1 flex items-center justify-center p-8 bg-background">
      <div class="w-full max-w-md">
        <div class="lg:hidden flex justify-center mb-8">
          <div class="w-28 h-28 bg-primary/10 rounded-2xl flex items-center justify-center">
            <img src="@/assets/logo-2.svg" alt="Logo SH3" class="w-20 h-20" />
          </div>
        </div>

        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold text-foreground mb-2">Acesse sua conta</h1>
          <p class="text-muted-foreground">Entre com suas credenciais para continuar</p>
        </div>

        <form @submit.prevent="onLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-foreground">Digite seu email</label>
            <input v-model="email" type="text" placeholder="example@email.com"
              class="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              required />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-foreground">Senha</label>
            <input v-model="password" type="password" placeholder="Senha"
              class="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
              required />
            <div class="text-right mt-2">
              <a href="#" class="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
                Esqueci minha senha
              </a>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <input id="manterLogado" type="checkbox" v-model="keepLogged"
              class="w-4 h-4 border border-border rounded bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2" />
            <label for="manterLogado" class="text-sm text-foreground font-medium cursor-pointer">
              Manter logado
            </label>
          </div>

          <button type="submit" :disabled="isLoading"
            class="w-full py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-center shadow-md hover:shadow-lg hover:bg-primary/90 transition-all duration-300 hover:-translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <span v-if="isLoading">Entrando...</span>
            <span v-else>Entrar</span>
          </button>

          <p v-if="error"
            class="p-3 text-error bg-error/10 border border-error/20 rounded-lg text-sm text-center animate-fade-in">
            {{ error }}
          </p>
        </form>

        <div class="flex justify-center gap-8 mt-12 pt-8 border-t border-border">
          <a href="#" class="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
            Ajuda
          </a>
          <a href="#" class="text-sm text-muted-foreground font-medium hover:text-foreground transition-colors">
            Política de privacidade
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth.service'

const email = ref('')
const password = ref('')
const keepLogged = ref(false)
const error = ref('')
const isLoading = ref(false)
const router = useRouter()

async function onLogin() {
  error.value = ''
  isLoading.value = true
  try {
    if (!email.value || !password.value) {
      error.value = 'Por favor, preencha todos os campos.'
      return
    }

    console.log('🔐 Iniciando login...')
    const response = await authService.login({ email: email.value, password: password.value })

    console.log('📦 Resposta do login:', response)
    const user = response.user

    console.log('👤 Dados do usuário:', {
      id: user?.id,
      email: user?.email,
      is_superadmin: user?.is_superadmin,
      name: user?.name
    })

    // SuperAdmin vai para AdminManagementView
    if (user?.is_superadmin) {
      console.log('✅ SuperAdmin detectado! Redirecionando para /suporteSH3')
      router.replace('/suporteSH3')
    } else {
      console.log('✅ Usuário normal detectado! Redirecionando para /')
      // Usuários normais vão para SuiteHome
      router.replace('/')
    }
  } catch (e: any) {
    console.error('❌ Erro no login:', e)
    error.value = e.message || 'Falha ao autenticar. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scooped>
.gradient-primary {
  background: var(--primary);
}


@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>

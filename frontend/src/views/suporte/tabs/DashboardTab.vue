<template>
  <div class="p-4 space-y-6">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-semibold text-foreground">Visão Geral do Sistema</h2>
      <p class="text-muted-foreground">Resumo rápido das informações principais</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-full bg-selenium-100 text-selenium-600 flex items-center justify-center mb-3">
          <i class="pi pi-users text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-muted-foreground mb-1">Usuários</h3>
        <p class="text-2xl font-bold text-foreground">{{ loadingStats ? '...' : usersStats.total }}</p>
        <div class="flex gap-3 mt-2 text-xs">
          <span class="text-jade-600">
            <i class="pi pi-check-circle mr-1"></i>{{ loadingStats ? '...' : usersStats.ativos }} ativos
          </span>
          <span class="text-ruby-600">
            <i class="pi pi-times-circle mr-1"></i>{{ loadingStats ? '...' : usersStats.inativos }} inativos
          </span>
        </div>
      </div>

      <div class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-full bg-jade-100 text-jade-600 flex items-center justify-center mb-3">
          <i class="pi pi-building text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-muted-foreground mb-1">Autarquias</h3>
        <p class="text-2xl font-bold text-foreground">{{ loadingStats ? '...' : autarquiasStats.total }}</p>
        <div class="flex gap-3 mt-2 text-xs">
          <span class="text-jade-600">
            <i class="pi pi-check-circle mr-1"></i>{{ loadingStats ? '...' : autarquiasStats.ativas }} ativas
          </span>
          <span class="text-ruby-600">
            <i class="pi pi-times-circle mr-1"></i>{{ loadingStats ? '...' : autarquiasStats.inativas }} inativas
          </span>
        </div>
      </div>

      <div class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-full bg-sulfur-100 text-sulfur-600 flex items-center justify-center mb-3">
          <i class="pi pi-cog text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-muted-foreground mb-1">Módulos</h3>
        <p class="text-2xl font-bold text-foreground">{{ loadingStats ? '...' : modulosStats.total }}</p>
        <div class="flex gap-3 mt-2 text-xs">
          <span class="text-jade-600">
            <i class="pi pi-check-circle mr-1"></i>{{ loadingStats ? '...' : modulosStats.ativos }} ativos
          </span>
          <span class="text-ruby-600">
            <i class="pi pi-times-circle mr-1"></i>{{ loadingStats ? '...' : modulosStats.inativos }} inativos
          </span>
        </div>
      </div>

      <div class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-full bg-copper-100 text-copper-600 flex items-center justify-center mb-3">
          <i class="pi pi-headphones text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-muted-foreground mb-1">Modo Suporte</h3>
        <p class="text-2xl font-bold text-foreground">{{ supportContext ? 'Ativo' : 'Desativado' }}</p>
      </div>
    </div>

    <div class="mt-10">
      <h3 class="text-lg font-semibold text-foreground mb-3">Últimas atividades</h3>
      <p class="text-muted-foreground text-sm">Esta área pode futuramente exibir logs, notificações ou mudanças recentes
        no sistema.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { moduloService } from '@/services/modulos.service'
import { userService } from '@/services/user.service'
import { autarquiaService } from '@/services/autarquia.service'

defineProps({
  users: { type: Array, default: () => [] },
  autarquias: { type: Array, default: () => [] },
  modulos: { type: Array, default: () => [] },
  supportContext: { type: Object, default: null }
})

const loadingStats = ref(false)
const usersStats = ref({
  total: 0,
  ativos: 0,
  inativos: 0,
  superadmins: 0
})
const autarquiasStats = ref({
  total: 0,
  ativas: 0,
  inativas: 0
})
const modulosStats = ref({
  total: 0,
  ativos: 0,
  inativos: 0
})

async function loadAllStats() {
  loadingStats.value = true
  try {
    const [users, autarquias, modulos] = await Promise.all([
      userService.getStats(),
      autarquiaService.getStats(),
      moduloService.getStats()
    ])

    usersStats.value = users
    autarquiasStats.value = autarquias
    modulosStats.value = modulos
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
  } finally {
    loadingStats.value = false
  }
}

onMounted(() => {
  loadAllStats()
})
</script>

<template>
  <div class="p-4 space-y-6">
    <!-- Cabeçalho -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-semibold text-foreground">Visão Geral do Sistema</h2>
      <p class="text-muted-foreground">Resumo rápido das informações principais</p>
    </div>

    <!-- Cards Resumo -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-full bg-selenium-100 text-selenium-600 flex items-center justify-center mb-3">
          <i class="pi pi-users text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-muted-foreground mb-1">Usuários</h3>
        <p class="text-2xl font-bold text-foreground">{{ users?.length || 0 }}</p>
      </div>

      <div class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-full bg-jade-100 text-jade-600 flex items-center justify-center mb-3">
          <i class="pi pi-building text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-muted-foreground mb-1">Autarquias</h3>
        <p class="text-2xl font-bold text-foreground">{{ autarquias?.length || 0 }}</p>
      </div>

      <div class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-full bg-sulfur-100 text-sulfur-600 flex items-center justify-center mb-3">
          <i class="pi pi-cog text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-muted-foreground mb-1">Módulos</h3>
        <p class="text-2xl font-bold text-foreground">{{ modulos?.length || 0 }}</p>
      </div>

      <div class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-full bg-copper-100 text-copper-600 flex items-center justify-center mb-3">
          <i class="pi pi-headphones text-xl"></i>
        </div>
        <h3 class="text-sm font-medium text-muted-foreground mb-1">Modo Suporte</h3>
        <p class="text-2xl font-bold text-foreground">{{ supportContext ? 'Ativo' : 'Desativado' }}</p>
      </div>
    </div>

    <!-- Seção adicional -->
    <div class="mt-10">
      <h3 class="text-lg font-semibold text-foreground mb-3">Últimas atividades</h3>
      <p class="text-muted-foreground text-sm">Esta área pode futuramente exibir logs, notificações ou mudanças recentes no sistema.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  users: { type: Array, default: () => [] },
  autarquias: { type: Array, default: () => [] },
  modulos: { type: Array, default: () => [] },
  supportContext: { type: Object, default: null }
})
</script>

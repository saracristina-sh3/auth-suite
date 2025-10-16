<template>
  <div
    class="card flex flex-col items-center gap-4
           bg-white dark:bg-gray-900 text-black dark:text-white
           border border-gray-200 dark:border-gray-700"
  >
    <!-- Botão fixo de Dark Theme -->
    <ThemeSwitcher />

    <Button
      type="button"
      class="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700
             text-white transition-colors"
      @click="toggleAll"
    >
      Toggle All
    </Button>

    <PanelMenu
      v-model:expandedKeys="expandedKeys"
      :model="menuItems"
      class="w-full md:w-80 bg-white dark:bg-gray-800
             text-gray-900 dark:text-gray-100 border-none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ThemeSwitcher from './theme/ThemeSwitcher.vue'
import Button from 'primevue/button'
import PanelMenu from 'primevue/panelmenu'


// Estado dos menus
const expandedKeys = ref<Record<string, boolean>>({})

// Menu principal
const menuItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/'
  },
  {
    key: 'veiculos',
    label: 'Veículos',
    icon: 'pi pi-car',
    children: [
      { key: 'todos-veiculos', label: 'Todos os Veículos', icon: 'pi pi-list', to: '/veiculos' },
      { key: 'adicionar-veiculo', label: 'Adicionar Veículo', icon: 'pi pi-plus', to: '/veiculos/novo' },
      { key: 'categorias-veiculos', label: 'Categorias', icon: 'pi pi-tags', to: '/veiculos/categorias' }
    ]
  },
  {
    key: 'motoristas',
    label: 'Motoristas',
    icon: 'pi pi-users',
    children: [
      { key: 'todos-motoristas', label: 'Todos os Motoristas', icon: 'pi pi-list', to: '/motoristas' },
      { key: 'adicionar-motorista', label: 'Adicionar Motorista', icon: 'pi pi-user-plus', to: '/motoristas/novo' }
    ]
  },
  {
    key: 'manutencao',
    label: 'Manutenção',
    icon: 'pi pi-wrench',
    to: '/manutencao'
  },
  {
    key: 'relatorios',
    label: 'Relatórios',
    icon: 'pi pi-chart-bar',
    to: '/relatorios'
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    icon: 'pi pi-cog',
    to: '/configuracoes'
  }
]

// Alterna todos os menus
const toggleAll = () => {
  if (Object.keys(expandedKeys.value).length > 0) {
    expandedKeys.value = {}
  } else {
    const keysToExpand: Record<string, boolean> = {}
    menuItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        keysToExpand[item.key] = true
      }
    })
    expandedKeys.value = keysToExpand
  }
}
</script>

<style scoped>
.card {
  padding: 1rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}
</style>

<template>
  <div class="flex flex-col gap-4">
            <Button icon="pi pi-arrow-right" @click="isDrawerVisible = true" />

    <!-- Drawer principal -->
  <Drawer v-model:visible="isDrawerVisible" header="Menu">
      <div>
        <!-- Botão de Dark Theme -->
        <ThemeSwitcher />
        <!-- Menu principal -->
        <PanelMenu :model="menuItems" class="w-full md:w-80" />
      </div>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ThemeSwitcher from './theme/ThemeSwitcher.vue'
import Drawer from 'primevue/drawer'

// Estado dos menus

// Estados de visibilidade e responsividade
const isDrawerVisible = ref(false)


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
</script>
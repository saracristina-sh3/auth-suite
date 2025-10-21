<template>
  <Sh3Modal v-model="isOpen" title="Usuários da Autarquia" :subtitle="autarquia?.nome" icon="pi-users">
    <div class="flex-1 overflow-y-auto">
      <Sh3LoadingState v-if="loading" message="Carregando usuários..." />

      <Sh3ErrorState v-else-if="error" :message="error" buttonLabel="Tentar novamente" buttonIcon="pi pi-refresh"
        @retry="loadUsers" />

      <Sh3EmptyState v-else-if="users.length === 0" icon="pi pi-users" iconClass="text-muted-foreground"
        title="Nenhum usuário vinculado" description="Esta autarquia ainda não possui usuários vinculados." />

      <div v-else class="space-y-6">
        <Sh3StatsGrid :stats="[
          {
            icon: 'pi pi-users',
            label: 'Total de usuários',
            value: users.length,
            iconColor: 'text-primary'
          },
          {
            icon: 'pi pi-check-circle',
            label: 'Ativos',
            value: activeUsersCount,
            iconColor: 'text-success'
          },
          {
            icon: 'pi pi-shield',
            label: 'Administradores',
            value: adminUsersCount,
            iconColor: 'text-copper-500'
          }
        ]" />

        <Sh3Table :items="users" :columns="userColumns" :paginated="true" :rows="8" dataKey="id">
        </Sh3Table>
      </div>
    </div>

    <template #footer>
      <button @click="close"
        class="px-4 py-2 bg-transparent border border-border text-foreground rounded-md hover:bg-accent transition-colors">
        Fechar
      </button>
    </template>
  </Sh3Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Sh3Modal from '@/components/common/Sh3Modal.vue'
import Sh3Table from '@/components/common/Sh3Table.vue'
import Sh3StatsGrid from '@/components/common/Sh3StatsGrid.vue'
import Sh3EmptyState from '@/components/common/state/Sh3EmptyState.vue'
import Sh3LoadingState from '@/components/common/state/Sh3LoadingState.vue'
import Sh3ErrorState from '@/components/common/state/Sh3ErrorState.vue'
import { autarquiaService } from '@/services/autarquia.service'
import type { Autarquia } from '@/types/auth'
import { useUserTableConfig } from "@/config/useUserTableConfig";

interface User {
  id: number
  name: string
  email: string
  pivot?: {
    role: string
    is_admin: boolean
    ativo: boolean
    is_default: boolean
    data_vinculo: string
  }
}

// Props
const props = defineProps({
  roles: {
    type: Array,
    default: () => []
  },
  autarquias: {
    type: Array,
    default: () => []
  }
});

// Controle
defineExpose({ open, close })
const isOpen = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const users = ref<User[]>([])
const autarquia = ref<Autarquia | null>(null)

// Computed
const activeUsersCount = computed(() => users.value.filter(u => u.pivot?.ativo).length)
const adminUsersCount = computed(() => users.value.filter(u => u.pivot?.is_admin).length)

// Métodos
async function open(autarquiaData: Autarquia) {
  autarquia.value = autarquiaData
  isOpen.value = true
  await loadUsers()
}

function close() {
  isOpen.value = false
  setTimeout(() => {
    users.value = []
    autarquia.value = null
    error.value = null
  }, 300)
}

async function loadUsers() {
  if (!autarquia.value) return
  loading.value = true
  error.value = null

  try {
    const response = await autarquiaService.getUsers(autarquia.value.id)
    users.value = response
  } catch (err: any) {
    console.error('Erro ao carregar usuários:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar usuários da autarquia.'
  } finally {
    loading.value = false
  }
}


const userConfig = useUserTableConfig(
  { value: props.roles || [] } as any,
  { value: props.autarquias || [] } as any
);
const userColumns = userConfig.columns;


</script>

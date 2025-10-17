<template>
     <!-- Aba Usuários -->
    <TabPanel header="Usuários" :value="0">
      <GenericTable
        title="Lista de Usuários"
        :items="users"
        :columns="userColumns"
        :actions="userActions"
        :loading="loading"
        actionsColumnStyle="width: 120px"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      >
        <template #column-cpf="{ data }">
          {{ formatCPF(data.cpf) }}
        </template>
        <template #column-is_active="{ data }">
          <Tag
            :value="data.is_active ? 'Ativo' : 'Inativo'"
            :severity="data.is_active ? 'success' : 'danger'"
          />
        </template>
        <template #column-autarquia="{ data }">
          {{ data.autarquia?.nome || '-' }}
        </template>
      </GenericTable>
    </TabPanel>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import GenericTable from '@/components/common/GenericTable.vue'
import type { User } from '@/services/user.service'
import { useUserTableConfig } from '@/composables/useUserTableConfig'

//State
const users = ref<User[]>([])

// Composables para configuração de tabelas
const userConfig = useUserTableConfig(roles, autarquias)

async function loadUsers() {
  try {
    loading.value = true
    const response = await userService.list()
    users.value = response.items
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
    showMessage('error', 'Falha ao carregar usuários.')
  } finally {
    loading.value = false
  }
}

</script>
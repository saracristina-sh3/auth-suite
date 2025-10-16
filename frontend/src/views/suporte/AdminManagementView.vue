<template>
  <BaseLayout>
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2 class="admin-title">Gerenciamento do Sistema</h2>
          <p class="admin-subtitle">Área restrita - SH3 Suporte</p>
        </div>
        <Button class="btn-primary" @click="onNew">
          <span class="btn-icon">+</span>
          Novo {{ activeTabLabel }}
        </Button>
      </div>

      <!-- Mensagem de feedback -->
      <div v-if="message" :class="['message', messageClass]">
        {{ message }}
      </div>

      <!-- Abas -->
      <TabView v-model:activeIndex="activeTab" @tab-change="onTabChange">
        <!-- Aba Usuários -->
        <TabPanel header="Usuários">
          <GenericTable
            title="Lista de Usuários"
            :items="users"
            :columns="userColumns"
            :actions="userActions"
            :loading="loading"
            actionsColumnStyle="width: 120px"
            @edit="handleEdit"
            @delete="handleDelete"
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

        <!-- Aba Autarquias -->
        <TabPanel header="Autarquias">
          <GenericTable
            title="Lista de Autarquias"
            :items="autarquias"
            :columns="autarquiaColumns"
            :actions="autarquiaActions"
            :loading="loading"
            actionsColumnStyle="width: 180px"
            @edit="handleEdit"
            @delete="handleDelete"
            @viewUsers="handleViewUsers"
            @viewModules="handleViewModules"
          />
        </TabPanel>

        <!-- Aba Módulos -->
        <TabPanel header="Módulos">
          <GenericTable
            title="Lista de Módulos"
            :items="modulos"
            :columns="moduloColumns"
            :actions="moduloActions"
            :loading="loading"
            actionsColumnStyle="width: 120px"
            @edit="handleEdit"
            @delete="handleDelete"
          >
            <template #column-descricao="{ data }">
              <span :title="data.descricao">{{ truncate(data.descricao, 50) }}</span>
            </template>
          </GenericTable>
        </TabPanel>
      </TabView>

      <!-- Formulário genérico -->
      <GenericForm
        ref="genericForm"
        :entityName="activeTabLabel"
        :fields="currentFields"
        @save="onSave"
      />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { userService } from '@/services/user.service'
import { roleService } from '@/services/role.service'
import { autarquiaService } from '@/services/autarquia.service'
import { moduloService } from '@/services/modulos.service'
import { useUserTableConfig } from '@/composables/useUserTableConfig'
import { useAutarquiaTableConfig } from '@/composables/useAutarquiaTableConfig'
import { useModuloTableConfig } from '@/composables/useModuloTableConfig'
import BaseLayout from '@/components/layouts/BaseLayout.vue'
import GenericTable from '@/components/common/GenericTable.vue'
import GenericForm from '@/components/common/GenericForm.vue'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Tag from 'primevue/tag'
import type { User } from '@/services/user.service'
import type { Role, Permission } from '@/services/role.service'
import type { Autarquia, Modulo } from '@/types/auth'

// State
const activeTab = ref(0)
const users = ref<User[]>([])
const autarquias = ref<Autarquia[]>([])
const modulos = ref<Modulo[]>([])
const roles = ref<Role[]>([])
const permissions = ref<Permission>({})
const loading = ref(false)
const genericForm = ref()
const message = ref('')
const messageType = ref<'success' | 'error' | ''>('')

// Composables para configuração de tabelas
const userConfig = useUserTableConfig(roles, autarquias)
const autarquiaConfig = useAutarquiaTableConfig()
const moduloConfig = useModuloTableConfig()

// Computed
const activeTabLabel = computed(() => {
  const labels = ['Usuário', 'Autarquia', 'Módulo']
  return labels[activeTab.value] || 'Item'
})

const messageClass = computed(() => {
  if (messageType.value === 'success') return 'message-success'
  if (messageType.value === 'error') return 'message-error'
  return 'message-info'
})

// Configuração de colunas, ações e campos vindos dos composables
const userColumns = userConfig.columns
const userActions = userConfig.actions

const autarquiaColumns = autarquiaConfig.columns
const autarquiaActions = autarquiaConfig.actions

const moduloColumns = moduloConfig.columns
const moduloActions = moduloConfig.actions

// Configuração de campos de formulário para cada entidade
const currentFields = computed(() => {
  if (activeTab.value === 0) {
    return userConfig.fields.value
  } else if (activeTab.value === 1) {
    return autarquiaConfig.fields
  } else {
    return moduloConfig.fields
  }
})

// Methods
function showMessage(type: 'success' | 'error', text: string) {
  messageType.value = type
  message.value = text
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 4000)
}

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

async function loadAutarquias() {
  try {
    loading.value = true
    autarquias.value = await autarquiaService.list()
  } catch (error) {
    console.error('Erro ao carregar autarquias:', error)
    showMessage('error', 'Falha ao carregar autarquias.')
  } finally {
    loading.value = false
  }
}

async function loadModulos() {
  try {
    loading.value = true
    modulos.value = await moduloService.list()
  } catch (error) {
    console.error('Erro ao carregar módulos:', error)
    showMessage('error', 'Falha ao carregar módulos.')
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  try {
    const response = await roleService.list()
    roles.value = response.roles
    permissions.value = response.permissions
  } catch (error) {
    console.error('Erro ao carregar roles:', error)
  }
}

async function onTabChange(event: any) {
  activeTab.value = event.index
  await loadCurrentTab()
}

async function loadCurrentTab() {
  if (activeTab.value === 0) {
    await loadUsers()
  } else if (activeTab.value === 1) {
    await loadAutarquias()
  } else if (activeTab.value === 2) {
    await loadModulos()
  }
}

function onNew() {
  genericForm.value?.open()
}

async function onSave(data: any) {
  try {
    if (activeTab.value === 0) {
      // Salvar usuário
      if (data.id) {
        await userService.update(data.id, data)
        showMessage('success', 'Usuário atualizado com sucesso.')
      } else {
        await userService.create(data)
        showMessage('success', 'Usuário criado com sucesso.')
      }
      await loadUsers()
    } else if (activeTab.value === 1) {
      // Salvar autarquia
      if (data.id) {
        await autarquiaService.update(data.id, data)
        showMessage('success', 'Autarquia atualizada com sucesso.')
      } else {
        await autarquiaService.create(data)
        showMessage('success', 'Autarquia criada com sucesso.')
      }
      await loadAutarquias()
    } else if (activeTab.value === 2) {
      // Salvar módulo
      if (data.id) {
        await moduloService.update(data.id, data)
        showMessage('success', 'Módulo atualizado com sucesso.')
      } else {
        await moduloService.create(data)
        showMessage('success', 'Módulo criado com sucesso.')
      }
      await loadModulos()
    }
  } catch (error: any) {
    console.error('Erro ao salvar:', error)
    const errorMessage = error.response?.data?.message || 'Erro ao salvar.'
    showMessage('error', errorMessage)
  }
}

// Event handlers para tabela
async function handleEdit(item: any) {
  genericForm.value?.open(item)
}

async function handleDelete(item: any) {
  const entityName = activeTabLabel.value
  if (!confirm(`Excluir ${entityName.toLowerCase()} "${item.nome || item.name}"?`)) {
    return
  }

  try {
    if (activeTab.value === 0) {
      await userService.remove(item.id)
      showMessage('success', 'Usuário removido com sucesso.')
      await loadUsers()
    } else if (activeTab.value === 1) {
      await autarquiaService.delete(item.id)
      showMessage('success', 'Autarquia removida com sucesso.')
      await loadAutarquias()
    } else if (activeTab.value === 2) {
      await moduloService.delete(item.id)
      showMessage('success', 'Módulo removido com sucesso.')
      await loadModulos()
    }
  } catch (error: any) {
    console.error('Erro ao excluir:', error)
    const errorMessage = error.response?.data?.message || 'Erro ao excluir.'
    showMessage('error', errorMessage)
  }
}

async function handleViewUsers() {
  showMessage('error', 'Funcionalidade em desenvolvimento.')
}

async function handleViewModules() {
  showMessage('error', 'Funcionalidade em desenvolvimento.')
}

// Helper functions
function formatCPF(cpf: string): string {
  if (!cpf) return '-'
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function truncate(text: string, length: number): string {
  if (!text) return '-'
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Lifecycle
onMounted(async () => {
  await loadRoles()
  await loadAutarquias()
  await loadCurrentTab()
})
</script>

<style scoped>
.admin-container {
  padding: 1.5rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.admin-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.admin-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-icon {
  font-weight: bold;
}

.message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  color: white;
  font-weight: 500;
}

.message-success {
  background-color: #16a34a;
}

.message-error {
  background-color: #dc2626;
}

.message-info {
  background-color: #6b7280;
}
</style>

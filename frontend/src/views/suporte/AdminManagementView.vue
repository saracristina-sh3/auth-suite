<template>
  <BaseLayout>
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2 class="admin-title">Painel do suporte</h2>
          <p class="admin-subtitle">Área restrita - SH3 Suporte</p>
        </div>
        <!-- Botão de criar apenas para Usuários e Autarquias -->
        <button
          v-if="activeTab === 0 || activeTab === 1"
          @click="onNew"
        >
          Novo {{ activeTabLabel }}
        </button>
      </div>

 

      <!-- Abas -->
      <TabView v-model:activeIndex="activeTab" @tab-change="onTabChange">
        <!-- Aba Usuários -->
        <TabPanel header="Usuários" :value="0">
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
        <TabPanel header="Autarquias" :value="1"> 
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
        <TabPanel header="Módulos" :value="2">
          <Card>
            <template #title>
              <div class="flex align-items-center justify-content-between">
                <span>Módulos do Sistema</span>
                <Tag value="Somente Leitura" severity="info" />
              </div>
            </template>
            <template #subtitle>
              Os módulos são fixos e não podem ser criados ou removidos. Você pode ativar/desativar globalmente.
            </template>
            <template #content>
              <div class="modulos-grid">
                <Card v-for="modulo in modulos" :key="modulo.id" class="modulo-card">
                  <template #header>
                    <div class="modulo-header">
                      <img
                        v-if="modulo.icone"
                        :src="`/src/assets/icons/${modulo.icone}.svg`"
                        :alt="`Ícone ${modulo.nome}`"
                        class="modulo-icon-svg"
                      />
                      <i v-else class="pi pi-box modulo-icon"></i>
                    </div>
                  </template>
                  <template #title>{{ modulo.nome }}</template>
                  <template #subtitle>{{ modulo.descricao }}</template>
                  <template #content>
                    <div class="flex align-items-center justify-content-between mt-3">
                      <span class="text-sm text-gray-600">Status:</span>
                      <ToggleSwitch
                        v-model="modulo.ativo"
                        @change="toggleModuloStatus(modulo)"
                      />
                    </div>
                  </template>
                </Card>
              </div>
            </template>
          </Card>
        </TabPanel>

        <!-- Aba Liberações de Módulos -->
        <TabPanel header="Liberações" :value="3">
          <Card>
            <template #title>Liberação de Módulos por Autarquia</template>
            <template #subtitle>
              Gerencie quais módulos cada autarquia tem acesso (contratos/planos)
            </template>
            <template #content>
              <p class="text-center text-gray-500 my-5">
                Interface em desenvolvimento...
              </p>
            </template>
          </Card>
        </TabPanel>
        <TabPanel header="Modo Suporte" :value="4">
               <!-- Painel de seleção de contexto de autarquia -->
      <Card v-if="!supportContext" class="mb-4">
        <template #title>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-building"></i>
            <span>Modo Suporte - Selecione uma Autarquia</span>
          </div>
        </template>
        <template #content>
          <p class="mb-3">
            Escolha uma autarquia para acessar como administrador com todas as permissões
          </p>
          <div class="flex gap-3">
            <Sh3Select
  v-model="selectedAutarquiaId"
  :field="{
    name: 'autarquia',
    label: 'Autarquia',
    type: 'select',
    placeholder: 'Selecione uma autarquia',
    optionLabel: 'nome',
    optionValue: 'id',
    options: autarquias
  }"
  class="flex-1"
/>

            <button
              label="Acessar"
              icon="pi pi-sign-in"
              @click="handleAssumeContext"
              :disabled="!selectedAutarquiaId"
            />
          </div>
        </template>
      </Card>

      <!-- Barra de contexto ativo -->
      <Message v-else severity="warn" :closable="false" class="mb-4">
        <div class="flex align-items-center justify-content-between w-full">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-shield" style="font-size: 1.5rem"></i>
            <div>
              <strong>Modo Suporte Ativo:</strong>
              <span class="ml-2">{{ supportContext.autarquia.nome }}</span>
            </div>
          </div>
          <button
            label="Sair do Modo Suporte"
            icon="pi pi-sign-out"
            @click="exitContext"
            severity="warning"
            outlined
          />
        </div>
      </Message>

      <!-- Mensagem de feedback -->
      <div v-if="message" :class="['message', messageClass]">
        {{ message }}
      </div>
        </TabPanel>
      </TabView>

      <!-- Formulário genérico -->
      <Sh3Form
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
import { useRouter } from 'vue-router'
import { userService } from '@/services/user.service'
import { roleService } from '@/services/role.service'
import { autarquiaService } from '@/services/autarquia.service'
import { moduloService } from '@/services/modulos.service'
import { supportService, type SupportContext } from '@/services/support.service'
import { useUserTableConfig } from '@/composables/useUserTableConfig'
import { useAutarquiaTableConfig } from '@/composables/useAutarquiaTableConfig'
import { useModuloTableConfig } from '@/composables/useModuloTableConfig'
import BaseLayout from '@/components/layouts/BaseLayout.vue'
import GenericTable from '@/components/common/GenericTable.vue'
import Sh3Form from '@/components/common/Sh3Form.vue'
import Sh3Select from '@/components/common/Sh3Select.vue'
import Card from 'primevue/card'
import ToggleSwitch from 'primevue/toggleswitch'
import Message from 'primevue/message'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Tag from 'primevue/tag'
import type { User } from '@/services/user.service'
import type { Role, Permission } from '@/services/role.service'
import type { Autarquia, Modulo } from '@/types/auth'

const router = useRouter()

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
const supportContext = ref<SupportContext | null>(null)
const selectedAutarquiaId = ref<number | null>(null)

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

// Support Context Functions
async function handleAssumeContext() {
  if (!selectedAutarquiaId.value) {
    showMessage('error', 'Selecione uma autarquia.')
    return
  }

  const autarquia = autarquias.value.find((a) => a.id === selectedAutarquiaId.value)
  if (!autarquia) {
    showMessage('error', 'Autarquia não encontrada.')
    return
  }

  if (!autarquia.ativo) {
    showMessage('error', 'Esta autarquia está inativa e não pode ser acessada.')
    return
  }

  try {
    loading.value = true
    console.log('🔄 Selecionando autarquia:', autarquia.nome)

    const context = await supportService.assumeAutarquiaContext(autarquia.id)
    supportContext.value = context
    selectedAutarquiaId.value = null

    showMessage('success', `Modo suporte ativado para: ${autarquia.nome}. Redirecionando...`)
    console.log('✅ Contexto de suporte ativo:', context)

    // Redirecionar para SuiteView (home) após 1 segundo
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 1000)
  } catch (error: any) {
    console.error('❌ Erro ao selecionar autarquia:', error)
    const errorMessage = error.message || 'Erro ao ativar modo suporte. Tente novamente.'
    showMessage('error', errorMessage)
  } finally {
    loading.value = false
  }
}

async function exitContext() {
  if (!confirm('Deseja sair do modo suporte e retornar ao seu contexto original?')) {
    return
  }

  try {
    loading.value = true
    console.log('🔙 Saindo do modo suporte...')

    await supportService.exitAutarquiaContext()
    supportContext.value = null

    showMessage('success', 'Retornado ao contexto original.')
    console.log('✅ Modo suporte desativado')
  } catch (error: any) {
    console.error('❌ Erro ao sair do contexto:', error)
    const errorMessage = error.message || 'Erro ao sair do modo suporte. Tente novamente.'
    showMessage('error', errorMessage)
  } finally {
    loading.value = false
  }
}

// Módulos Functions
async function toggleModuloStatus(modulo: Modulo) {
  try {
    loading.value = true
    console.log('🔄 Alterando status do módulo:', modulo.nome, '→', modulo.ativo)

    await moduloService.update(modulo.id, {
      nome: modulo.nome,
      descricao: modulo.descricao,
      icone: modulo.icone,
      ativo: modulo.ativo,
    })

    showMessage(
      'success',
      `Módulo "${modulo.nome}" ${modulo.ativo ? 'ativado' : 'desativado'} com sucesso.`
    )
  } catch (error: any) {
    console.error('❌ Erro ao alterar status do módulo:', error)

    // Reverter o status em caso de erro
    modulo.ativo = !modulo.ativo

    const errorMessage = error.response?.data?.message || 'Erro ao alterar status do módulo.'
    showMessage('error', errorMessage)
  } finally {
    loading.value = false
  }
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
  // Verificar se já existe um contexto de suporte ativo
  supportContext.value = supportService.getSupportContext()

  await loadRoles()
  await loadAutarquias()
  await loadCurrentTab()
})
</script>

<style scoped>
.admin-container {
  display:contents;
  min-height: 100vh;
  width: 100%;
  background: var(--color-background);
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

/* Módulos Grid Styles */
.modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.modulo-card {
  transition: all 0.3s ease;
}

.modulo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.modulo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 0 0;
}

.modulo-icon {
  font-size: 3rem;
  color: white;
}

.modulo-icon-svg {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: brightness(0) invert(1); /* Torna o SVG branco */
}
</style>

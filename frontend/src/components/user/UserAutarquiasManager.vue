<template>
  <div class="user-autarquias-manager">
    <div class="header">
      <h2>Gerenciar Autarquias do Usuário</h2>
      <button v-if="!isEditing" @click="startEdit" class="btn-primary">
        Editar Autarquias
      </button>
    </div>

    <!-- Mensagens de erro -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      Carregando autarquias...
    </div>

    <!-- Lista de Autarquias (Modo Visualização) -->
    <div v-else-if="!isEditing" class="autarquias-list">
      <div v-if="autarquias.length === 0" class="empty-state">
        Este usuário não está vinculado a nenhuma autarquia.
      </div>

      <div v-else class="autarquias-grid">
        <div
          v-for="autarquia in autarquias"
          :key="autarquia.id"
          :class="['autarquia-card', { default: autarquia.pivot.is_default }]"
        >
          <div class="card-header">
            <h3>{{ autarquia.nome }}</h3>
            <span
              v-if="autarquia.pivot.is_default"
              class="badge badge-primary"
            >
              Padrão
            </span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">Role:</span>
              <span class="value">{{ autarquia.pivot.role }}</span>
            </div>

            <div class="info-row">
              <span class="label">Admin:</span>
              <span class="value">
                {{ autarquia.pivot.is_admin ? 'Sim' : 'Não' }}
              </span>
            </div>

            <div class="info-row">
              <span class="label">Status:</span>
              <span
                :class="['badge', autarquia.pivot.ativo ? 'badge-success' : 'badge-danger']"
              >
                {{ autarquia.pivot.ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>

            <div class="info-row">
              <span class="label">Vinculado em:</span>
              <span class="value">{{ formatDate(autarquia.pivot.data_vinculo) }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button
              v-if="!autarquia.pivot.is_default"
              @click="setAsDefault(autarquia.id)"
              class="btn-secondary btn-sm"
            >
              Definir como Padrão
            </button>

            <button
              v-if="!autarquia.pivot.is_admin"
              @click="promoteToAdmin(autarquia.id)"
              class="btn-info btn-sm"
            >
              Promover a Admin
            </button>

            <button
              v-else
              @click="demoteFromAdmin(autarquia.id)"
              class="btn-warning btn-sm"
            >
              Remover Admin
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor de Autarquias (Modo Edição) -->
    <div v-else class="autarquias-editor">
      <div class="editor-header">
        <h3>Selecione as Autarquias</h3>
        <p class="help-text">
          Marque as autarquias que o usuário terá acesso e configure as permissões
        </p>
      </div>

      <table class="editor-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                @change="toggleSelectAll"
                :checked="allSelected"
              />
            </th>
            <th>Autarquia</th>
            <th>Status</th>
            <th>Role</th>
            <th>Admin</th>
            <th>Padrão</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="autarquia in availableAutarquias"
            :key="autarquia.id"
          >
            <td>
              <input
                type="checkbox"
                v-model="autarquia.selected"
                @change="onAutarquiaToggle(autarquia)"
              />
            </td>
            <td>
              <strong>{{ autarquia.nome }}</strong>
            </td>
            <td>
              <span
                :class="['badge', autarquia.ativo ? 'badge-success' : 'badge-danger']"
              >
                {{ autarquia.ativo ? 'Ativa' : 'Inativa' }}
              </span>
            </td>
            <td>
              <select
                v-model="autarquia.role"
                :disabled="!autarquia.selected"
                class="role-select"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="viewer">Viewer</option>
                <option value="manager">Manager</option>
              </select>
            </td>
            <td>
              <input
                type="checkbox"
                v-model="autarquia.isAdmin"
                :disabled="!autarquia.selected"
              />
            </td>
            <td>
              <input
                type="radio"
                name="default-autarquia"
                :value="autarquia.id"
                v-model="defaultAutarquiaId"
                :disabled="!autarquia.selected"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="editor-actions">
        <button @click="cancelEdit" class="btn-secondary">
          Cancelar
        </button>
        <button @click="saveChanges" class="btn-primary" :disabled="saving">
          {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>
    </div>

    <!-- Estatísticas -->
    <div v-if="!isEditing && autarquias.length > 0" class="stats">
      <div class="stat-card">
        <div class="stat-value">{{ autarquias.length }}</div>
        <div class="stat-label">Total de Autarquias</div>
      </div>

      <div class="stat-card">
        <div class="stat-value">{{ autarquiasAtivas.length }}</div>
        <div class="stat-label">Autarquias Ativas</div>
      </div>

      <div class="stat-card">
        <div class="stat-value">{{ autarquiasAdmin.length }}</div>
        <div class="stat-label">Admin em</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserAutarquias } from '@/composables/useUserAutarquias'
import { autarquiaService } from '@/services/autarquia.service'
import type { Autarquia } from '@/services/user.service'
import type { SyncAutarquiasPayload } from '@/services/user.service'

interface Props {
  userId: number
}

const props = defineProps<Props>()

interface AutarquiaSelection extends Autarquia {
  selected: boolean
  role: string
  isAdmin: boolean
  isDefault: boolean
}

// Composable
const {
  autarquias,
  loading,
  error,
  autarquiasAtivas,
  autarquiasAdmin,
  loadAutarquias,
  syncAutarquias,
  updateActiveAutarquia,
  promoteToAdmin: promote,
  demoteFromAdmin: demote
} = useUserAutarquias(props.userId)

// Estado local
const isEditing = ref(false)
const saving = ref(false)
const availableAutarquias = ref<AutarquiaSelection[]>([])
const defaultAutarquiaId = ref<number | null>(null)

const allSelected = computed(() =>
  availableAutarquias.value.every(a => a.selected)
)

// Métodos
async function loadAvailableAutarquias() {
  try {
    const all = await autarquiaService.list()
    availableAutarquias.value = all.map(autarquia => {
      const userAutarquia = autarquias.value.find(ua => ua.id === autarquia.id)
      return {
        ...autarquia,
        selected: !!userAutarquia,
        role: userAutarquia?.pivot.role || 'user',
        isAdmin: userAutarquia?.pivot.is_admin || false,
        isDefault: userAutarquia?.pivot.is_default || false
      }
    })

    // Define a autarquia padrão
    const defaultAut = availableAutarquias.value.find(a => a.isDefault)
    defaultAutarquiaId.value = defaultAut?.id || null
  } catch (err) {
    console.error('Erro ao carregar autarquias disponíveis:', err)
  }
}

function startEdit() {
  isEditing.value = true
  loadAvailableAutarquias()
}

function cancelEdit() {
  isEditing.value = false
  availableAutarquias.value = []
}

function toggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  availableAutarquias.value.forEach(a => {
    a.selected = checked
  })
}

function onAutarquiaToggle(autarquia: AutarquiaSelection) {
  if (!autarquia.selected && defaultAutarquiaId.value === autarquia.id) {
    defaultAutarquiaId.value = null
  }
}

async function saveChanges() {
  saving.value = true

  try {
    const selectedAutarquias = availableAutarquias.value
      .filter(a => a.selected)
      .map(a => ({
        id: a.id,
        pivot_data: {
          role: a.role,
          is_admin: a.isAdmin,
          is_default: a.id === defaultAutarquiaId.value,
          ativo: true
        }
      })) as SyncAutarquiasPayload[]

    if (selectedAutarquias.length === 0) {
      alert('Selecione pelo menos uma autarquia')
      return
    }

    if (!defaultAutarquiaId.value) {
      alert('Defina uma autarquia padrão')
      return
    }

    await syncAutarquias(selectedAutarquias)
    await updateActiveAutarquia(defaultAutarquiaId.value)

    isEditing.value = false
    alert('Autarquias atualizadas com sucesso!')
  } catch (err: any) {
    alert(err.message || 'Erro ao salvar alterações')
  } finally {
    saving.value = false
  }
}

async function setAsDefault(autarquiaId: number) {
  if (confirm('Deseja definir esta autarquia como padrão?')) {
    try {
      await updateActiveAutarquia(autarquiaId)
      await loadAutarquias()
      alert('Autarquia padrão atualizada!')
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar autarquia padrão')
    }
  }
}

async function promoteToAdmin(autarquiaId: number) {
  if (confirm('Promover este usuário a administrador desta autarquia?')) {
    try {
      await promote(autarquiaId)
      alert('Usuário promovido a admin!')
    } catch (err: any) {
      alert(err.message || 'Erro ao promover usuário')
    }
  }
}

async function demoteFromAdmin(autarquiaId: number) {
  if (confirm('Remover privilégios de administrador desta autarquia?')) {
    try {
      await demote(autarquiaId)
      alert('Privilégios de admin removidos!')
    } catch (err: any) {
      alert(err.message || 'Erro ao remover admin')
    }
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  loadAutarquias()
})
</script>

<style scoped>
.user-autarquias-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.error-message {
  background: #fee;
  color: #c00;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  background: #f9f9f9;
  border-radius: 0.5rem;
}

.autarquias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.autarquia-card {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: white;
  transition: all 0.2s;
}

.autarquia-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.autarquia-card.default {
  border-color: #3b82f6;
  background: #eff6ff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #333;
}

.card-body {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.info-row .label {
  font-weight: 500;
  color: #666;
}

.info-row .value {
  color: #333;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-primary {
  background: #3b82f6;
  color: white;
}

.badge-success {
  background: #10b981;
  color: white;
}

.badge-danger {
  background: #ef4444;
  color: white;
}

.editor-header {
  margin-bottom: 1.5rem;
}

.editor-header h3 {
  margin: 0 0 0.5rem 0;
}

.help-text {
  color: #666;
  font-size: 0.875rem;
}

.editor-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.editor-table th,
.editor-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.editor-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.editor-table tbody tr:hover {
  background: #f9fafb;
}

.role-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary,
.btn-secondary,
.btn-info,
.btn-warning {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-info {
  background: #0ea5e9;
  color: white;
}

.btn-info:hover {
  background: #0284c7;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
}
</style>

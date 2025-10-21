<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" @click.self="close">
      <div class="bg-card text-card-foreground rounded-lg max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <header class="flex justify-between items-center border-b border-border px-6 py-4">
          <div class="flex items-center gap-3">
            <i class="pi pi-users text-primary text-2xl"></i>
            <div>
              <h2 class="text-xl font-semibold text-card-foreground">Usuários da Autarquia</h2>
              <p class="text-sm text-muted-foreground mt-1">{{ autarquia?.nome }}</p>
            </div>
          </div>
          <button
            class="bg-transparent border-none text-2xl cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground"
            @click="close"
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-12">
            <Sh3ProgressSpinner size="small" />
            <p class="text-muted-foreground mt-4">Carregando usuários...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
            <i class="pi pi-exclamation-triangle text-destructive text-4xl mb-4"></i>
            <p class="text-destructive font-medium">{{ error }}</p>
            <button
              @click="loadUsers"
              class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
            >
              Tentar Novamente
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="users.length === 0" class="flex flex-col items-center justify-center py-12">
            <i class="pi pi-users text-muted-foreground text-6xl mb-4"></i>
            <h3 class="text-lg font-semibold text-foreground mb-2">Nenhum usuário vinculado</h3>
            <p class="text-muted-foreground text-center max-w-md">
              Esta autarquia ainda não possui usuários vinculados.
            </p>
          </div>

          <!-- Users Table -->
          <div v-else class="space-y-4">
            <!-- Stats -->
            <div class="bg-muted rounded-lg p-4 flex items-center gap-4">
              <div class="flex items-center gap-2">
                <i class="pi pi-users text-primary text-xl"></i>
                <div>
                  <p class="text-sm text-muted-foreground">Total de usuários</p>
                  <p class="text-2xl font-bold text-foreground">{{ users.length }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 ml-8">
                <i class="pi pi-check-circle text-success text-xl"></i>
                <div>
                  <p class="text-sm text-muted-foreground">Ativos</p>
                  <p class="text-2xl font-bold text-foreground">{{ activeUsersCount }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 ml-8">
                <i class="pi pi-shield text-copper-500 text-xl"></i>
                <div>
                  <p class="text-sm text-muted-foreground">Administradores</p>
                  <p class="text-2xl font-bold text-foreground">{{ adminUsersCount }}</p>
                </div>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto border border-border rounded-lg">
              <table class="min-w-full divide-y divide-border">
                <thead class="bg-muted">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Usuário
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Função
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Data Vínculo
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-card divide-y divide-border">
                  <tr
                    v-for="user in users"
                    :key="user.id"
                    class="hover:bg-muted transition-colors cursor-pointer"
                    @click="selectUser(user)"
                  >
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div class="flex items-center gap-3">
                        <Avatar
                          :label="getUserInitials(user.name)"
                          shape="circle"
                          class="bg-primary text-primary-foreground !w-8 !h-8 !text-sm"
                        />
                        <div>
                          <p class="text-sm font-medium text-foreground">{{ user.name }}</p>
                          <p v-if="user.pivot?.is_admin" class="text-xs text-copper-500 flex items-center gap-1">
                            <i class="pi pi-shield text-xs"></i>
                            Administrador
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <p class="text-sm text-foreground">{{ user.email }}</p>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getRoleBadgeClass(user.pivot?.role)"
                      >
                        {{ getRoleLabel(user.pivot?.role) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="user.pivot?.ativo ? 'bg-jade-100 text-jade-800' : 'bg-ruby-100 text-ruby-800'"
                      >
                        <i :class="['pi text-xs mr-1', user.pivot?.ativo ? 'pi-check' : 'pi-times']"></i>
                        {{ user.pivot?.ativo ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                      {{ formatDate(user.pivot?.data_vinculo) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            @click="close"
            class="px-4 py-2 bg-transparent border border-border text-foreground rounded-md hover:bg-accent transition-colors"
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Avatar from 'primevue/avatar'
import Sh3ProgressSpinner from '@/components/common/Sh3ProgressSpinner.vue'
import { autarquiaService } from '@/services/autarquia.service'

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

interface Autarquia {
  id: number
  nome: string
}

// Props & Emits
defineExpose({
  open,
  close
})

// State
const isOpen = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const users = ref<User[]>([])
const autarquia = ref<Autarquia | null>(null)

// Computed
const activeUsersCount = computed(() => {
  return users.value.filter(u => u.pivot?.ativo).length
})

const adminUsersCount = computed(() => {
  return users.value.filter(u => u.pivot?.is_admin).length
})

// Methods
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

function selectUser(user: User) {
  console.log('Usuário selecionado:', user)
  // Aqui você pode adicionar navegação para perfil do usuário ou modal de edição
}

function getUserInitials(name: string): string {
  if (!name) return '?'
  const parts = name.split(' ').filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase() || '?'
}

function getRoleLabel(role?: string): string {
  const roleMap: Record<string, string> = {
    'sh3': 'SH3 Suporte',
    'admin': 'Administrador',
    'user': 'Usuário',
    'viewer': 'Visualizador'
  }
  return roleMap[role || 'user'] || 'Usuário'
}

function getRoleBadgeClass(role?: string): string {
  const classMap: Record<string, string> = {
    'sh3': 'bg-copper-100 text-copper-800',
    'admin': 'bg-selenium-100 text-selenium-800',
    'user': 'bg-jade-100 text-jade-800',
    'viewer': 'bg-muted text-muted-foreground'
  }
  return classMap[role || 'user'] || 'bg-muted text-muted-foreground'
}

function formatDate(date?: string): string {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return '-'
  }
}
</script>

<style scoped>
/* Transições Vue necessárias */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

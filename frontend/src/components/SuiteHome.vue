<template>
  <BaseLayout>
    <div class="suite-container">
      <!-- User Info -->
      <div class="user-info">
        <UsuarioCard />
      </div>

      <!-- Seletor de Autarquia -->
      <div class="autarquia-selector" v-if="currentUser">
        <!-- Quando usuário tem apenas 1 autarquia -->
        <div v-if="autarquias.length === 1" class="autarquia-single">
          <div class="autarquia-card-single">
            <div class="flex align-items-center gap-3">
              <i class="pi pi-building icon-autarquia"></i>
              <div>
                <p class="label-autarquia">Autarquia</p>
                <p class="nome-autarquia">{{ autarquias[0]?.nome }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quando usuário tem múltiplas autarquias -->
        <div v-else-if="autarquias.length > 1" class="autarquia-multiple">
          <div class="autarquia-selector-card">
            <div class="selector-header">
              <i class="pi pi-building icon-autarquia"></i>
              <span class="selector-title">Selecione a Autarquia</span>
            </div>

            <Sh3Select
              :field="{
                name: 'autarquia_ativa',
                label: '',
                type: 'select',
                placeholder: 'Escolha uma autarquia para trabalhar',
                options: autarquias,
                optionLabel: 'nome',
                optionValue: 'id'
              }"
              v-model="autarquiaAtivaId"
              @update:modelValue="handleAutarquiaChange"
              :disabled="changingAutarquia"
            />

            <!-- Loading durante mudança -->
            <div v-if="changingAutarquia" class="autarquia-changing-feedback">
              <Sh3ProgressSpinner size="small" />
              <span class="ml-2">Alterando autarquia e recarregando módulos...</span>
            </div>

            <!-- Info da autarquia ativa -->
            <div v-else-if="autarquiaAtiva" class="autarquia-info-footer">
              <span class="info-text">
                <i class="pi pi-check-circle"></i>
                Trabalhando em: <strong>{{ autarquiaAtiva.nome }}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- Loading de autarquias -->
        <div v-else-if="loadingAutarquias" class="autarquia-loading">
          <ProgressSpinner size="small" />
          <span class="ml-2">Carregando autarquias...</span>
        </div>

        <!-- Sem autarquias -->
        <div v-else class="autarquia-empty">
          <Sh3Message severity="warn" :closable="false">
            Você não está vinculado a nenhuma autarquia. Entre em contato com o administrador.
          </Sh3Message>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <Sh3ProgressSpinner size="small" />
        <p class="text-color-secondary mt-3">Carregando módulos...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <Sh3Message severity="error" :closable="false">
          {{ error }}
        </Sh3Message>
        <Sh3Button label="Tentar novamente" icon="pi pi-refresh" @click="reload" class="mt-3" />
      </div>

      <!-- Empty State -->
      <div v-else-if="modulos.length === 0" class="empty-container">
        <i class="pi pi-box text-6xl text-color-secondary mb-3"></i>
        <h3 class="text-xl font-semibold text-color-secondary">Nenhum módulo disponível</h3>
        <p class="text-color-secondary">
          Sua autarquia ainda não possui módulos liberados.<br />
          Entre em contato com o administrador do sistema.
        </p>
      </div>

      <!-- Modules Grid -->
      <div v-else class="grid gap-3 md:gap-4 mt-6 w-full max-w-6xl">
        <Sh3Card
          v-for="modulo in modulos"
          :key="modulo.key"
          class="cursor-pointer transition-all duration-300 hover:shadow-2xl border-1 surface-border"
          @click="handleItemClick(modulo.route)"
        >
          <template #content>
            <div class="flex flex-column align-items-center gap-3 text-center p-3">
              <div class="text-primary text-4xl">
                <component v-if="typeof modulo.icon !== 'string'" :is="modulo.icon" />
                <i v-else :class="modulo.icon"></i>
              </div>
              <h3 class="text-lg font-semibold m-0">{{ modulo.title }}</h3>
              <p class="text-color-secondary line-height-3 m-0">{{ modulo.description }}</p>
            </div>
          </template>
        </Sh3Card>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useModulos } from '@/composables/useModulos'
import { useNotification } from '@/composables/useNotification'
import { authService } from '@/services/auth.service'
import { userService, type AutarquiaWithPivot } from '@/services/user.service'
import UsuarioCard from './usuario/UsuarioCard.vue'
import Sh3Select from './common/Sh3Select.vue'
import Sh3Card from './common/Sh3Card.vue'
import Sh3ProgressSpinner from './common/Sh3ProgressSpinner.vue'
import Sh3Message from './common/Sh3Message.vue'
import Sh3Button from './common/Sh3Button.vue'
import type { User } from '@/types/auth'
import BaseLayout from './layouts/BaseLayout.vue'

const { modulos, loading, error, reload } = useModulos()
const { showMessage } = useNotification()
const router = useRouter()

// Estado
const currentUser = ref<User | null>(null)
const autarquias = ref<AutarquiaWithPivot[]>([])
const autarquiaAtivaId = ref<number | null>(null)
const loadingAutarquias = ref(false)
const changingAutarquia = ref(false) // Loading durante mudança de autarquia

// Computed
const autarquiaAtiva = computed(() => {
  if (!autarquiaAtivaId.value) return null
  return autarquias.value.find(a => a.id === autarquiaAtivaId.value) || null
})

// Métodos
async function loadUserAutarquias() {
  const user = authService.getUserFromStorage()
  if (!user || !user.id) {
    console.error('Usuário não encontrado')
    return
  }

  loadingAutarquias.value = true

  try {
    console.log('🔄 Carregando autarquias do usuário:', user.id)

    // Buscar autarquias do usuário
    autarquias.value = await userService.getUserAutarquias(user.id)

    console.log('📦 Autarquias carregadas:', autarquias.value)

    // Definir autarquia ativa
    if (user.autarquia_ativa_id) {
      // Se o usuário já tem uma autarquia ativa definida
      autarquiaAtivaId.value = user.autarquia_ativa_id
    } else if (autarquias.value.length === 1 && autarquias.value[0]) {
      // Se tem apenas uma autarquia, seleciona automaticamente
      autarquiaAtivaId.value = autarquias.value[0].id
      await updateActiveAutarquia(autarquias.value[0].id)
    } else if (autarquias.value.length > 0) {
      // Se tem múltiplas, verifica se tem uma padrão
      const defaultAutarquia = autarquias.value.find(a => a.pivot.is_default)
      if (defaultAutarquia) {
        autarquiaAtivaId.value = defaultAutarquia.id
        await updateActiveAutarquia(defaultAutarquia.id)
      }
    }
  } catch (err) {
    console.error('❌ Erro ao carregar autarquias:', err)
  } finally {
    loadingAutarquias.value = false
  }
}

async function handleAutarquiaChange(newAutarquiaId: number | string) {
  const id = typeof newAutarquiaId === 'string' ? parseInt(newAutarquiaId) : newAutarquiaId

  console.log('🔄 Mudando autarquia ativa para:', id)

  changingAutarquia.value = true

  try {
    await updateActiveAutarquia(id)

    // Recarregar módulos para a nova autarquia
    await reload()

    // Mostrar mensagem de sucesso
    const autarquiaNome = autarquias.value.find(a => a.id === id)?.nome || 'Autarquia'
    showMessage('success', `Autarquia alterada para: ${autarquiaNome}`)
  } catch (err) {
    showMessage('error', 'Erro ao alterar autarquia. Tente novamente.')
  } finally {
    changingAutarquia.value = false
  }
}

async function updateActiveAutarquia(autarquiaId: number) {
  const user = authService.getUserFromStorage()
  if (!user || !user.id) return

  // Guardar ID anterior para rollback em caso de erro
  const previousAutarquiaId = user.autarquia_ativa_id

  try {
    // 💾 Atualizar localStorage PRIMEIRO (persistência otimista)
    const autarquiaAtualizada = autarquias.value.find(a => a.id === autarquiaId)
    const updatedUserData = {
      ...user,
      autarquia_ativa_id: autarquiaId,
      autarquia_ativa: autarquiaAtualizada || null
    }
    localStorage.setItem('user_data', JSON.stringify(updatedUserData))
    currentUser.value = updatedUserData

    console.log('💾 localStorage atualizado com autarquia:', autarquiaId)

    // 🔄 Sincronizar com backend
    await userService.updateActiveAutarquia(user.id, autarquiaId)

    console.log('✅ Autarquia ativa sincronizada com backend e persistida')
  } catch (err) {
    console.error('❌ Erro ao atualizar autarquia ativa:', err)

    // 🔙 Rollback: Reverter localStorage para valor anterior
    if (previousAutarquiaId) {
      const autarquiaAnterior = autarquias.value.find(a => a.id === previousAutarquiaId)
      const rollbackUserData = {
        ...user,
        autarquia_ativa_id: previousAutarquiaId,
        autarquia_ativa: autarquiaAnterior || null
      }
      localStorage.setItem('user_data', JSON.stringify(rollbackUserData))
      currentUser.value = rollbackUserData
      autarquiaAtivaId.value = previousAutarquiaId
    }

    throw err
  }
}

const handleItemClick = (route?: string) => {
  if (route) {
    router.push(route)
  }
}

// Lifecycle
onMounted(async () => {
  currentUser.value = authService.getUserFromStorage()
  await loadUserAutarquias()
})

// Watch para recarregar módulos quando autarquia mudar
watch(autarquiaAtivaId, (newId) => {
  if (newId && modulos.value.length === 0) {
    reload()
  }
})
</script>

<style scoped>
.suite-container {
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 90vh;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Seletor de Autarquia */
.autarquia-selector {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 600px;
}

/* Autarquia Única */
.autarquia-single {
  width: 100%;
}

.autarquia-card-single {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: transform 0.2s;
}

.autarquia-card-single:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.autarquia-card-single .icon-autarquia {
  font-size: 2.5rem;
}

.autarquia-card-single .label-autarquia {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.autarquia-card-single .nome-autarquia {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

/* Múltiplas Autarquias */
.autarquia-multiple {
  width: 100%;
}

.autarquia-selector-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.selector-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.selector-header .icon-autarquia {
  font-size: 1.75rem;
  color: #667eea;
}

.selector-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.autarquia-info-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.info-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-size: 0.875rem;
}

.info-text i {
  font-size: 1rem;
}

/* Feedback durante mudança de autarquia */
.autarquia-changing-feedback {
  margin-top: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 8px;
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Loading e Empty States */
.autarquia-loading,
.autarquia-empty {
  width: 100%;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.autarquia-empty {
  padding: 0;
}

/* Estados de Loading/Error/Empty */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.error-container {
  max-width: 500px;
}

.empty-container {
  padding: 4rem 1rem;
}

/* Grid de Módulos */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* Responsividade */
@media (max-width: 768px) {
  .suite-container {
    padding: 1rem 0.5rem;
  }

  .autarquia-selector {
    max-width: 100%;
  }

  .autarquia-card-single {
    padding: 1.25rem;
  }

  .autarquia-card-single .nome-autarquia {
    font-size: 1.25rem;
  }

  .selector-title {
    font-size: 1rem;
  }

  .grid {
    grid-template-columns: 1fr;
  }
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.autarquia-single,
.autarquia-multiple {
  animation: fadeIn 0.3s ease-out;
}
</style>

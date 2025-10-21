<template>
  <BaseLayout>
    <div class="p-4 md:p-8 flex flex-col items-center min-h-[90vh]">
      <!-- User Info -->
      <div class="flex items-center justify-center">
        <UsuarioCard />
      </div>

      <!-- Seletor de Autarquia -->
      <div class="mt-6 w-full max-w-[600px]" v-if="currentUser">
        <!-- Quando usuário tem apenas 1 autarquia -->
        <div v-if="autarquias.length === 1" class="w-full animate-fade-in">
          <div class="bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-primary-foreground shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div class="flex items-center gap-3">
              <i class="pi pi-building text-4xl"></i>
              <div>
                <p class="text-sm opacity-90 mb-1 font-medium uppercase tracking-wide">Autarquia</p>
                <p class="text-2xl font-bold leading-tight">{{ autarquias[0]?.nome }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quando usuário tem múltiplas autarquias -->
        <div v-else-if="autarquias.length > 1" class="w-full animate-fade-in">
          <div class="bg-card border-2 border-border rounded-xl p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <i class="pi pi-building text-3xl text-primary"></i>
              <span class="text-lg font-semibold text-foreground">Selecione a Autarquia</span>
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
            <div v-if="changingAutarquia" class="mt-4 p-4 flex items-center justify-center bg-muted rounded-lg text-primary text-sm font-medium animate-pulse">
              <Sh3ProgressSpinner size="small" />
              <span class="ml-2">Alterando autarquia e recarregando módulos...</span>
            </div>

            <!-- Info da autarquia ativa -->
            <div v-else-if="autarquiaAtiva" class="mt-4 pt-4 border-t border-border">
              <span class="flex items-center gap-2 text-success text-sm">
                <i class="pi pi-check-circle text-base"></i>
                Trabalhando em: <strong>{{ autarquiaAtiva.nome }}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- Loading de autarquias -->
        <div v-else-if="loadingAutarquias" class="w-full p-6 flex items-center justify-center text-muted-foreground text-sm">
          <Sh3ProgressSpinner size="small" />
          <span class="ml-2">Carregando autarquias...</span>
        </div>

        <!-- Sem autarquias -->
        <div v-else class="w-full">
          <Sh3Message severity="warn" :closable="false">
            Você não está vinculado a nenhuma autarquia. Entre em contato com o administrador.
          </Sh3Message>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center p-12 text-center">
        <Sh3ProgressSpinner size="small" />
        <p class="text-muted-foreground mt-3">Carregando módulos...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center p-12 text-center max-w-[500px]">
        <Sh3Message severity="error" :closable="false">
          {{ error }}
        </Sh3Message>
        <Sh3Button label="Tentar novamente" icon="pi pi-refresh" @click="reload" class="mt-3" />
      </div>

      <!-- Empty State -->
      <div v-else-if="modulos.length === 0" class="flex flex-col items-center justify-center p-16 text-center">
        <i class="pi pi-box text-6xl text-muted-foreground mb-3"></i>
        <h3 class="text-xl font-semibold text-muted-foreground">Nenhum módulo disponível</h3>
        <p class="text-muted-foreground">
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
  } catch  {
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
/* Animação customizada não disponível no Tailwind */
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

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>

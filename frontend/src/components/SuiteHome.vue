<template>
  <BaseLayout title="Bem-vindo ao Auth Suite" icon="pi pi-home">
    <div class="p-4 md:p-8 flex flex-col items-center min-h-[90vh]">
      <div class="flex items-center justify-center">
        <Sh3Welcome />
      </div>

      <div class="mt-6 w-full max-w-[600px]" v-if="currentUser">
        <div v-if="autarquias.length === 1" class="w-full animate-fade-in">
          <div
            class="bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-primary-foreground shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div class="flex items-center gap-3">
              <i class="pi pi-building text-4xl"></i>
              <div>
                <p class="text-sm opacity-90 mb-1 font-medium uppercase tracking-wide">Autarquia</p>
                <p class="text-2xl font-bold leading-tight">{{ autarquias[0]?.nome }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="autarquias.length > 1" class="w-full animate-fade-in">
          <div class="bg-card border-2 border-border rounded-xl p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <i class="pi pi-building text-3xl text-primary"></i>
              <span class="text-lg font-semibold text-foreground">Selecione a Autarquia</span>
            </div>

            <Sh3Select :field="{
              name: 'autarquia_ativa',
              label: '',
              type: 'select',
              placeholder: 'Escolha uma autarquia para trabalhar',
              options: autarquias,
              optionLabel: 'nome',
              optionValue: 'id'
            }" v-model="selectedAutarquiaId" @update:modelValue="handleAutarquiaChange"
              :disabled="changingAutarquia || autarquiaContextLoading" />

            <div v-if="changingAutarquia || autarquiaContextLoading"
              class="mt-4 p-4 flex items-center justify-center bg-muted rounded-lg text-primary text-sm font-medium animate-pulse">
              <Sh3ProgressSpinner size="small" />
              <span class="ml-2">Alterando autarquia e recarregando módulos...</span>
            </div>

            <div v-if="autarquiaAtiva" class="mt-4 pt-4 border-t border-border">
              <span class="flex items-center gap-2 text-success text-sm">
                <i class="pi pi-check-circle text-base"></i>
                Trabalhando em: <strong>{{ autarquiaAtiva.nome }}</strong>
              </span>
            </div>
          </div>
        </div>

        <Sh3LoadingState v-else-if="loadingAutarquias"
          class="w-full p-6 flex items-center justify-center text-muted-foreground text-sm">
          <Sh3ProgressSpinner size="small" />
          <span class="ml-2">Carregando autarquias...</span>
        </Sh3LoadingState>

        <div v-else class="w-full">
          <Sh3Message severity="warn" :closable="false">
            Você não está vinculado a nenhuma autarquia. Entre em contato com o administrador.
          </Sh3Message>
        </div>
      </div>

      <Sh3LoadingState v-if="loadingModulos" class="w-full flex flex-col items-center justify-center mt-12">
        <span class="text-muted-foreground mt-3">Carregando módulos...</span>
        <Sh3ProgressSpinner size="small" />
      </Sh3LoadingState>

      <Sh3ErrorState v-else-if="!loadingModulos && error" :message="error" buttonLabel="Tentar novamente"
        @retry="reload" />
      <Sh3EmptyState v-else-if="modulos.length === 0" icon="pi pi-box" iconClass="text-muted-foreground"
        title="Nenhum módulo disponível"
        description="Sua autarquia ainda não possui módulos liberados. Entre em contato com o administrador do sistema.">
        <Sh3Button label="Recarregar Módulos" icon="pi pi-refresh" @click="reload" />
      </Sh3EmptyState>

      <!-- Modules Grid - Cards com ícones e espaçamentos reduzidos -->
      <div v-else class="w-full max-w-6xl mt-6">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mt-4">
           <Sh3Card v-for="modulo in modulos" :key="modulo.id"
            class="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full"
            @click="handleItemClick(modulo.route)">
            
            <!-- Header com ícone -->
            <template #header>
              <div class="flex flex-col items-center text-center p-3 h-full">
                <div class="text-primary text-xl mb-1">
                  <component v-if="typeof modulo.icon !== 'string'" :is="modulo.icon" />
                  <i v-else :class="modulo.icon"></i>
                </div>
              </div>
            </template>
            
            <!-- Título -->
            <template #title>
              <h3 class="text-base font-semibold text-foreground line-clamp-2 leading-tight text-center">
                {{ modulo.nome }}
              </h3>
            </template>
            
            <!-- Subtítulo/Descrição -->
            <template #subtitle>
              <p class="text-muted-foreground text-sm leading-relaxed line-clamp-3 text-center">
                {{ modulo.descricao }}
              </p>
            </template>
            
            <!-- Footer com Acessar -->
            <template #footer>
              <div class="text-center">
                <span class="text-primary text-sm font-medium flex items-center justify-center gap-1">
                  Acessar
                  <i class="pi pi-arrow-right text-xs"></i>
                </span>
              </div>
            </template>
          </Sh3Card>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useModulos } from '@/composables/common/useModulos'
import { useNotification } from '@/composables/common/useNotification'
import { authService } from '@/services/auth.service'
import { userService, type AutarquiaWithPivot } from '@/services/user.service'
import { useAutarquiaStore } from '@/stores/autarquia.store'
import Sh3Welcome from './common/Sh3Welcome.vue'
import Sh3Select from './common/Sh3Select.vue'
import Sh3Card from './common/Sh3Card.vue'
import Sh3ProgressSpinner from './common/Sh3ProgressSpinner.vue'
import Sh3Message from './common/Sh3Message.vue'
import Sh3Button from './common/Sh3Button.vue'
import type { User } from '@/types/auth.types'
import BaseLayout from './layouts/BaseLayout.vue'
import Sh3LoadingState from './common/state/Sh3LoadingState.vue'
import Sh3EmptyState from './common/state/Sh3EmptyState.vue'
import Sh3ErrorState from './common/state/Sh3ErrorState.vue'

const { modulos, loadingModulos, error, reload } = useModulos()
const { showMessage } = useNotification()
const router = useRouter()

// Pinia centraliza o contexto da autarquia e reflete o valor salvo no backend
const autarquiaStore = useAutarquiaStore()
const { autarquiaId: storeAutarquiaId, autarquia: storeAutarquia, loading: autarquiaContextLoading } =
  storeToRefs(autarquiaStore)

const currentUser = ref<User | null>(null)
const autarquias = ref<AutarquiaWithPivot[]>([])
const selectedAutarquiaId = ref<number | null>(storeAutarquiaId.value ?? null)
const loadingAutarquias = ref(false)
const changingAutarquia = ref(false)

const autarquiaAtiva = computed(() => {
  if (storeAutarquia.value) {
    return storeAutarquia.value
  }

  if (!selectedAutarquiaId.value) return null
  return autarquias.value.find(a => a.id === selectedAutarquiaId.value) || null
})

async function loadUserAutarquias() {
  const user = authService.getUserFromStorage()
  if (!user || !user.id) {
    console.error('Usuário não encontrado')
    return
  }

  currentUser.value = user
  loadingAutarquias.value = true

  try {
    console.log('🔄 Carregando autarquias do usuário:', user.id)

    autarquias.value = await userService.getUserAutarquias(user.id)

    console.log('📦 Autarquias carregadas:', autarquias.value)

    const sessionAutarquia = await autarquiaStore.fetchAutarquia()

    if (!sessionAutarquia) {
      const fallbackAutarquia =
        autarquias.value.find(a => a.pivot.is_default) || autarquias.value[0] || null

      if (fallbackAutarquia) {
        await autarquiaStore.setAutarquia(fallbackAutarquia.id)
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
    const contexto = await autarquiaStore.setAutarquia(id)
    selectedAutarquiaId.value = id

    await reload()

    const autarquiaNome = contexto?.nome || autarquias.value.find(a => a.id === id)?.nome || 'Autarquia'
    showMessage('success', `Autarquia alterada para: ${autarquiaNome}`)
  } catch (error) {
    console.error('❌ Erro ao alterar autarquia:', error)
    selectedAutarquiaId.value = storeAutarquiaId.value ?? null
    showMessage('error', 'Erro ao alterar autarquia. Tente novamente.')
  } finally {
    changingAutarquia.value = false
  }
}

const handleItemClick = (route?: string) => {
  if (route) {
    router.push(route)
  }
}

onMounted(async () => {
  currentUser.value = authService.getUserFromStorage()
  await loadUserAutarquias()
})

watch(storeAutarquiaId, (newId) => {
  selectedAutarquiaId.value = newId ?? null
  if (newId && modulos.value.length === 0) {
    reload()
  }
})
</script>

<style scoped>
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
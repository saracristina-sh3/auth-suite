<template>
  <div class="liberacoes-tab">
    <Sh3Card>
      <template #title>Liberação de Módulos por Autarquia</template>
      <template #subtitle>
        Gerencie quais módulos cada autarquia tem acesso (contratos/planos)
      </template>
      <template #content>
        <!-- Loading State -->
        <Sh3LoadingState v-if="isLoading" message="Carregando dados..." />

        <!-- Error State -->
        <Sh3ErrorState
          v-else-if="error"
          :message="error"
          @retry="loadData"
        />

        <!-- Main Content -->
        <div v-else class="space-y-6">
          <!-- Autarquia Selection -->
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div class="flex-1 max-w-md">
              <label class="block text-sm font-medium text-foreground mb-2">
                Selecione a Autarquia
              </label>
              <select
                v-model="selectedAutarquiaId"
                :disabled="isSaving"
                class="w-full px-3 py-2 border border-input rounded bg-background text-foreground cursor-pointer transition-all duration-200 hover:border-border focus:border-ring focus:shadow-[0_0_0_2px] focus:shadow-ring/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option :value="null">Escolha uma autarquia...</option>
                <option
                  v-for="option in autarquiaOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- Bulk Actions -->
            <div v-if="selectedAutarquiaId" class="flex gap-2">
              <Sh3Button
                label="Selecionar Todos"
                icon="pi pi-check-square"
                severity="secondary"
                size="small"
                :disabled="isSaving || allModulesSelected"
                @click="selectAllModules"
              />
              <Sh3Button
                label="Limpar Todos"
                icon="pi pi-times"
                severity="secondary"
                size="small"
                :disabled="isSaving || noModulesSelected"
                @click="clearAllModules"
              />
            </div>
          </div>

          <!-- Empty State - No Autarquia Selected -->
          <Sh3EmptyState
            v-if="!selectedAutarquiaId"
            icon="pi pi-building"
            title="Nenhuma autarquia selecionada"
            message="Selecione uma autarquia acima para gerenciar seus módulos"
          />

          <!-- Modules Grid -->
          <div v-else-if="modulos.length > 0" class="space-y-4">

            <!-- Modules Table -->
            <div class="border border-border rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-muted/50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Módulo
                    </th>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-foreground">
                      Descrição
                    </th>
                    <th class="px-4 py-3 text-center text-sm font-semibold text-foreground w-32">
                      Status
                    </th>
                    <th class="px-4 py-3 text-center text-sm font-semibold text-foreground w-32">
                      Liberado
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr
                    v-for="modulo in filteredModulos"
                    :key="modulo.id"
                    class="hover:bg-muted/30 transition-colors"
                  >
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <span v-if="modulo.icone" :class="`pi ${modulo.icone} text-primary`"></span>
                        <span class="font-medium text-foreground">{{ modulo.nome }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-sm text-muted-foreground">
                        {{ modulo.descricao || '—' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <Sh3Tag
                        :value="modulo.ativo ? 'Ativo' : 'Inativo'"
                        :severity="modulo.ativo ? 'success' : 'danger'"
                      />
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-center">
                        <Sh3ToggleSwitch
                          :modelValue="liberacoes[modulo.id] || false"
                          :disabled="!modulo.ativo || isSaving"
                          @update:modelValue="(value) => toggleModulo(modulo.id, value)"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Summary -->
            <div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div class="flex items-center gap-4 text-sm">
                <span class="text-muted-foreground">
                  Total de módulos: <strong class="text-foreground">{{ modulos.length }}</strong>
                </span>
                <span class="text-muted-foreground">
                  Liberados: <strong class="text-jade-600">{{ liberadosCount }}</strong>
                </span>
                <span class="text-muted-foreground">
                  Bloqueados: <strong class="text-ruby-600">{{ bloqueadosCount }}</strong>
                </span>
              </div>

              <!-- Save Button -->
              <Sh3Button
                label="Salvar Alterações"
                icon="pi pi-save"
                :loading="isSaving"
                :disabled="!hasChanges"
                @click="saveChanges"
              />
            </div>
          </div>

          <!-- Empty State - No Modules -->
          <Sh3EmptyState
            v-else
            icon="pi pi-box"
            title="Nenhum módulo encontrado"
            message="Não há módulos cadastrados no sistema"
          />
        </div>
      </template>
    </Sh3Card>

    <!-- Success Message -->
    <Sh3Message
      v-if="successMessage"
      type="success"
      :message="successMessage"
      @close="successMessage = ''"
    />

    <!-- Error Message -->
    <Sh3Message
      v-if="errorMessage"
      type="error"
      :message="errorMessage"
      @close="errorMessage = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Sh3Card from '@/components/common/Sh3Card.vue'
import Sh3Button from '@/components/common/Sh3Button.vue'
import Sh3ToggleSwitch from '@/components/common/Sh3ToggleSwitch.vue'
import Sh3Tag from '@/components/common/Sh3Tag.vue'
import Sh3LoadingState from '@/components/common/state/Sh3LoadingState.vue'
import Sh3ErrorState from '@/components/common/state/Sh3ErrorState.vue'
import Sh3EmptyState from '@/components/common/state/Sh3EmptyState.vue'
import Sh3Message from '@/components/common/Sh3Message.vue'
import { autarquiaService } from '@/services/autarquia.service'
import { moduloService } from '@/services/modulos.service'
import { autarquiaModuloService, type BulkUpdateModulo } from '@/services/autarquia-modulo.service'
import type { Autarquia } from '@/types/support/autarquia.types'
import type { Modulo } from '@/types/support/modulos.types'

// Emits
defineEmits<{
  'tab-change': [event: any]
}>()

// State
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')
const errorMessage = ref('')

const autarquias = ref<Autarquia[]>([])
const modulos = ref<Modulo[]>([])
const selectedAutarquiaId = ref<number | null>(null)
// Liberações: Record<moduloId, isLiberado>
const liberacoes = ref<Record<number, boolean>>({})
const initialLiberacoes = ref<Record<number, boolean>>({})

// Computed
const autarquiaOptions = computed(() => {
  return autarquias.value
    .filter(a => a.ativo)
    .map(a => ({
      label: a.nome,
      value: a.id
    }))
})

const filteredModulos = computed(() => {
  return modulos.value
})

const liberadosCount = computed(() => {
  return Object.values(liberacoes.value).filter(v => v === true).length
})

const bloqueadosCount = computed(() => {
  return modulos.value.length - liberadosCount.value
})

const allModulesSelected = computed(() => {
  return modulos.value
    .filter(m => m.ativo)
    .every(m => liberacoes.value[m.id] === true)
})

const noModulesSelected = computed(() => {
  return modulos.value.every(m => liberacoes.value[m.id] !== true)
})

const hasChanges = computed(() => {
  return JSON.stringify(liberacoes.value) !== JSON.stringify(initialLiberacoes.value)
})

// Methods
async function loadData() {
  isLoading.value = true
  error.value = ''

  try {
    // Load autarquias and modulos in parallel
    const [autarquiasResponse, modulosResponse] = await Promise.all([
      autarquiaService.list({ per_page: 9999 }), // Buscar todos
      moduloService.list(undefined, { per_page: 9999 }) // Buscar todos
    ])

    autarquias.value = autarquiasResponse.data
    modulos.value = modulosResponse.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar dados'
    console.error('Erro ao carregar dados:', err)
  } finally {
    isLoading.value = false
  }
}

async function loadAutarquiaModulos(autarquiaId: number) {
  isLoading.value = true
  error.value = ''

  try {
    // Buscar liberações existentes desta autarquia
    const autarquiaModulos = await autarquiaModuloService.list(autarquiaId)

    // Criar um mapa de liberações: moduloId => ativo
    const liberacoesMap: Record<number, boolean> = {}

    // Primeiro, inicializar TODOS os módulos como false (não liberado)
    modulos.value.forEach(modulo => {
      liberacoesMap[modulo.id] = false
    })

    // Depois, atualizar com os valores reais do backend (se existirem)
    autarquiaModulos.forEach(am => {
      liberacoesMap[am.modulo_id] = am.ativo
    })

    // Atribuir ao estado
    liberacoes.value = liberacoesMap
    initialLiberacoes.value = { ...liberacoesMap }

    console.log(`[LiberacoesTab] Carregadas ${autarquiaModulos.length} liberações existentes para autarquia ${autarquiaId}`)
    console.log('[LiberacoesTab] Estado completo das liberações:', liberacoesMap)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar módulos da autarquia'
    console.error('Erro ao carregar módulos da autarquia:', err)
  } finally {
    isLoading.value = false
  }
}

function toggleModulo(moduloId: number, value: boolean) {
  liberacoes.value[moduloId] = value
  console.log(`[LiberacoesTab] Toggle módulo ${moduloId}:`, value)
}

function selectAllModules() {
  modulos.value
    .filter(m => m.ativo)
    .forEach(m => {
      liberacoes.value[m.id] = true
    })
  console.log('[LiberacoesTab] Todos os módulos ativos selecionados')
}

function clearAllModules() {
  modulos.value.forEach(m => {
    liberacoes.value[m.id] = false
  })
  console.log('[LiberacoesTab] Todos os módulos desmarcados')
}

async function saveChanges() {
  if (!selectedAutarquiaId.value) {
    errorMessage.value = 'Selecione uma autarquia'
    return
  }

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Preparar lista de módulos que mudaram de estado
    const modulosParaAtualizar: BulkUpdateModulo[] = []

    modulos.value.forEach(modulo => {
      const currentState = liberacoes.value[modulo.id] === true
      const initialState = initialLiberacoes.value[modulo.id] === true

      // Se houve mudança, adicionar à lista
      if (currentState !== initialState) {
        modulosParaAtualizar.push({
          modulo_id: modulo.id,
          ativo: currentState
        })
      }
    })

    if (modulosParaAtualizar.length === 0) {
      successMessage.value = 'Nenhuma alteração para salvar'
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
      return
    }

console.log(`[LiberacoesTab] Atualizando ${modulosParaAtualizar.length} módulos...`, modulosParaAtualizar)
console.log(`[LiberacoesTab] Requisição enviada:`, {
  autarquia_id: selectedAutarquiaId.value,
  modulos: modulosParaAtualizar
})
    // Chamar API para atualização em massa
    const result = await autarquiaModuloService.bulkUpdate(
      selectedAutarquiaId.value,
      modulosParaAtualizar
    )

    // Atualizar estado inicial
    initialLiberacoes.value = { ...liberacoes.value }

    // Mensagem de sucesso
  const totalAtualizados = result?.atualizados?.length || 0
const totalErros = result?.erros?.length || 0


   if (totalErros > 0) {
  successMessage.value = `✅ ${totalAtualizados} módulo(s) atualizado(s) com sucesso. ⚠️ ${totalErros} módulo(s) falharam.`
} else if (totalAtualizados > 0) {
  successMessage.value = `✅ ${totalAtualizados} módulo(s) atualizado(s) com sucesso!`
} else {
  successMessage.value = 'Nenhuma alteração para salvar.'
}

    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

    // Recarregar dados para garantir sincronização
    await loadAutarquiaModulos(selectedAutarquiaId.value)
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Erro ao salvar alterações'
    console.error('Erro ao salvar alterações:', err)
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})

// Watch for autarquia changes
watch(selectedAutarquiaId, (newId) => {
  if (newId) {
    loadAutarquiaModulos(newId)
  } else {
    liberacoes.value = {}
    initialLiberacoes.value = {}
  }
})
</script>

<style scoped>
.liberacoes-tab {
  @apply space-y-4;
}
</style>

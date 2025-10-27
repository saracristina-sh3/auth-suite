<template>
  <div class="liberacoes-tab">
    <Sh3Card>
      <template #title>Liberação de Módulos por Autarquia</template>
      <template #subtitle>
        Gerencie quais módulos cada autarquia tem acesso (contratos/planos)
      </template>
      <template #content>
        <Sh3LoadingState v-if="isLoading" message="Carregando dados..." />

        <Sh3ErrorState v-else-if="error" :message="error" @retry="loadData" />

        <div v-else class="space-y-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div class="flex-1 max-w-md">
              <Sh3Select v-model="selectedAutarquiaId" :field="{
                name: 'autarquia',
                label: 'Selecione a Autarquia',
                type: 'select',
                placeholder: 'Escolha uma autarquia...',
                options: autarquiaOptions,
                optionLabel: 'label',
                optionValue: 'value'
              }" />

            </div>

            <div v-if="selectedAutarquiaId" class="flex gap-2">
              <Sh3Button label="Selecionar Todos" icon="pi pi-check-square" severity="secondary" size="small"
                :disabled="isSaving || allModulesSelected" @click="selectAllModules" />
              <Sh3Button label="Limpar Todos" icon="pi pi-times" severity="secondary" size="small"
                :disabled="isSaving || noModulesSelected" @click="clearAllModules" />
            </div>
          </div>

          <Sh3EmptyState v-if="!selectedAutarquiaId" icon="pi pi-building" title="Nenhuma autarquia selecionada"
            message="Selecione uma autarquia acima para gerenciar seus módulos" />

          <div v-else-if="modulos.length > 0" class="space-y-4">

            <div class="border border-border rounded-lg overflow-hidden">
              <Sh3Table :items="filteredModulos" :columns="columns" :paginated="false">
                <template #column-ativo="{ data }">
                  <Sh3Tag :value="data.ativo ? 'Ativo' : 'Inativo'" :severity="data.ativo ? 'success' : 'danger'" />
                </template>
                <template #column-liberado="{ data }">
                  <Sh3ToggleSwitch :modelValue="liberacoes[data.id] || false" :disabled="!data.ativo || isSaving"
                    @update:modelValue="(value) => toggleModulo(data.id, value)" />
                </template>
              </Sh3Table>

            </div>

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

              <Sh3Button label="Salvar Alterações" icon="pi pi-save" :loading="isSaving" :disabled="!hasChanges"
                @click="saveChanges" />
            </div>
          </div>

          <Sh3EmptyState v-else icon="pi pi-box" title="Nenhum módulo encontrado"
            message="Não há módulos cadastrados no sistema" />
        </div>
      </template>
    </Sh3Card>

    <Sh3Message v-if="successMessage" type="success" closable @close="successMessage = ''">
      {{ successMessage }}
    </Sh3Message>

    <Sh3Message v-if="processedError" :type="processedError.severity === 'warning' ? 'warn' : processedError.severity"
      closable @close="processedError = null">
      <strong class="block">{{ processedError.title }}</strong>
      <p class="text-sm">{{ processedError.message }}</p>
      <small class="text-xs text-muted-foreground">{{ processedError.instruction }}</small>
    </Sh3Message>
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
import Sh3Select from '@/components/common/Sh3Select.vue'
import Sh3Table from '@/components/common/Sh3Table.vue'
import { autarquiaService } from '@/services/autarquia.service'
import { moduloService } from '@/services/modulos.service'
import { autarquiaModuloService, type BulkUpdateModulo } from '@/services/autarquia-modulo.service'
import {
  ERROR_MESSAGES,
  HTTP_ERROR_MAP,
  BUSINESS_ERROR_MESSAGES
} from '@/utils/error-messages'
import { ErrorType } from '@/types/common/error.types'

import type { Autarquia } from '@/types/support/autarquia.types'
import type { Modulo } from '@/types/support/modulos.types'

// Emits
defineEmits<{ 'tab-change': [event: any] }>()

// State
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')
const processedError = ref<null | {
  severity: string
  title: string
  message: string
  instruction?: string
}>(null)

const autarquias = ref<Autarquia[]>([])
const modulos = ref<Modulo[]>([])
const selectedAutarquiaId = ref<number | null>(null)
const liberacoes = ref<Record<number, boolean>>({})
const initialLiberacoes = ref<Record<number, boolean>>({})

// Computed
const autarquiaOptions = computed(() =>
  autarquias.value.filter(a => a.ativo).map(a => ({
    label: a.nome,
    value: a.id
  }))
)

const filteredModulos = computed(() => modulos.value)
const liberadosCount = computed(() => Object.values(liberacoes.value).filter(v => v).length)
const bloqueadosCount = computed(() => modulos.value.length - liberadosCount.value)
const allModulesSelected = computed(() => modulos.value.filter(m => m.ativo).every(m => liberacoes.value[m.id]))
const noModulesSelected = computed(() => modulos.value.every(m => !liberacoes.value[m.id]))
const hasChanges = computed(() => JSON.stringify(liberacoes.value) !== JSON.stringify(initialLiberacoes.value))

const columns = [
  { field: 'nome', header: 'Módulo' },
  { field: 'descricao', header: 'Descrição' },
  { field: 'ativo', header: 'Status', type: 'boolean' as const },
  { field: 'liberado', header: 'Liberado' }
]


// 🧩 Utilitário para processar erros padronizados
function processError(err: any) {
  let errorType: ErrorType = ErrorType.UNKNOWN

  // Erros HTTP
  if (err?.response?.status) {
    const status = err.response.status
    errorType = HTTP_ERROR_MAP[status] || ErrorType.SERVER
  }

  // Erros de rede
  else if (err?.message?.includes('Network Error')) {
    errorType = ErrorType.NETWORK
  }

  // Erros de negócio (mensagem vinda do backend)
  const businessKey = err?.response?.data?.error || err?.response?.data?.code
  if (businessKey && BUSINESS_ERROR_MESSAGES[businessKey]) {
    return BUSINESS_ERROR_MESSAGES[businessKey]
  }

  // Fallback — erro genérico mapeado
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ErrorType.UNKNOWN]
}

// Métodos
async function loadData() {
  isLoading.value = true
  error.value = ''
  try {
    const [autarquiasResponse, modulosResponse] = await Promise.all([
      autarquiaService.list({ per_page: 9999 }),
      moduloService.list(undefined, { per_page: 9999 })
    ])
    autarquias.value = autarquiasResponse.data
    modulos.value = modulosResponse.data
  } catch (err: any) {
    const friendly = processError(err)
    processedError.value = friendly
    error.value = friendly.message
  } finally {
    isLoading.value = false
  }
}

async function loadAutarquiaModulos(autarquiaId: number) {
  isLoading.value = true
  try {
    const autarquiaModulos = await autarquiaModuloService.list(autarquiaId)
    const map: Record<number, boolean> = {}
    modulos.value.forEach(m => (map[m.id] = false))
    autarquiaModulos.forEach(am => (map[am.modulo_id] = am.ativo))
    liberacoes.value = map
    initialLiberacoes.value = { ...map }
  } catch (err: any) {
    const friendly = processError(err)
    processedError.value = friendly
    error.value = friendly.message
  } finally {
    isLoading.value = false
  }
}

function toggleModulo(moduloId: number, value: boolean) {
  liberacoes.value[moduloId] = value
}

function selectAllModules() {
  modulos.value.filter(m => m.ativo).forEach(m => (liberacoes.value[m.id] = true))
}

function clearAllModules() {
  modulos.value.forEach(m => (liberacoes.value[m.id] = false))
}

async function saveChanges() {
  if (!selectedAutarquiaId.value) {
    processedError.value = ERROR_MESSAGES[ErrorType.VALIDATION]
    return
  }

  isSaving.value = true
  processedError.value = null
  successMessage.value = ''

  try {
    const modulosParaAtualizar: BulkUpdateModulo[] = []
    modulos.value.forEach(m => {
      const current = !!liberacoes.value[m.id]
      const initial = !!initialLiberacoes.value[m.id]
      if (current !== initial) modulosParaAtualizar.push({ modulo_id: m.id, ativo: current })
    })

    if (!modulosParaAtualizar.length) {
      successMessage.value = 'Nenhuma alteração para salvar.'
      return
    }

    const result = await autarquiaModuloService.bulkUpdate(selectedAutarquiaId.value, modulosParaAtualizar)
    initialLiberacoes.value = { ...liberacoes.value }

    const totalAtualizados = result?.atualizados?.length || 0
    const totalErros = result?.erros?.length || 0

    successMessage.value =
      totalErros > 0
        ? `✅ ${totalAtualizados} módulo(s) atualizado(s). ⚠️ ${totalErros} falharam.`
        : `✅ ${totalAtualizados} módulo(s) atualizado(s) com sucesso!`
  } catch (err: any) {
    processedError.value = processError(err)
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(loadData)
watch(selectedAutarquiaId, newId => newId && loadAutarquiaModulos(newId))
</script>


<style scoped>
.liberacoes-tab {
  @apply space-y-4;
}
</style>

<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" @click.self="close">
      <div class="bg-card text-card-foreground rounded-[var(--radius)] max-w-[90%] p-6 shadow-2xl" :style="{ width: dialogWidth }">
        <header class="flex justify-between items-center border-b border-border mb-4 pb-3">
          <h2 class="text-card-foreground text-xl font-semibold">{{ editingItem ? `Editar ${entityName}` : `Novo ${entityName}` }}</h2>
          <button class="bg-transparent border-none text-2xl cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground" @click="close">×</button>
        </header>

        <form @submit.prevent="save" class="p-fluid modal-body">
          <div
            v-for="field in fields"
            :key="field.name"
            :class="['field', field.type === 'checkbox' ? 'field-checkbox' : '']"
          >
            <!-- Campos de texto, email, password -->
            <template v-if="['text', 'email', 'password'].includes(field.type)">
              <label :for="field.name" class="block font-medium mb-1 text-foreground">
                {{ field.label }}
                <span v-if="field.required" class="text-destructive">*</span>
              </label>
              <input
                :id="field.name"
                v-model="formData[field.name]"
                :type="field.type"
                :required="field.required"
                class="w-full border border-input p-2 rounded bg-background text-foreground focus:outline-none focus:border-input-focus focus:ring-2 focus:ring-ring"
              />
            </template>

            <!-- Campo textarea -->
            <template v-else-if="field.type === 'textarea'">
              <label :for="field.name" class="block font-medium mb-1 text-foreground">
                {{ field.label }}
              </label>
              <textarea
                :id="field.name"
                v-model="(formData[field.name] as string)"
                :rows="field.rows || 3"
                class="w-full border border-input p-2 rounded bg-background text-foreground focus:outline-none focus:border-input-focus focus:ring-2 focus:ring-ring"
              ></textarea>
            </template>

            <!-- Campo checkbox -->
            <template v-else-if="field.type === 'checkbox'">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="formData[field.name]" />
                {{ field.label }}
              </label>
            </template>

            <!-- Campo select - CORRIGIDO -->
            <template v-else-if="field.type === 'select'">
              <Sh3Select
                :field="field"
                :modelValue="formData[field.name]"
                @update:modelValue="(value) => formData[field.name] = value"
                class="w-full"
              />
            </template>
          </div>

          <footer class="flex justify-end gap-4 mt-4 pt-4 border-t border-border">
            <button
              type="button"
              class="bg-transparent border border-border text-foreground px-4 py-2 rounded-[var(--radius)] cursor-pointer transition-all duration-200 hover:bg-accent hover:border-border disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSaving"
              @click="close"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-primary text-primary-foreground border-none px-4 py-2 rounded-[var(--radius)] cursor-pointer transition-all duration-200 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              :disabled="isSaving"
            >
              <i v-if="isSaving" class="pi pi-spin pi-spinner text-sm"></i>
              <span>{{ isSaving ? 'Salvando...' : (editingItem ? 'Atualizar' : 'Criar') }}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Sh3Select from './Sh3Select.vue'
import { useConfirmDialog } from '@/composables/common/useConfirmDialog'
import type { FieldConfig } from '@/types/common/table.types'

/**
 * Tipo genérico para dados do formulário
 */
type FormData = Record<string, unknown>

/**
 * Interface de props do componente
 */
interface Props {
  entityName: string
  fields: FieldConfig[]
  dialogWidth?: string
}

/**
 * Recebendo props tipadas com valores padrão (forma correta)
 */
const { entityName, fields, dialogWidth = '700px' } = defineProps<Props>()

/**
 * Emite o evento de salvamento
 */
const emit = defineEmits<{
  save: [data: FormData]
}>()

/**
 * Estado reativo principal
 */
const isOpen = ref(false)
const editingItem = ref<FormData | null>(null)
const formData = reactive<FormData>({})
const isSaving = ref(false)

/**
 * Composable de confirmação
 */
const { confirmDeactivate, confirmActivate } = useConfirmDialog()

/**
 * Inicializa os valores padrão do formData sempre que os campos mudarem
 */
watch(
  () => fields,
  (newFields) => {
    newFields.forEach((field) => {
      if (!(field.name in formData)) {
        formData[field.name] =
          field.defaultValue !== undefined
            ? field.defaultValue
            : getDefaultValue(field.type, field.multiple)
      }
    })
  },
  { immediate: true }
)

/**
 * Função auxiliar para definir valores padrão conforme o tipo
 */
function getDefaultValue(type: string, multiple?: boolean): unknown {
  switch (type) {
    case 'checkbox':
      return false
    case 'select':
      return multiple ? [] : null
    default:
      return ''
  }
}

/**
 * Abre o formulário (modo criar ou editar)
 */
function open(item?: FormData) {
  if (item) {
    editingItem.value = item
    fields.forEach((field) => {
      formData[field.name] =
        item[field.name] ?? field.defaultValue ?? getDefaultValue(field.type, field.multiple)
    })
  } else {
    editingItem.value = null
    fields.forEach((field) => {
      formData[field.name] =
        field.defaultValue ?? getDefaultValue(field.type, field.multiple)
    })
  }
  isOpen.value = true
}

/**
 * Fecha o diálogo e reseta os dados
 */
function close() {
  isOpen.value = false
  editingItem.value = null
  fields.forEach((field) => {
    formData[field.name] =
      field.defaultValue ?? getDefaultValue(field.type, field.multiple)
  })
}

/**
 * Prepara os dados para salvar
 */
function prepareData(): Record<string, any> {
  const data: Record<string, any> = {}

  fields.forEach((field) => {
    if (
      field.type === 'password' &&
      !formData[field.name] &&
      editingItem.value
    ) {
      return
    }
    data[field.name] = formData[field.name]
  })

  if (editingItem.value?.id) {
    data.id = editingItem.value.id
  }

  return data
}

/**
 * Executa o salvamento sem confirmação
 */
async function executeSave(data: Record<string, any>) {
  try {
    isSaving.value = true
    emit('save', data)
    // Aguardar um pouco para garantir que o salvamento foi processado
    await new Promise(resolve => setTimeout(resolve, 500))
    close()
  } finally {
    isSaving.value = false
  }
}

/**
 * Salva o item (emitindo o evento 'save')
 * Verifica se há mudança de status e solicita confirmação se necessário
 */
async function save() {
  const data = prepareData()

  // Verificar se está editando e se há mudança de status
  if (editingItem.value) {
    // Verificar campo is_active (usuários)
    const hasIsActive = 'is_active' in formData
    const hasAtivo = 'ativo' in formData

    if (hasIsActive) {
      const oldStatus = editingItem.value.is_active
      const newStatus = formData.is_active

      if (oldStatus !== newStatus) {
        const itemName = String(formData.name || formData.nome || 'Item')
        const itemDetails: Record<string, string> = {
          'ID': String((editingItem.value as any).id || ''),
          'Nome': itemName
        }

        if (formData.email) itemDetails['Email'] = String(formData.email)
        if (formData.cpf) itemDetails['CPF'] = String(formData.cpf)

        if (newStatus) {
          confirmActivate(itemName, () => executeSave(data), itemDetails)
        } else {
          confirmDeactivate(itemName, () => executeSave(data), itemDetails)
        }
        return
      }
    }

    // Verificar campo ativo (autarquias e módulos)
    if (hasAtivo) {
      const oldStatus = editingItem.value.ativo
      const newStatus = formData.ativo

      if (oldStatus !== newStatus) {
        const itemName = String(formData.nome || formData.name || 'Item')
        const itemDetails: Record<string, string> = {
          'ID': String((editingItem.value as any).id || ''),
          'Nome': itemName
        }

        if (newStatus) {
          confirmActivate(itemName, () => executeSave(data), itemDetails)
        } else {
          confirmDeactivate(itemName, () => executeSave(data), itemDetails)
        }
        return
      }
    }
  }

  // Se não há mudança de status ou não está editando, salva diretamente
  executeSave(data)
}

/**
 * Expõe métodos ao componente pai
 */
defineExpose({
  open,
  close,
})
</script>

<style scoped>
/* Transições Vue necessárias */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
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
                v-model="formData[field.name]"
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
            <button type="button" class="bg-transparent border border-border text-foreground px-4 py-2 rounded-[var(--radius)] cursor-pointer transition-all duration-200 hover:bg-accent hover:border-border" @click="close">Cancelar</button>
            <button type="submit" class="bg-primary text-primary-foreground border-none px-4 py-2 rounded-[var(--radius)] cursor-pointer transition-all duration-200 hover:bg-primary-hover">
              {{ editingItem ? 'Atualizar' : 'Criar' }}
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

/**
 * Interface que define cada campo dinâmico do formulário
 */
interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  placeholder?: string
  autofocus?: boolean
  rows?: number
  options?: any[]
  optionLabel?: string
  optionValue?: string
  defaultValue?: any
  multiple?: boolean     
  searchable?: boolean 
}

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
  save: [data: Record<string, any>]
}>()

/**
 * Estado reativo principal
 */
const isOpen = ref(false)
const editingItem = ref<Record<string, any> | null>(null)
const formData = reactive<Record<string, any>>({})

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
function getDefaultValue(type: string, multiple?: boolean): any {
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
function open(item?: Record<string, any>) {
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
 * Salva o item (emitindo o evento 'save')
 */
function save() {
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

  emit('save', data)
  close()
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
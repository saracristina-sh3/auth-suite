<template>
  <transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-content" :style="{ width: dialogWidth }">
        <header class="modal-header">
          <h2>{{ editingItem ? `Editar ${entityName}` : `Novo ${entityName}` }}</h2>
          <button class="close-btn" @click="close">×</button>
        </header>

        <form @submit.prevent="save" class="p-fluid modal-body">
          <div
            v-for="field in fields"
            :key="field.name"
            :class="['field', field.type === 'checkbox' ? 'field-checkbox' : '']"
          >
            <!-- Campos de texto, email, password -->
            <template v-if="['text', 'email', 'password'].includes(field.type)">
              <label :for="field.name" class="block font-medium mb-1">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>
              <input
                :id="field.name"
                v-model="formData[field.name]"
                :type="field.type"
                :required="field.required"
                class="w-full border p-2 rounded"
              />
            </template>

            <!-- Campo textarea -->
            <template v-else-if="field.type === 'textarea'">
              <label :for="field.name" class="block font-medium mb-1">
                {{ field.label }}
              </label>
              <textarea
                :id="field.name"
                v-model="formData[field.name]"
                :rows="field.rows || 3"
                class="w-full border p-2 rounded"
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

          <footer class="modal-footer">
            <button type="button" class="btn-cancel" @click="close">Cancelar</button>
            <button type="submit" class="btn-save">
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
            : getDefaultValue(field.type)
      }
    })
  },
  { immediate: true }
)

/**
 * Função auxiliar para definir valores padrão conforme o tipo
 */
function getDefaultValue(type: string): any {
  switch (type) {
    case 'checkbox':
      return false
    case 'select':
      return null
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
        item[field.name] ?? field.defaultValue ?? getDefaultValue(field.type)
    })
  } else {
    editingItem.value = null
    fields.forEach((field) => {
      formData[field.name] =
        field.defaultValue ?? getDefaultValue(field.type)
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
      field.defaultValue ?? getDefaultValue(field.type)
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
/* Seus estilos permanecem os mesmos */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  border-radius: 10px;
  max-width: 90%;
  padding: 1.5rem;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
.btn-cancel {
  background: transparent;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
}
.btn-save {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
}
</style>
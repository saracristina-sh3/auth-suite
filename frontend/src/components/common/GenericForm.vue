<template>
  <Dialog
    v-model:visible="isOpen"
    :header="editingItem ? `Editar ${entityName}` : `Novo ${entityName}`"
    :modal="true"
    :style="{ width: dialogWidth }"
  >
    <form @submit.prevent="save" class="p-fluid">
      <!-- Campos dinâmicos -->
      <div
        v-for="field in fields"
        :key="field.name"
        :class="field.type === 'checkbox' ? 'field-checkbox' : 'field'"
      >
        <!-- Campo de texto -->
        <template v-if="field.type === 'text' || field.type === 'email' || field.type === 'password'">
          <label :for="field.name" class="block text-900 font-medium mb-2">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <InputText
            v-if="field.type !== 'password'"
            :id="field.name"
            v-model="formData[field.name]"
            :type="field.type"
            :required="field.required"
            :placeholder="field.placeholder"
            :autofocus="field.autofocus"
            class="w-full"
          />
          <Password
            v-else
            :id="field.name"
            v-model="formData[field.name]"
            :feedback="false"
            toggleMask
            :required="field.required && !editingItem"
            :placeholder="field.placeholder"
            class="w-full"
          />
        </template>

        <!-- Campo de textarea -->
        <template v-else-if="field.type === 'textarea'">
          <label :for="field.name" class="block text-900 font-medium mb-2">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <Textarea
            :id="field.name"
            v-model="formData[field.name]"
            :required="field.required"
            :placeholder="field.placeholder"
            :rows="field.rows || 3"
            class="w-full"
          />
        </template>

        <!-- Campo de dropdown/select -->
        <template v-else-if="field.type === 'select'">
          <label :for="field.name" class="block text-900 font-medium mb-2">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <Select
            :id="field.name"
            v-model="formData[field.name]"
            :options="field.options || []"
            :optionLabel="field.optionLabel || 'label'"
            :optionValue="field.optionValue || 'value'"
            :placeholder="field.placeholder || 'Selecione uma opção'"
            :required="field.required"
            class="w-full"
          />
        </template>

        <!-- Campo de checkbox -->
        <template v-else-if="field.type === 'checkbox'">
          <Checkbox
            :id="field.name"
            v-model="formData[field.name]"
            :binary="true"
          />
          <label :for="field.name" class="ml-2">{{ field.label }}</label>
        </template>

        <!-- Slot customizado para campos especiais -->
        <slot :name="`field-${field.name}`" :formData="formData" :field="field"></slot>
      </div>
    </form>

    <template #footer>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        class="p-button-text"
        @click="close"
      />
      <Button
        :label="editingItem ? 'Atualizar' : 'Criar'"
        icon="pi pi-check"
        @click="save"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'

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

interface Props {
  entityName: string 
  fields: FieldConfig[]
  dialogWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  dialogWidth: '700px'
})

const isOpen = ref(false)
const editingItem = ref<any>(null)
const formData = reactive<Record<string, any>>({})

// Inicializa formData com valores padrão
watch(() => props.fields, (fields) => {
  fields.forEach(field => {
    if (!(field.name in formData)) {
      formData[field.name] = field.defaultValue !== undefined ? field.defaultValue : getDefaultValue(field.type)
    }
  })
}, { immediate: true })

function getDefaultValue(type: string): any {
  switch (type) {
    case 'checkbox':
      return true
    case 'text':
    case 'email':
    case 'password':
    case 'textarea':
      return ''
    case 'select':
      return null
    default:
      return null
  }
}

function open(item?: any) {
  if (item) {
    editingItem.value = item
    // Preenche o formulário com os dados do item
    props.fields.forEach(field => {
      formData[field.name] = item[field.name] !== undefined ? item[field.name] : getDefaultValue(field.type)
    })
  } else {
    editingItem.value = null
    // Reseta o formulário com valores padrão
    props.fields.forEach(field => {
      formData[field.name] = field.defaultValue !== undefined ? field.defaultValue : getDefaultValue(field.type)
    })
  }
  isOpen.value = true
}

function close() {
  isOpen.value = false
  editingItem.value = null
  // Reseta o formulário
  props.fields.forEach(field => {
    formData[field.name] = field.defaultValue !== undefined ? field.defaultValue : getDefaultValue(field.type)
  })
}

function save() {
  const data: any = {}

  // Copia apenas os campos configurados
  props.fields.forEach(field => {
    // Para senha, só inclui se não estiver vazia
    if (field.type === 'password' && !formData[field.name] && editingItem.value) {
      return
    }
    data[field.name] = formData[field.name]
  })

  if (editingItem.value) {
    data.id = editingItem.value.id
  }

  emit('save', data)
  close()
}

const emit = defineEmits<{
  save: [data: any]
}>()

defineExpose({
  open,
  close
})
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}

.field-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
</style>

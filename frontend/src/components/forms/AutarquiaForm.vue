<template>
  <Sh3ModalForm
    v-model="isOpen"
    :title="editingAutarquia ? 'Editar Autarquia' : 'Nova Autarquia'"
    icon="pi pi-building"
    :loading="isSaving"
    :disabled="!isFormValid"
    submitLabel="Salvar"
    loadingLabel="Salvando..."
    @submit="handleSubmit"
  >
    <div class="field">
      <label for="nome" class="block font-medium mb-1 text-foreground">
        Nome <span class="text-destructive">*</span>
      </label>
      <input
        id="nome"
        v-model="formData.nome"
        type="text"
        required
        placeholder="Ex: Prefeitura Municipal de..."
        :class="[
          'w-full border p-2 rounded bg-background text-foreground focus:outline-none focus:ring-2',
          errors.nome
            ? 'border-destructive focus:ring-destructive'
            : 'border-input focus:border-input-focus focus:ring-ring'
        ]"
        @blur="validateField('nome')"
        @input="clearError('nome')"
      />
      <span v-if="errors.nome" class="text-destructive text-sm mt-1">{{
        errors.nome
      }}</span>
    </div>

    <div class="field field-checkbox">
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="formData.ativo" class="w-4 h-4" />
        <span class="text-foreground">Autarquia Ativa</span>
      </label>
      <span class="text-muted-foreground text-xs ml-6">
        Autarquias inativas não poderão ser acessadas por usuários
      </span>
    </div>
  </Sh3ModalForm>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { Autarquia } from '@/types/support/autarquia.types'
import Sh3ModalForm from '@/components/common/modal/Sh3ModalForm.vue'

const emit = defineEmits<{
  save: [data: Partial<Autarquia>]
}>()

const isOpen = ref(false)
const editingAutarquia = ref<Autarquia | null>(null)
const isSaving = ref(false)

const formData = reactive({
  nome: '',
  ativo: true,
})

const errors = reactive<Record<string, string>>({
  nome: '',
})

const validateField = (fieldName: keyof typeof formData) => {
  errors[fieldName] = ''
  switch (fieldName) {
    case 'nome':
      if (!formData.nome || formData.nome.trim().length < 3)
        errors.nome = 'Nome deve ter pelo menos 3 caracteres'
      else if (formData.nome.length > 100)
        errors.nome = 'Nome não pode ter mais de 100 caracteres'
      break
  }
}

const clearError = (fieldName: string) => {
  errors[fieldName] = ''
}

const isFormValid = computed(() => {
  if (!formData.nome || formData.nome.trim().length < 3) return false
  return !Object.values(errors).some((e) => e !== '')
})

const open = (autarquia?: Autarquia) => {
  if (autarquia) {
    editingAutarquia.value = autarquia
    formData.nome = autarquia.nome || ''
    formData.ativo = autarquia.ativo ?? true
  } else {
    editingAutarquia.value = null
    formData.nome = ''
    formData.ativo = true
  }

  Object.keys(errors).forEach((k) => (errors[k] = ''))
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  editingAutarquia.value = null
}

const handleSubmit = async () => {
  validateField('nome')
  if (!isFormValid.value) return

  try {
    isSaving.value = true

    const data: Partial<Autarquia> = {
      nome: formData.nome.trim(),
      ativo: formData.ativo,
    }

    if (editingAutarquia.value?.id) data.id = editingAutarquia.value.id

    emit('save', data)
    await new Promise((r) => setTimeout(r, 500))
    close()
  } finally {
    isSaving.value = false
  }
}

defineExpose({ open, close })
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}
.field-checkbox {
  margin-bottom: 0.5rem;
}
</style>

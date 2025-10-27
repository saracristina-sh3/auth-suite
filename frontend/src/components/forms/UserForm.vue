<template>
  <Sh3ModalForm v-model="isOpen" :title="editingUser ? 'Editar Usuário' : 'Novo Usuário'" icon="pi pi-building"
    :loading="isSaving" :disabled="!isFormValid" submitLabel="Salvar" loadingLabel="Salvando..." @submit="handleSubmit">
    <div class="field">
      <label for="name" class="block font-medium mb-1 text-foreground">
        Nome <span class="text-destructive">*</span>
      </label>
      <input id="name" v-model="formData.name" type="text" required :class="[
        'w-full border p-2 rounded bg-background text-foreground focus:outline-none focus:ring-2',
        errors.name ? 'border-destructive focus:ring-destructive' : 'border-input focus:border-input-focus focus:ring-ring'
      ]" @blur="validateField('name')" @input="clearError('name')" />
      <span v-if="errors.name" class="text-destructive text-sm mt-1">{{ errors.name }}</span>
    </div>

    <div class="field">
      <label for="email" class="block font-medium mb-1 text-foreground">
        Email <span class="text-destructive">*</span>
      </label>
      <input id="email" v-model="formData.email" type="email" required :class="[
        'w-full border p-2 rounded bg-background text-foreground focus:outline-none focus:ring-2',
        errors.email ? 'border-destructive focus:ring-destructive' : 'border-input focus:border-input-focus focus:ring-ring'
      ]" @blur="validateField('email')" @input="clearError('email')" />
      <span v-if="errors.email" class="text-destructive text-sm mt-1">{{ errors.email }}</span>
    </div>

    <div class="field">
      <label for="cpf" class="block font-medium mb-1 text-foreground">
        CPF <span class="text-destructive">*</span>
      </label>
      <input id="cpf" v-model="formData.cpf" type="text" required placeholder="000.000.000-00" maxlength="14" :class="[
        'w-full border p-2 rounded bg-background text-foreground focus:outline-none focus:ring-2',
        errors.cpf ? 'border-destructive focus:ring-destructive' : 'border-input focus:border-input-focus focus:ring-ring'
      ]" @input="handleCpfInput" @blur="validateField('cpf')" />
      <span v-if="errors.cpf" class="text-destructive text-sm mt-1">{{ errors.cpf }}</span>
    </div>

    <div class="field">
      <label for="password" class="block font-medium mb-1 text-foreground">
        Senha {{ !editingUser ? '' : '(deixe em branco para não alterar)' }}
        <span v-if="!editingUser" class="text-destructive">*</span>
      </label>
      <input id="password" v-model="formData.password" type="password" :required="!editingUser" :class="[
        'w-full border p-2 rounded bg-background text-foreground focus:outline-none focus:ring-2',
        errors.password ? 'border-destructive focus:ring-destructive' : 'border-input focus:border-input-focus focus:ring-ring'
      ]" @blur="validateField('password')" @input="clearError('password')" />
      <span v-if="errors.password" class="text-destructive text-sm mt-1">{{ errors.password }}</span>
    </div>

    <div class="field">
      <label for="role" class="block font-medium mb-1 text-foreground">
        Perfil <span class="text-destructive">*</span>
      </label>
      <select id="role" v-model="formData.role" required :class="[
        'w-full border p-2 rounded bg-background text-foreground focus:outline-none focus:ring-2',
        errors.role ? 'border-destructive focus:ring-destructive' : 'border-input focus:border-input-focus focus:ring-ring'
      ]" @blur="validateField('role')" @change="clearError('role')">
        <option value="">Selecione um perfil</option>
        <option v-for="role in roles" :key="role.value" :value="role.value">
          {{ role.label }}
        </option>
      </select>
      <span v-if="errors.role" class="text-destructive text-sm mt-1">{{ errors.role }}</span>
    </div>

    <div class="field">
      <Sh3Select v-model="formData.autarquias" :field="{
        name: 'autarquias',
        label: 'Autarquias',
        multiple: true,
        required: true,
        placeholder: 'Selecione uma ou mais autarquias',
        options: autarquias,
        optionLabel: 'nome',
        optionValue: 'id'
      }" @update:modelValue="handleAutarquiasChange" />
      <span v-if="errors.autarquias" class="text-destructive text-sm mt-1">{{ errors.autarquias }}</span>
      <span class="text-muted-foreground text-xs mt-1 block">
        Todas as autarquias que o usuário pode acessar.
      </span>

    </div>

    <div class="field">
      <Sh3Select v-model="formData.autarquia_preferida_id" :field="{
        name: 'autarquia_preferida_id',
        label: 'Autarquia Preferida',
        required: true,
        disabled: selectedAutarquias.length === 0,
        placeholder: 'Selecione a autarquia preferida',
        options: selectedAutarquias,
        optionLabel: 'nome',
        optionValue: 'id'
      }" @update:modelValue="clearError('autarquia_preferida_id')" />
      <span v-if="errors.autarquia_preferida_id" class="text-destructive text-sm mt-1">{{ errors.autarquia_preferida_id
        }}</span>
      <span class="text-muted-foreground text-xs mt-1 block">
        Autarquia padrão ao fazer login. Deve estar entre as autarquias selecionadas acima.
      </span>

    </div>

    <div class="field field-checkbox">
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="formData.is_active" class="w-4 h-4" />
        <span class="text-foreground">Usuário Ativo</span>
      </label>
    </div>
  </Sh3ModalForm>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Sh3ModalForm from '@/components/common/modal/Sh3ModalForm.vue'
import type { User } from '@/types/common/user.types'
import type { Role } from '@/services/role.service'
import type { Autarquia } from '@/types/support/autarquia.types'

import {
  validateCPF,
  formatCPF,
  validateEmail,
  validateRequired,
  validateMinLength,
  validationMessages,
  removeNonDigits
} from '@/utils/validators'

const props = defineProps<{
  roles: Role[]
  autarquias: Autarquia[]
}>()

const emit = defineEmits<{ save: [data: Partial<User>] }>()

const isOpen = ref(false)
const editingUser = ref<User | null>(null)
const isSaving = ref(false)

const formData = reactive({
  name: '',
  email: '',
  cpf: '',
  password: '',
  role: '',
  autarquias: [] as number[],
  autarquia_preferida_id: null as number | null,
  is_active: true
})

const errors = reactive<Record<string, string>>({
  name: '',
  email: '',
  cpf: '',
  password: '',
  role: '',
  autarquias: '',
  autarquia_preferida_id: ''
})

const selectedAutarquias = computed(() =>
  props.autarquias.filter((a) => formData.autarquias.includes(a.id))
)

const handleCpfInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  formData.cpf = formatCPF(input.value)
  clearError('cpf')
}

const handleAutarquiasChange = () => {
  clearError('autarquias')
  if (
    formData.autarquia_preferida_id &&
    !formData.autarquias.includes(formData.autarquia_preferida_id)
  ) {
    formData.autarquia_preferida_id = null
    clearError('autarquia_preferida_id')
  }
  if (formData.autarquias.length === 1) {
    formData.autarquia_preferida_id = formData.autarquias[0] ?? null
  }
}

const validateField = (field: keyof typeof formData) => {
  errors[field] = ''

  switch (field) {
    case 'name':
      if (!validateRequired(formData.name))
        errors.name = validationMessages.required
      else if (!validateMinLength(formData.name, 3))
        errors.name = validationMessages.minLength(3)
      break

    case 'email':
      if (!validateRequired(formData.email))
        errors.email = validationMessages.email.required
      else if (!validateEmail(formData.email))
        errors.email = validationMessages.email.invalid
      break

    case 'cpf':
      const cpfClean = removeNonDigits(formData.cpf)
      if (!validateRequired(formData.cpf))
        errors.cpf = validationMessages.cpf.required
      else if (!validateCPF(cpfClean))
        errors.cpf = validationMessages.cpf.invalid
      break

    case 'password':
      if (!editingUser.value && !validateRequired(formData.password))
        errors.password = validationMessages.required
      else if (
        formData.password &&
        !validateMinLength(formData.password, 6)
      )
        errors.password = validationMessages.minLength(6)
      break

    case 'role':
      if (!validateRequired(formData.role))
        errors.role = validationMessages.required
      break

    case 'autarquias':
      if (!validateRequired(formData.autarquias))
        errors.autarquias = validationMessages.required
      break

    case 'autarquia_preferida_id':
      if (!validateRequired(formData.autarquia_preferida_id))
        errors.autarquia_preferida_id = validationMessages.required
      else if (
        !formData.autarquias.includes(formData.autarquia_preferida_id!)
      )
        errors.autarquia_preferida_id =
          'A autarquia preferida deve estar entre as autarquias selecionadas'
      break
  }
}

const clearError = (field: string) => (errors[field] = '')

const isFormValid = computed(() => {
  const requiredFields = ['name', 'email', 'cpf', 'role', 'autarquias', 'autarquia_preferida_id']
  for (const field of requiredFields) {
    if (!validateRequired((formData as any)[field])) return false
  }
  if (!editingUser.value && !formData.password) return false
  return !Object.values(errors).some((e) => e !== '')
})

const open = (user?: User) => {
  editingUser.value = user ?? null
  formData.name = user?.name ?? ''
  formData.email = user?.email ?? ''
  formData.cpf = user?.cpf ? formatCPF(user.cpf) : ''
  formData.password = ''
  formData.role = user?.role ?? ''
  formData.autarquias = (user as any)?.autarquias ?? []
  formData.autarquia_preferida_id = user?.autarquia_preferida_id ?? null
  formData.is_active = user?.is_active ?? true
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
  editingUser.value = null
}

const handleSubmit = async () => {
  ;[
    'name',
    'email',
    'cpf',
    'password',
    'role',
    'autarquias',
    'autarquia_preferida_id'
  ].forEach((f) => validateField(f as keyof typeof formData))

  if (!isFormValid.value) return

  try {
    isSaving.value = true
    const data: Partial<User> = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      cpf: removeNonDigits(formData.cpf),
      role: formData.role,
      autarquias: formData.autarquias,
      autarquia_preferida_id: formData.autarquia_preferida_id,
      is_active: formData.is_active
    }
    if (formData.password) data.password = formData.password
    if (editingUser.value?.id) data.id = editingUser.value.id

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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.field {
  margin-bottom: 1rem;
}

.field-checkbox {
  margin-bottom: 0.5rem;
}
</style>

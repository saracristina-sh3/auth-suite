<template>
  <Dialog 
    v-model:visible="isOpen" 
    :header="editingUser ? 'Editar Usuário' : 'Novo Usuário'"
    :modal="true"
    :style="{ width: '500px' }"
    :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    class="p-dialog-sm"
  >
    <form @submit.prevent="save" class="p-fluid">
      <div class="field">
        <label for="name" class="block text-900 font-medium mb-2">Nome</label>
        <InputText 
          id="name"
          v-model="form.name"
          required
          autofocus
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="email" class="block text-900 font-medium mb-2">E-mail</label>
        <InputText 
          id="email"
          v-model="form.email"
          type="email"
          required
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="cpf" class="block text-900 font-medium mb-2">CPF</label>
        <InputText 
          id="cpf"
          v-model="form.cpf"
          required
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="password" class="block text-900 font-medium mb-2">Palavra-chave</label>
        <Password 
          id="password"
          v-model="form.password"
          :feedback="false"
          toggleMask
          :required="!editingUser"
          class="w-full"
        />
      </div>

      <div class="field">
        <label for="role" class="block text-900 font-medium mb-2">Função</label>
        <Dropdown
          id="role"
          v-model="form.role"
          :options="roles"
          optionLabel="label"
          optionValue="value"
          placeholder="Selecione uma função"
          required
          class="w-full"
        />
      </div>

      <div class="field-checkbox">
        <Checkbox
          id="is_active"
          v-model="form.is_active"
          :binary="true"
        />
        <label for="is_active" class="ml-2">Usuário ativo</label>
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
        :label="editingUser ? 'Atualizar' : 'Criar'" 
        icon="pi pi-check" 
        @click="save" 
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Dropdown from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import type { User } from '@/services/user.service'
import type { Role, Permission } from '@/services/role.service'

interface Props {
  roles: Role[]
  permissions: Permission
}

defineProps<Props>()

const isOpen = ref(false)
const editingUser = ref<User | null>(null)

const form = reactive({
  name: '',
  email: '',
  cpf: '',
  password: '',
  role: '',
  is_active: true
})

// Métodos públicos para o componente pai
function open(user?: User) {
  editingUser.value = user || null
  if (user) {
    Object.assign(form, user)
    form.password = ''
  } else {
    resetForm()
  }
  isOpen.value = true
}

function close() {
  isOpen.value = false
  resetForm()
}

function save() {
  emit('save', { ...form, id: editingUser.value?.id })
  close()
}

function resetForm() {
  Object.assign(form, {
    name: '',
    email: '',
    cpf: '',
    password: '',
    role: '',
    is_active: true
  })
}

const emit = defineEmits<{
  save: [user: Partial<User>]
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
  margin-bottom: 1.5rem;
}
</style>
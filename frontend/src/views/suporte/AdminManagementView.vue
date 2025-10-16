<template>
  <BaseLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Gerenciamento de Usuários</h2>
        <Button label="Novo Usuário" icon="pi pi-plus" @click="onNewUser" />
      </div>
 <!-- Mensagem de feedback -->
      <div v-if="message" :class="['mb-4 p-3 rounded text-white', messageClass]">
        {{ message }}
      </div>
      <UserTable :users="users" @edit="onEditUser" @delete="onDeleteUser" />
      <UserForm ref="userForm" @save="onSaveUser" />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { userService } from '@/services/user.service';
import Button from 'primevue/button';
import BaseLayout from '@/components/layouts/BaseLayout.vue';
import UserTable from '@/components/usuario/UserTable.vue';
import UserForm from '@/components/usuario/UserForm.vue';


const users = ref<any[]>([]);
const userForm = ref();

const message = ref('')
const messageType = ref<'success' | 'error' | ''>('')

// Computed class para cor da mensagem
const messageClass = computed(() => {
  if (messageType.value === 'success') return 'bg-green-600'
  if (messageType.value === 'error') return 'bg-red-600'
  return 'bg-gray-500'
})

// Função auxiliar para exibir mensagens
function showMessage(type: 'success' | 'error', text: string) {
  messageType.value = type
  message.value = text
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 4000) // mensagem desaparece em 4 segundos
}

async function loadUsers() {
  try {
    users.value = (await userService.list()).data
  } catch {
    showMessage('error', 'Falha ao carregar usuários.')
  }
}

function onNewUser() {
  userForm.value.open()
}

function onEditUser(user: any) {
  userForm.value.open(user)
}

async function onSaveUser(user: any) {
  try {
    if (user.id) {
      await userService.update(user.id, user)
      showMessage('success', 'Usuário atualizado com sucesso.')
    } else {
      await userService.create(user)
      showMessage('success', 'Usuário criado com sucesso.')
    }
    loadUsers()
  } catch {
    showMessage('error', 'Erro ao salvar usuário.')
  }
}

async function onDeleteUser(user: any) {
  if (confirm(`Excluir usuário ${user.name}?`)) {
    try {
      await userService.remove(user.id)
      loadUsers()
      showMessage('success', 'Usuário removido com sucesso.')
    } catch {
      showMessage('error', 'Erro ao excluir usuário.')
    }
  }
}

onMounted(loadUsers)
</script>

<style scoped>
.bg-green-600 {
  background-color: #16a34a;
}
.bg-red-600 {
  background-color: #dc2626;
}
.bg-gray-500 {
  background-color: #6b7280;
}
</style>

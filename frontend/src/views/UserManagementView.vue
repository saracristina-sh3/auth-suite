<template>
  <BaseLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Gerenciamento de Usuários</h2>
        <Button label="Novo Usuário" icon="pi pi-plus" @click="onNewUser" />
      </div>

      <UserTable :users="users" @edit="onEditUser" @delete="onDeleteUser" />
      <UserForm ref="userForm" @save="onSaveUser" />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { userService } from '@/services/user.service';
import Button from 'primevue/button';
import BaseLayout from '@/components/layouts/BaseLayout.vue';
import UserTable from '@/components/usuario/UserTable.vue';
import UserForm from '@/components/usuario/UserForm.vue';
import { useToast } from 'primevue/usetoast';

const users = ref<any[]>([]);
const userForm = ref();
const toast = useToast();

async function loadUsers() {
  try {
    users.value = (await userService.list()).data;
  } catch {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar usuários.' });
  }
}

function onNewUser() {
  userForm.value.open();
}

function onEditUser(user: any) {
  userForm.value.open(user);
}

async function onSaveUser(user: any) {
  try {
    if (user.id) {
      await userService.update(user.id, user);
      toast.add({ severity: 'success', summary: 'Atualizado', detail: 'Usuário atualizado com sucesso.' });
    } else {
      await userService.create(user);
      toast.add({ severity: 'success', summary: 'Criado', detail: 'Usuário criado com sucesso.' });
    }
    loadUsers();
  } catch {
  toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar usuários.' });
}
}

async function onDeleteUser(user: any) {
  if (confirm(`Excluir usuário ${user.name}?`)) {
    await userService.remove(user.id);
    loadUsers();
    toast.add({ severity: 'success', summary: 'Excluído', detail: 'Usuário removido.' });
  }
}

onMounted(loadUsers);
</script>

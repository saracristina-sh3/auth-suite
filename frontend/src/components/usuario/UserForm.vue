<template>
  <Dialog v-model:visible="visible" modal header="Usuário" :style="{ width: '30rem' }">
    <div class="p-fluid">
      <div class="field">
        <label>Nome</label>
        <InputText v-model="form.name" />
      </div>
      <div class="field">
        <label>Email</label>
        <InputText v-model="form.email" />
      </div>
      <div class="field">
        <label>Senha</label>
        <Password v-model="form.password" toggleMask />
      </div>
      <div class="field">
        <label>Função</label>
        <Select v-model="form.role" :options="roles" optionLabel="label" optionValue="value" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" text @click="close" />
      <Button label="Salvar" icon="pi pi-check" @click="save" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import  Dialog  from 'primevue/dialog';
import  InputText  from 'primevue/inputtext';
import  Select  from 'primevue/select';
import  Button  from 'primevue/button';
import  Password  from 'primevue/password';

const emit = defineEmits(['save', 'close']);
const visible = ref(false);
const form = ref<any>({});
const roles = [
  { label: 'Usuário', value: 'user' },
  { label: 'Gerente', value: 'manager' },
  { label: 'Administrador', value: 'admin' },
  { label: 'Superadmin', value: 'superadmin' },
];

function open(user?: any) {
  form.value = user ? { ...user } : {};
  visible.value = true;
}

function close() {
  visible.value = false;
  emit('close');
}

function save() {
  emit('save', { ...form.value });
  close();
}

defineExpose({ open });
</script>

<template>
  <Card>
    <template #title>Usuários</template>
    <DataTable :value="users" dataKey="id" paginator :rows="10">
      <Column field="name" header="Nome" sortable />
      <Column field="email" header="E-mail" sortable />
      <Column field="role" header="Função" sortable />
      <Column field="is_active" header="Ativo">
        <template #body="{ data }">
          <Tag :severity="data.is_active ? 'success' : 'danger'">
            {{ data.is_active ? 'Sim' : 'Não' }}
          </Tag>
        </template>
      </Column>
      <Column header="Ações">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text @click="$emit('edit', data)" />
          <Button icon="pi pi-trash" text severity="danger" @click="$emit('delete', data)" />
        </template>
      </Column>
    </DataTable>
  </Card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import  Card  from 'primevue/card';
import  DataTable  from 'primevue/datatable';
import Column from 'primevue/column'
import  Button  from 'primevue/button';
import  Tag  from 'primevue/tag';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

defineProps<{
  users: User[];
}>();
</script>

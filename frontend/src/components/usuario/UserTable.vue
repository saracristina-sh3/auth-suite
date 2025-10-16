<template>
  <Card>
    <template #title>Usuários</template>
    <template #content>
      <DataTable 
        :value="users" 
        dataKey="id"
        paginator
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        responsiveLayout="scroll"
        class="p-datatable-sm"
      >
        <Column field="id" header="ID" :sortable="true" style="width: 80px"></Column>
        <Column field="name" header="Nome" :sortable="true"></Column>
        <Column field="email" header="E-mail" :sortable="true"></Column>
        <Column field="cpf" header="CPF">
          <template #body="slotProps">
            {{ formatCPF(slotProps.data.cpf) }}
          </template>
        </Column>
        <Column field="role" header="Função" :sortable="true"></Column>
        
        <Column field="is_active" header="Ativo">
          <template #body="slotProps">
            <Tag 
              :value="slotProps.data.is_active ? 'Sim' : 'Não'" 
              :severity="slotProps.data.is_active ? 'success' : 'danger'" 
            />
          </template>
        </Column>

        <Column header="Ações" style="width: 120px">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button 
                icon="pi pi-pencil" 
                class="p-button-text p-button-primary" 
                @click="emit('edit', slotProps.data)" 
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-text p-button-danger" 
                @click="emit('delete', slotProps.data)" 
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { User } from '@/services/user.service'

interface Props {
  users: User[]
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [user: User]
  delete: [user: User]
}>()

function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
</script>
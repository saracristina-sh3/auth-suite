<template>
  <Card>
    <template #title>{{ title }}</template>
    <template #content>
      <DataTable
        :value="items"
        :dataKey="dataKey"
        paginator
        :rows="rows"
        :rowsPerPageOptions="rowsPerPageOptions"
        responsiveLayout="scroll"
        :loading="loading"
      >
        <!-- Colunas dinâmicas -->
        <Column
          v-for="col in columns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          :sortable="col.sortable !== false"
          :style="col.style"
        >
          <template #body="slotProps">
            <!-- Slot customizado para a coluna -->
            <slot :name="`column-${col.field}`" :data="slotProps.data">
              <!-- Renderização padrão baseada no tipo -->
              <span v-if="col.type === 'boolean'">
                <Tag
                  :value="slotProps.data[col.field] ? 'Sim' : 'Não'"
                  :severity="slotProps.data[col.field] ? 'success' : 'danger'"
                />
              </span>
              <span v-else-if="col.type === 'date'">
                {{ formatDate(slotProps.data[col.field]) }}
              </span>
              <span v-else-if="col.type === 'cpf'">
                {{ formatCPF(slotProps.data[col.field]) }}
              </span>
              <span v-else>
                {{ slotProps.data[col.field] }}
              </span>
            </slot>
          </template>
        </Column>

        <!-- Coluna de ações -->
        <Column v-if="actions.length > 0" header="Ações" :style="actionsColumnStyle">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                v-for="action in actions"
                :key="action.name"
                :icon="action.icon"
                :class="['p-button-text', action.class || 'p-button-primary']"
                @click="emit(action.event, slotProps.data)"
                v-tooltip.top="action.tooltip"
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

interface ColumnConfig {
  field: string
  header: string
  sortable?: boolean
  style?: string
  type?: 'text' | 'boolean' | 'date' | 'cpf'
}

interface ActionConfig {
  name: string
  icon: string
  event: string
  tooltip?: string
  class?: string
}

interface Props {
  title: string
  items: any[]
  columns: ColumnConfig[]
  actions?: ActionConfig[]
  dataKey?: string
  rows?: number
  rowsPerPageOptions?: number[]
  loading?: boolean
  actionsColumnStyle?: string
}

const props = withDefaults(defineProps<Props>(), {
  dataKey: 'id',
  rows: 10,
  rowsPerPageOptions: () => [5, 10, 20, 50],
  actions: () => [],
  loading: false,
  actionsColumnStyle: 'width: 120px'
})

const emit = defineEmits<{
  [key: string]: [item: any]
}>()

function formatDate(date: string): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatCPF(cpf: string): string {
  if (!cpf) return '-'
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
</script>

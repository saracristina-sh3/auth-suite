<template>
  <Sh3Card>
    <template #title>
      {{ title }}
    </template>

    <template #content>
      <Sh3Table
        :items="items"
        :columns="columns"
        :actions="actions"
        :rows="rows"
        :paginated="true"
        :dataKey="dataKey"
        class="w-full"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @viewUsers="$emit('viewUsers', $event)"
        @viewModules="$emit('viewModules', $event)"
      >
        <!-- Renderiza slots customizados (como column-cpf, column-is_active, etc.) -->
        <template
          v-for="col in columns"
          :key="col.field"
          #[`column-${col.field}`]="slotProps"
        >
          <slot
            :name="`column-${col.field}`"
            v-bind="slotProps"
          ></slot>
        </template>
      </Sh3Table>
    </template>
  </Sh3Card>
</template>

<script setup lang="ts">
import Sh3Card from '@/components/common/Sh3Card.vue'
import Sh3Table from '@/components/common/Sh3Table.vue'
import type { ColumnConfig } from '@/types/columnTypes'
import type { ActionConfig } from '@/types/actionTypes'

interface Props {
  title: string
  items: any[]
  columns: ColumnConfig[]
  actions?: ActionConfig[]
  dataKey?: string
  rows?: number
  loading?: boolean
  actionsColumnStyle?: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    items: any[]
    columns: ColumnConfig[]
    actions?: ActionConfig[]
    dataKey?: string
    rows?: number
    paginated?: boolean
  }>(),
  {
    dataKey: 'id',
    actions: () => [],
    paginated: true,
    rows: 10
  }
)


const emit = defineEmits<{
  edit: [item: any]
  delete: [item: any]
  viewUsers: [item: any]
  viewModules: [item: any]
}>()
</script>

<style scoped>
/* Opcional: leve estilo de espaçamento */
.w-full {
  width: 100%;
}
</style>

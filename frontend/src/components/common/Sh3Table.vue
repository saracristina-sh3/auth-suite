<template>
  <div class="overflow-x-auto border border-border rounded-lg">
    <table class="min-w-full divide-y divide-border">
      <thead class="bg-muted">
        <tr>
          <th
            v-for="col in columns"
            :key="col.field"
            class="px-4 py-2 text-left text-sm font-semibold text-foreground"
          >
            {{ col.header }}
          </th>
          <th v-if="actions?.length" class="px-4 py-2 text-left text-sm font-semibold text-foreground">
            Ações
          </th>
        </tr>
      </thead>
      <tbody class="bg-card divide-y divide-border">
        <tr
          v-for="item in paginatedItems"
          :key="item[dataKey]"
          class="hover:bg-muted transition-colors"
        >
          <td
            v-for="col in columns"
            :key="col.field"
            class="px-4 py-2 text-sm text-foreground whitespace-nowrap"
          >
            <slot :name="`column-${col.field}`" :data="item">
              <template v-if="col.type === 'boolean'">
                <Sh3Tag
                  :value="item[col.field] ? 'Sim' : 'Não'"
                  :severity="item[col.field] ? 'success' : 'danger'"
                />
              </template>
              <template v-else-if="col.type === 'date'">
                {{ formatDate(item[col.field]) }}
              </template>
              <template v-else-if="col.type === 'cpf'">
                {{ formatCPF(item[col.field]) }}
              </template>
              <template v-else>
                {{ item[col.field] }}
              </template>
            </slot>
          </td>

          <!-- Coluna de ações -->
          <td v-if="actions?.length" class="px-4 py-2 text-sm text-right whitespace-nowrap">
            <div class="flex justify-end gap-2">
              <Sh3Button
                v-for="action in actions"
                :key="action.name"
                :icon="action.icon"
                variant="text"
                :class="action.class"
                @click="$emit(action.event, item)"
              >
              </Sh3Button>
            </div>
          </td>
        </tr>

        <tr v-if="!paginatedItems.length">
          <td :colspan="columns.length + 1" class="text-center py-6 text-muted-foreground">
            Nenhum registro encontrado.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginação -->
    <div
      v-if="paginated"
      class="flex justify-between items-center px-4 py-3 border-t border-border bg-muted"
    >
      <div class="text-sm text-muted-foreground">
        Mostrando {{ start + 1 }}–{{ end }} de {{ items.length }}
      </div>
      <div class="flex gap-1">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="[
            'px-3 py-1 rounded text-sm transition-colors',
            page === currentPage
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border text-foreground hover:bg-muted'
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Sh3Tag from './Sh3Tag.vue'
import Sh3Button from './Sh3Button.vue'
import type { ColumnConfig } from '@/types/columnTypes'
import type { ActionConfig } from '@/types/actionTypes'

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


const currentPage = ref(1)
const rows = computed(() => props.rows ?? 10)
const start = computed(() => (currentPage.value - 1) * rows.value)
const end = computed(() => Math.min(start.value + rows.value, props.items.length))
const totalPages = computed(() => Math.ceil(props.items.length / rows.value))

const paginatedItems = computed(() =>
  props.paginated ? props.items.slice(start.value, end.value) : props.items
)

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

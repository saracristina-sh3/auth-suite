<template>
  <div class="overflow-x-auto border border-gray-200 rounded-lg">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="col in columns"
            :key="col.field"
            class="px-4 py-2 text-left text-sm font-semibold text-gray-700"
          >
            {{ col.header }}
          </th>
          <th v-if="actions?.length" class="px-4 py-2 text-left text-sm font-semibold text-gray-700">
            Ações
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-100">
        <tr
          v-for="item in paginatedItems"
          :key="item[dataKey]"
          class="hover:bg-gray-50 transition-colors"
        >
          <td
            v-for="col in columns"
            :key="col.field"
            class="px-4 py-2 text-sm text-gray-800 whitespace-nowrap"
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
          <td :colspan="columns.length + 1" class="text-center py-6 text-gray-500">
            Nenhum registro encontrado.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Paginação -->
    <div
      v-if="paginated"
      class="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50"
    >
      <div class="text-sm text-gray-500">
        Mostrando {{ start + 1 }}–{{ end }} de {{ items.length }}
      </div>
      <div class="flex gap-1">
        <button
          v-for="page in totalPages"
          :key="page"
          @click="currentPage = page"
          :class="[
            'px-3 py-1 rounded text-sm',
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
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

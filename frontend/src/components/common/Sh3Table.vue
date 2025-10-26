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
        <!-- Loading State -->
        <tr v-if="loading">
          <td :colspan="columns.length + (actions?.length ? 1 : 0)">
            <Sh3LoadingState message="Carregando dados..." />
          </td>
        </tr>

        <!-- Error State -->
        <tr v-else-if="error">
          <td :colspan="columns.length + (actions?.length ? 1 : 0)">
            <Sh3ErrorState
              :message="error"
              buttonLabel="Tentar novamente"
              @retry="$emit('retry')"
            />
          </td>
        </tr>

        <!-- Data Rows -->
        <template v-else>
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
                  @click="emit(action.event as any, item)"
                >
                </Sh3Button>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="!paginatedItems.length">
            <td :colspan="columns.length + (actions?.length ? 1 : 0)">
              <Sh3EmptyState
                :icon="emptyIcon"
                :title="emptyTitle"
                :description="emptyDescription"
              >
                <slot name="empty-action" />
              </Sh3EmptyState>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Paginação -->
    <div
      v-if="paginated && !loading && !error"
      class="flex justify-between items-center px-4 py-3 border-t border-border bg-muted"
    >
      <div class="text-sm text-muted-foreground">
        Mostrando {{ displayStart }}–{{ displayEnd }} de {{ displayTotal }}
      </div>
      <div class="flex gap-1">
        <!-- Botão Anterior -->
        <button
          @click="goToPage(displayCurrentPage - 1)"
          :disabled="displayCurrentPage === 1"
          :class="[
            'px-3 py-1 rounded text-sm transition-colors',
            displayCurrentPage === 1
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              : 'bg-card border border-border text-foreground hover:bg-muted'
          ]"
        >
          <i class="pi pi-chevron-left text-xs"></i>
        </button>

        <!-- Páginas -->
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 rounded text-sm transition-colors',
            page === displayCurrentPage
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border text-foreground hover:bg-muted'
          ]"
        >
          {{ page }}
        </button>

        <!-- Botão Próximo -->
        <button
          @click="goToPage(displayCurrentPage + 1)"
          :disabled="displayCurrentPage === displayLastPage"
          :class="[
            'px-3 py-1 rounded text-sm transition-colors',
            displayCurrentPage === displayLastPage
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              : 'bg-card border border-border text-foreground hover:bg-muted'
          ]"
        >
          <i class="pi pi-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Sh3Tag from './Sh3Tag.vue'
import Sh3Button from './Sh3Button.vue'
import Sh3LoadingState from './state/Sh3LoadingState.vue'
import Sh3EmptyState from './state/Sh3EmptyState.vue'
import Sh3ErrorState from './state/Sh3ErrorState.vue'
import type { ColumnConfig } from '@/types/common/column.types'
import type { ActionConfig } from '@/types/common/action.types'
import type { PaginationMeta } from '@/types/common/pagination.types'

const props = withDefaults(
  defineProps<{
    title?: string
    items: any[]
    columns: ColumnConfig[]
    actions?: ActionConfig[]
    dataKey?: string
    rows?: number
    paginated?: boolean
    loading?: boolean
    error?: string | null
    emptyIcon?: string
    emptyTitle?: string
    emptyDescription?: string
    // Props para paginação server-side
    serverSide?: boolean
    paginationMeta?: PaginationMeta | null
  }>(),
  {
    dataKey: 'id',
    actions: () => [],
    paginated: true,
    rows: 10,
    loading: false,
    error: null,
    emptyIcon: 'pi pi-inbox',
    emptyTitle: 'Nenhum registro encontrado',
    emptyDescription: 'Não há dados para exibir no momento.',
    serverSide: false,
    paginationMeta: null
  }
)

// Define emits de forma mais permissiva para suportar eventos dinâmicos das ações
const emit = defineEmits(['page-change', 'retry'])

// Paginação client-side
const currentPage = ref(1)
const rows = computed(() => props.rows ?? 10)
const start = computed(() => (currentPage.value - 1) * rows.value)
const end = computed(() => Math.min(start.value + rows.value, props.items.length))
const totalPages = computed(() => Math.ceil(props.items.length / rows.value))

const paginatedItems = computed(() => {
  // Se for server-side, retorna items direto (já vem paginado do backend)
  if (props.serverSide) {
    return props.items
  }
  // Client-side: fatia os items
  return props.paginated ? props.items.slice(start.value, end.value) : props.items
})

// Valores de exibição (usa server-side se disponível, senão client-side)
const displayCurrentPage = computed(() =>
  props.serverSide && props.paginationMeta
    ? props.paginationMeta.current_page
    : currentPage.value
)

const displayLastPage = computed(() =>
  props.serverSide && props.paginationMeta
    ? props.paginationMeta.last_page
    : totalPages.value
)

const displayTotal = computed(() =>
  props.serverSide && props.paginationMeta
    ? props.paginationMeta.total
    : props.items.length
)

const displayStart = computed(() => {
  if (displayTotal.value === 0) return 0
  if (props.serverSide && props.paginationMeta) {
    return (props.paginationMeta.current_page - 1) * props.paginationMeta.per_page + 1
  }
  return start.value + 1
})

const displayEnd = computed(() => {
  if (props.serverSide && props.paginationMeta) {
    return Math.min(
      props.paginationMeta.current_page * props.paginationMeta.per_page,
      props.paginationMeta.total
    )
  }
  return end.value
})

// Páginas visíveis (mostra no máximo 5 páginas)
const visiblePages = computed(() => {
  const total = displayLastPage.value
  const current = displayCurrentPage.value
  const maxVisible = 5

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function goToPage(page: number) {
  if (page < 1 || page > displayLastPage.value) return

  if (props.serverSide) {
    emit('page-change', page)
  } else {
    currentPage.value = page
  }
}

// Reset página quando items mudam (client-side)
watch(() => props.items, () => {
  if (!props.serverSide && currentPage.value > totalPages.value) {
    currentPage.value = 1
  }
})

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

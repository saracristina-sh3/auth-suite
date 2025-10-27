<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <Sh3Card
      v-for="item in items"
      :key="itemKey(item)"
      class="cursor-pointer transition-all duration-300 hover:shadow-lg border border-border hover:-translate-y-1"
      @click="$emit('select', item)"
    >
      <template #content>
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center text-white"
              :class="item.iconGradient || 'bg-gradient-to-br from-primary to-primary/80'"
            >
              <i
                v-if="item.icon"
                :class="['pi', `pi-${item.icon}`, 'text-xl']"
              ></i>
              <i v-else class="pi pi-box text-xl"></i>
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-foreground text-base leading-tight">
                {{ item.title }}
              </h3>
            </div>
          </div>

          <span
            v-if="item.status"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :class="item.statusClass || 'bg-muted text-foreground'"
          >
            <i v-if="item.statusIcon" :class="['pi', item.statusIcon, 'text-xs mr-1']"></i>
            {{ item.status }}
          </span>
        </div>

        <!-- Descrição -->
        <p v-if="item.description" class="text-sm text-muted-foreground mb-4 line-clamp-2">
          {{ item.description }}
        </p>

        <div v-if="item.details" class="space-y-2 pt-3 border-t border-border">
          <div
            v-for="(detail, i) in item.details"
            :key="i"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-muted-foreground">{{ detail.label }}</span>
            <span class="text-foreground font-medium">{{ detail.value }}</span>
          </div>
        </div>

        <!-- Slot extra -->
        <div v-if="$slots.default" class="mt-3">
          <slot :item="item" />
        </div>
      </template>
    </Sh3Card>
  </div>
</template>

<script setup lang="ts">
import Sh3Card from '@/components/common/Sh3Card.vue'

export interface GridItemDetail {
  label: string
  value: string | number
}

export interface GridItem {
  id: number | string
  title: string
  description?: string
  icon?: string
  iconGradient?: string
  status?: string
  statusIcon?: string
  statusClass?: string
  details?: GridItemDetail[]
}

const props = defineProps<{
  items: GridItem[]
  itemKey?: (item: GridItem) => string | number
}>()

const itemKey = props.itemKey || ((item: GridItem) => item.id)

defineEmits<{
  (e: 'select', item: GridItem): void
}>()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

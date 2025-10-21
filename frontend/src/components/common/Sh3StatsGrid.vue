<template>
  <div
    class="bg-muted rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
  >
    <div
      v-for="(item, index) in stats"
      :key="index"
      class="flex items-center gap-3"
    >
      <i
        v-if="item.icon"
        :class="[item.icon, item.iconColor || 'text-primary', 'text-xl']"
      ></i>

      <div>
        <p class="text-sm text-muted-foreground">{{ item.label }}</p>
        <p class="text-2xl font-bold text-foreground">
          {{ item.value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StatItem {
  icon?: string
  iconColor?: string
  label: string
  value: string | number
}

defineProps<{
  stats: StatItem[]
}>()
</script>

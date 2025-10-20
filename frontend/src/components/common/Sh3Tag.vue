<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      severityClass
    ]"
  >
    {{ value }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: string
  severity?: 'success' | 'info' | 'warn' | 'danger'
}>()

const severityClass = computed(() => {
  switch (props.severity) {
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'info':
      return 'bg-blue-100 text-blue-800'
    case 'warn':
      return 'bg-yellow-100 text-yellow-800'
    case 'danger':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})
</script>

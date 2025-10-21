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
      return 'bg-jade-100 text-jade-800 border border-jade-300'
    case 'info':
      return 'bg-selenium-100 text-selenium-800 border border-selenium-300'
    case 'warn':
      return 'bg-sulfur-100 text-sulfur-800 border border-sulfur-300'
    case 'danger':
      return 'bg-ruby-100 text-ruby-800 border border-ruby-300'
    default:
      return 'bg-muted text-muted-foreground border border-border'
  }
})
</script>

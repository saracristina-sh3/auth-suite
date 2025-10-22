<template>
  <div
    class="flex flex-col items-center justify-center text-center py-12 px-6"
  >
    <!-- Spinner -->
    <Sh3ProgressSpinner :size="size" />

    <!-- Mensagem -->
    <p v-if="message" class="text-muted-foreground mt-4">
      {{ message }}
    </p>

    <!-- Slot opcional -->
    <div v-if="$slots.default" class="mt-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sh3ProgressSpinner from '@/components/common/Sh3ProgressSpinner.vue'

defineProps<{
  message?: string
  size?: 'small' | 'large' | 'normal'
}>()
</script>

<template>
  <header
    class="flex justify-between items-center border-b border-border m-4 mb-4 pb-3"
  >
    <h2 class="text-card-foreground text-xl font-semibold">
      {{ title }}
    </h2>

    <button
      class="bg-transparent border-none text-2xl cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground"
      @click="$emit('close')"
      aria-label="Fechar"
    >
      ×
    </button>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

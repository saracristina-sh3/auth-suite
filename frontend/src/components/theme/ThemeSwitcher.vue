<template>
  <div class="flex justify-end p-2 mb-4">
    <button
      type="button"
      class="inline-flex w-8 h-8 p-0 items-center justify-center
             rounded border border-border bg-card text-card-foreground
             cursor-not-allowed opacity-70"
      disabled
      title="Dark mode ativo"
    >
      <i class="pi pi-moon" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

// Ativa o modo escuro globalmente no app
onMounted(() => {
  document.documentElement.classList.add('dark')
})
</script>

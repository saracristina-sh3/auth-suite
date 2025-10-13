<template>
  <div class="flex justify-end p-2 mb-4">
    <button
      type="button"
      class="inline-flex w-8 h-8 p-0 items-center justify-center
             rounded border border-gray-600 bg-gray-800 text-white
             cursor-not-allowed opacity-70"
      disabled
      title="Dark mode ativo"
    >
      <i class="pi pi-moon text-white" />
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

<style scoped>
/* Exemplo: personalização adicional de tema dark */
:root.dark {
  --color-bg: #121212;
  --color-surface: #1e1e1e;
  --color-text: #ffffff;
  --color-border: #3a3a3a;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
</style>

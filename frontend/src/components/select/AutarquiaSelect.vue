<script setup lang="ts">
import { ref } from 'vue'
import Select from 'primevue/select'

const autarquias = [
  { name: 'Prefeitura Municipal', code: 'pref' },
  { name: 'Câmara Municipal', code: 'cam' },
  { name: 'Instituto de Previdência', code: 'inst' }
]

const selectedAutarquia = ref()
</script>

<template>
  <Select
    v-model="selectedAutarquia"
    :options="autarquias"
    optionLabel="name"
    placeholder="Selecione a autarquia"
    class="w-full md:w-56"
  />
</template>

<style scoped>

</style>

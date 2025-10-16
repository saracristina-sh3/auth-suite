<!-- src/components/select/AutarquiaSelect.vue -->
<template>
  <Dropdown
    v-model="selectedValue"
    :options="options"
    optionLabel="label"
    optionValue="value"
    :placeholder="placeholder"
    class="w-full"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dropdown from 'primevue/dropdown'

interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue?: string | number | null
  options: Option[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecione...',
  modelValue: null
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const selectedValue = ref<string | number | null>(props.modelValue ?? null)

watch(selectedValue, (newValue) => {
  // Garantir que não enviamos undefined
  emit('update:modelValue', newValue ?? null)
})

watch(() => props.modelValue, (newValue) => {
  selectedValue.value = newValue ?? null
})
</script>
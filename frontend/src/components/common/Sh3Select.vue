<template>
  <div class="field">
    <label :for="field.name" class="block font-medium mb-2">
      {{ field.label }}
      <span v-if="field.required" class="text-red-500">*</span>
    </label>

    <select
      :id="field.name"
      :value="modelValue"
      @change="onChange($event)"
      :required="field.required"
      class="w-full border p-2 rounded"
    >
      <!-- Placeholder -->
      <option disabled :value="null">
        {{ field.placeholder || 'Selecione uma opção' }}
      </option>

      <!-- Opções -->
      <option
        v-for="option in field.options || []"
        :key="getOptionValue(option)"
        :value="getOptionValue(option)"
      >
        {{ getOptionLabel(option) }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

/**
 * Interface que define o campo genérico (igual ao do GenericForm)
 */
interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'
  required?: boolean
  placeholder?: string
  options?: any[]
  optionLabel?: string
  optionValue?: string
}

/**
 * Props aceitas pelo componente Sh3Select
 */
const props = defineProps<{
  field: FieldConfig
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

// Função para tratar mudanças no select
function onChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}

// Funções auxiliares para obter label e value das opções
function getOptionLabel(option: any): string {
  const labelKey = props.field.optionLabel || 'label'
  return option[labelKey] || String(option)
}

function getOptionValue(option: any): any {
  const valueKey = props.field.optionValue || 'value'
  return option[valueKey] !== undefined ? option[valueKey] : option
}
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}
select {
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}
select:disabled {
  background-color: #f9f9f9;
  color: #999;
  cursor: not-allowed;
}
select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}
</style>

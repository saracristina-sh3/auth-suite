<template>
  <div class="field">
    <label :for="field.name" class="block font-medium mb-2 text-foreground">
      {{ field.label }}
      <span v-if="field.required" class="text-destructive">*</span>
    </label>

    <!-- Multi-Select com Checkboxes -->
    <div v-if="field.multiple" class="multi-select-container">
      <div class="multi-select-header" @click="toggleDropdown">
        <div class="selected-display">
          <span v-if="selectedLabels.length === 0" class="placeholder">
            {{ field.placeholder || 'Selecione uma ou mais opções' }}
          </span>
          <div v-else class="selected-tags">
            <span
              v-for="label in selectedLabels"
              :key="label"
              class="selected-tag"
            >
              {{ label }}
            </span>
            <span v-if="selectedLabels.length > 3" class="more-count">
              +{{ selectedLabels.length - 3 }} mais
            </span>
          </div>
        </div>
        <i :class="['pi', isOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
      </div>

      <div v-if="isOpen" class="multi-select-dropdown">
        <div class="search-box" v-if="field.searchable !== false">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar..."
            class="search-input"
            @click.stop
          />
        </div>

        <div class="options-list">
          <label
            v-for="option in filteredOptions"
            :key="getOptionValue(option)"
            class="option-item"
            @click.stop
          >
            <input
              type="checkbox"
              :value="getOptionValue(option)"
              :checked="isSelected(getOptionValue(option))"
              @change="toggleOption(getOptionValue(option))"
            />
            <span class="option-label">{{ getOptionLabel(option) }}</span>
          </label>

          <div v-if="filteredOptions.length === 0" class="empty-message">
            Nenhuma opção encontrada
          </div>
        </div>

        <div class="multi-select-actions">
          <button type="button" @click.stop="selectAll" class="action-btn">
            Selecionar Todos
          </button>
          <button type="button" @click.stop="clearAll" class="action-btn">
            Limpar
          </button>
        </div>
      </div>
    </div>

    <!-- Select Simples (Single Select) -->
    <select
      v-else
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/**
 * Interface que define o campo genérico (estendida para suportar multi-select)
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
  multiple?: boolean      
  searchable?: boolean    
}

/**
 * Props aceitas pelo componente Sh3Select
 */
const props = defineProps<{
  field: FieldConfig
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])

// Estado do dropdown
const isOpen = ref(false)
const searchQuery = ref('')

// Computed: Valor interno como array (para multi-select)
const internalValue = computed({
  get: () => {
    if (!props.field.multiple) return props.modelValue

    // Se for multi-select, garante que sempre retorna array
    if (Array.isArray(props.modelValue)) {
      return props.modelValue
    }
    return props.modelValue ? [props.modelValue] : []
  },
  set: (value) => {
    emit('update:modelValue', value)
  }
})

// Computed: Labels dos itens selecionados
const selectedLabels = computed(() => {
  if (!props.field.multiple) return []

  const options = props.field.options || []
  return internalValue.value
    .map((val: string | number) => {
      const option = options.find((opt) => getOptionValue(opt) === val)
      return option ? getOptionLabel(option) : null
    })
    .filter(Boolean)
    .slice(0, 3) // Mostra apenas os primeiros 3
})

// Computed: Opções filtradas pela busca
const filteredOptions = computed(() => {
  const options = props.field.options || []
  if (!searchQuery.value) return options

  const query = searchQuery.value.toLowerCase()
  return options.filter((option) =>
    getOptionLabel(option).toLowerCase().includes(query)
  )
})

// Funções auxiliares para obter label e value das opções
function getOptionLabel(option: any): string {
  const labelKey = props.field.optionLabel || 'label'
  return option[labelKey] || String(option)
}

function getOptionValue(option: any): any {
  const valueKey = props.field.optionValue || 'value'
  return option[valueKey] !== undefined ? option[valueKey] : option
}

// Função para tratar mudanças no select simples
function onChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}

// Funções do multi-select
function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    searchQuery.value = ''
  }
}

function isSelected(value: string | number): boolean {
  return internalValue.value.includes(value)
}

function toggleOption(value: string | number) {
  const currentValues = [...internalValue.value]
  const index = currentValues.indexOf(value)

  if (index > -1) {
    currentValues.splice(index, 1)
  } else {
    currentValues.push(value)
  }

  emit('update:modelValue', currentValues)
}

function selectAll() {
  const allValues = filteredOptions.value.map((opt) => getOptionValue(opt))
  emit('update:modelValue', allValues)
}

function clearAll() {
  emit('update:modelValue', [])
}

// Fechar dropdown ao clicar fora
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.multi-select-container')) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}

/* Select Simples */
select {
  border: 1px solid hsl(var(--input-border));
  border-radius: var(--radius);
  padding: 0.5rem 0.75rem;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

select:disabled {
  background-color: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  cursor: not-allowed;
  opacity: 0.6;
}

select:focus {
  outline: none;
  border-color: hsl(var(--input-focus));
  box-shadow: 0 0 0 var(--focus-ring-width) hsl(var(--ring) / 0.2);
}

/* Multi-Select Container */
.multi-select-container {
  position: relative;
}

.multi-select-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0.5rem 0.75rem;
  border: 1px solid hsl(var(--input-border));
  border-radius: var(--radius);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: all 0.2s;
}

.multi-select-header:hover {
  border-color: hsl(var(--border));
}

.multi-select-header:focus-within {
  border-color: hsl(var(--input-focus));
  box-shadow: 0 0 0 var(--focus-ring-width) hsl(var(--ring) / 0.2);
}

.selected-display {
  flex: 1;
  overflow: hidden;
}

.placeholder {
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.selected-tag {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.more-count {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

/* Dropdown */
.multi-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: hsl(var(--popover));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  z-index: 50;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

/* Search Box */
.search-box {
  padding: 0.5rem;
  border-bottom: 1px solid hsl(var(--border));
}

.search-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid hsl(var(--input-border));
  border-radius: 0.25rem;
  font-size: 0.875rem;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

.search-input:focus {
  outline: none;
  border-color: hsl(var(--input-focus));
  box-shadow: 0 0 0 1px hsl(var(--ring) / 0.2);
}

/* Options List */
.options-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.25rem 0;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background 0.15s;
  color: hsl(var(--foreground));
}

.option-item:hover {
  background: hsl(var(--accent));
}

.option-item input[type="checkbox"] {
  cursor: pointer;
  accent-color: hsl(var(--primary));
}

.option-label {
  flex: 1;
  font-size: 0.875rem;
  color: hsl(var(--foreground));
}

.empty-message {
  padding: 1rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
  font-size: 0.875rem;
}

/* Actions */
.multi-select-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--muted));
}

.action-btn {
  flex: 1;
  padding: 0.375rem 0.75rem;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: hsl(var(--accent));
  border-color: hsl(var(--border));
}

/* Scrollbar customizado */
.options-list::-webkit-scrollbar {
  width: 6px;
}

.options-list::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

.options-list::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}

.options-list::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}
</style>

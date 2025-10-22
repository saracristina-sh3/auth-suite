<template>
  <div class="mb-6">
    <label :for="field.name" class="block font-medium mb-2 text-foreground">
      {{ field.label }}
      <span v-if="field.required" class="text-destructive">*</span>
    </label>

    <!-- Multi-Select com Checkboxes -->
    <div v-if="field.multiple" class="relative">
      <div
        class="flex items-center justify-between min-h-[42px] px-3 py-2 border border-input rounded bg-background text-foreground cursor-pointer transition-all duration-200 hover:border-border focus-within:border-ring focus-within:shadow-[0_0_0_2px] focus-within:shadow-ring/20"
        @click="toggleDropdown"
      >
        <div class="flex-1 overflow-hidden">
          <span v-if="selectedLabels.length === 0" class="text-muted-foreground text-sm">
            {{ field.placeholder || 'Selecione uma ou mais opções' }}
          </span>
          <div v-else class="flex flex-wrap gap-1">
            <span
              v-for="label in selectedLabels"
              :key="label"
              class="inline-block px-2 py-0.5 bg-primary text-primary-foreground rounded text-xs font-medium"
            >
              {{ label }}
            </span>
            <span v-if="selectedLabels.length > 3" class="inline-block px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
              +{{ selectedLabels.length - 3 }} mais
            </span>
          </div>
        </div>
        <i :class="['pi', isOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
      </div>

      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded shadow-lg z-50 max-h-[300px] flex flex-col"
      >
        <div class="p-2 border-b border-border" v-if="field.searchable !== false">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar..."
            class="w-full px-2 py-1.5 border border-input rounded text-sm bg-background text-foreground focus:outline-none focus:border-ring focus:shadow-[0_0_0_1px] focus:shadow-ring/20"
            @click.stop
          />
        </div>

        <div class="flex-1 overflow-y-auto py-1">
          <label
            v-for="option in filteredOptions"
            :key="getOptionValue(option)"
            class="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors hover:bg-accent text-foreground"
            @click.stop
          >
            <input
              type="checkbox"
              :value="getOptionValue(option)"
              :checked="isSelected(getOptionValue(option))"
              @change="toggleOption(getOptionValue(option))"
              class="cursor-pointer accent-primary"
            />
            <span class="flex-1 text-sm text-foreground">{{ getOptionLabel(option) }}</span>
          </label>

          <div v-if="filteredOptions.length === 0" class="p-4 text-center text-muted-foreground text-sm">
            Nenhuma opção encontrada
          </div>
        </div>

        <div class="flex gap-2 p-2 border-t border-border bg-muted">
          <button
            type="button"
            @click.stop="selectAll"
            class="flex-1 px-3 py-1.5 bg-background border border-border rounded text-xs font-medium text-foreground cursor-pointer transition-all hover:bg-accent hover:border-border"
          >
            Selecionar Todos
          </button>
          <button
            type="button"
            @click.stop="clearAll"
            class="flex-1 px-3 py-1.5 bg-background border border-border rounded text-xs font-medium text-foreground cursor-pointer transition-all hover:bg-accent hover:border-border"
          >
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
      class="w-full px-3 py-2 border border-input rounded bg-background text-foreground focus:outline-none focus:border-ring focus:shadow-[0_0_0_2px] focus:shadow-ring/20 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
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
/* Scrollbar customizado para a lista de opções */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}
</style>

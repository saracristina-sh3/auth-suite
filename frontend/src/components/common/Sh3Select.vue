<template>
    <div class="sh3-select-container">
      <div
        class="sh3-select"
        :class="{
          'sh3-select--open': isOpen,
          'sh3-select--disabled': disabled,
          'sh3-select--has-value': selectedOption,
          'sh3-select--error': error
        }"
        @click="toggleDropdown"
        @blur="handleBlur"
        tabindex="0"
      >
        <div class="sh3-select__trigger">
          <span class="sh3-select__value">
            {{ displayValue || placeholder }}
          </span>
          <span class="sh3-select__arrow" :class="{ 'sh3-select__arrow--open': isOpen }">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
        
        <div v-if="isOpen" class="sh3-select__dropdown">
          <div
            v-for="(option, index) in options"
            :key="index"
            class="sh3-select__option"
            :class="{
              'sh3-select__option--selected': isOptionSelected(option),
              'sh3-select__option--disabled': option.disabled
            }"
            @click.stop="selectOption(option)"
          >
            {{ getOptionLabel(option) }}
          </div>
          <div v-if="options.length === 0" class="sh3-select__no-options">
            Nenhuma opção disponível
          </div>
        </div>
      </div>
      
      <input
        type="hidden"
        :id="id"
        :name="name"
        :value="internalValue"
        :required="required"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  
  interface Option {
    label?: string
    value?: any
    disabled?: boolean
  }
  
  interface Props {
    id?: string
    name?: string
    modelValue?: any
    options?: any[]
    optionLabel?: string
    optionValue?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    error?: boolean
  }
  
  const props = withDefaults(defineProps<Props>(), {
    options: () => [],
    optionLabel: 'label',
    optionValue: 'value',
    placeholder: 'Selecione uma opção',
    disabled: false,
    required: false,
    error: false
  })
  
  const emit = defineEmits<{
    'update:modelValue': [value: any]
    'change': [value: any]
  }>()
  
  const isOpen = ref(false)
  const internalValue = ref(props.modelValue)
  
  // Encontra a opção selecionada
  const selectedOption = computed(() => {
    if (internalValue.value === null || internalValue.value === undefined) {
      return null
    }
    
    return props.options.find(option => {
      const optionValue = getOptionValue(option)
      return optionValue === internalValue.value
    })
  })
  
  // Valor exibido no select
  const displayValue = computed(() => {
    if (!selectedOption.value) return ''
    return getOptionLabel(selectedOption.value)
  })
  
  // Métodos
  const getOptionLabel = (option: any): string => {
    if (typeof option === 'string') return option
    return option[props.optionLabel] || option.label || option.toString()
  }
  
  const getOptionValue = (option: any): any => {
    if (typeof option === 'string') return option
    return option[props.optionValue] || option.value || option
  }
  
  const isOptionSelected = (option: any): boolean => {
    const optionValue = getOptionValue(option)
    return optionValue === internalValue.value
  }
  
  const toggleDropdown = () => {
    if (!props.disabled) {
      isOpen.value = !isOpen.value
    }
  }
  
  const handleBlur = (event: FocusEvent) => {
    // Fecha o dropdown quando perde o foco, mas com um pequeno delay
    // para permitir o clique nas opções
    setTimeout(() => {
      isOpen.value = false
    }, 150)
  }
  
  const selectOption = (option: any) => {
    if (option.disabled) return
    
    const newValue = getOptionValue(option)
    internalValue.value = newValue
    emit('update:modelValue', newValue)
    emit('change', newValue)
    isOpen.value = false
  }
  
  // Watch para sincronizar com prop modelValue
  watch(() => props.modelValue, (newValue) => {
    internalValue.value = newValue
  })
  
  // Watch para mudanças internas
  watch(internalValue, (newValue) => {
    if (newValue !== props.modelValue) {
      emit('update:modelValue', newValue)
    }
  })
  </script>
  
  <script lang="ts">
  export default {
    name: 'Sh3Select'
  }
  </script>

  <style scoped>
  .sh3-select-container {
    position: relative;
    width: 100%;
  }
  
  .sh3-select {
    position: relative;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    outline: none;
  }
  
  .sh3-select:hover:not(.sh3-select--disabled) {
    border-color: #9ca3af;
  }
  
  .sh3-select--open {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  .sh3-select--disabled {
    background-color: #f9fafb;
    border-color: #e5e7eb;
    cursor: not-allowed;
    color: #9ca3af;
  }
  
  .sh3-select--error {
    border-color: #ef4444;
  }
  
  .sh3-select--error.sh3-select--open {
    border-color: #ef4444;
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
  }
  
  .sh3-select__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    min-height: 44px;
  }
  
  .sh3-select__value {
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .sh3-select--has-value .sh3-select__value {
    color: #1f2937;
  }
  
  .sh3-select:not(.sh3-select--has-value) .sh3-select__value {
    color: #6b7280;
  }
  
  .sh3-select__arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.5rem;
    color: #6b7280;
    transition: transform 0.2s ease-in-out;
  }
  
  .sh3-select__arrow--open {
    transform: rotate(180deg);
  }
  
  .sh3-select__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    max-height: 200px;
    overflow-y: auto;
    z-index: 50;
    margin-top: 2px;
  }
  
  .sh3-select__option {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .sh3-select__option:last-child {
    border-bottom: none;
  }
  
  .sh3-select__option:hover:not(.sh3-select__option--disabled) {
    background-color: #f3f4f6;
  }
  
  .sh3-select__option--selected {
    background-color: #eff6ff;
    color: #1d4ed8;
    font-weight: 500;
  }
  
  .sh3-select__option--disabled {
    background-color: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }
  
  .sh3-select__no-options {
    padding: 0.75rem 1rem;
    color: #6b7280;
    text-align: center;
    font-style: italic;
  }
  </style>
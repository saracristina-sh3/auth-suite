<template>
    <div class="custom-checkbox-container">
      <div
        :id="id"
        class="custom-checkbox"
        :class="{
          'custom-checkbox--checked': modelValue,
          'custom-checkbox--disabled': disabled
        }"
        @click="toggleCheckbox"
        @keydown="handleKeydown"
        tabindex="0"
        role="checkbox"
        :aria-checked="modelValue"
        :aria-label="label"
        :aria-disabled="disabled"
      >
        <span class="custom-checkbox__checkmark" v-if="modelValue">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M10 3L4.5 8.5L2 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </div>
  
      <label
        :for="id"
        class="custom-checkbox__label"
        @click="toggleCheckbox"
      >
        {{ label }}
      </label>
    </div>
  </template>
  
  <script setup lang="ts">
  

  const props = defineProps({
    id: { type: String, required: true },
    modelValue: { type: Boolean, default: false },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  function toggleCheckbox() {
    if (!props.disabled) {
      emit('update:modelValue', !props.modelValue)
    }
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      toggleCheckbox()
    }
  }


  </script>

  <script lang="ts">
export default {
  name: 'Sh3Checkbox'
}
</script>
  
  <style scoped>
  .custom-checkbox-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .custom-checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid #6b7280;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease-in-out;
    background-color: white;
    position: relative;
    cursor: pointer;
  }
  
  .custom-checkbox:hover {
    border-color: #3b82f6;
  }
  
  .custom-checkbox--checked {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
  
  .custom-checkbox--checked .custom-checkbox__checkmark {
    color: white;
  }
  
  .custom-checkbox--disabled {
    background-color: #f3f4f6;
    border-color: #d1d5db;
    cursor: not-allowed;
  }
  
  .custom-checkbox--disabled:hover {
    border-color: #d1d5db;
  }
  
  .custom-checkbox:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  .custom-checkbox__checkmark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  
  .custom-checkbox__label {
    cursor: pointer;
    user-select: none;
    font-weight: 500;
    color: #374151;
  }
  
  .custom-checkbox--disabled + .custom-checkbox__label {
    color: #9ca3af;
    cursor: not-allowed;
  }
  </style>
  
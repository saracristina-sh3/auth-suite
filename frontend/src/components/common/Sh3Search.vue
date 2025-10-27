<template>
  <div class="flex items-center gap-2 max-w-md">
    <span class="pi pi-search text-muted-foreground"></span>
    <input
      v-model="internalValue"
      :type="type"
      :placeholder="placeholder"
      @input="handleInput"
      @keyup.enter="$emit('search', internalValue)"
    />
    
    <button
      v-if="showClear && internalValue"
      @click="clearSearch"
      class="p-1 text-muted-foreground hover:text-foreground transition-colors"
      type="button"
    >
      <span class="pi pi-times"></span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch  } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Buscar...'
  },
  type: {
    type: String,
    default: 'text'
  },
  currentCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  showCounter: {
    type: Boolean,
    default: true
  },
  showClear: {
    type: Boolean,
    default: true
  },
  inputClass: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value: string) => ['small', 'medium', 'large'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

const clearSearch = () => {
  internalValue.value = ''
  emit('update:modelValue', '')
  emit('clear')
}
</script>
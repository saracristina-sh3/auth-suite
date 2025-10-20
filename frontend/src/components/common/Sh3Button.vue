<template>
  <button
    :type="type"
    :disabled="disabled"
     :class="[
      'inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium transition-all',
      variant === 'primary'
        ? 'bg-primary-500 text-surface-0 hover:bg-primary-600'
        : variant === 'secondary'
        ? 'bg-surface-200 text-surface-800 hover:bg-surface-300'
        : variant === 'danger'
        ? 'bg-ruby-600 text-surface-0 hover:bg-ruby-700'
        : 'bg-transparent text-surface-700 hover:bg-surface-100',
      disabled && 'opacity-50 cursor-not-allowed'
    ]"
    @click="$emit('click')"
  >
    <i v-if="icon" :class="['pi', icon]"></i>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    icon?: string
    variant?: 'primary' | 'secondary' | 'danger' | 'text'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false
  }
)

defineEmits(['click'])
</script>

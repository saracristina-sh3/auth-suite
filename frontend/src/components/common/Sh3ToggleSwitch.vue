<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="toggle"
    :class="[
      'toggle-switch',
      {
        'toggle-switch--checked': modelValue,
        'toggle-switch--disabled': disabled
      }
    ]"
  >
    <span class="toggle-switch__thumb"></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'change': [value: boolean];
}>();

const toggle = () => {
  if (!props.disabled) {
    const newValue = !props.modelValue;
    emit('update:modelValue', newValue);
    emit('change', newValue);
  }
};
</script>

<style scoped>
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
  background-color: var(--surface-300);
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.toggle-switch:hover:not(.toggle-switch--disabled) {
  background-color: var(--surface-400);
}

.toggle-switch--checked {
  background-color: var(--primary-color);
}

.toggle-switch--checked:hover:not(.toggle-switch--disabled) {
  background-color: var(--primary-600);
}

.toggle-switch--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-switch__thumb {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: 1rem;
  height: 1rem;
  background-color: white;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-switch--checked .toggle-switch__thumb {
  left: calc(100% - 1rem - 0.25rem);
}

.toggle-switch:focus-visible {
  box-shadow: 0 0 0 2px var(--primary-color);
}
</style>
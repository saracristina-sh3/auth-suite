<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="toggle"
    :class="[
      'relative inline-block w-12 h-6 rounded-full border-none outline-none transition-all duration-200 ease-in-out',
      disabled
        ? modelValue
          ? 'bg-primary opacity-60 cursor-not-allowed'
          : 'bg-muted opacity-60 cursor-not-allowed'
        : modelValue
          ? 'bg-primary hover:bg-jade-600 cursor-pointer'
          : 'bg-muted hover:bg-border cursor-pointer',
      'focus-visible:shadow-[0_0_0_2px] focus-visible:shadow-primary/50'
    ]"
  >
    <span
      :class="[
        'absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
        modelValue ? 'left-[calc(100%-1rem-0.25rem)]' : 'left-1'
      ]"
    ></span>
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
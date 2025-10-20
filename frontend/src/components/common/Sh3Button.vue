<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click')"
  >
    <!-- Ícone antes do texto -->
    <i v-if="icon && iconPosition === 'left'" :class="['pi', icon]" />

    <!-- Label ou slot -->
    <span v-if="label">{{ label }}</span>
    <slot v-else></slot>

    <!-- Ícone depois do texto -->
    <i v-if="icon && iconPosition === 'right'" :class="['pi', icon]" />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
    variant?: "primary" | "secondary" | "danger" | "warning" | "text";
    outlined?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    iconPosition?: "left" | "right";
  }>(),
  {
    variant: "primary",
    type: "button",
    iconPosition: "left",
    disabled: false,
    outlined: false,
  }
);

defineEmits(["click"]);

const buttonClasses = computed(() => {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all focus:outline-none";

  const variants: Record<string, string> = {
    primary: props.outlined
      ? "border border-blue-500 text-blue-600 bg-transparent hover:bg-blue-50"
      : "bg-blue-600 text-white hover:bg-blue-700",
    secondary: props.outlined
      ? "border border-gray-400 text-gray-700 bg-transparent hover:bg-gray-50"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: props.outlined
      ? "border border-red-500 text-red-600 bg-transparent hover:bg-red-50"
      : "bg-red-600 text-white hover:bg-red-700",
    warning: props.outlined
      ? "border border-yellow-500 text-yellow-600 bg-transparent hover:bg-yellow-50"
      : "bg-yellow-500 text-white hover:bg-yellow-600",
    text: "bg-transparent text-blue-600 hover:bg-blue-50",
  };

  const disabledStyle = props.disabled ? "opacity-50 cursor-not-allowed" : "";

  return [base, variants[props.variant], disabledStyle];
});
</script>

<style scoped>
button i {
  font-size: 1rem;
}
</style>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click')"
  >
    <i v-if="icon && iconPosition === 'left'" :class="['pi', icon, 'text-base']" />

    <span v-if="label">{{ label }}</span>
    <slot v-else></slot>

    <i v-if="icon && iconPosition === 'right'" :class="['pi', icon, 'text-base']" />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
variant?: "primary" | "secondary" | "danger" | "warning" | "text" | "outline";
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
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variants: Record<string, string> = {
    primary: props.outlined
      ? "border border-primary text-primary bg-transparent hover:bg-primary/10 active:bg-primary/20"
      : "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled",
    secondary: props.outlined
      ? "border border-secondary text-secondary bg-transparent hover:bg-secondary/10 active:bg-secondary/20"
      : "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active disabled:bg-secondary-disabled",
    danger: props.outlined
      ? "border border-destructive text-destructive bg-transparent hover:bg-destructive/10 active:bg-destructive/20"
      : "bg-destructive text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-active",
    warning: props.outlined
      ? "border border-sulfur-500 text-sulfur-700 bg-transparent hover:bg-sulfur-50 active:bg-sulfur-100"
      : "bg-sulfur-500 text-sulfur-950 hover:bg-sulfur-600 active:bg-sulfur-700",
    text: "bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20",
    outline: "border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",

  };

  const disabledStyle = props.disabled ? "opacity-50 cursor-not-allowed" : "";

  return [base, variants[props.variant], disabledStyle];
});
</script>

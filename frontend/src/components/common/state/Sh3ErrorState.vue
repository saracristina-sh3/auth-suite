<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <!-- Ícone -->
    <i :class="[icon || 'pi pi-exclamation-triangle', iconClass || 'text-destructive', 'text-4xl mb-4']"></i>

    <!-- Mensagem -->
    <p class="font-medium text-destructive mb-4">
      {{ message }}
    </p>

    <!-- Ações -->
    <div v-if="$slots.default">
      <slot />
    </div>
    <Sh3Button
      v-else-if="buttonLabel"
      :label="buttonLabel"
      :icon="buttonIcon || 'pi pi-refresh'"
      @click="$emit('retry')"
      class="mt-3"
    />
  </div>
</template>

<script setup lang="ts">
import Sh3Button from '@/components/common/Sh3Button.vue'

defineProps<{
  message: string
  icon?: string
  iconClass?: string
  buttonLabel?: string
  buttonIcon?: string
}>()

defineEmits(['retry'])
</script>

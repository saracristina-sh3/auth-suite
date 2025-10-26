<template>
  <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
    <!-- Ícone -->
    <i :class="[computedIcon, computedIconClass, 'text-5xl mb-4']"></i>

    <!-- Título -->
    <h3 v-if="title" class="text-lg font-semibold mb-2" :class="computedTextClass">
      {{ title }}
    </h3>

    <!-- Mensagem -->
    <p class="font-medium mb-2" :class="computedTextClass">
      {{ message }}
    </p>

    <!-- Instrução -->
    <p v-if="instruction" class="text-sm text-muted-foreground max-w-md mb-4">
      {{ instruction }}
    </p>

    <!-- Detalhes técnicos (colapsável) -->
    <details v-if="technicalDetails" class="text-xs text-muted-foreground max-w-md mt-2">
      <summary class="cursor-pointer hover:text-foreground">
        Detalhes técnicos
      </summary>
      <pre class="mt-2 p-2 bg-muted rounded text-left overflow-x-auto">{{ technicalDetails }}</pre>
    </details>

    <!-- Ações -->
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
    <Sh3Button
      v-else-if="buttonLabel"
      :label="buttonLabel"
      :icon="buttonIcon || 'pi pi-refresh'"
      @click="$emit('retry')"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Sh3Button from '@/components/common/Sh3Button.vue'
import type { ErrorSeverity } from '@/types/common/error.types'

const props = withDefaults(
  defineProps<{
    message: string
    title?: string
    instruction?: string
    technicalDetails?: string
    severity?: ErrorSeverity
    icon?: string
    iconClass?: string
    buttonLabel?: string
    buttonIcon?: string
  }>(),
  {
    severity: 'error'
  }
)

defineEmits(['retry'])

// Computed para ícone baseado na severity
const computedIcon = computed(() => {
  if (props.icon) return props.icon

  const severityIcons: Record<ErrorSeverity, string> = {
    'error': 'pi pi-times-circle',
    'warning': 'pi pi-exclamation-triangle',
    'validation': 'pi pi-info-circle'
  }

  return severityIcons[props.severity]
})

// Computed para classe do ícone baseado na severity
const computedIconClass = computed(() => {
  if (props.iconClass) return props.iconClass

  const severityIconClasses: Record<ErrorSeverity, string> = {
    'error': 'text-destructive',
    'warning': 'text-orange-500',
    'validation': 'text-yellow-600'
  }

  return severityIconClasses[props.severity]
})

// Computed para classe do texto baseado na severity
const computedTextClass = computed(() => {
  const severityTextClasses: Record<ErrorSeverity, string> = {
    'error': 'text-destructive',
    'warning': 'text-orange-700',
    'validation': 'text-yellow-700'
  }

  return severityTextClasses[props.severity]
})
</script>

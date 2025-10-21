<template>
  <div
    v-if="visible"
    class="sh3-message rounded-lg px-5 py-4 font-medium border shadow-sm mb-4 transition-all duration-300"
    :class="[type]"
    role="alert"
  >
    <div class="flex items-center justify-between gap-4">
      <!-- Ícone (automático conforme o tipo) -->
      <div class="flex items-center gap-3">
        <i :class="iconClass" class="text-2xl"></i>
        <div>
          <slot />
        </div>
      </div>

      <!-- Botão de fechar (opcional) -->
      <button
        v-if="closable"
        class="bg-transparent border-none text-inherit text-xl cursor-pointer px-2 py-1 transition-opacity duration-200 hover:opacity-70"
        @click="closeMessage"
        aria-label="Fechar"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info', // success | error | warn | info
  },
  closable: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close', 'update:modelValue'])

const visible = ref(props.modelValue)

function closeMessage() {
  visible.value = false
  emit('close')
  emit('update:modelValue', false)
}

// Ícones automáticos baseados no tipo
const iconClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'pi pi-check-circle'
    case 'error':
      return 'pi pi-times-circle'
    case 'warn':
      return 'pi pi-exclamation-triangle'
    default:
      return 'pi pi-info-circle'
  }
})
</script>

<style scoped>
/* Cores específicas por tipo usando paleta SH3 */
.sh3-message.info {
  background-color: hsl(199 95% 94%);
  border-color: hsl(var(--info));
  color: hsl(199 89% 32%);
}

.sh3-message.success {
  background-color: hsl(174 70% 94%);
  border-color: hsl(var(--success));
  color: hsl(174 64% 26%);
}

.sh3-message.error {
  background-color: hsl(0 86% 94%);
  border-color: hsl(var(--destructive));
  color: hsl(0 84% 40%);
}

.sh3-message.warn {
  background-color: hsl(48 96% 94%);
  border-color: hsl(var(--warning));
  color: hsl(48 96% 20%);
}
</style>

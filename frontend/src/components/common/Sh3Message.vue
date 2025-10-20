<template>
  <div
    v-if="visible"
    class="sh3-message"
    :class="[type]"
    role="alert"
  >
    <div class="sh3-message-content">
      <!-- Ícone (automático conforme o tipo) -->
      <div class="left">
        <i :class="iconClass" class="icon"></i>
        <div class="text">
          <slot />
        </div>
      </div>

      <!-- Botão de fechar (opcional) -->
      <button
        v-if="closable"
        class="close-btn"
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
.sh3-message {
  border-radius: 8px;
  padding: 1rem 1.25rem;
  font-weight: 500;
  border: 1px solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.sh3-message-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  font-size: 1.5rem;
}

/* Cores por tipo */
.sh3-message.info {
  background-color: #e0f2fe;
  border-color: #38bdf8;
  color: #0369a1;
}

.sh3-message.success {
  background-color: #dcfce7;
  border-color: #22c55e;
  color: #166534;
}

.sh3-message.error {
  background-color: #fee2e2;
  border-color: #ef4444;
  color: #991b1b;
}

.sh3-message.warn {
  background-color: #fef9c3;
  border-color: #facc15;
  color: #92400e;
}

.close-btn {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 0.7;
}
</style>

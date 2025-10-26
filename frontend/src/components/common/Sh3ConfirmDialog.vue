<template>
  <!-- Overlay -->
  <transition name="fade">
    <div
      v-if="isVisible"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="handleCancel"
    >
      <!-- Dialog -->
      <transition name="scale">
        <div
          v-if="isVisible"
          class="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-md w-full mx-4 overflow-hidden outline-none"
          tabindex="0"
          ref="dialogRef"
        >
          <!-- Header -->
          <div class="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <i
              :class="severityConfig.icon"
              :style="{ color: severityConfig.color, fontSize: '1.5rem' }"
            ></i>
            <span class="text-lg font-semibold">{{ title }}</span>
            <button
              class="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              @click="handleCancel"
              aria-label="Fechar"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="p-4">
            <p class="text-foreground mb-4">{{ message }}</p>

            <!-- Detalhes -->
            <div
              v-if="itemDetails"
              class="bg-muted/30 p-3 rounded-md mb-4"
            >
              <p
                v-for="(value, key) in itemDetails"
                :key="key"
                class="text-sm"
              >
                <strong>{{ key }}:</strong> {{ value }}
              </p>
            </div>

            <!-- Aviso -->
            <div
              v-if="warning"
              class="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
            >
              <i class="pi pi-exclamation-triangle text-yellow-600 dark:text-yellow-500 mt-0.5"></i>
              <p class="text-sm text-yellow-800 dark:text-yellow-200">
                {{ warning }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <Sh3Button
              label="Cancelar"
              variant="secondary"
              @click="handleCancel"
            />
            <Sh3Button
              :label="confirmLabel"
              :variant="severityConfig.variant"
              @click="handleConfirm"
              :loading="loading"
            />
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Sh3Button from './Sh3Button.vue'

export interface ConfirmDialogProps {
  visible: boolean
  title?: string
  message: string
  confirmLabel?: string
  severity?: 'danger' | 'warning' | 'info'
  itemDetails?: Record<string, string>
  warning?: string
  loading?: boolean
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  title: 'Confirmar ação',
  confirmLabel: 'Confirmar',
  severity: 'danger',
  loading: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const isVisible = ref(props.visible)
const dialogRef = ref<HTMLElement | null>(null)

watch(() => props.visible, async (newVal) => {
  isVisible.value = newVal
  if (newVal) {
    await nextTick()
    dialogRef.value?.focus()
  }
})

watch(isVisible, (newVal) => {
  emit('update:visible', newVal)
})

// Configura ícone, cor e estilo com base na severidade
const severityConfig = computed(() => {
  switch (props.severity) {
    case 'danger':
      return {
        icon: 'pi pi-exclamation-circle',
        color: '#ef4444',
        variant: 'danger' as const
      }
    case 'warning':
      return {
        icon: 'pi pi-exclamation-triangle',
        color: '#f59e0b',
        variant: 'warning' as const
      }
    case 'info':
      return {
        icon: 'pi pi-info-circle',
        color: '#3b82f6',
        variant: 'secondary' as const
      }
    default:
      return {
        icon: 'pi pi-question-circle',
        color: '#6b7280',
        variant: 'secondary' as const
      }
  }
})

// Eventos de teclado globais
const handleKeydown = (event: KeyboardEvent) => {
  if (!isVisible.value) return
  if (event.key === 'Escape') {
    handleCancel()
  } else if (event.key === 'Enter') {
    handleConfirm()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Ações
const handleConfirm = () => emit('confirm')
const handleCancel = () => {
  isVisible.value = false
  emit('cancel')
}
</script>

<style scoped>
/* Animações */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>

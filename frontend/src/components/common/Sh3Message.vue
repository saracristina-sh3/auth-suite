<template>
  <div
    v-if="visible"
    class="rounded-lg px-5 py-4 font-medium border shadow-sm mb-4 transition-all duration-300"
    :class="messageClasses"
    role="alert"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <i :class="iconClass" class="text-2xl"></i>
        <div>
          <slot />
        </div>
      </div>

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

const messageClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-jade-50 border-jade-600 text-jade-800'
    case 'error':
      return 'bg-ruby-50 border-ruby-600 text-ruby-800'
    case 'warn':
      return 'bg-sulfur-50 border-sulfur-600 text-sulfur-900'
    default:
      return 'bg-selenium-50 border-selenium-600 text-selenium-800'
  }
})
</script>

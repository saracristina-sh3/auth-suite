<template>
  <transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" @click.self="close">
      <div class="bg-card text-card-foreground rounded-lg w-full max-w-5xl mx-4 shadow-2xl max-h-[90vh] flex flex-col">
        <Sh3ModalHeader :title="title" :subtitle="subtitle" :icon="icon" @close="close" />

        <div class="flex-1 overflow-y-auto p-6">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="flex justify-between items-center gap-3 px-6 py-4 border-t border-border">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import Sh3ModalHeader from './Sh3ModalHeader.vue';

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: "Título do Modal" },
  subtitle: { type: String, default: "" },
  icon: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(props.modelValue);

watchEffect(() => {
  isOpen.value = props.modelValue;
});

function close() {
  emit("update:modelValue", false);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

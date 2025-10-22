<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      @click.self="close"
    >
      <div
        class="bg-card text-card-foreground rounded-lg w-full max-w-5xl mx-4 shadow-2xl max-h-[90vh] flex flex-col"
      >
        <!-- Header -->
        <header
          class="flex justify-between items-center border-b border-border px-6 py-4"
        >
          <div class="flex items-center gap-3">
            <slot name="icon">
              <i v-if="icon" :class="['pi', icon, 'text-primary text-2xl']"></i>
            </slot>
            <div>
              <h2 class="text-xl font-semibold text-card-foreground">
                {{ title }}
              </h2>
              <p v-if="subtitle" class="text-sm text-muted-foreground mt-1">
                {{ subtitle }}
              </p>
            </div>
          </div>
          <button
            class="bg-transparent border-none text-2xl cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-foreground"
            @click="close"
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <slot />
        </div>

        <!-- Footer -->
        <footer
          v-if="$slots.footer"
          class="flex justify-between items-center gap-3 px-6 py-4 border-t border-border"
        >
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";

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

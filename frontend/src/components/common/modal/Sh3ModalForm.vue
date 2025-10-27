<template>
    <transition name="fade">
        <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
            @click.self="close">
            <div
                class="bg-card text-card-foreground rounded-lg w-full max-w-5xl mx-4 shadow-2xl max-h-[90vh] flex flex-col">
                <Sh3ModalHeader :title="title" :subtitle="subtitle" :icon="icon" @close="close" />

                <div class="flex-1 overflow-y-auto p-6">
                    <form @submit.prevent="$emit('submit')" class="space-y-4">
                        <slot />
                    </form>
                </div>

                <footer class="flex justify-end gap-4 px-6 py-4 border-t border-border">
                    <slot name="footer">
                        <Sh3Button :label="cancelLabel" variant="outline" :disabled="loading" @click="close" />

                        <Sh3Button :label="loading ? loadingLabel : submitLabel"
                            :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'" :disabled="loading || disabled"
                            :variant="loading ? 'secondary' : 'primary'" type="submit" @click="$emit('submit')" />
                    </slot>
                </footer>
            </div>
        </div>
    </transition>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import Sh3ModalHeader from './Sh3ModalHeader.vue'
import Sh3Button from '@/components/common/Sh3Button.vue'

const props = defineProps({
    modelValue: { type: Boolean, required: true },
    title: { type: String, default: 'Título do Formulário' },
    subtitle: { type: String, default: '' },
    icon: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    cancelLabel: { type: String, default: 'Cancelar' },
    submitLabel: { type: String, default: 'Salvar' },
    loadingLabel: { type: String, default: 'Salvando...' },
})

const emit = defineEmits(['update:modelValue', 'submit'])

const isOpen = ref(props.modelValue)

watchEffect(() => {
    isOpen.value = props.modelValue
})

function close() {
    emit('update:modelValue', false)
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

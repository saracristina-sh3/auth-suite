<template>
  <transition name="fade">
    <div v-if="visible" class="w-full max-w-[800px] animate-fade-in">
      <div
        class="rounded-xl p-5 shadow-lg border-2 flex items-start justify-between gap-4 text-white"
        :style="bannerStyle"
      >
        <div class="flex items-start gap-4 flex-1">
          <div class="bg-white/20 rounded-lg p-3 shrink-0">
            <i :class="[icon, 'text-white text-3xl']"></i>
          </div>

          <div class="flex-1">
            <h3 class="text-lg font-bold mb-1 flex items-center gap-2">
              <i v-if="showWarningIcon" class="pi pi-exclamation-triangle text-sm"></i>
              {{ title }}
            </h3>

            <p v-if="message" class="text-white/90 text-sm mb-2">
              <slot name="message">{{ message }}</slot>
            </p>

            <div
              v-if="highlight"
              class="bg-white/20 rounded-lg px-4 py-2 inline-flex items-center gap-2 backdrop-blur-sm"
            >
              <i v-if="highlightIcon" :class="[highlightIcon, 'text-lg']"></i>
              <span class="font-bold text-base">{{ highlight }}</span>
            </div>

            <p v-if="footer" class="text-white/80 text-xs mt-3">
              <i v-if="footerIcon" :class="[footerIcon, 'mr-1']"></i>
              {{ footer }}
            </p>
          </div>
        </div>

        <!-- Botão -->
        <div v-if="actionLabel" class="shrink-0">
          <Sh3Button
            :label="actionLabel"
            :icon="actionIcon"
            :variant="buttonVariant"
            outlined
            size="small"
            class="bg-white/10 hover:bg-white/20 border-white/40 text-white"
            @click="$emit('action')"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Sh3Button from './Sh3Button.vue'

const props = withDefaults(
  defineProps<{
    visible?: boolean
    title: string
    message?: string
    icon?: string
    showWarningIcon?: boolean

    highlight?: string
    highlightIcon?: string

    footer?: string
    footerIcon?: string

    actionLabel?: string
    actionIcon?: string
    buttonVariant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'text' | 'outline'

    palette?: 'jade' | 'ruby' | 'sulfur' | 'orange' | 'amber'
  }>(),
  {
    visible: true,
    icon: 'pi pi-info-circle',
    showWarningIcon: false,
    palette: 'jade',
    buttonVariant: 'secondary',
  }
)

defineEmits(['action'])

const bannerStyle = computed(() => {
  const customPalettes: Record<string, { start: string; end: string; border: string }> = {
    'orange': {
      start: '#f97316',
      end: '#c2410c',
      border: '#9a3412'
    },
    'amber': {
      start: '#f59e0b',
      end: '#d97706',
      border: '#b45309'
    }
  }

  const paletteName = props.palette || 'jade'

  if (customPalettes[paletteName]) {
    const palette = customPalettes[paletteName]
    return {
      background: `linear-gradient(to right, ${palette.start}, ${palette.end})`,
      borderColor: palette.border
    }
  }

  const startColor = `var(--${paletteName}-500)`
  const endColor = `var(--${paletteName}-700)`
  const border = `var(--${paletteName}-800)`

  return {
    background: `linear-gradient(to right, ${startColor}, ${endColor})`,
    borderColor: border
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <div 
    :class="[
      'progress-spinner',
      `progress-spinner--${size}`,
      { 'progress-spinner--inline': inline }
    ]" 
    :style="spinnerStyle"
    role="status"
    aria-live="polite"
  >
    <svg 
      class="progress-spinner__circle" 
      viewBox="0 0 100 100"
      :style="svgStyle"
    >
      <circle
        class="progress-spinner__track"
        cx="50"
        cy="50"
        r="45"
        :stroke-width="strokeWidth"
        fill="none"
      />
      <circle
        class="progress-spinner__indicator"
        cx="50"
        cy="50"
        r="45"
        :stroke-width="strokeWidth"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <span v-if="$slots.default || text" class="progress-spinner__text">
      <slot>{{ text }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'normal' | 'large';
  strokeWidth?: number;
  inline?: boolean;
  text?: string;
  progress?: number; 
  indeterminate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'normal',
  strokeWidth: 4,
  inline: false,
  text: '',
  progress: undefined,
  indeterminate: true
})

// Constantes para cálculo do círculo
const radius = 45
const circumference = computed(() => 2 * Math.PI * radius)

// Calcula o dashoffset baseado no progresso
const dashOffset = computed(() => {
  if (props.indeterminate || props.progress === undefined) {
    return circumference.value * 0.25 
  }
  const progress = Math.max(0, Math.min(100, props.progress))
  return circumference.value * (1 - progress / 100)
})

// Estilos baseados no tamanho
const spinnerStyle = computed(() => {
  const sizes = {
    small: '32px',
    normal: '50px',
    large: '80px'
  }
  return {
    width: sizes[props.size],
    height: sizes[props.size]
  }
})

const svgStyle = computed(() => ({
  transform: props.indeterminate ? 'rotate(0deg)' : 'none'
}))
</script>

<style scoped>
.progress-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.progress-spinner--inline {
  flex-direction: row;
  gap: 0.5rem;
}

.progress-spinner__circle {
  width: 100%;
  height: 100%;
  animation: progress-spinner-rotate 2s linear infinite;
}

.progress-spinner__track {
  stroke: var(--surface-200);
}

.progress-spinner__indicator {
  stroke: var(--primary-color);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

/* Modo indeterminado - animação contínua */
.progress-spinner__circle:has(.progress-spinner__indicator:not([style*="stroke-dashoffset"])) {
  animation: progress-spinner-rotate 2s linear infinite;
}

.progress-spinner__circle:has(.progress-spinner__indicator:not([style*="stroke-dashoffset"])) .progress-spinner__indicator {
  animation: progress-spinner-dash 1.5s ease-in-out infinite;
}

.progress-spinner__text {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  text-align: center;
}

.progress-spinner--inline .progress-spinner__text {
  font-size: 0.8rem;
}

/* Animações */
@keyframes progress-spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes progress-spinner-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* Tamanhos específicos */
.progress-spinner--small {
  width: 32px;
  height: 32px;
}

.progress-spinner--normal {
  width: 50px;
  height: 50px;
}

.progress-spinner--large {
  width: 80px;
  height: 80px;
}

/* Acessibilidade - reduzir animações para usuários que preferem */
@media (prefers-reduced-motion: reduce) {
  .progress-spinner__circle {
    animation-duration: 4s;
  }
  
  .progress-spinner__indicator {
    animation-duration: 3s;
  }
}
</style>
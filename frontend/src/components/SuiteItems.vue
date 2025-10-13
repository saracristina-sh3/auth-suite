<script setup lang="ts">
import Card from 'primevue/card';

// Defina as emissões
defineEmits<{
  click: [event: MouseEvent]
}>();
</script>

<template>
  <Card
    class="suite-item-card"
    @click="$emit('click', $event)"
  >
    <template #content>
      <div class="card-content">
        <div class="icon-container">
          <slot name="icon"></slot>
        </div>
        <div class="text-content">
          <h3 class="heading">
            <slot name="heading"></slot>
          </h3>
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.suite-item-card {
  transition: all 0.3s ease;
  height: 100%;
  cursor: pointer;
}

.suite-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.15);
  border-color: var(--color-primary-soft);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  background: var(--color-background-mute);
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.suite-item-card:hover .icon-container {
  background: var(--color-primary);
  color: white;
  transform: scale(1.05);
}

.text-content {
  width: 100%;
}

.heading {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.content {
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Estilos para sobrescrever o PrimeVue */
:deep(.p-card) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: var(--color-background-soft);
}

:deep(.p-card-body) {
  padding: 0 !important;
}

:deep(.p-card-content) {
  padding: 1rem !important;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

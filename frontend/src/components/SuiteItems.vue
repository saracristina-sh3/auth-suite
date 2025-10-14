<script setup lang="ts">
import Card from 'primevue/card';

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
  height: auto;
  width: 220px;
  max-width: 100%;
  cursor: pointer;
  margin: 0 auto;
  border-radius: 1rem;
}

.suite-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.12);
  border-color: var(--color-primary-soft);
}

/* conteúdo interno do card */
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.75rem; /* padding menor */
  gap: 0.5rem; /* aproxima ícone e texto */
}

/* ícone reduzido e mais próximo */
.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.suite-item-card:hover .icon-container {
  transform: scale(1.05);
}

/* texto menor e mais denso */
.heading {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.3rem 0;
}

.content {
  color: var(--color-text);
  font-size: 0.85rem;
  line-height: 1.3;
  max-width: 90%;
}

/* Responsividade: aumenta um pouco em telas pequenas */
@media (max-width: 768px) {
  .suite-item-card {
    width: 180px;
  }
}
</style>

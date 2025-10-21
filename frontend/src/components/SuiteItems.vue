<template>
  <Card
    class="cursor-pointer transition-all duration-300 border-1 surface-border hover:shadow-2xl"
    @click="$emit('click', $event)"
  >
    <template #content>
      <div class="flex flex-column align-items-center gap-2 text-center p-3">
        <div class="text-primary text-4xl">
          <slot name="icon"></slot>
        </div>
        <h3 class="text-lg font-semibold m-0">
          <slot name="heading"></slot>
        </h3>
        <p class="text-color-secondary line-height-3 m-0 text-sm">
          <slot></slot>
        </p>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card';

defineEmits<{
  click: [event: MouseEvent]
}>();
</script>
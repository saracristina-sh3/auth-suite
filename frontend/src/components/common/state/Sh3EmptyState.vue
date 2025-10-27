<template>
  <div
    class="flex flex-col items-center justify-center text-center py-10 px-6"
  >
    <i
      v-if="icon"
      :class="[icon, 'text-6xl mb-4', iconClass]"
    ></i>

    <h3
      v-if="title"
      class="text-lg font-semibold text-foreground mb-2"
    >
      {{ title }}
    </h3>

    <p
      v-if="description"
      class="text-muted-foreground text-center max-w-md"
    >
      {{ description }}
    </p>

    <!-- Slot opcional para conteúdo extra (ex: botão) -->
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  iconClass?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="bg-card rounded-lg shadow-sm border border-border p-4 mb-4">
    <header v-if="$slots.title" class="mb-3">
      <h2 class="text-lg font-semibold text-card-foreground">
        <slot name="title"></slot>
      </h2>
    </header>

    <section v-if="$slots.subtitle" class="mb-2 text-muted-foreground text-sm">
      <slot name="subtitle"></slot>
    </section>

    <section class="text-card-foreground">
      <slot name="content"></slot>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

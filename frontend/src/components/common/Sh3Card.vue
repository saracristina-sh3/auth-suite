<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
    <header v-if="$slots.title" class="mb-3">
      <h2 class="text-lg font-semibold text-gray-800">
        <slot name="title"></slot>
      </h2>
    </header>

    <section v-if="$slots.subtitle" class="mb-2 text-gray-500 text-sm">
      <slot name="subtitle"></slot>
    </section>

    <section>
      <slot name="content"></slot>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<template>
  <div class="bg-card rounded-lg shadow-sm border border-border p-4 mb-4 flex flex-col h-full">
    
    <!-- HEADER: Para imagens, ícones grandes, banners -->
    <header v-if="$slots.header" class="mb-3">
      <slot name="header"></slot>
    </header>

    <!-- TITLE: Título principal do card -->
    <header v-if="$slots.title" class="mb-3">
      <h2 class="text-lg font-semibold text-card-foreground">
        <slot name="title"></slot>
      </h2>
    </header>

    <!-- SUBTITLE: Descrição/Texto secundário -->
    <section v-if="$slots.subtitle" class="mb-2 text-muted-foreground text-sm">
      <slot name="subtitle"></slot>
    </section>

    <!-- CONTENT: Conteúdo principal (flexível) -->
    <section class="text-card-foreground flex-grow">
      <slot name="content"></slot>
    </section>

    <!-- FOOTER: Ações, status, botões -->
    <footer v-if="$slots.footer" class="mt-3 pt-3 border-t border-border">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>
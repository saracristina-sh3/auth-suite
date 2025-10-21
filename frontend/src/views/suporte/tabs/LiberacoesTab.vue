<template>
  <div @tab-change="$emit('tab-change', $event)">
    <Card>
      <template #title>Liberação de Módulos por Autarquia</template>
      <template #subtitle>
        Gerencie quais módulos cada autarquia tem acesso
        (contratos/planos)
      </template>
      <template #content>
        <p class="text-center text-muted-foreground my-5">
          Interface em desenvolvimento...
        </p>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from "primevue/card";

defineEmits<{
  'tab-change': [event: any];
}>();
</script>
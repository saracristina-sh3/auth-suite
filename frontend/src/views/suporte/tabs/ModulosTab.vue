<template>
  <div @tab-change="$emit('tab-change', $event)">
    <Sh3Card>
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <span>Módulos do Sistema</span>
          <Sh3Tag value="Somente Leitura" severity="info" />
        </div>
      </template>
      <template #subtitle>
        Os módulos são fixos e não podem ser criados ou removidos. Você
        pode ativar/desativar globalmente.
      </template>
      <template #content>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mt-4">
          <Sh3Card v-for="modulo in modulos" :key="modulo.id"
            class="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <template #header>
              <div
                class="bg-gradient-to-br from-selenium-600 to-selenium-800 h-[120px] flex items-center justify-center rounded-t-lg">
                <img v-if="modulo.icone" :src="`/src/assets/icons/${modulo.icone}.svg`" :alt="`Ícone ${modulo.nome}`"
                  class="w-20 h-20 object-contain brightness-0 invert" />
                <i v-else class="pi pi-box text-5xl text-white"></i>
              </div>
            </template>
            <template #title>{{ modulo.nome }}</template>
            <template #subtitle>{{ modulo.descricao }}</template>
            <template #content>
              <div class="flex align-items-center justify-content-between mt-3">
                <span class="text-sm text-muted-foreground">Status:</span>
                <Sh3ToggleSwitch v-model="modulo.ativo" @change="$emit('toggle-modulo-status', modulo)" />
              </div>
            </template>
          </Sh3Card>
        </div>
      </template>
    </Sh3Card>
  </div>
</template>

<script setup lang="ts">
import Sh3Card from "@/components/common/Sh3Card.vue";
import Sh3ToggleSwitch from "@/components/common/Sh3ToggleSwitch.vue";
import Sh3Tag from "@/components/common/Sh3Tag.vue";
import type { Modulo } from "@/types/auth";

defineProps<{
  modulos: Modulo[];
}>();

defineEmits<{
  'tab-change': [event: any];
  'toggle-modulo-status': [modulo: Modulo];
}>();
</script>
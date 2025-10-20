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
        <div class="modulos-grid">
          <Sh3Card v-for="modulo in modulos" :key="modulo.id" class="modulo-card">
            <template #header>
              <div class="modulo-header">
                <img 
                  v-if="modulo.icone" 
                  :src="`/src/assets/icons/${modulo.icone}.svg`"
                  :alt="`Ícone ${modulo.nome}`" 
                  class="modulo-icon-svg" 
                />
                <i v-else class="pi pi-box modulo-icon"></i>
              </div>
            </template>
            <template #title>{{ modulo.nome }}</template>
            <template #subtitle>{{ modulo.descricao }}</template>
            <template #content>
              <div class="flex align-items-center justify-content-between mt-3">
                <span class="text-sm text-gray-600">Status:</span>
                <Sh3ToggleSwitch 
                  v-model="modulo.ativo" 
                  @change="$emit('toggle-modulo-status', modulo)" 
                />
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

<style scoped>
.modulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.modulo-card {
  transition: all 0.3s ease;
}

.modulo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.modulo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 0 0;
}

.modulo-icon {
  font-size: 3rem;
  color: white;
}

.modulo-icon-svg {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}
</style>
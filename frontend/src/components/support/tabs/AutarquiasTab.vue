<template>
  <div @tab-change="$emit('tab-change', $event)">
    <GenericTable 
      title="Lista de Autarquias" 
      :items="autarquias" 
      :columns="autarquiaColumns"
      :actions="autarquiaActions" 
      @edit="$emit('edit', $event)" 
      @delete="$emit('delete', $event)" 
      @viewUsers="$emit('view-users')"
      @viewModules="$emit('view-modules')" 
    />
  </div>
</template>

<script setup lang="ts">
import { useAutarquiaTableConfig } from "@/composables/useAutarquiaTableConfig";
import GenericTable from "@/components/common/GenericTable.vue";
import type { Autarquia } from "@/types/auth";

defineProps<{
  autarquias: Autarquia[];
}>();

defineEmits<{
  'tab-change': [event: any];
  'edit': [item: any];
  'delete': [item: any];
  'view-users': [];
  'view-modules': [];
}>();

// Configuração da tabela de autarquias
const autarquiaConfig = useAutarquiaTableConfig();
const autarquiaColumns = autarquiaConfig.columns;
const autarquiaActions = autarquiaConfig.actions;
</script>
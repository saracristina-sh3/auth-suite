<template>
  <div @tab-change="$emit('tab-change', $event)">
    <GenericTable
      title="Lista de Autarquias"
      :items="autarquias"
      :columns="autarquiaColumns"
      :actions="autarquiaActions"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @viewUsers="handleViewUsers"
      @viewModules="handleViewModules"
    />

    <!-- Modais -->
    <AutarquiaUsersModal ref="autarquiaUsersModal" />
    <AutarquiaModulesModal ref="autarquiaModulesModal" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAutarquiaTableConfig } from "@/config/useAutarquiaTableConfig";
import GenericTable from "@/components/common/GenericTable.vue";
import AutarquiaUsersModal from "./modal/AutarquiaUsersModal.vue";
import AutarquiaModulesModal from "./modal/AutarquiaModulesModal.vue";
import type { Autarquia } from "@/types/auth";

defineProps<{
  autarquias: Autarquia[];
}>();

defineEmits<{
  'tab-change': [event: any];
  'edit': [item: any];
  'delete': [item: any];
}>();

// Refs para os modais
const autarquiaUsersModal = ref();
const autarquiaModulesModal = ref();

// Configuração da tabela de autarquias
const autarquiaConfig = useAutarquiaTableConfig();
const autarquiaColumns = autarquiaConfig.columns;
const autarquiaActions = autarquiaConfig.actions;

// Handlers dos modais
function handleViewUsers(autarquia: Autarquia) {
  console.log('📋 Abrindo modal de usuários para autarquia:', autarquia.nome);
  autarquiaUsersModal.value?.open(autarquia);
}

function handleViewModules(autarquia: Autarquia) {
  console.log('📦 Abrindo modal de módulos para autarquia:', autarquia.nome);
  autarquiaModulesModal.value?.open(autarquia);
}
</script>
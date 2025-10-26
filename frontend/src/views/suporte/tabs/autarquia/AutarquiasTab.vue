<template>
  <div @tab-change="$emit('tab-change', $event)">
    <Sh3Table
      title="Lista de Autarquias"
      :items="autarquias"
      :columns="autarquiaColumns"
      :actions="autarquiaActions"
      :loading="loading"
      :error="error"
      empty-icon="pi pi-building"
      empty-title="Nenhuma autarquia cadastrada"
      empty-description="Adicione autarquias para organizar e gerenciar usuários e módulos."
      @edit="$emit('edit', $event)"
      @toggle-status="$emit('toggle-status', $event)"
      @viewUsers="handleViewUsers"
      @viewModules="handleViewModules"
      @retry="$emit('retry')"
    />

    <AutarquiaUsersModal ref="autarquiaUsersModal" />
    <AutarquiaModulesModal ref="autarquiaModulesModal" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAutarquiaTableConfig } from "@/config/useAutarquiaTableConfig";
import Sh3Table from "@/components/common/Sh3Table.vue";
import AutarquiaUsersModal from "./modal/AutarquiaUsersModal.vue";
import AutarquiaModulesModal from "./modal/AutarquiaModulesModal.vue";
import type { Autarquia } from "@/types/support/autarquia.types";

defineProps<{
  autarquias: Autarquia[];
  loading?: boolean;
  error?: string | null;
}>();

defineEmits<{
  'tab-change': [event: any];
  'edit': [item: any];
  'toggle-status': [item: any];
  'retry': [];
}>();

const autarquiaUsersModal = ref();
const autarquiaModulesModal = ref();

const autarquiaConfig = useAutarquiaTableConfig();
const autarquiaColumns = autarquiaConfig.columns;
const autarquiaActions = autarquiaConfig.actions;

function handleViewUsers(autarquia: Autarquia) {
  console.log('📋 Abrindo modal de usuários para autarquia:', autarquia.nome);
  autarquiaUsersModal.value?.open(autarquia);
}

function handleViewModules(autarquia: Autarquia) {
  console.log('📦 Abrindo modal de módulos para autarquia:', autarquia.nome);
  autarquiaModulesModal.value?.open(autarquia);
}
</script>
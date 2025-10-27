<template>
  <div>
    <Sh3Table
      title="Lista de Usuários"
      :items="users"
      :columns="userColumns"
      :actions="userActions"
      :loading="loading"
      :error="error"
      empty-icon="pi pi-users"
      empty-title="Nenhum usuário cadastrado"
      empty-description="Comece adicionando novos usuários ao sistema clicando no botão 'Novo Usuário'."
      @edit="$emit('edit', $event)"
      @toggle-status="$emit('toggle-status', $event)"
      @retry="$emit('retry')"
    >
      <template #column-cpf="{ data }">
        {{ formatCPF(data.cpf) }}
      </template>

      <template #column-autarquia="{ data }">
        {{ getAutarquiaNome(data) }}
      </template>

      <template #column-is_active="{ data }">
        <Sh3Tag :value="data.is_active ? 'Ativo' : 'Inativo'" :severity="data.is_active ? 'success' : 'danger'" />
      </template>
    </Sh3Table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserTableConfig } from "@/config/useUserTableConfig";
import Sh3Table from "@/components/common/Sh3Table.vue";
import Sh3Tag from "@/components/common/Sh3Tag.vue";
import type { Role } from "@/services/role.service";
import type { Autarquia } from "@/types/support/autarquia.types";
import type { User } from "@/types/common/user.types";

defineEmits<{
  'edit': [item: User];
  'toggle-status': [item: User];
  'retry': [];
}>();

function formatCPF(cpf: string): string {
  if (!cpf) return "-";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function getAutarquiaNome(user: User): string {
  const userRecord = user as unknown as Record<string, unknown>;
  const autarquiaPreferidaData = userRecord.autarquiaPreferida as { nome?: string } | undefined;

  console.log('🔍 Debug user data:', {
    id: user.id,
    name: user.name,
    autarquia_ativa: user.autarquia_ativa,
    autarquiaPreferida: autarquiaPreferidaData,
    autarquia_preferida_id: user.autarquia_preferida_id,
    raw_user: user
  });

  return user.autarquia_preferida?.nome || autarquiaPreferidaData?.nome || '-';
}

const props = defineProps<{
  users: User[];
  roles?: Role[];
  autarquias?: Autarquia[];
  loading?: boolean;
  error?: string | null;
}>();

// Criar computed refs para passar para useUserTableConfig
const rolesRef = computed(() => props.roles || []);
const autarquiasRef = computed(() => props.autarquias || []);

const userConfig = useUserTableConfig(rolesRef, autarquiasRef);
const userColumns = userConfig.columns;
const userActions = userConfig.actions;
</script>
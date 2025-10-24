<template>
  <div>
    <Sh3Table title="Lista de Usuários" :items="users" :columns="userColumns" :actions="userActions"
      @edit="$emit('edit', $event)" @delete="$emit('delete', $event)">
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
import { useUserTableConfig } from "@/config/useUserTableConfig";
import Sh3Table from "@/components/common/Sh3Table.vue";
import Sh3Tag from "@/components/common/Sh3Tag.vue";
import type { User } from "@/services/user.service";
import type { Role } from "@/services/role.service";
import type { Autarquia } from "@/types/autarquia.types";

defineEmits<{
  'edit': [item: any];
  'delete': [item: any];
}>();

function formatCPF(cpf: string): string {
  if (!cpf) return "-";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function getAutarquiaNome(user: User): string {
  const userRecord = user as unknown as Record<string, unknown>;
  const autarquiaAtivaData = userRecord.autarquiaAtiva as { nome?: string } | undefined;

  return user.autarquia_ativa?.nome || autarquiaAtivaData?.nome || '-';
}

const props = defineProps<{
  users: User[];
  roles?: Role[];
  autarquias?: Autarquia[];
}>();

const userConfig = useUserTableConfig(
  { value: props.roles || [] } as any,
  { value: props.autarquias || [] } as any
);
const userColumns = userConfig.columns;
const userActions = userConfig.actions;
</script>
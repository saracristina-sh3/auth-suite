<template>
  <!-- Painel de seleção de contexto de autarquia -->
  <Sh3Card v-if="!supportContext" class="mb-4">
    <template #title>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-building"></i>
        <span>Modo Suporte - Selecione uma Autarquia</span>
      </div>
    </template>
    <template #content>
      <p class="mb-3">
        Escolha uma autarquia para acessar como administrador com todas
        as permissões
      </p>
      <div class="flex gap-3">
        <Sh3Select v-model="selectedAutarquiaId" :field="{
          name: 'autarquia',
          label: 'Autarquia',
          type: 'select',
          placeholder: 'Selecione uma autarquia',
          optionLabel: 'nome',
          optionValue: 'id',
          options: autarquias,
        }" class="flex-1" />

        <Sh3Button label="Acessar" icon="pi pi-sign-in" variant="primary" @click="$emit('assume-context')"
          :disabled="!selectedAutarquiaId" />
      </div>
    </template>
  </Sh3Card>

  <!-- Barra de contexto ativo -->
  <Message v-else severity="warn" :closable="false" class="mb-4">
    <div class="flex align-items-center justify-content-between w-full">
      <div class="flex align-items-center gap-3">
        <i class="pi pi-shield" style="font-size: 1.5rem"></i>
        <div>
          <strong>Modo Suporte Ativo:</strong>
          <span class="ml-2">{{ supportContext.autarquia.nome }}</span>
        </div>
      </div>
      <Sh3Button label="Sair do Modo Suporte" icon="pi pi-sign-out" variant="warning" outlined
        @click="$emit('exit-context')" />
    </div>
  </Message>
</template>

<script setup lang="ts">
import type { Autarquia } from "@/types/auth";
import type { SupportContext } from "@/types/support/supportTypes";

defineProps<{
  supportContext: SupportContext | null;
  autarquias: Autarquia[];
}>();

defineEmits<{
  'assume-context': [];
  'exit-context': [];
}>();

const selectedAutarquiaId = defineModel<number | null>('selectedAutarquiaId');
</script>
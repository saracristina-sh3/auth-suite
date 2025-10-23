<template>
  <div @tab-change="$emit('tab-change', $event)">
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
          
          <Sh3Select :modelValue="selectedAutarquiaId"
            @update:modelValue="$emit('update:selected-autarquia-id', $event)" :field="{
              name: 'autarquia',
              label: 'Autarquia',
              type: 'select',
              placeholder: 'Selecione uma autarquia',
              optionLabel: 'nome',
              optionValue: 'id',
              options: autarquias,
            }" class="flex-1" />

          <Sh3Button label="Acessar" icon="pi pi-sign-in" variant="primary" @click="handleAssumeClick"
            :disabled="!selectedAutarquiaId" />
        </div>
      </template>
    </Sh3Card>

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

    <div v-if="message"
      :class="['mb-4 p-3 rounded-md text-white font-medium', messageClass === 'message-success' ? 'bg-success' : messageClass === 'message-error' ? 'bg-destructive' : 'bg-muted-foreground']">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import Sh3Card from "@/components/common/Sh3Card.vue";
import Sh3Select from "@/components/common/Sh3Select.vue";
import Sh3Button from "@/components/common/Sh3Button.vue";
import Message from "primevue/message";
import type { Autarquia } from "@/types/autarquia.types";
import type { SupportContext } from "@/types/support/support.types";

const props = defineProps<{
  supportContext: SupportContext | null;
  autarquias: Autarquia[];
  selectedAutarquiaId: number | null;
  message: string;
  messageClass: string;
}>();

const emit = defineEmits<{
  'tab-change': [event: any];
  'assume-context': [];
  'exit-context': [];
  'update:selected-autarquia-id': [id: number | null];
}>();

function handleAssumeClick() {
  console.log('🖱️ Botão Acessar clicado!');
  console.log('📍 selectedAutarquiaId:', props.selectedAutarquiaId);
  emit('assume-context');
}
</script>
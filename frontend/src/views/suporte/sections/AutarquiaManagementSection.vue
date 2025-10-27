<template>
  <div class="autarquia-management-section">
    <AutarquiasTab
      :autarquias="autarquias"
      :loading="loading"
      :error="error"
      @edit="handleEdit"
      @toggle-status="handleToggleStatus"
      @retry="handleRetry"
    />

    <AutarquiaForm
      ref="autarquiaForm"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AutarquiasTab from '@/views/suporte/sections/tabs/autarquia/AutarquiasTab.vue';
import AutarquiaForm from '@/components/forms/AutarquiaForm.vue';
import { autarquiaService } from '@/services/autarquia.service';
import { useSaveAutarquia } from '@/composables/support/useSaveAutarquia';
import { useConfirmDialog } from '@/composables/common/useConfirmDialog';
import type { Autarquia } from '@/types/support/autarquia.types';

const props = defineProps<{
  autarquias: Autarquia[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  'reload': [];
  'show-message': [type: 'success' | 'error', message: string];
}>();

const autarquiaForm = ref();

const { saveAutarquia } = useSaveAutarquia({
  loadAutarquias: async () => emit('reload'),
  showMessage: (type, message) => emit('show-message', type, message)
});

const { confirmDeactivate, confirmActivate } = useConfirmDialog();

function openNew() {
  autarquiaForm.value?.open();
}

function handleEdit(item: Autarquia) {
  autarquiaForm.value?.open(item);
}

async function handleSave(data: any) {
  await saveAutarquia(data);
}

async function handleToggleStatus(item: Autarquia): Promise<void> {
  const isActive = item.ativo;
  const itemName = item.nome;

  const itemDetails: Record<string, string> = {
    'ID': item.id?.toString() || '',
    'Nome': itemName || ''
  };

  const toggleAction = async () => {
    try {
      await autarquiaService.update(item.id, { nome: item.nome, ativo: !isActive });
      emit('reload');
      emit('show-message', 'success', `Autarquia "${itemName}" ${!isActive ? 'ativada' : 'inativada'} com sucesso.`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      emit('show-message', 'error', 'Erro ao alterar status da autarquia.');
    }
  };

  if (isActive) {
    await confirmDeactivate(itemName, toggleAction, itemDetails);
  } else {
    await confirmActivate(itemName, toggleAction, itemDetails);
  }
}

function handleRetry() {
  emit('reload');
}

defineExpose({
  openNew
});
</script>

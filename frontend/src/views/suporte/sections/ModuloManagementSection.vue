<template>
  <div class="modulo-management-section">
    <ModulosTab
      @toggle-status="handleToggleStatus"
      @toggle-modulo-status="handleToggleModuloStatus"
    />
  </div>
</template>

<script setup lang="ts">
import ModulosTab from '@/views/suporte/sections/tabs/ModulosTab.vue';
import { moduloService } from '@/services/modulos.service';
import { useSaveModulo } from '@/composables/support/useSaveModulo';
import { useConfirmDialog } from '@/composables/common/useConfirmDialog';
import type { Modulo } from '@/types/support/modulos.types';

const props = defineProps<{
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  'reload': [];
  'show-message': [type: 'success' | 'error', message: string];
}>();

const { saveModulo } = useSaveModulo({
  loadModulos: async () => emit('reload'),
  showMessage: (type, message) => emit('show-message', type, message)
});

const { confirmDeactivate, confirmActivate } = useConfirmDialog();

async function handleToggleStatus(item: Modulo): Promise<void> {
  const isActive = item.ativo;
  const itemName = item.nome;

  const itemDetails: Record<string, string> = {
    'ID': item.id?.toString() || '',
    'Nome': itemName || ''
  };

  const toggleAction = async () => {
    try {
      await moduloService.update(item.id, {
        nome: item.nome,
        descricao: item.descricao,
        icone: item.icone,
        ativo: !isActive
      });
      emit('reload');
      emit('show-message', 'success', `Módulo "${itemName}" ${!isActive ? 'ativado' : 'inativado'} com sucesso.`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      emit('show-message', 'error', 'Erro ao alterar status do módulo.');
    }
  };

  if (isActive) {
    await confirmDeactivate(itemName, toggleAction, itemDetails);
  } else {
    await confirmActivate(itemName, toggleAction, itemDetails);
  }
}

async function handleToggleModuloStatus(modulo: Modulo) {
  try {
    console.log('🔄 Alterando status do módulo:', modulo.nome, '→', modulo.ativo);

    await moduloService.update(modulo.id, {
      nome: modulo.nome,
      descricao: modulo.descricao,
      icone: modulo.icone,
      ativo: modulo.ativo
    });

    emit('show-message', 'success', `Módulo "${modulo.nome}" ${modulo.ativo ? 'ativado' : 'desativado'} com sucesso.`);
  } catch (error: unknown) {
    console.error('❌ Erro ao alterar status do módulo:', error);

    modulo.ativo = !modulo.ativo;

    const errorMessage = (error as any).response?.data?.message || 'Erro ao alterar status do módulo.';
    emit('show-message', 'error', errorMessage);
  }
}

defineExpose({});
</script>

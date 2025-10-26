<template>
  <BaseLayout title="Administração do Suporte" icon="pi pi-shield">
    <div class="contents min-h-screen w-full bg-background">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-foreground mb-1">Painel do suporte</h2>
        <p class="text-sm text-muted-foreground font-medium m-0">Área restrita - SH3 Suporte</p>
      </div>
      <div class="flex justify-end mb-4">
        <Sh3Button
          class="!px-3 !py-2 shadow-md flex items-center gap-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all duration-200"
          v-if="showNewButton" @click="onNew">
          <i class="pi pi-plus"> {{ activeTabLabel }} </i>
        </Sh3Button>
      </div>


      <div class="flex gap-2 mb-4 border-b-2 border-border">
        <router-link v-for="tab in tabs" :key="tab.path" :to="tab.path" custom v-slot="{ navigate, isActive }">
          <button @click="navigate" :class="[
            'bg-transparent border-none px-5 py-3 font-medium cursor-pointer border-b-[3px] transition-all duration-200',
            isActive
              ? 'text-primary border-b-primary'
              : 'text-muted-foreground border-b-transparent hover:text-foreground'
          ]">
            {{ tab.label }}
          </button>
        </router-link>
      </div>

      <div class="tabs-content">
        <router-view :users="users" :autarquias="autarquias" :modulos="modulos" :support-context="supportContext"
          :selected-autarquia-id="selectedAutarquiaId" :message="message" :message-class="messageClass"
          @edit="handleEdit" @assume-context="handleAssumeContext" @exit-context="exitContext"
          @toggle-status="handleToggleStatus"
          @toggle-modulo-status="toggleModuloStatus" @update:selected-autarquia-id="selectedAutarquiaId = $event" />
      </div>

      <Sh3Form ref="genericForm" :entityName="activeTabLabel" :fields="currentFields" @save="onSave" />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { userService } from "@/services/user.service";
import { moduloService } from "@/services/modulos.service";
import { useUserTableConfig } from "@/config/useUserTableConfig";
import { useAutarquiaTableConfig } from "@/config/useAutarquiaTableConfig";
import { useModuloTableConfig } from "@/config/useModuloTableConfig";
import { useSaveHandler } from "@/composables/common/useSaveHandler";
import { useNotification } from "@/composables/common/useNotification";
import { useDataLoader } from "@/composables/common/useDataLoader";
import { useSupportContext } from "@/composables/support/useSupportContext";
import { useSupportTabs } from "@/composables/support/useSupportTabs";
import { useConfirmDialog } from "@/composables/common/useConfirmDialog";
import BaseLayout from "@/components/layouts/BaseLayout.vue";
import Sh3Form from "@/components/common/Sh3Form.vue";
import Sh3Button from "@/components/common/Sh3Button.vue";

import type { Modulo } from "@/types/support/modulos.types";

const router = useRouter();

const { showMessage, message, messageClass } = useNotification();
const { loadUsers, loadAutarquias, loadModulos, loadRoles, users, autarquias, modulos, roles, loading } = useDataLoader(showMessage);
const {
  supportContext,
  selectedAutarquiaId,
  handleAssumeContext,
  exitContext
} = useSupportContext(autarquias, showMessage, router);

const genericForm = ref()

const userConfig = useUserTableConfig(roles, autarquias);
const autarquiaConfig = useAutarquiaTableConfig();
const moduloConfig = useModuloTableConfig();

const {
  tabs,
  currentTabName,
  activeTabLabel,
  showNewButton,
  activeTabIndex,
  currentFields
} = useSupportTabs({
  userFields: userConfig.fields,
  autarquiaFields: autarquiaConfig.fields,
  moduloFields: moduloConfig.fields,
  onTabChange: async (tabName) => {
    if (tabName === 'usuarios') {
      await loadUsers()
    } else if (tabName === 'autarquias') {
      await loadAutarquias()
    } else if (tabName === 'modulos') {
      await loadModulos()
    }
  }
})

const { onSave } = useSaveHandler(activeTabIndex, showMessage, { loadUsers, loadAutarquias, loadModulos });
const { confirmDeactivate, confirmActivate } = useConfirmDialog();

function onNew() {
  genericForm.value?.open()
}

async function handleEdit(item: any) {
  if (currentTabName.value === 'usuarios' && item.id) {
    try {
      const userAutarquias = await userService.getUserAutarquias(item.id);

      const autarquiaIds = userAutarquias.map(a => a.id);

      genericForm.value?.open({
        ...item,
        autarquias: autarquiaIds
      });
    } catch (error) {
      console.error('Erro ao carregar autarquias do usuário:', error);
      genericForm.value?.open(item);
    }
  } else {
    genericForm.value?.open(item);
  }
}

async function handleToggleStatus(item: any) {
  const tabName = currentTabName.value;
  const isActive = item.is_active || item.ativo;
  const itemName = item.name || item.nome;

  const itemDetails: Record<string, string> = {
    'ID': item.id?.toString() || '',
    'Nome': itemName || ''
  };

  // Adicionar detalhes específicos por tipo
  if (tabName === 'usuarios') {
    itemDetails['Email'] = item.email || '';
    itemDetails['CPF'] = item.cpf || '';
  }

  const toggleAction = async () => {
    try {
      loading.value = true;

      if (tabName === 'usuarios') {
        await userService.update(item.id, { is_active: !isActive });
        await loadUsers();
        showMessage('success', `Usuário "${itemName}" ${!isActive ? 'ativado' : 'inativado'} com sucesso.`);
      } else if (tabName === 'autarquias') {
        const { autarquiaService } = await import('@/services/autarquia.service');
        await autarquiaService.update(item.id, { nome: item.nome, ativo: !isActive });
        await loadAutarquias();
        showMessage('success', `Autarquia "${itemName}" ${!isActive ? 'ativada' : 'inativada'} com sucesso.`);
      } else if (tabName === 'modulos') {
        await moduloService.update(item.id, {
          nome: item.nome,
          descricao: item.descricao,
          icone: item.icone,
          ativo: !isActive
        });
        await loadModulos();
        showMessage('success', `Módulo "${itemName}" ${!isActive ? 'ativado' : 'inativado'} com sucesso.`);
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      showMessage('error', 'Erro ao alterar status do item.');
    } finally {
      loading.value = false;
    }
  };

  // Mostrar confirmação
  if (isActive) {
    confirmDeactivate(itemName, toggleAction, itemDetails);
  } else {
    confirmActivate(itemName, toggleAction, itemDetails);
  }
}

async function toggleModuloStatus(modulo: Modulo) {
  try {
    loading.value = true;
    console.log("🔄 Alterando status do módulo:", modulo.nome, "→", modulo.ativo);

    await moduloService.update(modulo.id, {
      nome: modulo.nome,
      descricao: modulo.descricao,
      icone: modulo.icone,
      ativo: modulo.ativo,
    });

    showMessage(
      "success",
      `Módulo "${modulo.nome}" ${modulo.ativo ? "ativado" : "desativado"} com sucesso.`
    );
  } catch (error: unknown) {
    console.error("❌ Erro ao alterar status do módulo:", error);

    modulo.ativo = !modulo.ativo;

    const errorMessage = (error as any).response?.data?.message || "Erro ao alterar status do módulo.";
    showMessage("error", errorMessage);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadRoles();
  await loadAutarquias();
});
</script>
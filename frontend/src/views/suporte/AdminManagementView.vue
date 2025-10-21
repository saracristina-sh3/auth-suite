<template>
  <BaseLayout>
    <div class="contents min-h-screen w-full bg-background">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-foreground mb-1">Painel do suporte</h2>
          <p class="text-sm text-muted-foreground font-medium m-0">Área restrita - SH3 Suporte</p>
        </div>
      <!-- Botão fixo (atalho global menor) -->
      <transition name="fade">

        <Sh3Button v-if="activeTab === 1 || activeTab === 2"
          class="!px-3 !py-2 bottom-4 right-4 z-50 shadow-md rounded-full flex items-center gap-1 text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-all duration-200"
      @click="onNew"
    >
          <i class="pi pi-plus text-sm"></i>
          {{ activeTabLabel }}
        </Sh3Button>
      </div>

      <!-- Navegação das Abas -->
      <div class="flex gap-2 mb-4 border-b-2 border-border">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          :class="[
            'bg-transparent border-none px-5 py-3 font-medium cursor-pointer border-b-[3px] transition-all duration-200',
            activeTab === index
              ? 'text-primary border-b-primary'
              : 'text-muted-foreground border-b-transparent hover:text-foreground'
          ]"
          @click="setActiveTab(index)"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Conteúdo das Abas -->
      <div class="tabs-content">
        <component 
          :is="currentTabComponent" 
          :key="activeTab"
          :users="users"
          :autarquias="autarquias"
          :modulos="modulos"
          :support-context="supportContext"
          :selected-autarquia-id="selectedAutarquiaId"
          :message="message"
          :message-class="messageClass"
          @edit="handleEdit"
          @delete="handleDelete"
          @view-users="handleViewUsers"
          @view-modules="handleViewModules"
          @assume-context="handleAssumeContext"
          @exit-context="exitContext"
          @toggle-modulo-status="toggleModuloStatus"
          @update:selected-autarquia-id="selectedAutarquiaId = $event"
        />
      </div>

      <!-- Formulário genérico -->
      <Sh3Form 
        ref="genericForm" 
        :entityName="activeTabLabel" 
        :fields="currentFields" 
        @save="onSave" 
      />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { userService } from "@/services/user.service";
import { autarquiaService } from "@/services/autarquia.service";
import { moduloService } from "@/services/modulos.service";
import { useUserTableConfig } from "@/config/useUserTableConfig";
import { useAutarquiaTableConfig } from "@/config/useAutarquiaTableConfig";
import { useModuloTableConfig } from "@/config/useModuloTableConfig";
import { useSaveHandler } from "@/composables/useSaveHandler";
import { useNotification } from "@/composables/useNotification";
import { useDataLoader } from "@/composables/useDataLoader";
import { useSupportContext } from "@/composables/useSupportContext";
import BaseLayout from "@/components/layouts/BaseLayout.vue";
import Sh3Form from "@/components/common/Sh3Form.vue";
import Sh3Button from "@/components/common/Sh3Button.vue";

// Import dos componentes de tab
import DashboardTab from "./tabs/DashboardTab.vue";
import UsersTab from "./tabs/UserTab.vue";
import AutarquiasTab from "./tabs/AutarquiasTab.vue";
import ModulosTab from "./tabs/ModulosTab.vue";
import LiberacoesTab from "./tabs/LiberacoesTab.vue";
import SupportContextTab from "./tabs/SupportContextTab.vue";

import type {  Modulo } from "@/types/auth";

const router = useRouter();
const tabs = ['Dashboard', 'Usuários', 'Autarquias', 'Módulos', 'Liberações', 'Modo Suporte'];
const activeTab = ref(0);

// Composables
const { showMessage, message, messageClass } = useNotification();
const { loadUsers, loadAutarquias, loadModulos, loadRoles, users, autarquias, modulos, roles, loading } = useDataLoader(showMessage);
const { onSave } = useSaveHandler(activeTab, showMessage, { loadUsers, loadAutarquias, loadModulos });
const { 
  supportContext, 
  selectedAutarquiaId, 
  handleAssumeContext, 
  exitContext 
} = useSupportContext(autarquias, showMessage, router);

// State

const genericForm = ref();

// Composables para configuração de tabelas
const userConfig = useUserTableConfig(roles, autarquias);
const autarquiaConfig = useAutarquiaTableConfig();
const moduloConfig = useModuloTableConfig();

// Computed
const activeTabLabel = computed(() => {
  const labels = ["Usuário", "Autarquia", "Módulo"];
  return labels[activeTab.value] || "Item";
});

const currentTabComponent = computed(() => {
  const components = [
    DashboardTab,
    UsersTab,
    AutarquiasTab,
    ModulosTab,
    LiberacoesTab,
    SupportContextTab
  ];
  return components[activeTab.value] || UsersTab;
});

// Configuração de campos de formulário para cada entidade
const currentFields = computed(() => {
  if (activeTab.value === 0) {
    return userConfig.fields.value;
  } else if (activeTab.value === 1) {
    return autarquiaConfig.fields;
  } else {
    return moduloConfig.fields;
  }
});

// Methods
function setActiveTab(index: number) {
  activeTab.value = index;
  loadCurrentTab();
}


async function loadCurrentTab() {
  if (activeTab.value === 0) {
    await loadUsers();
  } else if (activeTab.value === 1) {
    await loadAutarquias();
  } else if (activeTab.value === 2) {
    await loadModulos();
  }
}

function onNew() {
  genericForm.value?.open();
}

// Event handlers para tabela
async function handleEdit(item: any) {
  // Se for um usuário (tab 0), carregar as autarquias dele
  if (activeTab.value === 0 && item.id) {
    try {
      // Buscar autarquias do usuário
      const userAutarquias = await userService.getUserAutarquias(item.id);

      // Converter para array de IDs
      const autarquiaIds = userAutarquias.map(a => a.id);

      // Abrir formulário com dados do usuário + autarquias
      genericForm.value?.open({
        ...item,
        autarquias: autarquiaIds
      });
    } catch (error) {
      console.error('Erro ao carregar autarquias do usuário:', error);
      // Abrir formulário sem as autarquias em caso de erro
      genericForm.value?.open(item);
    }
  } else {
    // Para autarquias e módulos, apenas abrir normalmente
    genericForm.value?.open(item);
  }
}

async function handleDelete(item: any) {
  const entityName = activeTabLabel.value;
  if (!confirm(`Excluir ${entityName.toLowerCase()} "${item.nome || item.name}"?`)) {
    return;
  }

  try {
    if (activeTab.value === 0) {
      await userService.remove(item.id);
      showMessage("success", "Usuário removido com sucesso.");
      await loadUsers();
    } else if (activeTab.value === 1) {
      await autarquiaService.delete(item.id);
      showMessage("success", "Autarquia removida com sucesso.");
      await loadAutarquias();
    } else if (activeTab.value === 2) {
      await moduloService.delete(item.id);
      showMessage("success", "Módulo removido com sucesso.");
      await loadModulos();
    }
  } catch (error: any) {
    console.error("Erro ao excluir:", error);
    const errorMessage = error.response?.data?.message || "Erro ao excluir.";
    showMessage("error", errorMessage);
  }
}

async function handleViewUsers() {
  showMessage("error", "Funcionalidade em desenvolvimento.");
}

async function handleViewModules() {
  showMessage("error", "Funcionalidade em desenvolvimento.");
}

// Módulos Functions
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

    // Reverter o status em caso de erro
    modulo.ativo = !modulo.ativo;

    const errorMessage = (error as any).response?.data?.message || "Erro ao alterar status do módulo.";
    showMessage("error", errorMessage);
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(async () => {
  await loadRoles();
  await loadAutarquias();
  await loadCurrentTab();
});
</script>
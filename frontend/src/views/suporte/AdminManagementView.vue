<template>
  <BaseLayout>
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <h2 class="admin-title">Painel do suporte</h2>
          <p class="admin-subtitle">Área restrita - SH3 Suporte</p>
        </div>
        <!-- Botão de criar apenas para Usuários e Autarquias -->
        <Sh3Button v-if="activeTab === 0 || activeTab === 1" @click="onNew">
          + {{ activeTabLabel }}
        </Sh3Button>
      </div>

      <!-- Navegação das Abas -->
      <div class="tabs-nav">
        <button 
          v-for="(tab, index) in tabs" 
          :key="index" 
          :class="['tab-button', { active: activeTab === index }]"
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
import UsersTab from "@/components/support/tabs/UserTab.vue";
import AutarquiasTab from "@/components/support/tabs/AutarquiasTab.vue";
import ModulosTab from "@/components/support/tabs/ModulosTab.vue";
import LiberacoesTab from "@/components/support/tabs/LiberacoesTab.vue";
import SupportContextTab from "@/components/support/tabs/SupportContextTab.vue";

import type {  Modulo } from "@/types/auth";

const router = useRouter();
const tabs = ['Usuários', 'Autarquias', 'Módulos', 'Liberações', 'Modo Suporte'];
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

<style scoped>
.admin-container {
  display: contents;
  min-height: 100vh;
  width: 100%;
  background: var(--color-background);
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.admin-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.admin-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin: 0;
}

.tabs-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.tab-button {
  background: none;
  border: none;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #111827;
}

.tab-button.active {
  color: #2563eb;
  border-color: #2563eb;
}

.message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  color: white;
  font-weight: 500;
}

.message-success {
  background-color: #16a34a;
}

.message-error {
  background-color: #dc2626;
}

.message-info {
  background-color: #6b7280;
}
</style>
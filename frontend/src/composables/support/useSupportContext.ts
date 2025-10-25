import { ref, onMounted, type Ref } from 'vue';
import { supportService } from "@/services/support.service";
import type { SupportContext } from "@/types/support/support.types";
import type { Autarquia } from "@/types/autarquia.types";
import type { Router } from 'vue-router';

export function useSupportContext(
  autarquias: Ref<Autarquia[]>, 
  showMessage: (type: "success" | "error", text: string) => void, 
  router: Router
) {
  const supportContext = ref<SupportContext | null>(null);
  const selectedAutarquiaId = ref<number | null>(null);
  const loading = ref(false);

  onMounted(() => {
    supportContext.value = supportService.getSupportContext();
  });

  async function handleAssumeContext() {
    console.log('🎯 handleAssumeContext chamado!');
    console.log('📋 selectedAutarquiaId.value:', selectedAutarquiaId.value, 'tipo:', typeof selectedAutarquiaId.value);
    console.log('📋 autarquias disponíveis:', autarquias.value.length);
    console.log('📋 IDs das autarquias:', autarquias.value.map(a => ({ id: a.id, tipo: typeof a.id, nome: a.nome })));

    if (!selectedAutarquiaId.value) {
      console.warn('⚠️ Nenhuma autarquia selecionada');
      showMessage("error", "Selecione uma autarquia.");
      return;
    }

    // Converter para number para garantir comparação correta
    const selectedId = Number(selectedAutarquiaId.value);
    const autarquia = autarquias.value.find((a) => Number(a.id) === selectedId);
    console.log('🔍 Autarquia encontrada:', autarquia);

    if (!autarquia) {
      console.error('❌ Autarquia não encontrada no array');
      showMessage("error", "Autarquia não encontrada.");
      return;
    }

    if (!autarquia.ativo) {
      console.warn('⚠️ Autarquia inativa:', autarquia.nome);
      showMessage("error", "Esta autarquia está inativa e não pode ser acessada.");
      return;
    }

    try {
      loading.value = true;
      console.log("🔄 Iniciando assumeAutarquiaContext para:", autarquia.nome, "ID:", autarquia.id);

      const context = await supportService.assumeAutarquiaContext(autarquia.id);
      supportContext.value = context;
      selectedAutarquiaId.value = null;

      showMessage("success", `Modo suporte ativado para: ${autarquia.nome}. Redirecionando...`);
      console.log("✅ Contexto de suporte ativo:", context);

      setTimeout(() => {
        console.log("🚀 Redirecionando para /home");
        router.push({ name: "home" });
      }, 1000);
    } catch (error: any) {
      console.error("❌ Erro ao selecionar autarquia:", error);
      console.error("❌ Stack trace:", error.stack);
      const errorMessage = error.message || "Erro ao ativar modo suporte. Tente novamente.";
      showMessage("error", errorMessage);
    } finally {
      loading.value = false;
    }
  }

  async function exitContext() {
    if (!confirm("Deseja sair do modo suporte e retornar ao seu contexto original?")) {
      return;
    }

    try {
      loading.value = true;
      console.log("🔙 Saindo do modo suporte...");

      await supportService.exitAutarquiaContext();
      supportContext.value = null;

      showMessage("success", "Retornado ao contexto original. Redirecionando...");
      console.log("✅ Modo suporte desativado");

      // Redirecionar de volta para AdminManagementView
      setTimeout(() => {
        console.log("🚀 Redirecionando para /suporteSH3");
        router.push({ path: "/suporteSH3" });
      }, 1000);
    } catch (error: any) {
      console.error("❌ Erro ao sair do contexto:", error);
      const errorMessage = error.message || "Erro ao sair do modo suporte. Tente novamente.";
      showMessage("error", errorMessage);
    } finally {
      loading.value = false;
    }
  }

  return {
    supportContext,
    selectedAutarquiaId,
    loading,
    handleAssumeContext,
    exitContext
  };
}
import { ref, onMounted, type Ref } from 'vue';
import { supportService, type SupportContext } from "@/services/support.service";
import type { Autarquia } from "@/types/auth";
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
    if (!selectedAutarquiaId.value) {
      showMessage("error", "Selecione uma autarquia.");
      return;
    }

    const autarquia = autarquias.value.find((a) => a.id === selectedAutarquiaId.value);
    if (!autarquia) {
      showMessage("error", "Autarquia não encontrada.");
      return;
    }

    if (!autarquia.ativo) {
      showMessage("error", "Esta autarquia está inativa e não pode ser acessada.");
      return;
    }

    try {
      loading.value = true;
      console.log("🔄 Selecionando autarquia:", autarquia.nome);

      const context = await supportService.assumeAutarquiaContext(autarquia.id);
      supportContext.value = context;
      selectedAutarquiaId.value = null;

      showMessage("success", `Modo suporte ativado para: ${autarquia.nome}. Redirecionando...`);
      console.log("✅ Contexto de suporte ativo:", context);

      setTimeout(() => {
        router.push({ name: "home" });
      }, 1000);
    } catch (error: any) {
      console.error("❌ Erro ao selecionar autarquia:", error);
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

      showMessage("success", "Retornado ao contexto original.");
      console.log("✅ Modo suporte desativado");
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
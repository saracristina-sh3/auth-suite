import { autarquiaService } from "@/services/autarquia.service";
import { handleApiError, formatValidationErrors } from "@/utils/error-handler";
import type { AutarquiaFormPayload } from "@/types/support/form-payloads.types";

interface SaveAutarquiaDependencies {
  loadAutarquias: () => Promise<void>;
  showMessage: (type: "success" | "error", text: string) => void;
}

export function useSaveAutarquia(dependencies: SaveAutarquiaDependencies) {
  const { loadAutarquias, showMessage } = dependencies;

  async function saveAutarquia(data: AutarquiaFormPayload): Promise<void> {
    try {
      if (data.id) {
        // Atualizar autarquia existente
        await autarquiaService.update(data.id, data);
        showMessage("success", "Autarquia atualizada com sucesso.");
      } else {
        // Criar nova autarquia
        await autarquiaService.create(data);
        showMessage("success", "Autarquia criada com sucesso.");
      }

      await loadAutarquias();
    } catch (err: unknown) {
      const { message, errors, type } = handleApiError(err);

      // Se for erro de validação, mostrar todos os erros
      if (type === 'validation' && errors) {
        const validationMessages = formatValidationErrors(errors);
        showMessage("error", validationMessages || message);
      } else {
        showMessage("error", message);
      }

      // Não lançar novamente o erro para evitar crashes
      console.error('Erro ao salvar autarquia:', err);
    }
  }

  return {
    saveAutarquia
  };
}

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

        await autarquiaService.update(data.id, data);
        showMessage("success", "Autarquia atualizada com sucesso.");
      } else {

        await autarquiaService.create(data);
        showMessage("success", "Autarquia criada com sucesso.");
      }

      await loadAutarquias();
    } catch (err: unknown) {
      const { message, errors, type } = handleApiError(err);


      if (type === 'validation' && errors) {
        const validationMessages = formatValidationErrors(errors);
        showMessage("error", validationMessages || message);
      } else {
        showMessage("error", message);
      }

      console.error('Erro ao salvar autarquia:', err);
    }
  }

  return {
    saveAutarquia
  };
}

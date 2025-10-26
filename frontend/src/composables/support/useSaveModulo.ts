import { moduloService } from "@/services/modulos.service";
import { handleApiError, formatValidationErrors } from "@/utils/error-handler";
import type { ModuloFormPayload } from "@/types/support/form-payloads.types";

interface SaveModuloDependencies {
  loadModulos: () => Promise<void>;
  showMessage: (type: "success" | "error", text: string) => void;
}

export function useSaveModulo(dependencies: SaveModuloDependencies) {
  const { loadModulos, showMessage } = dependencies;

  async function saveModulo(data: ModuloFormPayload): Promise<void> {
    try {
      if (data.id) {
        // Atualizar módulo existente
        await moduloService.update(data.id, data);
        showMessage("success", "Módulo atualizado com sucesso.");
      } else {
        // Criar novo módulo
        await moduloService.create(data);
        showMessage("success", "Módulo criado com sucesso.");
      }

      await loadModulos();
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
      console.error('Erro ao salvar módulo:', err);
    }
  }

  return {
    saveModulo
  };
}

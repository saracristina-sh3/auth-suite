import { userService } from "@/services/user.service";
import { autarquiaService } from "@/services/autarquia.service";
import { moduloService } from "@/services/modulos.service";
import type { Ref } from "vue";
import { handleApiError, formatValidationErrors } from "@/utils/error-handler";
import type { SyncAutarquiasPayload } from "@/types/common/use-autarquia-pivot.types";

interface SaveHandlerDependencies {
  loadUsers: () => Promise<void>;
  loadAutarquias: () => Promise<void>;
  loadModulos: () => Promise<void>;
}

export function useSaveHandler(
  activeTab: Ref<number>,
  showMessage: (type: "success" | "error", text: string) => void,
  dependencies: SaveHandlerDependencies
) {
  const { loadUsers, loadAutarquias, loadModulos } = dependencies;

  async function onSave(data: any): Promise<void> {
    try {
      if (activeTab.value === 1) {
        // Salvar usuário (tab index 1)
        let userId: number;

        if (data.id) {
          // Atualizar usuário existente
          const updatedUser = await userService.update(data.id, data);
          userId = updatedUser.id;
          showMessage("success", "Usuário atualizado com sucesso.");
        } else {
          // Criar novo usuário
          const newUser = await userService.create(data);
          userId = newUser.id;
          showMessage("success", "Usuário criado com sucesso.");
        }

        // Sincronizar autarquias se foram fornecidas
        if (data.autarquias && Array.isArray(data.autarquias)) {
          console.log('🔄 Sincronizando autarquias do usuário:', data.autarquias);

          // Preparar payload para syncAutarquias
          const autarquiasToSync: SyncAutarquiasPayload[] = data.autarquias.map((autarquiaId: number) => ({
            id: autarquiaId,
            pivot_data: {
              role: data.role || 'user',
              is_admin: false,
              is_default: autarquiaId === data.autarquia_ativa_id, 
              ativo: true
            }
          }));

          await userService.syncAutarquias(userId, autarquiasToSync);
          console.log('✅ Autarquias sincronizadas com sucesso');
        }

        // Atualizar autarquia ativa se foi fornecida
        if (data.autarquia_ativa_id) {
          console.log('🔄 Atualizando autarquia ativa:', data.autarquia_ativa_id);
          await userService.updateActiveAutarquia(userId, data.autarquia_ativa_id);
          console.log('✅ Autarquia ativa atualizada com sucesso');
        }

        await loadUsers();
      } else if (activeTab.value === 2) {
        // Salvar autarquia (tab index 2)
        if (data.id) {
          await autarquiaService.update(data.id, data);
          showMessage("success", "Autarquia atualizada com sucesso.");
        } else {
          await autarquiaService.create(data);
          showMessage("success", "Autarquia criada com sucesso.");
        }
        await loadAutarquias();
      } else if (activeTab.value === 3) {
        // Salvar módulo (tab index 3)
        if (data.id) {
          await moduloService.update(data.id, data);
          showMessage("success", "Módulo atualizado com sucesso.");
        } else {
          await moduloService.create(data);
          showMessage("success", "Módulo criado com sucesso.");
        }
        await loadModulos();
      }
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
      console.error('Erro ao salvar:', err);
    }
  }

  return {
    onSave
  };
}

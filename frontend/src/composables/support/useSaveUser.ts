import { userService } from "@/services/user.service";
import { handleApiError, formatValidationErrors } from "@/utils/error-handler";
import type { SyncAutarquiasPayload } from "@/types/common/use-autarquia-pivot.types";
import type { UserFormPayload } from "@/types/support/form-payloads.types";

interface SaveUserDependencies {
  loadUsers: () => Promise<void>;
  showMessage: (type: "success" | "error", text: string) => void;
}

export function useSaveUser(dependencies: SaveUserDependencies) {
  const { loadUsers, showMessage } = dependencies;

  async function saveUser(data: UserFormPayload): Promise<void> {
    try {
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
      console.error('Erro ao salvar usuário:', err);
    }
  }

  return {
    saveUser
  };
}

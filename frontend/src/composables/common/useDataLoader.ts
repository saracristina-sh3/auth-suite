import { ref } from 'vue';
import { userService } from "@/services/user.service";
import { roleService } from "@/services/role.service";
import { autarquiaService } from "@/services/autarquia.service";
import { moduloService } from "@/services/modulos.service";
import type { Role, Permission } from "@/services/role.service";
import type { Autarquia } from "@/types/support/autarquia.types";
import type { Modulo } from "@/types/support/modulos.types";
import type { User } from "@/types/common/user.types";
import { handleApiError } from "@/utils/error-handler";

export function useDataLoader(showMessage: (type: "success" | "error", text: string) => void) {
  const users = ref<User[]>([]);
  const autarquias = ref<Autarquia[]>([]);
  const modulos = ref<Modulo[]>([]);
  const roles = ref<Role[]>([]);
  const permissions = ref<Permission>({});
  const loading = ref(false);

  async function loadUsers() {
    try {
      loading.value = true;
      const response = await userService.list();
      users.value = response.items;
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Erro ao carregar usuários:", error);
      showMessage("error", message);
    } finally {
      loading.value = false;
    }
  }

  async function loadAutarquias() {
    try {
      loading.value = true;
      autarquias.value = await autarquiaService.list();
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Erro ao carregar autarquias:", error);
      showMessage("error", message);
    } finally {
      loading.value = false;
    }
  }

  async function loadModulos() {
    try {
      loading.value = true;
      modulos.value = await moduloService.list();
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Erro ao carregar módulos:", error);
      showMessage("error", message);
    } finally {
      loading.value = false;
    }
  }

  async function loadRoles() {
    try {
      const response = await roleService.list();
      roles.value = response.roles;
      permissions.value = response.permissions;
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Erro ao carregar roles:", error);
      showMessage("error", message);
    }
  }

  return {
    users,
    autarquias,
    modulos,
    roles,
    permissions,
    loading,
    loadUsers,
    loadAutarquias,
    loadModulos,
    loadRoles
  };
}
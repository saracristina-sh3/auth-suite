import { ref } from 'vue';
import { userService } from "@/services/user.service";
import { roleService } from "@/services/role.service";
import { autarquiaService } from "@/services/autarquia.service";
import { moduloService } from "@/services/modulos.service";
import type { User } from "@/services/user.service";
import type { Role, Permission } from "@/services/role.service";
import type { Autarquia } from "@/types/autarquia.types";
import type { Modulo } from "@/types/modulos.types";

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
      console.error("Erro ao carregar usuários:", error);
      showMessage("error", "Falha ao carregar usuários.");
    } finally {
      loading.value = false;
    }
  }

  async function loadAutarquias() {
    try {
      loading.value = true;
      autarquias.value = await autarquiaService.list();
    } catch (error) {
      console.error("Erro ao carregar autarquias:", error);
      showMessage("error", "Falha ao carregar autarquias.");
    } finally {
      loading.value = false;
    }
  }

  async function loadModulos() {
    try {
      loading.value = true;
      modulos.value = await moduloService.list();
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
      showMessage("error", "Falha ao carregar módulos.");
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
      console.error("Erro ao carregar roles:", error);
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
import { ref, computed } from 'vue';
import { userService } from "@/services/user.service";
import { roleService } from "@/services/role.service";
import { autarquiaService } from "@/services/autarquia.service";
import { moduloService } from "@/services/modulos.service";
import type { Role, Permission } from "@/services/role.service";
import type { Autarquia } from "@/types/support/autarquia.types";
import type { Modulo } from "@/types/support/modulos.types";
import type { User } from "@/types/common/user.types";
import { handleApiError } from "@/utils/error-handler";
import { useCache } from "@/composables/common/useCache";
import type { PaginationMeta } from "@/types/common/pagination.types";

// Caches com TTL de 5 minutos
const usersCache = useCache<User[]>({
  key: 'users-admin',
  ttl: 5 * 60 * 1000
});

const autarquiasCache = useCache<Autarquia[]>({
  key: 'autarquias-admin',
  ttl: 5 * 60 * 1000
});

const modulosCache = useCache<Modulo[]>({
  key: 'modulos-admin',
  ttl: 5 * 60 * 1000
});

export function useDataLoader(showMessage: (type: "success" | "error", text: string) => void) {
  const users = ref<User[]>([]);
  const autarquias = ref<Autarquia[]>([]);
  const modulos = ref<Modulo[]>([]);
  const roles = ref<Role[]>([]);
  const permissions = ref<Permission>({});
  const loading = ref(false);
  const usersError = ref<string | null>(null);
  const autarquiasError = ref<string | null>(null);
  const modulosError = ref<string | null>(null);

  const usersPaginationMeta = ref<PaginationMeta | null>(null);
  const autarquiasPaginationMeta = ref<PaginationMeta | null>(null);
  const modulosPaginationMeta = ref<PaginationMeta | null>(null);

  async function loadUsers(page: number = 1, perPage: number = 10, forceRefresh: boolean = false) {
    try {
      loading.value = true;
      usersError.value = null;

      const response = await userService.list({ page, per_page: perPage });

      users.value = response.data;
      usersPaginationMeta.value = response.meta;
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Erro ao carregar usuários:", error);
      usersError.value = message;
      showMessage("error", message);
    } finally {
      loading.value = false;
    }
  }

  async function loadAutarquias(page: number = 1, perPage: number = 10, forceRefresh: boolean = false) {
    try {
      loading.value = true;
      autarquiasError.value = null;

      const response = await autarquiaService.list({ page, per_page: perPage });

      autarquias.value = response.data;
      autarquiasPaginationMeta.value = response.meta;
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Erro ao carregar autarquias:", error);
      autarquiasError.value = message;
      showMessage("error", message);
    } finally {
      loading.value = false;
    }
  }

  async function loadModulos(page: number = 1, perPage: number = 10, forceRefresh: boolean = false) {
    try {
      loading.value = true;
      modulosError.value = null;

      const response = await moduloService.list(undefined, { page, per_page: perPage });

      modulos.value = response.data;
      modulosPaginationMeta.value = response.meta;
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Erro ao carregar módulos:", error);
      modulosError.value = message;
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

  /**
   * Invalida cache e recarrega usuários
   */
  const refreshUsers = async (page: number = 1, perPage: number = 10) => {
    console.log('🔄 Invalidando cache de usuários e recarregando...');
    usersCache.invalidate();
    await loadUsers(page, perPage, true);
  };

  /**
   * Invalida cache e recarrega autarquias
   */
  const refreshAutarquias = async (page: number = 1, perPage: number = 10) => {
    console.log('🔄 Invalidando cache de autarquias e recarregando...');
    autarquiasCache.invalidate();
    await loadAutarquias(page, perPage, true);
  };

  /**
   * Invalida cache e recarrega módulos
   */
  const refreshModulos = async (page: number = 1, perPage: number = 10) => {
    console.log('🔄 Invalidando cache de módulos e recarregando...');
    modulosCache.invalidate();
    await loadModulos(page, perPage, true);
  };

  const usersCacheInfo = computed(() => ({
    hasCache: usersCache.hasValidCache.value,
    timeToExpire: usersCache.timeToExpire.value,
    timeToExpireMinutes: Math.ceil(usersCache.timeToExpire.value / 60000)
  }));

  const autarquiasCacheInfo = computed(() => ({
    hasCache: autarquiasCache.hasValidCache.value,
    timeToExpire: autarquiasCache.timeToExpire.value,
    timeToExpireMinutes: Math.ceil(autarquiasCache.timeToExpire.value / 60000)
  }));

  const modulosCacheInfo = computed(() => ({
    hasCache: modulosCache.hasValidCache.value,
    timeToExpire: modulosCache.timeToExpire.value,
    timeToExpireMinutes: Math.ceil(modulosCache.timeToExpire.value / 60000)
  }));

  return {
    users,
    autarquias,
    modulos,
    roles,
    permissions,
    loading,
    usersError,
    autarquiasError,
    modulosError,
    loadUsers,
    loadAutarquias,
    loadModulos,
    loadRoles,
    refreshUsers,
    refreshAutarquias,
    refreshModulos,
    usersCacheInfo,
    autarquiasCacheInfo,
    modulosCacheInfo,
    usersPaginationMeta,
    autarquiasPaginationMeta,
    modulosPaginationMeta
  };
}
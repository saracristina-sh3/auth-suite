import api from './api'

/**
 * Representa uma role (perfil) do sistema
 */
export interface Role {
  /** Label amigável (ex: "Administrador") */
  label: string
  /** Valor interno (ex: "admin") */
  value: string
}

/**
 * Mapa de permissões por role
 */
export interface Permission {
  [key: string]: string[]
}

/**
 * Resposta da API ao listar roles
 */
export interface RoleResponse {
  /** Lista de roles disponíveis */
  roles: Role[]
  /** Mapa de permissões por role */
  permissions: Permission
}

/**
 * Serviço de gerenciamento de roles (perfis de usuário)
 *
 * @description Fornece acesso às roles disponíveis no sistema e suas permissões.
 *
 * @example
 * const { roles, permissions } = await roleService.list()
 * console.log('Roles disponíveis:', roles)
 * console.log('Permissões do admin:', permissions.admin)
 */
export const roleService = {
  /**
   * Lista todas as roles disponíveis no sistema
   *
   * @returns {Promise<RoleResponse>} Roles e suas permissões
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const { roles, permissions } = await roleService.list()
   *
   * // Usar roles em um select
   * roles.forEach(role => {
   *   console.log(`${role.label} (${role.value})`)
   * })
   *
   * // Verificar permissões de uma role
   * const adminPermissions = permissions.admin
   * console.log('Admin pode:', adminPermissions)
   */
  async list(): Promise<RoleResponse> {
    const response = await api.get('/roles')
    console.log('🎭 Roles response:', response.data)
    return response.data.data
  },
}
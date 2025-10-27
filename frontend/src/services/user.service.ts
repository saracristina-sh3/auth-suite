import api from './api'
import type { ApiResponse } from '@/types/common/api.types'
import type { PaginatedResponse } from '@/types/common/api.types'
import type { User } from '@/types/common/user.types'
import type { AutarquiaWithPivot, UserAutarquiaPivot, SyncAutarquiasPayload } from '@/types/common/use-autarquia-pivot.types'


/**
 * Serviço de gerenciamento de usuários
 *
 * @description Fornece operações CRUD completas para usuários, incluindo
 * gerenciamento de autarquias vinculadas e autarquia ativa.
 *
 * @example
 * // Listar usuários
 * const users = await userService.list({ page: 1, per_page: 10 })
 *
 * // Criar usuário
 * const newUser = await userService.create({
 *   name: 'João Silva',
 *   email: 'joao@example.com',
 *   cpf: '12345678900',
 *   password: 'senha123',
 *   role: 'user'
 * })
 */
export const userService = {
  /**
   * Lista todos os usuários com paginação
   *
   * @param {Object} params - Parâmetros de paginação e filtros
   * @param {number} params.page - Número da página (padrão: 1)
   * @param {number} params.per_page - Itens por página (padrão: 15)
   * @param {string} params.search - Termo de busca (nome ou email)
   * @param {string} params.role - Filtrar por role (user, admin, superadmin, etc)
   * @param {boolean} params.is_active - Filtrar por status ativo
   *
   * @returns {Promise<PaginatedResponse<User>>} Resposta paginada com usuários
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const response = await userService.list({
   *   page: 1,
   *   per_page: 10,
   *   search: 'joão',
   *   role: 'admin'
   * })
   * console.log(response.data) // Array de usuários
   * console.log(response.meta) // Metadados de paginação
   */
  async list(params = {}): Promise<PaginatedResponse<User>> {
    try {
      console.log('🔄 userService.list - Chamando API...')

      const response = await api.get('/users', { params })
      console.log('📦 userService.list - Resposta:', response.data)

      return response.data

    } catch (error) {
      console.error('❌ Erro no userService.list:', error)
      throw error
    }
  },

  /**
   * Busca um usuário específico por ID
   *
   * @param {number} id - ID do usuário
   *
   * @returns {Promise<User>} Usuário encontrado
   *
   * @throws {Error} Se o usuário não for encontrado (404) ou requisição falhar
   *
   * @example
   * const user = await userService.get(1)
   * console.log(user.name) // 'João Silva'
   */
  async get(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`)
    return response.data.data
  },

  /**
   * Cria um novo usuário
   *
   * @param {Partial<User>} payload - Dados do novo usuário
   * @param {string} payload.name - Nome completo (obrigatório)
   * @param {string} payload.email - Email único (obrigatório)
   * @param {string} payload.cpf - CPF único, apenas números (obrigatório)
   * @param {string} payload.password - Senha, mínimo 6 caracteres (obrigatório)
   * @param {string} payload.role - Role do usuário (user, admin, superadmin, etc)
   * @param {number[]} payload.autarquias - IDs das autarquias vinculadas
   * @param {number} payload.autarquia_preferida_id - ID da autarquia padrão
   * @param {boolean} payload.is_active - Status ativo (padrão: true)
   *
   * @returns {Promise<User>} Usuário criado
   *
   * @throws {Error} Se validação falhar ou requisição falhar
   *
   * @example
   * const newUser = await userService.create({
   *   name: 'João Silva',
   *   email: 'joao@example.com',
   *   cpf: '12345678900',
   *   password: 'senha123',
   *   role: 'user',
   *   autarquias: [1, 2],
   *   autarquia_preferida_id: 1,
   *   is_active: true
   * })
   */
  async create(payload: Partial<User>): Promise<User> {
    const response = await api.post('/users', payload)
    return response.data.data
  },

  /**
   * Atualiza um usuário existente
   *
   * @param {number} id - ID do usuário a ser atualizado
   * @param {Partial<User>} payload - Dados a serem atualizados
   * @param {string} payload.name - Nome completo
   * @param {string} payload.email - Email único
   * @param {string} payload.cpf - CPF único, apenas números
   * @param {string} payload.password - Nova senha (opcional, só atualiza se fornecida)
   * @param {string} payload.role - Role do usuário
   * @param {number[]} payload.autarquias - IDs das autarquias vinculadas
   * @param {number} payload.autarquia_preferida_id - ID da autarquia padrão
   * @param {boolean} payload.is_active - Status ativo
   *
   * @returns {Promise<User>} Usuário atualizado
   *
   * @throws {Error} Se o usuário não for encontrado ou validação falhar
   *
   * @example
   * const updatedUser = await userService.update(1, {
   *   name: 'João Silva Atualizado',
   *   email: 'joao.novo@example.com'
   * })
   */
  async update(id: number, payload: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, payload)
    return response.data.data
  },

  /**
   * Remove um usuário
   *
   * @param {number} id - ID do usuário a ser removido
   *
   * @returns {Promise<void>}
   *
   * @throws {Error} Se o usuário não for encontrado ou não puder ser removido
   *
   * @example
   * await userService.remove(1)
   */
  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },

  // ====================================
  // MÉTODOS DE GESTÃO DE AUTARQUIAS
  // ====================================

  /**
   * Busca todas as autarquias vinculadas a um usuário específico
   *
   * @param userId - ID do usuário
   * @returns Array de autarquias com dados da pivot
   *
   * @example
   * const autarquias = await userService.getUserAutarquias(1)
   * console.log(autarquias[0].pivot.role) // 'admin'
   */
  async getUserAutarquias(userId: number): Promise<AutarquiaWithPivot[]> {
    try {
      console.log(`🔄 userService.getUserAutarquias - Buscando autarquias do usuário ${userId}...`)

      const response = await api.get<ApiResponse<AutarquiaWithPivot[]>>(`/users/${userId}/autarquias`)
      console.log('📦 userService.getUserAutarquias - Resposta:', response.data)

      return response.data.data || []

    } catch (error) {
      console.error('❌ Erro ao buscar autarquias do usuário:', error)
      throw error
    }
  },

  /**
   * Anexa uma ou mais autarquias a um usuário
   *
   * @param userId - ID do usuário
   * @param autarquiaIds - Array de IDs das autarquias a serem anexadas
   * @param pivotData - Dados opcionais para a tabela pivot (role, is_admin, etc.)
   *
   * @example
   * await userService.attachAutarquias(1, [1, 2, 3], {
   *   role: 'admin',
   *   is_admin: true,
   *   ativo: true
   * })
   */
  async attachAutarquias(
    userId: number,
    autarquiaIds: number[],
    pivotData?: Partial<UserAutarquiaPivot>
  ): Promise<void> {
    try {
      console.log(`🔄 userService.attachAutarquias - Anexando autarquias ao usuário ${userId}...`)

      const payload = {
        autarquia_ids: autarquiaIds,
        pivot_data: pivotData || {}
      }

      const response = await api.post<ApiResponse<void>>(
        `/users/${userId}/autarquias/attach`,
        payload
      )

      console.log('✅ userService.attachAutarquias - Sucesso:', response.data.message)

    } catch (error) {
      console.error('❌ Erro ao anexar autarquias:', error)
      throw error
    }
  },

  /**
   * Desanexa uma ou mais autarquias de um usuário
   *
   * @param userId - ID do usuário
   * @param autarquiaIds - Array de IDs das autarquias a serem desanexadas
   *
   * @example
   * await userService.detachAutarquias(1, [1, 2])
   */
  async detachAutarquias(userId: number, autarquiaIds: number[]): Promise<void> {
    try {
      console.log(`🔄 userService.detachAutarquias - Desanexando autarquias do usuário ${userId}...`)

      const payload = {
        autarquia_ids: autarquiaIds
      }

      const response = await api.post<ApiResponse<void>>(
        `/users/${userId}/autarquias/detach`,
        payload
      )

      console.log('✅ userService.detachAutarquias - Sucesso:', response.data.message)

    } catch (error) {
      console.error('❌ Erro ao desanexar autarquias:', error)
      throw error
    }
  },

  /**
   * Sincroniza as autarquias de um usuário
   * Remove todas as autarquias existentes e adiciona apenas as fornecidas
   *
   * @param userId - ID do usuário
   * @param autarquias - Array de objetos com id da autarquia e dados da pivot
   *
   * @example
   * await userService.syncAutarquias(1, [
   *   { id: 1, pivot_data: { role: 'admin', is_admin: true } },
   *   { id: 2, pivot_data: { role: 'user', is_admin: false } }
   * ])
   */
  async syncAutarquias(
    userId: number,
    autarquias: SyncAutarquiasPayload[]
  ): Promise<void> {
    try {
      console.log(`🔄 userService.syncAutarquias - Sincronizando autarquias do usuário ${userId}...`)

      const payload = {
        autarquias: autarquias
      }

      const response = await api.post<ApiResponse<void>>(
        `/users/${userId}/autarquias/sync`,
        payload
      )

      console.log('✅ userService.syncAutarquias - Sucesso:', response.data.message)

    } catch (error) {
      console.error('❌ Erro ao sincronizar autarquias:', error)
      throw error
    }
  },

  /**
   * Atualiza a autarquia ativa de um usuário
   *
   * @param userId - ID do usuário
   * @param autarquiaId - ID da autarquia a ser definida como ativa
   *
   * @example
   * await userService.updateActiveAutarquia(1, 5)
   */
  async updateActiveAutarquia(userId: number, autarquiaId: number): Promise<void> {
    try {
      console.log(`🔄 userService.updateActiveAutarquia - Atualizando autarquia ativa do usuário ${userId}...`)

      const payload = {
        autarquia_ativa_id: autarquiaId
      }

      const response = await api.put<ApiResponse<void>>(
        `/users/${userId}/active-autarquia`,
        payload
      )

      console.log('✅ userService.updateActiveAutarquia - Sucesso:', response.data.message)

    } catch (error) {
      console.error('❌ Erro ao atualizar autarquia ativa:', error)
      throw error
    }
  },

  /**
   * Retorna estatísticas dos usuários
   *
   * @returns {Promise<Object>} Estatísticas dos usuários
   * @returns {number} return.total - Total de usuários
   * @returns {number} return.ativos - Usuários ativos
   * @returns {number} return.inativos - Usuários inativos
   * @returns {number} return.superadmins - Usuários superadmin
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const stats = await userService.getStats()
   * console.log(`Total: ${stats.total}, Ativos: ${stats.ativos}`)
   */
  async getStats(): Promise<{ total: number; ativos: number; inativos: number; superadmins: number }> {
    const response = await api.get<{ data: { total: number; ativos: number; inativos: number; superadmins: number } }>('/users/stats')
    return response.data.data
  },
}

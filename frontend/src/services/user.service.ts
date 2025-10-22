// src/services/user.service.ts
import api from './auth.service'

/**
 * Interface representando uma Autarquia
 */
export interface Autarquia {
  id: number
  nome: string
  ativo: boolean
}

/**
 * Interface representando os dados da tabela pivot usuario_autarquia
 */
export interface UserAutarquiaPivot {
  role: string
  is_admin: boolean
  is_default: boolean
  ativo: boolean
  data_vinculo: string
}

/**
 * Interface representando uma Autarquia com dados da pivot
 */
export interface AutarquiaWithPivot extends Autarquia {
  pivot: UserAutarquiaPivot
}

/**
 * Interface do usuário atualizada com suporte a múltiplas autarquias
 */
export interface User {
  id: number
  name: string
  email: string
  cpf: string
  role: string
  is_superadmin: boolean
  is_active: boolean
  autarquia_ativa_id?: number | null
  autarqui_ativa_nome?: string
  autarquia_ativa?: Autarquia | null
  autarquias?: AutarquiaWithPivot[]
}

export interface PaginatedResponse<T> {
  items: T[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

/**
 * Interface para resposta padrão da API
 */
interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

/**
 * Payload para sincronização de autarquias
 */
export interface SyncAutarquiasPayload {
  id: number
  pivot_data?: Partial<UserAutarquiaPivot>
}

export const userService = {
  /**
   * Lista todos os usuários com paginação
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
   */
  async get(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`)
    return response.data.data
  },

  /**
   * Cria um novo usuário
   */
  async create(payload: Partial<User>): Promise<User> {
    const response = await api.post('/users', payload)
    return response.data.data
  },

  /**
   * Atualiza um usuário existente
   */
  async update(id: number, payload: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, payload)
    return response.data.data
  },

  /**
   * Remove um usuário
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
   */
  async getStats(): Promise<{ total: number; ativos: number; inativos: number; superadmins: number }> {
    const response = await api.get<{ data: { total: number; ativos: number; inativos: number; superadmins: number } }>('/users/stats')
    return response.data.data
  },
}

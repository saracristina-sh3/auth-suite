import api from './api'
import type { Autarquia } from '@/types/support/autarquia.types'

/**
 * Resposta da API ao gerenciar autarquia ativa na sessão
 */
interface SessionAutarquiaResponse {
  success: boolean
  message?: string
  data: {
    autarquia_ativa_id: number | null
    autarquia_ativa: Autarquia | null
  }
}

/**
 * Serviço de gerenciamento de sessão Laravel
 *
 * @description Gerencia a autarquia ativa na sessão do Laravel (server-side).
 * A autarquia ativa na sessão determina qual autarquia o usuário está visualizando
 * no momento.
 *
 * @example
 * // Definir autarquia ativa
 * await sessionService.setActiveAutarquia(1)
 *
 * // Obter autarquia ativa
 * const { data } = await sessionService.getActiveAutarquia()
 * console.log('Autarquia ativa:', data.autarquia_ativa?.nome)
 *
 * // Limpar autarquia ativa
 * await sessionService.clearActiveAutarquia()
 */
export const sessionService = {
  /**
   * Define a autarquia ativa na sessão atual (Laravel)
   *
   * @param {number} autarquiaId - ID da autarquia a ser definida como ativa
   *
   * @returns {Promise<SessionAutarquiaResponse>} Resposta com a autarquia definida
   *
   * @throws {Error} Se a autarquia não existir ou requisição falhar
   *
   * @example
   * const response = await sessionService.setActiveAutarquia(1)
   * console.log('Autarquia ativa definida:', response.data.autarquia_ativa?.nome)
   */
  async setActiveAutarquia(autarquiaId: number): Promise<SessionAutarquiaResponse> {
    const response = await api.post('/session/active-autarquia', {
      autarquia_id: autarquiaId
    })
    return response.data
  },

  /**
   * Obtém a autarquia ativa da sessão atual (Laravel)
   *
   * @returns {Promise<SessionAutarquiaResponse>} Resposta com a autarquia ativa
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const { data } = await sessionService.getActiveAutarquia()
   * if (data.autarquia_ativa) {
   *   console.log('Autarquia ativa:', data.autarquia_ativa.nome)
   * } else {
   *   console.log('Nenhuma autarquia ativa')
   * }
   */
  async getActiveAutarquia(): Promise<SessionAutarquiaResponse> {
    const response = await api.get('/session/active-autarquia')
    return response.data
  },

  /**
   * Remove a autarquia ativa da sessão
   *
   * @returns {Promise<void>}
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * await sessionService.clearActiveAutarquia()
   * console.log('Autarquia ativa removida da sessão')
   */
  async clearActiveAutarquia(): Promise<void> {
    await api.delete('/session/active-autarquia')
  }
}
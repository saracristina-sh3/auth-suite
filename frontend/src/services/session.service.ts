import api from './api'
import type { Autarquia } from './user.service'

interface SessionAutarquiaResponse {
  success: boolean
  message?: string
  data: {
    autarquia_ativa_id: number | null
    autarquia_ativa: Autarquia | null
  }
}

export const sessionService = {
  /**
   * Define a autarquia ativa na sessão atual (backend)
   */
  async setActiveAutarquia(autarquiaId: number): Promise<SessionAutarquiaResponse> {
    const response = await api.post('/session/active-autarquia', {
      autarquia_id: autarquiaId
    })
    return response.data
  },

  /**
   * Obtém a autarquia ativa da sessão atual (backend)
   */
  async getActiveAutarquia(): Promise<SessionAutarquiaResponse> {
    const response = await api.get('/session/active-autarquia')
    return response.data
  },

  /**
   * Remove a autarquia ativa da sessão
   */
  async clearActiveAutarquia(): Promise<void> {
    await api.delete('/session/active-autarquia')
  }
}
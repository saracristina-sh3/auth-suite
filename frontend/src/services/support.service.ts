import api from './auth.service'
import type { Autarquia, Modulo } from '@/types/auth'

export interface SupportContext {
  autarquia: Autarquia
  support_mode: boolean
  is_admin: boolean
  modulos: Modulo[]
  permissions: {
    view: boolean
    create: boolean
    edit: boolean
    delete: boolean
    manage_users: boolean
    manage_modules: boolean
  }
}

export interface AssumeContextResponse {
  success: boolean
  message: string
  token: string
  context: SupportContext
}

export interface ExitContextResponse {
  success: boolean
  message: string
  token: string
  user: any
}

class SupportService {
  private readonly STORAGE_KEY = 'support_context'

  /**
   * Assume o contexto de uma autarquia específica
   * Apenas para usuários superadmin (Sh3)
   */
  async assumeAutarquiaContext(autarquiaId: number): Promise<SupportContext> {
    try {
      const token = localStorage.getItem('auth_token')
      console.log('🔄 Assumindo contexto de autarquia:', autarquiaId)
      console.log('🔑 Token disponível:', token ? 'Sim' : 'Não')
      console.log('🔑 Token:', token?.substring(0, 20) + '...')

      const { data } = await api.post<AssumeContextResponse>('/support/assume-context', {
        autarquia_id: autarquiaId,
      })

      if (data.success && data.token && data.context) {
        // Salvar dados originais do usuário antes de modificar
        const originalUserData = localStorage.getItem('user_data')
        if (originalUserData) {
          localStorage.setItem('original_user_data', originalUserData)
        }

        // Atualizar o token de autenticação
        localStorage.setItem('auth_token', data.token)
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`

        // Salvar o contexto de suporte no localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.context))

        // IMPORTANTE: Modificar os dados do usuário para parecer um admin da autarquia
        const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}')
        const modifiedUser = {
          ...currentUser,
          autarquia_id: data.context.autarquia.id,
          autarquia: data.context.autarquia,
          role: 'admin', // Temporariamente admin da autarquia
          is_superadmin: false, // Desabilitar flag de superadmin temporariamente
          _support_mode: true, // Flag interna para identificar modo suporte
        }
        localStorage.setItem('user_data', JSON.stringify(modifiedUser))

        console.log('✅ Contexto assumido com sucesso:', data.context.autarquia.nome)
        console.log('👤 Usuário modificado temporariamente:', modifiedUser)

        return data.context
      } else {
        throw new Error(data.message || 'Falha ao assumir contexto')
      }
    } catch (error: any) {
      console.error('❌ Erro ao assumir contexto:', error)
      const message =
        error.response?.data?.message || 'Erro ao assumir contexto da autarquia. Tente novamente.'
      throw new Error(message)
    }
  }

  /**
   * Sai do modo suporte e retorna ao contexto original do usuário
   */
  async exitAutarquiaContext(): Promise<void> {
    try {
      console.log('🔙 Saindo do modo suporte...')

      const { data } = await api.post<ExitContextResponse>('/support/exit-context')

      if (data.success && data.token && data.user) {
        // Atualizar o token de autenticação
        localStorage.setItem('auth_token', data.token)
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`

        // Restaurar dados originais do usuário (se existir backup)
        const originalUserData = localStorage.getItem('original_user_data')
        if (originalUserData) {
          localStorage.setItem('user_data', originalUserData)
          localStorage.removeItem('original_user_data')
          console.log('✅ Dados originais do usuário restaurados')
        } else {
          // Caso não tenha backup, usa os dados retornados pela API
          localStorage.setItem('user_data', JSON.stringify(data.user))
        }

        // Remover o contexto de suporte
        localStorage.removeItem(this.STORAGE_KEY)

        console.log('✅ Retornado ao contexto original')
      } else {
        throw new Error(data.message || 'Falha ao sair do contexto')
      }
    } catch (error: any) {
      console.error('❌ Erro ao sair do contexto:', error)
      const message =
        error.response?.data?.message || 'Erro ao sair do modo suporte. Tente novamente.'
      throw new Error(message)
    }
  }

  /**
   * Verifica se está em modo suporte
   */
  isInSupportMode(): boolean {
    const context = this.getSupportContext()
    return context !== null && context.support_mode === true
  }

  /**
   * Obtém o contexto de suporte atual do localStorage
   */
  getSupportContext(): SupportContext | null {
    try {
      const contextData = localStorage.getItem(this.STORAGE_KEY)
      if (!contextData || contextData === 'undefined' || contextData === 'null') {
        return null
      }

      const parsed = JSON.parse(contextData)
      if (parsed && typeof parsed === 'object' && parsed.support_mode) {
        return parsed as SupportContext
      } else {
        localStorage.removeItem(this.STORAGE_KEY)
        return null
      }
    } catch (error) {
      console.error('Erro ao fazer parse do support_context:', error)
      localStorage.removeItem(this.STORAGE_KEY)
      return null
    }
  }

  /**
   * Obtém a autarquia do contexto de suporte atual
   */
  getCurrentAutarquia(): Autarquia | null {
    const context = this.getSupportContext()
    return context?.autarquia || null
  }

  /**
   * Obtém os módulos disponíveis no contexto de suporte atual
   */
  getCurrentModulos(): Modulo[] {
    const context = this.getSupportContext()
    return context?.modulos || []
  }

  /**
   * Verifica se tem permissão específica no contexto de suporte
   */
  hasPermission(permission: keyof SupportContext['permissions']): boolean {
    const context = this.getSupportContext()
    if (!context || !context.support_mode) return false
    return context.permissions[permission] || false
  }

  /**
   * Limpa o contexto de suporte (útil em caso de erro ou logout)
   */
  clearSupportContext(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

export const supportService = new SupportService()
export default supportService

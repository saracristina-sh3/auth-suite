import api from './api'
import type { Autarquia } from '@/types/support/autarquia.types'
import type { Modulo } from '@/types/support/modulos.types'
import type { SupportContext, AssumeContextResponse, ExitContextResponse } from '@/types/support/support.types'
import { getItem, setItem, removeItem, STORAGE_KEYS } from '@/utils/storage'
import type { User } from '@/types/common/user.types'

class SupportService {
  private readonly STORAGE_KEY = 'support_context'

  /**
   * Assume o contexto de uma autarquia específica
   * Apenas para usuários superadmin (Sh3)
   */
  async assumeAutarquiaContext(autarquiaId: number): Promise<SupportContext> {
    try {
      const token = getItem<string>(STORAGE_KEYS.AUTH_TOKEN, '')
      console.log('🔄 Assumindo contexto de autarquia:', autarquiaId)
      console.log('🔑 Token disponível:', token ? 'Sim' : 'Não')

      const { data } = await api.post<AssumeContextResponse>('/support/assume-context', {
        autarquia_id: autarquiaId,
      })

      if (data.success && data.token && data.context) {
        // Salvar dados originais do usuário antes de modificar
        const originalUserData = getItem<User | null>(STORAGE_KEYS.USER, null)
        if (originalUserData) {
          setItem('original_user_data', originalUserData)
          console.log('💾 Dados originais do usuário salvos')
        }

        // Atualizar o token de autenticação
        setItem(STORAGE_KEYS.AUTH_TOKEN, data.token)
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`
        console.log('🔑 Novo token de suporte definido')

        // ✅ Salvar contexto de suporte no localStorage
        setItem(this.STORAGE_KEY, data.context)
        console.log('💾 Contexto de suporte salvo no localStorage')

        // ✅ Atualizar user_data com autarquia ativa e flag de support_mode
        const currentUser = getItem<User>(STORAGE_KEYS.USER, {} as User)
        const modifiedUser = {
          ...currentUser,
          _support_mode: true,
          autarquia_ativa_id: data.context.autarquia.id,
          autarquia_ativa: {
            id: data.context.autarquia.id,
            nome: data.context.autarquia.nome,
            ativo: data.context.autarquia.ativo
          }
        }
        setItem(STORAGE_KEYS.USER, modifiedUser)
        console.log('💾 user_data atualizado com autarquia ativa:', data.context.autarquia.nome)

        console.log('✅ Contexto assumido com sucesso:', data.context.autarquia.nome)
        console.log('📋 Módulos disponíveis:', data.context.modulos?.length || 0)

        return data.context
      } else {
        throw new Error(data.message || 'Falha ao assumir contexto')
      }
    } catch (error: unknown) {
      console.error('❌ Erro ao assumir contexto:', error)
      let message = 'Erro ao assumir contexto da autarquia. Tente novamente.'
      if (typeof error === 'object' && error !== null) {
        const maybeMessage = (error as any)?.response?.data?.message
        if (typeof maybeMessage === 'string' && maybeMessage.length) {
          message = maybeMessage
        }
      }
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
        setItem(STORAGE_KEYS.AUTH_TOKEN, data.token)
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`
        console.log('🔑 Token original restaurado')

        // Restaurar dados originais do usuário (se existir backup)
        const originalUserData = getItem<User | null>('original_user_data', null)
        if (originalUserData) {
          setItem(STORAGE_KEYS.USER, originalUserData)
          removeItem('original_user_data')
          console.log('✅ Dados originais do usuário restaurados')
        } else {
          // Caso não tenha backup, usa os dados retornados pela API
          // Mas remove flag _support_mode e autarquia_ativa
          const cleanUser = {
            ...data.user,
            _support_mode: undefined,
            autarquia_ativa_id: data.user.autarquia_preferida_id || undefined,
            autarquia_ativa: data.user.autarquia_ativa || undefined
          }
          setItem(STORAGE_KEYS.USER, cleanUser)
          console.log('✅ Dados do usuário atualizados (sem modo suporte)')
        }

        // Remover o contexto de suporte
        removeItem(this.STORAGE_KEY)
        console.log('🧹 Contexto de suporte removido')

        console.log('✅ Retornado ao contexto original')
      } else {
        throw new Error(data.message || 'Falha ao sair do contexto')
      }
    } catch (error: unknown) {
      console.error('❌ Erro ao sair do contexto:', error)
      let message = 'Erro ao sair do modo suporte. Tente novamente.'
      if (typeof error === 'object' && error !== null) {
        const maybeMessage = (error as any)?.response?.data?.message
        if (typeof maybeMessage === 'string' && maybeMessage.length) {
          message = maybeMessage
        }
      }
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
    const contextData = getItem<SupportContext | null>(this.STORAGE_KEY, null)
    if (contextData && typeof contextData === 'object' && contextData.support_mode) {
      return contextData
    }
    return null
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
    removeItem(this.STORAGE_KEY)
    removeItem('original_user_data')
    console.log('🧹 Contexto de suporte limpo (support_context e original_user_data removidos)')
  }
}

export const supportService = new SupportService()
export default supportService

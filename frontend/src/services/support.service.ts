import api from './api'
import type { Autarquia } from '@/types/support/autarquia.types'
import type { Modulo } from '@/types/support/modulos.types'
import type { SupportContext, AssumeContextResponse, ExitContextResponse } from '@/types/support/support.types'
import { getItem, setItem, removeItem, STORAGE_KEYS } from '@/utils/storage'
import type { User } from '@/types/common/user.types'
import { tokenService } from './token.service'

/**
 * Serviço de gerenciamento do modo suporte
 *
 * @description Permite que superadmins (Sh3) assumam o contexto de uma autarquia
 * para realizar operações administrativas. Gerencia a troca de contexto, tokens
 * temporários e restauração do contexto original.
 *
 * @example
 * // Assumir contexto de uma autarquia
 * const context = await supportService.assumeAutarquiaContext(1)
 * console.log('Modo suporte ativo:', context.autarquia.nome)
 *
 * // Verificar se está em modo suporte
 * if (supportService.isInSupportMode()) {
 *   console.log('Trabalhando como:', supportService.getCurrentAutarquia()?.nome)
 * }
 *
 * // Sair do modo suporte
 * await supportService.exitAutarquiaContext()
 */
class SupportService {
  private readonly STORAGE_KEY = 'support_context'

  /**
   * Assume o contexto de uma autarquia específica
   *
   * @description Apenas para usuários superadmin (Sh3). Cria um token temporário
   * e salva o contexto da autarquia, permitindo que o superadmin trabalhe como
   * se fosse dessa autarquia.
   *
   * @param {number} autarquiaId - ID da autarquia a assumir
   *
   * @returns {Promise<SupportContext>} Contexto de suporte com autarquia e módulos
   *
   * @throws {Error} Se o usuário não for superadmin ou autarquia não existir
   *
   * @example
   * try {
   *   const context = await supportService.assumeAutarquiaContext(1)
   *   console.log('Assumindo autarquia:', context.autarquia.nome)
   *   console.log('Módulos disponíveis:', context.modulos.length)
   * } catch (error) {
   *   console.error('Erro ao assumir contexto:', error.message)
   * }
   */
  async assumeAutarquiaContext(autarquiaId: number): Promise<SupportContext> {
    try {
      const token = tokenService.getAccessToken()
      console.log('🔄 Assumindo contexto de autarquia:', autarquiaId)
      console.log('🔑 Token disponível:', token ? 'Sim' : 'Não')

      const { data } = await api.post<AssumeContextResponse>('/support/assume-context', {
        autarquia_id: autarquiaId,
      })

      if (data.success && data.token && data.context) {
        const originalUserData = getItem<User | null>(STORAGE_KEYS.USER, null)
        if (originalUserData) {
          setItem('original_user_data', originalUserData)
          console.log('💾 Dados originais do usuário salvos')
        }

        setItem(STORAGE_KEYS.AUTH_TOKEN, data.token)
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`
        console.log('🔑 Novo token de suporte definido')

        setItem(this.STORAGE_KEY, data.context)
        console.log('💾 Contexto de suporte salvo no localStorage')

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
   *
   * @description Restaura o token original do superadmin, limpa o contexto de
   * suporte e restaura os dados originais do usuário.
   *
   * @returns {Promise<void>}
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * try {
   *   await supportService.exitAutarquiaContext()
   *   console.log('Retornado ao contexto original')
   * } catch (error) {
   *   console.error('Erro ao sair do contexto:', error.message)
   * }
   */
  async exitAutarquiaContext(): Promise<void> {
    try {
      console.log('🔙 Saindo do modo suporte...')

      const { data } = await api.post<ExitContextResponse>('/support/exit-context')

      if (data.success && data.token && data.user) {
        setItem(STORAGE_KEYS.AUTH_TOKEN, data.token)
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`
        console.log('🔑 Token original restaurado')

        const originalUserData = getItem<User | null>('original_user_data', null)
        if (originalUserData) {
          setItem(STORAGE_KEYS.USER, originalUserData)
          removeItem('original_user_data')
          console.log('✅ Dados originais do usuário restaurados')
        } else {
          const cleanUser = {
            ...data.user,
            _support_mode: undefined,
            autarquia_ativa_id: data.user.autarquia_preferida_id || undefined,
            autarquia_ativa: data.user.autarquia_ativa || undefined
          }
          setItem(STORAGE_KEYS.USER, cleanUser)
          console.log('✅ Dados do usuário atualizados (sem modo suporte)')
        }

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
   *
   * @returns {boolean} true se está trabalhando em modo suporte
   *
   * @example
   * if (supportService.isInSupportMode()) {
   *   console.log('Em modo suporte')
   * }
   */
  isInSupportMode(): boolean {
    const context = this.getSupportContext()
    return context !== null && context.support_mode === true
  }

  /**
   * Obtém o contexto de suporte atual do localStorage
   *
   * @returns {SupportContext|null} Contexto de suporte ou null se não estiver ativo
   *
   * @example
   * const context = supportService.getSupportContext()
   * if (context) {
   *   console.log('Autarquia:', context.autarquia.nome)
   *   console.log('Permissões:', context.permissions)
   * }
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
   *
   * @returns {Autarquia|null} Autarquia atual ou null se não estiver em modo suporte
   *
   * @example
   * const autarquia = supportService.getCurrentAutarquia()
   * if (autarquia) {
   *   console.log('Trabalhando na autarquia:', autarquia.nome)
   * }
   */
  getCurrentAutarquia(): Autarquia | null {
    const context = this.getSupportContext()
    return context?.autarquia || null
  }

  /**
   * Obtém os módulos disponíveis no contexto de suporte atual
   *
   * @returns {Modulo[]} Array de módulos disponíveis (vazio se não estiver em modo suporte)
   *
   * @example
   * const modulos = supportService.getCurrentModulos()
   * console.log('Módulos disponíveis:', modulos.length)
   */
  getCurrentModulos(): Modulo[] {
    const context = this.getSupportContext()
    return context?.modulos || []
  }

  /**
   * Verifica se tem permissão específica no contexto de suporte
   *
   * @param {string} permission - Nome da permissão a verificar
   *
   * @returns {boolean} true se possui a permissão
   *
   * @example
   * if (supportService.hasPermission('manage_users')) {
   *   console.log('Pode gerenciar usuários nesta autarquia')
   * }
   */
  hasPermission(permission: keyof SupportContext['permissions']): boolean {
    const context = this.getSupportContext()
    if (!context || !context.support_mode) return false
    return context.permissions[permission] || false
  }

  /**
   * Limpa o contexto de suporte
   *
   * @description Útil em caso de erro ou logout. Remove todos os dados de suporte
   * do localStorage incluindo contexto e backup dos dados originais.
   *
   * @returns {void}
   *
   * @example
   * // Em caso de erro
   * supportService.clearSupportContext()
   * console.log('Contexto limpo')
   */
  clearSupportContext(): void {
    removeItem(this.STORAGE_KEY)
    removeItem('original_user_data')
    console.log('🧹 Contexto de suporte limpo (support_context e original_user_data removidos)')
  }
}

/**
 * Instância singleton do serviço de suporte
 */
export const supportService = new SupportService()

export default supportService

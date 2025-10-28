import type { Autarquia } from '@/types/support/autarquia.types'
import type { Modulo } from '@/types/support/modulos.types'
import type { User } from '@/types/common/user.types'

/**
 * Interface representando o contexto de suporte
 */
export interface SupportContext {
  /**
   * Autarquia assumida pelo superadmin
   */
  autarquia: Autarquia

  /**
   * Flag indicando que está em modo suporte
   */
  support_mode: boolean

  /**
   * Indica se o superadmin tem privilégios de admin nesta autarquia
   */
  is_admin: boolean

  /**
   * Lista de módulos disponíveis para esta autarquia
   */
  modulos: Modulo[]

  /**
   * Permissões do superadmin neste contexto
   */
  permissions: {
    /** Permissão para visualizar recursos */
    view: boolean
    /** Permissão para criar novos recursos */
    create: boolean
    /** Permissão para editar recursos */
    edit: boolean
    /** Permissão para deletar recursos */
    delete: boolean
    /** Permissão para gerenciar usuários */
    manage_users: boolean
    /** Permissão para gerenciar módulos */
    manage_modules: boolean
  }
}

/**
 * Resposta da API ao assumir contexto de suporte
 *
 * @description Retornada pelo endpoint `/support/assume-context` quando
 * um superadmin assume o controle de uma autarquia.
 *
 * @example
 * const response: AssumeContextResponse = {
 *   success: true,
 *   message: 'Contexto assumido com sucesso',
 *   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   data: {
 *     autarquia: { ... },
 *     support_mode: true,
 *     is_admin: true,
 *     modulos: [...],
 *     permissions: { ... }
 *   }
 * }
 */
export interface AssumeContextResponse {
  /**
   * Indica se a operação foi bem-sucedida
   */
  success: boolean

  /**
   * Mensagem de feedback da operação
   */
  message: string

  /**
   * Token JWT temporário para trabalhar neste contexto
   */
  token: string

  /**
   * CORREÇÃO: O data já é o SupportContext diretamente
   */
  data: SupportContext
}

/**
 * Resposta da API ao sair do contexto de suporte
 *
 * @description Retornada pelo endpoint `/support/exit-context` quando
 * um superadmin sai do modo suporte e retorna ao seu contexto original.
 *
 * @example
 * const response: ExitContextResponse = {
 *   success: true,
 *   message: 'Contexto restaurado com sucesso',
 *   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   user: {
 *     id: 1,
 *     name: 'Admin SH3',
 *     is_superadmin: true,
 *     ...
 *   }
 * }
 */
export interface ExitContextResponse {
  /**
   * Indica se a operação foi bem-sucedida
   */
  success: boolean

  /**
   * Mensagem de feedback da operação
   */
  message: string

  /**
   * Token JWT original do superadmin
   */
  token: string

  /**
   * Dados atualizados do usuário superadmin
   */
  user: User
}
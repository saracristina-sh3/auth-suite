import type { Autarquia } from '@/types/support/autarquia.types'
import type { Modulo } from '@/types/support/modulos.types'
import type { User } from '@/types/common/user.types'

/**
 * Interface representando o contexto de suporte
 *
 * @description Define o contexto completo quando um superadmin assume
 * o controle de uma autarquia específica. Contém todas as informações
 * necessárias para trabalhar como se fosse um usuário dessa autarquia.
 *
 * **Fluxo de uso**:
 * 1. Superadmin chama `supportService.assumeAutarquiaContext(autarquiaId)`
 * 2. Backend cria token temporário e retorna este contexto
 * 3. Frontend armazena contexto no localStorage
 * 4. Superadmin trabalha com acesso total à autarquia
 * 5. Ao sair, `supportService.exitAutarquiaContext()` restaura contexto original
 *
 * @example
 * const context: SupportContext = {
 *   autarquia: { id: 1, nome: 'Prefeitura Municipal', ... },
 *   support_mode: true,
 *   is_admin: true,
 *   modulos: [
 *     { id: 1, nome: 'Gestão de Frota', ... },
 *     { id: 2, nome: 'Protocolo', ... }
 *   ],
 *   permissions: {
 *     view: true,
 *     create: true,
 *     edit: true,
 *     delete: true,
 *     manage_users: true,
 *     manage_modules: true
 *   }
 * }
 *
 * @see supportService.assumeAutarquiaContext
 * @see supportService.exitAutarquiaContext
 */
export interface SupportContext {
  /**
   * Autarquia assumida pelo superadmin
   *
   * @description Contém todas as informações da autarquia que está
   * sendo gerenciada no modo suporte.
   */
  autarquia: Autarquia

  /**
   * Flag indicando que está em modo suporte
   *
   * @description Sempre `true` quando em modo suporte.
   * Usado para diferenciar de contexto normal de usuário.
   *
   * @example
   * if (context.support_mode) {
   *   console.log('Trabalhando em modo suporte')
   * }
   */
  support_mode: boolean

  /**
   * Indica se o superadmin tem privilégios de admin nesta autarquia
   *
   * @description Geralmente `true` para superadmins em modo suporte,
   * garantindo acesso administrativo completo.
   */
  is_admin: boolean

  /**
   * Lista de módulos disponíveis para esta autarquia
   *
   * @description Contém todos os módulos que a autarquia tem acesso.
   * Usado para renderizar menus e verificar funcionalidades disponíveis.
   *
   * @example
   * const modulosAtivos = context.modulos.filter(m => m.ativo)
   * console.log(`Autarquia tem ${modulosAtivos.length} módulos ativos`)
   */
  modulos: Modulo[]

  /**
   * Permissões do superadmin neste contexto
   *
   * @description Define o que o superadmin pode fazer enquanto trabalha
   * nesta autarquia. Geralmente todas são `true` para dar acesso completo.
   *
   * **Permissões**:
   * - `view`: Pode visualizar recursos
   * - `create`: Pode criar novos recursos
   * - `edit`: Pode editar recursos existentes
   * - `delete`: Pode remover recursos
   * - `manage_users`: Pode gerenciar usuários desta autarquia
   * - `manage_modules`: Pode gerenciar módulos desta autarquia
   *
   * @example
   * if (context.permissions.manage_users) {
   *   console.log('Pode gerenciar usuários desta autarquia')
   * }
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
 *   context: {
 *     autarquia: { ... },
 *     support_mode: true,
 *     is_admin: true,
 *     modulos: [...],
 *     permissions: { ... }
 *   }
 * }
 *
 * @see supportService.assumeAutarquiaContext
 */
export interface AssumeContextResponse {
  /**
   * Indica se a operação foi bem-sucedida
   */
  success: boolean

  /**
   * Mensagem de feedback da operação
   *
   * @example
   * "Contexto assumido com sucesso para a autarquia Prefeitura Municipal"
   */
  message: string

  /**
   * Token JWT temporário para trabalhar neste contexto
   *
   * @description Token especial que concede acesso total à autarquia
   * assumida. Deve ser usado em todas as requisições enquanto em modo suporte.
   *
   * **IMPORTANTE**:
   * - Token é temporário e expira quando sai do modo suporte
   * - Contém informações da autarquia assumida
   * - Backend identifica requisições em modo suporte por este token
   */
  token: string

  /**
   * Contexto completo da autarquia assumida
   *
   * @description Contém todas as informações necessárias para trabalhar
   * em modo suporte.
   */
  context: SupportContext
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
 *
 * @see supportService.exitAutarquiaContext
 */
export interface ExitContextResponse {
  /**
   * Indica se a operação foi bem-sucedida
   */
  success: boolean

  /**
   * Mensagem de feedback da operação
   *
   * @example
   * "Contexto restaurado com sucesso. Bem-vindo de volta!"
   */
  message: string

  /**
   * Token JWT original do superadmin
   *
   * @description Token restaurado do superadmin, permitindo que ele
   * volte a trabalhar com suas permissões normais.
   *
   * **IMPORTANTE**:
   * - Este é o token original do superadmin, não o temporário
   * - Válido pelo tempo de expiração normal (1 hora)
   * - Contém as informações originais do usuário superadmin
   */
  token: string

  /**
   * Dados atualizados do usuário superadmin
   *
   * @description Dados completos do superadmin após sair do modo suporte.
   * Usado para restaurar o estado original no frontend.
   *
   * @example
   * // Restaurar dados do usuário
   * localStorage.setItem('user_data', JSON.stringify(response.user))
   */
  user: User
}
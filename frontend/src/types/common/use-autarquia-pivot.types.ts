import type { Autarquia } from "@/types/support/autarquia.types";

/**
 * Interface representando os dados da tabela pivot usuario_autarquia
 *
 * @description Esta interface define a estrutura dos dados armazenados na tabela
 * pivot que relaciona usuários e autarquias. Cada registro representa um vínculo
 * entre um usuário e uma autarquia específica.
 *
 * **Banco de dados**: Tabela `usuario_autarquia`
 *
 * @example
 * const pivot: UserAutarquiaPivot = {
 *   role: 'admin',
 *   is_admin: true,
 *   is_default: false,
 *   ativo: true,
 *   data_vinculo: '2025-10-27T10:30:00.000Z'
 * }
 */
export interface UserAutarquiaPivot {
  /**
   * Role do usuário nesta autarquia específica
   *
   * @description A role pode ser diferente em cada autarquia. Por exemplo,
   * um usuário pode ser 'admin' em uma autarquia e 'user' em outra.
   *
   * Valores possíveis:
   * - `user`: Usuário comum desta autarquia
   * - `admin`: Administrador desta autarquia
   * - `gestor`: Gestor desta autarquia
   *
   * @example
   * // Usuário é admin na autarquia 1
   * autarquia1.pivot.role = 'admin'
   *
   * // Mas é apenas user na autarquia 2
   * autarquia2.pivot.role = 'user'
   */
  role: string

  /**
   * Indica se o usuário é administrador desta autarquia
   *
   * @description Flag booleana que determina permissões administrativas
   * do usuário nesta autarquia específica.
   *
   * **IMPORTANTE**: Diferente de `is_superadmin` (global do usuário),
   * esta flag é específica para cada autarquia.
   *
   * @example
   * if (autarquia.pivot.is_admin) {
   *   console.log('Usuário pode gerenciar esta autarquia')
   * }
   */
  is_admin: boolean

  /**
   * Indica se esta é a autarquia padrão do usuário
   *
   * @description Quando `true`, esta autarquia é a preferida do usuário.
   * Corresponde ao `autarquia_preferida_id` na tabela users.
   *
   * **Regras**:
   * - Apenas uma autarquia pode ter `is_default: true` por usuário
   * - Será automaticamente selecionada ao fazer login
   * - Deve estar entre as autarquias ativas do usuário
   *
   * @example
   * const autarquiaPadrao = autarquias.find(a => a.pivot.is_default)
   */
  is_default: boolean

  /**
   * Status do vínculo usuário-autarquia
   *
   * @description
   * - `true`: Vínculo ativo, usuário pode acessar esta autarquia
   * - `false`: Vínculo inativo, usuário não tem mais acesso
   *
   * **IMPORTANTE**: Diferente de `user.is_active` (status global do usuário),
   * esta flag controla apenas o acesso a esta autarquia específica.
   *
   * @example
   * // Desativar acesso de usuário a uma autarquia específica
   * await userService.updatePivot(userId, autarquiaId, {
   *   ativo: false
   * })
   */
  ativo: boolean

  /**
   * Data e hora em que o usuário foi vinculado à autarquia
   *
   * @description Timestamp ISO 8601 registrando quando o vínculo foi criado.
   *
   * @example
   * const dataVinculo = new Date(autarquia.pivot.data_vinculo)
   * console.log('Vinculado desde:', dataVinculo.toLocaleDateString())
   */
  data_vinculo: string
}

/**
 * Interface representando uma Autarquia com dados da tabela pivot
 *
 * @description Estende a interface Autarquia básica adicionando os dados da pivot.
 * Usada quando se busca autarquias no contexto de um usuário específico.
 *
 * @example
 * // Ao buscar autarquias de um usuário
 * const autarquias = await userService.getUserAutarquias(userId)
 *
 * autarquias.forEach(autarquia => {
 *   console.log(`${autarquia.nome}:`)
 *   console.log(`  Role: ${autarquia.pivot.role}`)
 *   console.log(`  Admin: ${autarquia.pivot.is_admin}`)
 *   console.log(`  Padrão: ${autarquia.pivot.is_default}`)
 *   console.log(`  Ativo: ${autarquia.pivot.ativo}`)
 * })
 */
export interface AutarquiaWithPivot extends Autarquia {
  /**
   * Dados da relação usuário-autarquia
   *
   * @description Contém todas as informações específicas do vínculo entre
   * o usuário e esta autarquia.
   */
  pivot: UserAutarquiaPivot
}


/**
 * Payload para sincronização de autarquias de um usuário
 *
 * @description Usado ao sincronizar as autarquias vinculadas a um usuário.
 * O método `syncAutarquias` remove todos os vínculos existentes e cria novos
 * com base neste payload.
 *
 * @example
 * // Sincronizar autarquias de um usuário
 * await userService.syncAutarquias(userId, [
 *   {
 *     id: 1,
 *     pivot_data: {
 *       role: 'admin',
 *       is_admin: true,
 *       is_default: true,
 *       ativo: true
 *     }
 *   },
 *   {
 *     id: 2,
 *     pivot_data: {
 *       role: 'user',
 *       is_admin: false,
 *       is_default: false,
 *       ativo: true
 *     }
 *   }
 * ])
 *
 * @see userService.syncAutarquias
 */
export interface SyncAutarquiasPayload {
  /**
   * ID da autarquia a ser vinculada
   */
  id: number

  /**
   * Dados opcionais da pivot
   *
   * @description Se não fornecido, serão usados valores padrão:
   * - `role`: 'user'
   * - `is_admin`: false
   * - `is_default`: false
   * - `ativo`: true
   * - `data_vinculo`: now()
   */
  pivot_data?: Partial<UserAutarquiaPivot>
}

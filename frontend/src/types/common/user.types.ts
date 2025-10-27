import type { Autarquia } from "@/types/support/autarquia.types";

/**
 * Interface representando um usuário do sistema
 *
 * @description Define a estrutura completa de um usuário, incluindo dados básicos,
 * autarquias vinculadas e configurações de contexto.
 *
 * @example
 * const user: User = {
 *   id: 1,
 *   name: 'João Silva',
 *   email: 'joao@example.com',
 *   cpf: '12345678900',
 *   role: 'admin',
 *   autarquia_preferida_id: 1,
 *   autarquia_ativa_id: 1,
 *   is_active: true,
 *   is_superadmin: false
 * }
 */
export interface User {
  /** ID único do usuário */
  id: number;

  /** Nome completo do usuário */
  name: string;

  /** Email único do usuário (usado para login) */
  email: string;

  /** CPF único do usuário (apenas números, sem formatação) */
  cpf: string;

  /**
   * Role (perfil) do usuário
   *
   * @description Define as permissões e acessos do usuário no sistema.
   *
   * Valores possíveis:
   * - `user`: Usuário comum
   * - `gestor`: Gestor/Manager
   * - `admin`: Administrador
   * - `superadmin`: Super administrador (SH3)
   * - `clientAdmin`: Administrador do cliente
   */
  role: string;

  /**
   * ID da autarquia preferida do usuário
   *
   * @description Autarquia padrão que será automaticamente selecionada quando
   * o usuário fizer login. Deve estar entre as autarquias vinculadas ao usuário.
   *
   * Esta é definida no cadastro e **não muda** durante a sessão.
   *
   * @example
   * // Ao fazer login, esta autarquia será definida como ativa
   * user.autarquia_preferida_id = 1
   */
  autarquia_preferida_id?: number | null;

  /**
   * Objeto completo da autarquia preferida
   *
   * @description Populated quando necessário pelo backend.
   */
  autarquia_preferida?: Autarquia | null;

  /**
   * ID da autarquia atualmente ativa na sessão
   *
   * @description Autarquia que o usuário está visualizando/trabalhando no momento.
   * Pode ser alterada durante a sessão quando o usuário troca de autarquia.
   *
   * **IMPORTANTE**:
   * - Inicialmente é igual a `autarquia_preferida_id`
   * - Pode ser alterada pelo usuário durante a sessão
   * - No modo suporte, representa a autarquia assumida pelo superadmin
   * - Armazenada na sessão Laravel (server-side)
   *
   * @example
   * // Usuário troca de autarquia durante a sessão
   * user.autarquia_ativa_id = 2 // Diferente da preferida
   */
  autarquia_ativa_id?: number | null;

  /**
   * Objeto completo da autarquia ativa
   *
   * @description Populated quando necessário pelo backend.
   */
  autarquia_ativa?: Autarquia | null;

  /**
   * @deprecated Use `autarquia_preferida` ou `autarquia_ativa` em vez disso
   *
   * Mantido apenas para compatibilidade com código antigo.
   */
  autarquia?: Autarquia;

  /**
   * Status do usuário
   *
   * @description
   * - `true`: Usuário pode fazer login e acessar o sistema
   * - `false`: Usuário desativado, não pode fazer login
   */
  is_active: boolean;

  /**
   * Indica se o usuário é superadmin (SH3)
   *
   * @description Superadmins têm acesso total ao sistema, incluindo:
   * - Painel de administração do suporte
   * - Modo suporte (assumir contexto de autarquias)
   * - Gerenciamento de todos os recursos
   * - Bypass de todas as verificações de permissão
   */
  is_superadmin: boolean;

  /**
   * Flag interna indicando modo suporte
   *
   * @description Quando `true`, indica que um superadmin está trabalhando
   * em modo suporte (assumiu o contexto de uma autarquia).
   *
   * **IMPORTANTE**: Não é armazenado no banco de dados, apenas em memória/localStorage.
   *
   * @internal
   *
   * @example
   * if (user._support_mode) {
   *   console.log('Trabalhando como:', user.autarquia_ativa?.nome)
   * }
   */
  _support_mode?: boolean;

  /**
   * Dados da tabela pivot usuario_autarquia
   *
   * @description Presente quando o usuário é carregado no contexto de uma autarquia,
   * contém informações específicas do relacionamento usuário-autarquia.
   *
   * @see UserAutarquiaPivot
   */
  pivot?: {
    /** Role do usuário nesta autarquia específica */
    role: string
    /** Se o usuário é admin desta autarquia */
    is_admin: boolean
    /** Se o vínculo está ativo */
    ativo: boolean
    /** Se esta é a autarquia padrão do usuário */
    is_default: boolean
    /** Data em que o usuário foi vinculado à autarquia */
    data_vinculo: string
  }

  /**
   * Lista de autarquias vinculadas ao usuário
   *
   * @description Pode conter IDs (quando enviado ao backend) ou objetos completos
   * (quando recebido do backend).
   *
   * Todas as autarquias que o usuário tem permissão para acessar.
   *
   * @example
   * // Ao criar/editar usuário
   * user.autarquias = [1, 2, 3] // IDs
   *
   * // Ao receber do backend
   * user.autarquias = [
   *   { id: 1, nome: 'Autarquia A', ... },
   *   { id: 2, nome: 'Autarquia B', ... }
   * ]
   */
  autarquias?: number[] | Autarquia[];

  /**
   * Senha do usuário
   *
   * @description Presente apenas ao criar/editar usuário.
   * Nunca retornada pelo backend por questões de segurança.
   *
   * **Validações**:
   * - Obrigatório ao criar usuário
   * - Opcional ao editar (se não fornecida, mantém a senha atual)
   * - Mínimo 6 caracteres
   */
  password?: string;

}

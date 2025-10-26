/**
 * Tipos para payloads de formulários do painel de suporte
 */

/**
 * Payload para criar/atualizar usuário
 */
export interface UserFormPayload {
  id?: number
  name: string
  email: string
  cpf: string
  password?: string
  role: 'user' | 'gestor' | 'admin' | 'superadmin' | 'clientAdmin'
  autarquia_preferida_id: number
  is_active?: boolean
  autarquias?: number[]
  autarquia_ativa_id?: number
}

/**
 * Payload para criar/atualizar autarquia
 */
export interface AutarquiaFormPayload {
  id?: number
  nome: string
  ativo?: boolean
}

/**
 * Payload para criar/atualizar módulo
 */
export interface ModuloFormPayload {
  id?: number
  nome: string
  descricao?: string
  icone?: string
  ativo?: boolean
}

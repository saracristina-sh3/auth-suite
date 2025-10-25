import type { Autarquia } from "@/types/support/autarquia.types";

/**
 * Interface representando os dados da tabela pivot usuario_autarquia
 */
export interface UserAutarquiaPivot {
  role: string
  is_admin: boolean
  is_default: boolean
  ativo: boolean
  data_vinculo: string
}

/**
 * Interface representando uma Autarquia com dados da pivot
 */
export interface AutarquiaWithPivot extends Autarquia {
  pivot: UserAutarquiaPivot
}


/**
 * Payload para sincronização de autarquias
 */
export interface SyncAutarquiasPayload {
  id: number
  pivot_data?: Partial<UserAutarquiaPivot>
}

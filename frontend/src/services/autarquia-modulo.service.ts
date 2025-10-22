// src/services/autarquia-modulo.service.ts
import api from './auth.service'

export interface AutarquiaModulo {
  autarquia_id: number
  modulo_id: number
  data_liberacao: string | null
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface BulkUpdateModulo {
  modulo_id: number
  ativo: boolean
}

export const autarquiaModuloService = {
  /**
   * Lista as liberações de módulos para uma autarquia
   */
  async list(autarquiaId: number): Promise<AutarquiaModulo[]> {
    const response = await api.get<{ data: AutarquiaModulo[] }>('/autarquia-modulo', {
      params: { autarquia_id: autarquiaId }
    })
    return response.data.data
  },

  /**
   * Atualiza o status de um módulo para uma autarquia
   */
  async update(autarquiaId: number, moduloId: number, ativo: boolean): Promise<AutarquiaModulo> {
    const response = await api.put<{ data: AutarquiaModulo }>(
      `/autarquia-modulo/${autarquiaId}/${moduloId}`,
      { ativo }
    )
    return response.data.data
  },

  /**
   * Atualiza o status de múltiplos módulos para uma autarquia
   */
async bulkUpdate(autarquiaId: number, modulos: BulkUpdateModulo[]): Promise<{
  atualizados: AutarquiaModulo[]
  erros: any[]
}> {
  const response = await api.put<{
    data: { atualizados: AutarquiaModulo[]; erros: any[] }
  }>('/autarquia-modulo/bulk', {
    autarquia_id: autarquiaId,
    modulos,
  });

  // ⬇️ Corrigido: retorna apenas o conteúdo dentro de data.data
  return response.data.data;
}

}

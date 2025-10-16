// src/services/autarquia-modulo.service.ts
import api from './auth.service'

export interface AutarquiaModulo {
  autarquia_id: number
  modulo_id: number
  data_liberacao: string
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface AutarquiaModuloFormData {
  autarquia_id: number
  modulo_id: number
  ativo?: boolean
}

export const autarquiaModuloService = {
  async list(autarquiaId?: number, moduloId?: number): Promise<AutarquiaModulo[]> {
    const params: any = {}
    if (autarquiaId) params.autarquia_id = autarquiaId
    if (moduloId) params.modulo_id = moduloId

    const response = await api.get<{ data: AutarquiaModulo[] }>('/autarquia-modulo', { params })
    return response.data.data
  },

  async getById(autarquiaId: number, moduloId: number): Promise<AutarquiaModulo> {
    const response = await api.get<{ data: AutarquiaModulo }>(
      `/autarquia-modulo/${autarquiaId}/${moduloId}`
    )
    return response.data.data
  },

  async create(data: AutarquiaModuloFormData): Promise<AutarquiaModulo> {
    const response = await api.post<{ data: AutarquiaModulo }>('/autarquia-modulo', data)
    return response.data.data
  },

  async update(
    autarquiaId: number,
    moduloId: number,
    data: Partial<AutarquiaModuloFormData>
  ): Promise<AutarquiaModulo> {
    const response = await api.put<{ data: AutarquiaModulo }>(
      `/autarquia-modulo/${autarquiaId}/${moduloId}`,
      data
    )
    return response.data.data
  },

  async delete(autarquiaId: number, moduloId: number): Promise<void> {
    await api.delete(`/autarquia-modulo/${autarquiaId}/${moduloId}`)
  },

  async bulkCreate(liberacoes: AutarquiaModuloFormData[]): Promise<AutarquiaModulo[]> {
    const response = await api.post<{ data: AutarquiaModulo[] }>('/autarquia-modulo/bulk', {
      liberacoes
    })
    return response.data.data
  },
}

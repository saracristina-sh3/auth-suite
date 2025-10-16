// src/services/modulo.service.ts
import api from './auth.service'
import type { Modulo } from '@/types/auth'

export interface ModuloFormData {
  nome: string
  descricao?: string
  icone?: string
  ativo?: boolean
}

export interface ModuloListResponse {
  data: Modulo[]
}

export const moduloService = {
  async list(autarquiaId?: number): Promise<Modulo[]> {
    const params = autarquiaId ? { autarquia_id: autarquiaId } : {}
    const response = await api.get<ModuloListResponse>('/modulos', { params })
    return response.data.data
  },

  async getById(id: number): Promise<Modulo> {
    const response = await api.get<{ data: Modulo }>(`/modulos/${id}`)
    return response.data.data
  },

  async create(data: ModuloFormData): Promise<Modulo> {
    const response = await api.post<{ data: Modulo }>('/modulos', data)
    return response.data.data
  },

  async update(id: number, data: ModuloFormData): Promise<Modulo> {
    const response = await api.put<{ data: Modulo }>(`/modulos/${id}`, data)
    return response.data.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/modulos/${id}`)
  },

  async getAutarquias(id: number): Promise<any[]> {
    const response = await api.get(`/modulos/${id}/autarquias`)
    return response.data.data
  },
}
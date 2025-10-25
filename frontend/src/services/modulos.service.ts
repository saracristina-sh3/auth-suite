// src/services/modulo.service.ts
import type { Autarquia } from '@/types/support/autarquia.types'
import api from './api'
import type { Modulo } from '@/types/support/modulos.types'

export interface ModuloFormData {
  nome: string
  descricao?: string
  icone?: string
  ativo?: boolean
}

export interface ModuloListResponse {
  data: Modulo[]
}

export interface ModuloStatsResponse {
  data: {
    total: number
    ativos: number
    inativos: number
  }
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

  async getModulos(): Promise<Modulo[]> {
    const response = await api.get<ModuloListResponse>('/modulos')
    return response.data.data
  },
  
  async getAutarquias(id: number): Promise<Autarquia[]> {
    const response = await api.get(`/modulos/${id}/autarquias`)
    return response.data.data
  },

  async getStats(): Promise<{ total: number; ativos: number; inativos: number }> {
    const response = await api.get<ModuloStatsResponse>('/modulos/stats')
    return response.data.data
  },
}

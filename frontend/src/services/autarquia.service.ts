// src/services/autarquia.service.ts
import api from './api'
import type { Autarquia } from '@/types/autarquia.types'

export interface AutarquiaFormData {
  nome: string
  ativo?: boolean
}

export interface AutarquiaListResponse {
  data: Autarquia[]
}

export const autarquiaService = {
  async list(): Promise<Autarquia[]> {
    const response = await api.get<AutarquiaListResponse>('/autarquias')
    return response.data.data
  },

  async getById(id: number): Promise<Autarquia> {
    const response = await api.get<{ data: Autarquia }>(`/autarquias/${id}`)
    return response.data.data
  },

  async create(data: AutarquiaFormData): Promise<Autarquia> {
    const response = await api.post<{ data: Autarquia }>('/autarquias', data)
    return response.data.data
  },

  async update(id: number, data: AutarquiaFormData): Promise<Autarquia> {
    const response = await api.put<{ data: Autarquia }>(`/autarquias/${id}`, data)
    return response.data.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/autarquias/${id}`)
  },

  async getModulos(id: number): Promise<any[]> {
    const response = await api.get(`/autarquias/${id}/modulos`)
    return response.data.data
  },

  async getModulosStats(id: number): Promise<{ total: number; ativos: number; inativos: number }> {
    const response = await api.get<{ data: { total: number; ativos: number; inativos: number } }>(
      `/autarquias/${id}/modulos/stats`
    )
    return response.data.data
  },

  async getUsers(id: number): Promise<any[]> {
    const response = await api.get(`/autarquias/${id}/usuarios`)
    return response.data.data
  },

  // Alias para compatibilidade
  async getUsuarios(id: number): Promise<any[]> {
    return this.getUsers(id)
  },

  async getStats(): Promise<{ total: number; ativas: number; inativas: number }> {
    const response = await api.get<{ data: { total: number; ativas: number; inativas: number } }>('/autarquias/stats')
    return response.data.data
  },
}
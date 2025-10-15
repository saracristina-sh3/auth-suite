// src/services/api.service.ts
import api from './auth.service'

/**
 * Tipagem genérica para respostas paginadas do backend Laravel.
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

/**
 * Classe de acesso genérico à API — CRUD padrão.
 */
class ApiService {
  // GET /resource
  async getAll<T>(endpoint: string, params: Record<string, any> = {}): Promise<PaginatedResponse<T>> {
    const { data } = await api.get<PaginatedResponse<T>>(endpoint, { params })
    return data
  }

  // GET /resource/:id
  async getOne<T>(endpoint: string, id: number | string): Promise<T> {
    const { data } = await api.get<T>(`${endpoint}/${id}`)
    return data
  }

  // POST /resource
  async create<T>(endpoint: string, payload: Record<string, any>): Promise<T> {
    const { data } = await api.post<T>(endpoint, payload)
    return data
  }

  // PUT /resource/:id
  async update<T>(endpoint: string, id: number | string, payload: Record<string, any>): Promise<T> {
    const { data } = await api.put<T>(`${endpoint}/${id}`, payload)
    return data
  }

  // DELETE /resource/:id
  async delete(endpoint: string, id: number | string): Promise<void> {
    await api.delete(`${endpoint}/${id}`)
  }
}

export const apiService = new ApiService()
export default apiService

// src/services/user.service.ts
import api from './auth.service'

export interface User {
  id: number
  name: string
  email: string
  cpf: string
  role: string
  is_superadmin: boolean
  is_active: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export const userService = {
  async list(params = {}): Promise<PaginatedResponse<User>> {
    try {
      console.log('🔄 userService.list - Chamando API...')
      
      // CHAMADA DIRETA IGUAL AO ROLE SERVICE
      const response = await api.get('/users', { params })
      console.log('📦 userService.list - Resposta:', response.data)
      
      // A SUA API RETORNA: { data: { items, meta, success, message } }
      return response.data // ← RETORNA response.data DIRETAMENTE
      
    } catch (error) {
      console.error('❌ Erro no userService.list:', error)
      throw error
    }
  },

  async get(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`)
    return response.data.data
  },

  async create(payload: Partial<User>): Promise<User> {
    const response = await api.post('/users', payload)
    return response.data.data
  },

  async update(id: number, payload: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, payload)
    return response.data.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
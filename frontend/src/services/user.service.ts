// src/services/user.service.ts
import apiService from './api.service'

export interface User {
  id: number
  name: string
  email: string
  role: string
  is_superadmin: boolean
}

export const userService = {
  list: (params = {}) => apiService.getAll<User>('/users', params),
  get: (id: number) => apiService.getOne<User>('/users', id),
  create: (payload: Partial<User>) => apiService.create<User>('/users', payload),
  update: (id: number, payload: Partial<User>) => apiService.update<User>('/users', id, payload),
  remove: (id: number) => apiService.delete('/users', id),
}

import api from './api'

export interface Role {
  label: string
  value: string
}

export interface Permission {
  [key: string]: string[]
}

export interface RoleResponse {
  roles: Role[]
  permissions: Permission
}

export const roleService = {
  async list(): Promise<RoleResponse> {
    const response = await api.get('/roles')
    console.log('🎭 Roles response:', response.data)
    return response.data.data
  },
}
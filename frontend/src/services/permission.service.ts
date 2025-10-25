// src/services/permission.service.ts
import api from './api'

export interface UsuarioModuloPermissao {
  user_id: number
  modulo_id: number
  autarquia_id: number
  permissao_leitura: boolean
  permissao_escrita: boolean
  permissao_exclusao: boolean
  permissao_admin: boolean
  data_concessao: string
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface PermissaoFormData {
  user_id: number
  modulo_id: number
  autarquia_id: number
  permissao_leitura?: boolean
  permissao_escrita?: boolean
  permissao_exclusao?: boolean
  permissao_admin?: boolean
  ativo?: boolean
}

export interface CheckPermissionRequest {
  user_id: number
  modulo_id: number
  autarquia_id: number
  tipo_permissao: 'leitura' | 'escrita' | 'exclusao' | 'admin'
}

export interface CheckPermissionResponse {
  tem_permissao: boolean
  detalhes?: UsuarioModuloPermissao
}

export const permissionService = {
  async list(userId?: number, autarquiaId?: number, moduloId?: number): Promise<UsuarioModuloPermissao[]> {
    const params: any = {}
    if (userId) params.user_id = userId
    if (autarquiaId) params.autarquia_id = autarquiaId
    if (moduloId) params.modulo_id = moduloId

    const response = await api.get<{ data: UsuarioModuloPermissao[] }>('/permissoes', { params })
    return response.data.data
  },

  async getById(userId: number, moduloId: number, autarquiaId: number): Promise<UsuarioModuloPermissao> {
    const response = await api.get<{ data: UsuarioModuloPermissao }>(
      `/permissoes/${userId}/${moduloId}/${autarquiaId}`
    )
    return response.data.data
  },

  async create(data: PermissaoFormData): Promise<UsuarioModuloPermissao> {
    const response = await api.post<{ data: UsuarioModuloPermissao }>('/permissoes', data)
    return response.data.data
  },

  async update(
    userId: number,
    moduloId: number,
    autarquiaId: number,
    data: Partial<PermissaoFormData>
  ): Promise<UsuarioModuloPermissao> {
    const response = await api.put<{ data: UsuarioModuloPermissao }>(
      `/permissoes/${userId}/${moduloId}/${autarquiaId}`,
      data
    )
    return response.data.data
  },

  async delete(userId: number, moduloId: number, autarquiaId: number): Promise<void> {
    await api.delete(`/permissoes/${userId}/${moduloId}/${autarquiaId}`)
  },

  async checkPermission(data: CheckPermissionRequest): Promise<CheckPermissionResponse> {
    const response = await api.post<{ data: CheckPermissionResponse }>('/permissoes/check', data)
    return response.data.data
  },

  async bulkCreate(permissoes: PermissaoFormData[]): Promise<UsuarioModuloPermissao[]> {
    const response = await api.post<{ data: UsuarioModuloPermissao[] }>('/permissoes/bulk', {
      permissoes
    })
    return response.data.data
  },
}

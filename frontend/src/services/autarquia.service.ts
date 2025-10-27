import type { Modulo } from '@/types/support/modulos.types'
import api from './api'
import type { Autarquia } from '@/types/support/autarquia.types'
import type { User } from '@/types/common/user.types'
import type { PaginatedResponse } from '@/types/common/api.types'
import type { PaginationParams } from '@/types/common/pagination.types'

/**
 * Dados do formulário de autarquia
 */
export interface AutarquiaFormData {
  nome: string
  ativo?: boolean
}

/**
 * Resposta da API ao listar autarquias
 */
export interface AutarquiaListResponse {
  data: Autarquia[]
}

/**
 * Serviço de gerenciamento de autarquias
 *
 * @description Fornece operações CRUD completas para autarquias, incluindo
 * gerenciamento de módulos e usuários vinculados.
 *
 * @example
 * // Listar autarquias
 * const autarquias = await autarquiaService.list({ page: 1, per_page: 10 })
 *
 * // Criar autarquia
 * const nova = await autarquiaService.create({
 *   nome: 'Prefeitura Municipal',
 *   ativo: true
 * })
 */
export const autarquiaService = {
  /**
   * Lista autarquias com paginação server-side
   *
   * @param {PaginationParams} params - Parâmetros de paginação
   * @param {number} params.page - Número da página (padrão: 1)
   * @param {number} params.per_page - Itens por página (padrão: 15)
   * @param {string} params.search - Termo de busca (nome)
   *
   * @returns {Promise<PaginatedResponse<Autarquia>>} Resposta paginada com autarquias
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const response = await autarquiaService.list({
   *   page: 1,
   *   per_page: 10,
   *   search: 'prefeitura'
   * })
   * console.log(response.data) // Array de autarquias
   * console.log(response.meta) // Metadados de paginação
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Autarquia>> {
    const response = await api.get<PaginatedResponse<Autarquia>>('/autarquias', { params })
    return response.data
  },

  /**
   * Busca uma autarquia específica por ID
   *
   * @param {number} id - ID da autarquia
   *
   * @returns {Promise<Autarquia>} Autarquia encontrada
   *
   * @throws {Error} Se a autarquia não for encontrada (404) ou requisição falhar
   *
   * @example
   * const autarquia = await autarquiaService.getById(1)
   * console.log(autarquia.nome) // 'Prefeitura Municipal'
   */
  async getById(id: number): Promise<Autarquia> {
    const response = await api.get<{ data: Autarquia }>(`/autarquias/${id}`)
    return response.data.data
  },

  /**
   * Cria uma nova autarquia
   *
   * @param {AutarquiaFormData} data - Dados da nova autarquia
   * @param {string} data.nome - Nome da autarquia (obrigatório)
   * @param {boolean} data.ativo - Status ativo (padrão: true)
   *
   * @returns {Promise<Autarquia>} Autarquia criada
   *
   * @throws {Error} Se validação falhar ou requisição falhar
   *
   * @example
   * const nova = await autarquiaService.create({
   *   nome: 'Prefeitura Municipal de São Paulo',
   *   ativo: true
   * })
   */
  async create(data: AutarquiaFormData): Promise<Autarquia> {
    const response = await api.post<{ data: Autarquia }>('/autarquias', data)
    return response.data.data
  },

  /**
   * Atualiza uma autarquia existente
   *
   * @param {number} id - ID da autarquia a ser atualizada
   * @param {AutarquiaFormData} data - Dados a serem atualizados
   * @param {string} data.nome - Nome da autarquia
   * @param {boolean} data.ativo - Status ativo
   *
   * @returns {Promise<Autarquia>} Autarquia atualizada
   *
   * @throws {Error} Se a autarquia não for encontrada ou validação falhar
   *
   * @example
   * const atualizada = await autarquiaService.update(1, {
   *   nome: 'Prefeitura Municipal - Nome Atualizado',
   *   ativo: false
   * })
   */
  async update(id: number, data: AutarquiaFormData): Promise<Autarquia> {
    const response = await api.put<{ data: Autarquia }>(`/autarquias/${id}`, data)
    return response.data.data
  },

  /**
   * Remove uma autarquia
   *
   * @param {number} id - ID da autarquia a ser removida
   *
   * @returns {Promise<void>}
   *
   * @throws {Error} Se a autarquia não for encontrada ou não puder ser removida
   *
   * @example
   * await autarquiaService.delete(1)
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/autarquias/${id}`)
  },

  /**
   * Busca todos os módulos vinculados a uma autarquia
   *
   * @param {number} id - ID da autarquia
   *
   * @returns {Promise<Modulo[]>} Array de módulos vinculados
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const modulos = await autarquiaService.getModulos(1)
   * console.log(modulos.length) // Quantidade de módulos
   */
  async getModulos(id: number): Promise<Modulo[]> {
    const response = await api.get(`/autarquias/${id}/modulos`)
    return response.data.data
  },

  /**
   * Retorna estatísticas dos módulos de uma autarquia
   *
   * @param {number} id - ID da autarquia
   *
   * @returns {Promise<Object>} Estatísticas dos módulos
   * @returns {number} return.total - Total de módulos
   * @returns {number} return.ativos - Módulos ativos
   * @returns {number} return.inativos - Módulos inativos
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const stats = await autarquiaService.getModulosStats(1)
   * console.log(`Ativos: ${stats.ativos} de ${stats.total}`)
   */
  async getModulosStats(id: number): Promise<{ total: number; ativos: number; inativos: number }> {
    const response = await api.get<{ data: { total: number; ativos: number; inativos: number } }>(
      `/autarquias/${id}/modulos/stats`
    )
    return response.data.data
  },

  /**
   * Busca todos os usuários vinculados a uma autarquia
   *
   * @param {number} id - ID da autarquia
   *
   * @returns {Promise<User[]>} Array de usuários vinculados
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const usuarios = await autarquiaService.getUsers(1)
   * console.log(usuarios.length) // Quantidade de usuários
   */
  async getUsers(id: number): Promise<User[]> {
    const response = await api.get(`/autarquias/${id}/usuarios`)
    return response.data.data
  },

  /**
   * Alias para getUsers (mantido para compatibilidade)
   *
   * @deprecated Use getUsers() em vez disso
   *
   * @param {number} id - ID da autarquia
   *
   * @returns {Promise<User[]>} Array de usuários vinculados
   *
   * @example
   * const usuarios = await autarquiaService.getUsuarios(1)
   */
  async getUsuarios(id: number): Promise<User[]> {
    return this.getUsers(id)
  },

  /**
   * Retorna estatísticas das autarquias
   *
   * @returns {Promise<Object>} Estatísticas das autarquias
   * @returns {number} return.total - Total de autarquias
   * @returns {number} return.ativas - Autarquias ativas
   * @returns {number} return.inativas - Autarquias inativas
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const stats = await autarquiaService.getStats()
   * console.log(`Total: ${stats.total}, Ativas: ${stats.ativas}`)
   */
  async getStats(): Promise<{ total: number; ativas: number; inativas: number }> {
    const response = await api.get<{ data: { total: number; ativas: number; inativas: number } }>('/autarquias/stats')
    return response.data.data
  },
}
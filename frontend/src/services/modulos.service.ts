import type { Autarquia } from '@/types/support/autarquia.types'
import api from './api'
import type { Modulo } from '@/types/support/modulos.types'
import type { PaginatedResponse } from '@/types/common/api.types'
import type { PaginationParams } from '@/types/common/pagination.types'

/**
 * Dados do formulário de módulo
 */
export interface ModuloFormData {
  nome: string
  descricao?: string
  icone?: string
  ativo?: boolean
}

/**
 * Resposta da API ao listar módulos
 */
export interface ModuloListResponse {
  data: Modulo[]
}

/**
 * Resposta da API com estatísticas de módulos
 */
export interface ModuloStatsResponse {
  data: {
    total: number
    ativos: number
    inativos: number
  }
}

/**
 * Serviço de gerenciamento de módulos
 *
 * @description Fornece operações CRUD completas para módulos, incluindo
 * gerenciamento de autarquias vinculadas e estatísticas.
 *
 * @example
 * // Listar módulos
 * const modulos = await moduloService.list()
 *
 * // Criar módulo
 * const novo = await moduloService.create({
 *   nome: 'Gestão de Frota',
 *   descricao: 'Sistema de controle de veículos',
 *   icone: 'pi pi-car',
 *   ativo: true
 * })
 */
export const moduloService = {
  /**
   * Lista módulos com paginação server-side
   *
   * @param {number} autarquiaId - ID da autarquia para filtrar (opcional)
   * @param {PaginationParams} params - Parâmetros de paginação
   * @param {number} params.page - Número da página (padrão: 1)
   * @param {number} params.per_page - Itens por página (padrão: 15)
   * @param {string} params.search - Termo de busca (nome ou descrição)
   *
   * @returns {Promise<PaginatedResponse<Modulo>>} Resposta paginada com módulos
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * // Listar todos os módulos
   * const todos = await moduloService.list()
   *
   * // Listar módulos de uma autarquia específica
   * const modulosAutarquia = await moduloService.list(1, { page: 1 })
   */
  async list(autarquiaId?: number, params?: PaginationParams): Promise<PaginatedResponse<Modulo>> {
    const requestParams = {
      ...params,
      ...(autarquiaId ? { autarquia_id: autarquiaId } : {})
    }
    const response = await api.get<PaginatedResponse<Modulo>>('/modulos', { params: requestParams })
    return response.data
  },

  /**
   * Busca um módulo específico por ID
   *
   * @param {number} id - ID do módulo
   *
   * @returns {Promise<Modulo>} Módulo encontrado
   *
   * @throws {Error} Se o módulo não for encontrado (404) ou requisição falhar
   *
   * @example
   * const modulo = await moduloService.getById(1)
   * console.log(modulo.nome) // 'Gestão de Frota'
   */
  async getById(id: number): Promise<Modulo> {
    const response = await api.get<{ data: Modulo }>(`/modulos/${id}`)
    return response.data.data
  },

  /**
   * Cria um novo módulo
   *
   * @param {ModuloFormData} data - Dados do novo módulo
   * @param {string} data.nome - Nome do módulo (obrigatório)
   * @param {string} data.descricao - Descrição do módulo
   * @param {string} data.icone - Ícone PrimeIcons (ex: 'pi pi-car')
   * @param {boolean} data.ativo - Status ativo (padrão: true)
   *
   * @returns {Promise<Modulo>} Módulo criado
   *
   * @throws {Error} Se validação falhar ou requisição falhar
   *
   * @example
   * const novo = await moduloService.create({
   *   nome: 'Gestão de Frota',
   *   descricao: 'Sistema de controle de veículos',
   *   icone: 'pi pi-car',
   *   ativo: true
   * })
   */
  async create(data: ModuloFormData): Promise<Modulo> {
    const response = await api.post<{ data: Modulo }>('/modulos', data)
    return response.data.data
  },

  /**
   * Atualiza um módulo existente
   *
   * @param {number} id - ID do módulo a ser atualizado
   * @param {ModuloFormData} data - Dados a serem atualizados
   * @param {string} data.nome - Nome do módulo
   * @param {string} data.descricao - Descrição do módulo
   * @param {string} data.icone - Ícone PrimeIcons
   * @param {boolean} data.ativo - Status ativo
   *
   * @returns {Promise<Modulo>} Módulo atualizado
   *
   * @throws {Error} Se o módulo não for encontrado ou validação falhar
   *
   * @example
   * const atualizado = await moduloService.update(1, {
   *   nome: 'Gestão de Frota v2',
   *   descricao: 'Sistema completo de veículos',
   *   ativo: true
   * })
   */
  async update(id: number, data: ModuloFormData): Promise<Modulo> {
    const response = await api.put<{ data: Modulo }>(`/modulos/${id}`, data)
    return response.data.data
  },

  /**
   * Remove um módulo
   *
   * @param {number} id - ID do módulo a ser removido
   *
   * @returns {Promise<void>}
   *
   * @throws {Error} Se o módulo não for encontrado ou não puder ser removido
   *
   * @example
   * await moduloService.delete(1)
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/modulos/${id}`)
  },

  /**
   * Busca todos os módulos sem paginação (para admin/support)
   *
   * @returns {Promise<Modulo[]>} Array de todos os módulos
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const todosModulos = await moduloService.getModulos()
   * console.log(todosModulos.length) // Total de módulos
   */
  async getModulos(): Promise<Modulo[]> {
    const response = await api.get<ModuloListResponse>('/modulos')
    return response.data.data
  },

  /**
   * Busca todas as autarquias vinculadas a um módulo
   *
   * @param {number} id - ID do módulo
   *
   * @returns {Promise<Autarquia[]>} Array de autarquias vinculadas
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const autarquias = await moduloService.getAutarquias(1)
   * console.log(autarquias.length) // Quantidade de autarquias
   */
  async getAutarquias(id: number): Promise<Autarquia[]> {
    const response = await api.get(`/modulos/${id}/autarquias`)
    return response.data.data
  },

  /**
   * Retorna estatísticas dos módulos
   *
   * @returns {Promise<Object>} Estatísticas dos módulos
   * @returns {number} return.total - Total de módulos
   * @returns {number} return.ativos - Módulos ativos
   * @returns {number} return.inativos - Módulos inativos
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const stats = await moduloService.getStats()
   * console.log(`Total: ${stats.total}, Ativos: ${stats.ativos}`)
   */
  async getStats(): Promise<{ total: number; ativos: number; inativos: number }> {
    const response = await api.get<ModuloStatsResponse>('/modulos/stats')
    return response.data.data
  },
}

/**
 * Metadados de paginação retornados pelo backend
 */
export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

/**
 * Resposta paginada genérica do backend
 */
export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: PaginationMeta
}

/**
 * Parâmetros de paginação para requisições
 */
export interface PaginationParams {
  page?: number
  per_page?: number
  search?: string
}

/**
 * Estado de paginação no frontend
 */
export interface PaginationState {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
}

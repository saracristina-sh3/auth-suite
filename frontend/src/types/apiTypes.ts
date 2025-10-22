// src/types/api.ts
export interface ApiError {
  message?: string
  error?: string
  errors?: {
    email?: string[]
    password?: string[]
    [key: string]: string[] | undefined
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}
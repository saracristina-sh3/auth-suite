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
  success: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}


export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}
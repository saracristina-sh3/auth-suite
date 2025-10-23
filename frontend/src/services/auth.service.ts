import axios, { type AxiosError } from 'axios'
import type { LoginCredentials, AuthResponse, User } from '@/types/auth.types'
import { supportService } from './support.service'

interface ApiError {
  message?: string
  error?: string
  errors?: {
    email?: string[]
    password?: string[]
    [key: string]: string[] | undefined
  }
}

// ✅ Define corretamente a URL base da API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

// === INTERCEPTORS ===
api.interceptors.request.use((config) => {
  console.log('📤 Enviando requisição:', {
    url: config.url,
    method: config.method,
    data: config.data,
  })

  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('📥 Resposta recebida:', {
      status: response.status,
      data: response.data,
    })
    return response
  },
  (error: AxiosError) => {
    console.error('❌ Erro na requisição:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
    })

    const requestUrl = error.config?.url || ''
    if (
      error.response?.status === 401 &&
      !requestUrl.includes('/login') &&
      !requestUrl.includes('/register')
    ) {
      // Limpa tokens de autenticação
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      // Limpa contexto de suporte se existir
      supportService.clearSupportContext()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

// === SERVIÇO DE AUTENTICAÇÃO ===
class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/login', credentials)

      if (data.token && data.user) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        api.defaults.headers.common.Authorization = `Bearer ${data.token}`
      } else {
        throw new Error('Resposta de login inválida')
      }

      return data
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError & { message?: string }>
      const message =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.response?.data?.errors?.email?.[0] ||
        'Erro ao fazer login. Tente novamente.'
      throw new Error(message)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('auth_token')
    if (!token) return null

    try {
      // Rota correta é /me conforme api.php linha 27
      const { data } = await api.get<{ user: User }>('/me')

      if (data.user) {
        localStorage.setItem('user_data', JSON.stringify(data.user))
        return data.user
      } else {
        this.logout()
        return null
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      this.logout()
      return null
    }
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        await api.post('/logout')
      } catch {
        // ignora erros
      }
    }

    // Limpa tokens de autenticação
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    // Limpa contexto de suporte se existir (original_user_data e support_context)
    supportService.clearSupportContext()
    try {
      const { useAutarquiaStore } = await import('@/stores/autarquia.store')
      useAutarquiaStore().clear()
    } catch (storeError) {
      console.warn('⚠️ Não foi possível limpar o contexto de autarquia em memória durante o logout.', storeError)
    }
    delete api.defaults.headers.common.Authorization
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    return !!token && token !== 'undefined' && token !== 'null'
  }

  getUserFromStorage(): User | null {
    try {
      const userData = localStorage.getItem('user_data')
      if (
        !userData ||
        userData === 'undefined' ||
        userData === 'null' ||
        userData.trim() === ''
      ) {
        return null
      }

      const parsed = JSON.parse(userData)
      if (parsed && typeof parsed === 'object' && parsed.id && parsed.email) {
        return parsed as User
      } else {
        localStorage.removeItem('user_data')
        return null
      }
    } catch (error) {
      console.error('Erro ao fazer parse do user_data:', error)
      localStorage.removeItem('user_data')
      return null
    }
  }

  hasRole(role: string): boolean {
    const user = this.getUserFromStorage()
    return user ? user.role === role || user.is_superadmin : false
  }

  canAccess(permission: string): boolean {
    const user = this.getUserFromStorage()
    if (!user) return false
    if (user.is_superadmin) return true

    const rolePermissions: Record<string, string[]> = {
      user: ['view_dashboard'],
      manager: ['view_dashboard', 'manage_users', 'view_reports'],
      admin: ['view_dashboard', 'manage_users', 'manage_system', 'view_reports'],
    }

    return rolePermissions[user.role]?.includes(permission) || false
  }
}

// === EXPORTAÇÕES ===
export const authService = new AuthService()
export const login = (credentials: LoginCredentials) => authService.login(credentials)
export const logout = () => authService.logout()
export const getUser = () => authService.getCurrentUser()
export const isAuthenticated = () => authService.isAuthenticated()
export default api

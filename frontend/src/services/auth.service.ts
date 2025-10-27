import api from './api'
import type { LoginCredentials } from '@/types/common/auth.types'
import type { User } from '@/types/common/user.types'
import { sessionService } from './session.service'
import { getItem, setItem, removeItem, STORAGE_KEYS } from '@/utils/storage'

// === SERVIÇO DE AUTENTICAÇÃO ===
class AuthService {
async login(credentials: LoginCredentials) {
    const response = await api.post('/login', credentials)
    const { token, refresh_token, user, expires_in } = response.data

    // Armazenar tokens
    setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    setItem('refresh_token', refresh_token)

    // Armazenar timestamp de expiração
    if (expires_in) {
      const expiresAt = Date.now() + (expires_in * 1000)
      setItem('token_expires_at', expiresAt)
    }

    // NÃO armazenar autarquia_ativa no localStorage
    // Ela virá da session do backend
    const userData = {
      ...user,
      // Remover autarquia_ativa do storage local
      autarquia_ativa_id: undefined,
      autarquia_ativa: undefined
    }

    setItem(STORAGE_KEYS.USER, userData)

    return { token, user }
  }

  async getCurrentUser() {
    const response = await api.get('/user')
    const { user } = response.data

    // Manter autarquia_ativa do localStorage se existir, senão pegar da resposta
    const storedUser = this.getUserFromStorage()
    const userData = {
      ...user,
      autarquia_ativa_id: storedUser?.autarquia_ativa_id || user.autarquia_ativa_id,
      autarquia_ativa: storedUser?.autarquia_ativa || user.autarquia_ativa
    }

    setItem(STORAGE_KEYS.USER, userData)

    return userData
  }

    /**
   * Obtém autarquia ativa da session (não do localStorage)
   */
  async getActiveAutarquiaFromSession() {
    const response = await sessionService.getActiveAutarquia()
    return response.data
  }

  /**
   * Renova o access token usando o refresh token
   */
  async refreshToken(): Promise<{ token: string; user: any } | null> {
    try {
      const refreshToken = getItem<string>('refresh_token', '')

      if (!refreshToken) {
        console.warn('⚠️ Refresh token não encontrado')
        return null
      }

      // Usar o refresh token para obter um novo access token
      const response = await api.post('/refresh', null, {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      })

      const { token, refresh_token, user, expires_in } = response.data

      // Atualizar tokens no localStorage
      setItem(STORAGE_KEYS.AUTH_TOKEN, token)
      setItem('refresh_token', refresh_token)

      // Atualizar timestamp de expiração
      if (expires_in) {
        const expiresAt = Date.now() + (expires_in * 1000)
        setItem('token_expires_at', expiresAt)
      }

      // Atualizar dados do usuário
      const userData = {
        ...user,
        autarquia_ativa_id: undefined,
        autarquia_ativa: undefined
      }
      setItem(STORAGE_KEYS.USER, userData)

      console.log('✅ Token renovado com sucesso')
      return { token, user }

    } catch (error) {
      console.error('❌ Erro ao renovar token:', error)
      return null
    }
  }

  /**
   * Verifica se o token está próximo de expirar (menos de 5 minutos)
   */
  isTokenExpiringSoon(): boolean {
    const expiresAt = getItem<number>('token_expires_at', 0)
    if (!expiresAt) return false

    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    return (expiresAt - now) < fiveMinutes
  }

  async logout(): Promise<void> {
    const token = getItem<string>(STORAGE_KEYS.AUTH_TOKEN, '')
    if (token) {
      try {
        await api.post('/logout')
      } catch {
        // ignora erros
      }
    }

    // Limpa tokens de autenticação
    removeItem(STORAGE_KEYS.AUTH_TOKEN)
    removeItem('refresh_token')
    removeItem('token_expires_at')
    removeItem(STORAGE_KEYS.USER)
    // Limpa contexto de suporte se existir
    removeItem('support_context')
    removeItem('original_user_data')
    delete api.defaults.headers.common.Authorization
  }

  isAuthenticated(): boolean {
    const token = getItem<string>(STORAGE_KEYS.AUTH_TOKEN, '')
    return !!token && token !== 'undefined' && token !== 'null'
  }

  getUserFromStorage(): User | null {
    const userData = getItem<User | null>(STORAGE_KEYS.USER, null)
    if (userData && typeof userData === 'object' && userData.id && userData.email) {
      return userData
    }
    return null
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

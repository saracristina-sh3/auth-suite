import api from './api'
import type { LoginCredentials } from '@/types/common/auth.types'
import type { User } from '@/types/common/user.types'
import { sessionService } from './session.service'
import { getItem, setItem, STORAGE_KEYS } from '@/utils/storage'
import { tokenService } from './token.service'

class AuthService {
async login(credentials: LoginCredentials) {
    const response = await api.post('/login', credentials)
    const { token, refresh_token, user, expires_in } = response.data

    tokenService.saveTokens(token, refresh_token, expires_in)

    const userData = {
      ...user,
      autarquia_ativa_id: undefined,
      autarquia_ativa: undefined
    }

    setItem(STORAGE_KEYS.USER, userData)

    return { token, user }
  }

  async getCurrentUser() {
    const response = await api.get('/user')
    const { user } = response.data

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
   * Obtém autarquia ativa da session
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
      const refreshToken = tokenService.getRefreshToken()

      if (!refreshToken) {
        console.warn('⚠️ Refresh token não encontrado')
        return null
      }

      const response = await api.post('/refresh', null, {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      })

      const { token, refresh_token, user, expires_in } = response.data

      tokenService.saveTokens(token, refresh_token, expires_in)

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
    return tokenService.isTokenExpiringSoon(5)
  }

  async logout(): Promise<void> {
    const token = tokenService.getAccessToken()
    if (token) {
      try {
        await api.post('/logout')
      } catch {
        
      }
    }

    tokenService.clearTokens()

    setItem(STORAGE_KEYS.USER, null)

    setItem(STORAGE_KEYS.SUPPORT_CONTEXT, null)
    setItem(STORAGE_KEYS.ORIGINAL_USER_DATA, null)

    delete api.defaults.headers.common.Authorization
  }

  isAuthenticated(): boolean {
    return tokenService.hasValidToken()
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

export const authService = new AuthService()
export const login = (credentials: LoginCredentials) => authService.login(credentials)
export const logout = () => authService.logout()
export const getUser = () => authService.getCurrentUser()
export const isAuthenticated = () => authService.isAuthenticated()
export default api

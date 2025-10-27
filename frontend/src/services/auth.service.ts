import api from './api'
import type { LoginCredentials } from '@/types/common/auth.types'
import type { User } from '@/types/common/user.types'
import { sessionService } from './session.service'
import { getItem, setItem, STORAGE_KEYS } from '@/utils/storage'
import { tokenService } from './token.service'

/**
 * Serviço de autenticação e gerenciamento de sessão
 *
 * @description Fornece funcionalidades completas de autenticação incluindo login,
 * logout, renovação de token, verificação de permissões e gerenciamento de usuário.
 *
 * @example
 * // Login
 * const { token, user } = await authService.login({
 *   email: 'user@example.com',
 *   password: 'senha123'
 * })
 *
 * // Verificar autenticação
 * if (authService.isAuthenticated()) {
 *   const user = authService.getUserFromStorage()
 * }
 *
 * // Logout
 * await authService.logout()
 */
class AuthService {
  /**
   * Realiza o login do usuário
   *
   * @param {LoginCredentials} credentials - Credenciais de login
   * @param {string} credentials.email - Email do usuário
   * @param {string} credentials.password - Senha do usuário
   *
   * @returns {Promise<Object>} Dados do login
   * @returns {string} return.token - Access token JWT
   * @returns {User} return.user - Dados do usuário autenticado
   *
   * @throws {Error} Se as credenciais forem inválidas ou requisição falhar
   *
   * @example
   * try {
   *   const { token, user } = await authService.login({
   *     email: 'user@example.com',
   *     password: 'senha123'
   *   })
   *   console.log('Login bem-sucedido:', user.name)
   * } catch (error) {
   *   console.error('Erro no login:', error.message)
   * }
   */
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

  /**
   * Busca os dados atualizados do usuário autenticado
   *
   * @returns {Promise<User>} Dados atualizados do usuário
   *
   * @throws {Error} Se o usuário não estiver autenticado ou requisição falhar
   *
   * @example
   * const user = await authService.getCurrentUser()
   * console.log('Dados atualizados:', user.name)
   */
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
   * Obtém a autarquia ativa da sessão Laravel
   *
   * @returns {Promise<any>} Dados da autarquia ativa
   *
   * @throws {Error} Se a requisição falhar
   *
   * @example
   * const autarquia = await authService.getActiveAutarquiaFromSession()
   * console.log('Autarquia ativa:', autarquia.nome)
   */
  async getActiveAutarquiaFromSession() {
    const response = await sessionService.getActiveAutarquia()
    return response.data
  }

  /**
   * Renova o access token usando o refresh token
   *
   * @returns {Promise<Object|null>} Novos dados de autenticação ou null se falhar
   * @returns {string} return.token - Novo access token
   * @returns {User} return.user - Dados atualizados do usuário
   *
   * @example
   * const result = await authService.refreshToken()
   * if (result) {
   *   console.log('Token renovado com sucesso')
   * } else {
   *   console.log('Falha ao renovar token - redirecionando para login')
   * }
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
   * Verifica se o token está próximo de expirar
   *
   * @returns {boolean} true se o token expira em menos de 5 minutos
   *
   * @example
   * if (authService.isTokenExpiringSoon()) {
   *   console.log('Token expirando em breve, renovando...')
   *   await authService.refreshToken()
   * }
   */
  isTokenExpiringSoon(): boolean {
    return tokenService.isTokenExpiringSoon(5)
  }

  /**
   * Realiza o logout do usuário
   *
   * @description Limpa todos os dados de autenticação (tokens, dados do usuário,
   * contexto de suporte) do localStorage e notifica o backend.
   *
   * @returns {Promise<void>}
   *
   * @example
   * await authService.logout()
   * console.log('Logout realizado com sucesso')
   * // Redirecionar para página de login
   */
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

  /**
   * Verifica se o usuário está autenticado
   *
   * @returns {boolean} true se possui token válido e não expirado
   *
   * @example
   * if (authService.isAuthenticated()) {
   *   console.log('Usuário autenticado')
   * } else {
   *   console.log('Redirecionar para login')
   * }
   */
  isAuthenticated(): boolean {
    return tokenService.hasValidToken()
  }

  /**
   * Obtém os dados do usuário armazenados no localStorage
   *
   * @returns {User|null} Dados do usuário ou null se não estiver autenticado
   *
   * @example
   * const user = authService.getUserFromStorage()
   * if (user) {
   *   console.log('Usuário:', user.name)
   *   console.log('Role:', user.role)
   * }
   */
  getUserFromStorage(): User | null {
    const userData = getItem<User | null>(STORAGE_KEYS.USER, null)
    if (userData && typeof userData === 'object' && userData.id && userData.email) {
      return userData
    }
    return null
  }

  /**
   * Verifica se o usuário possui uma role específica
   *
   * @param {string} role - Role a verificar (user, admin, superadmin, etc)
   *
   * @returns {boolean} true se o usuário possui a role ou é superadmin
   *
   * @example
   * if (authService.hasRole('admin')) {
   *   console.log('Usuário é admin')
   * }
   */
  hasRole(role: string): boolean {
    const user = this.getUserFromStorage()
    return user ? user.role === role || user.is_superadmin : false
  }

  /**
   * Verifica se o usuário tem permissão para acessar um recurso
   *
   * @param {string} permission - Permissão a verificar
   *
   * @returns {boolean} true se o usuário tem a permissão
   *
   * @description Superadmins têm acesso a tudo. Outras roles têm permissões específicas:
   * - user: view_dashboard
   * - manager: view_dashboard, manage_users, view_reports
   * - admin: view_dashboard, manage_users, manage_system, view_reports
   *
   * @example
   * if (authService.canAccess('manage_users')) {
   *   console.log('Pode gerenciar usuários')
   * }
   */
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

/**
 * Instância singleton do serviço de autenticação
 */
export const authService = new AuthService()

/**
 * Função de atalho para login
 * @see AuthService.login
 */
export const login = (credentials: LoginCredentials) => authService.login(credentials)

/**
 * Função de atalho para logout
 * @see AuthService.logout
 */
export const logout = () => authService.logout()

/**
 * Função de atalho para obter usuário atual
 * @see AuthService.getCurrentUser
 */
export const getUser = () => authService.getCurrentUser()

/**
 * Função de atalho para verificar autenticação
 * @see AuthService.isAuthenticated
 */
export const isAuthenticated = () => authService.isAuthenticated()

export default api
